import { getAdminDb } from './firebase-admin';

// Remove the runtime declaration - this belongs in route files, not library files
// export const runtime = "nodejs";

// Remove the Firebase initialization code
// import { initializeApp, getApps, cert } from 'firebase-admin/app';
// import { getFirestore } from 'firebase-admin/firestore';

export interface UserSubscription {
  userId: string;
  customerId: string;
  subscriptionId: string;
  status: string;
  planId: string;
  currentPeriodEnd: number;
  createdAt: number;
  updatedAt: number;
}

export async function createOrUpdateUserSubscription(data: any) {
  try {
    const db = await getAdminDb();
    if (!db) return false;
    
    const userRef = db.collection('users').doc(data.userId);
    const subscriptionRef = userRef.collection('subscriptions').doc(data.subscriptionId);
    
    await subscriptionRef.set(data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const db = await getAdminDb();
    if (!db) return null;
    
    const doc = await db.collection('subscriptions').doc(userId).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as UserSubscription;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

export async function getCustomerIdFromUserId(userId: string): Promise<string | null> {
  const subscription = await getUserSubscription(userId);
  return subscription?.customerId || null;
}

export async function getSubscriptionIdFromUserId(userId: string): Promise<string | null> {
  const subscription = await getUserSubscription(userId);
  return subscription?.subscriptionId || null;
}

export async function updateUserSubscriptionStatus(
  userId: string, 
  status: string, 
  currentPeriodEnd?: number
): Promise<void> {
  try {
    const db = await getAdminDb();
    if (!db) return;
    
    const data: Partial<UserSubscription> = {
      status,
      updatedAt: Date.now(),
    };
    
    if (currentPeriodEnd) {
      data.currentPeriodEnd = currentPeriodEnd;
    }
    
    await db.collection('subscriptions').doc(userId).update(data);
  } catch (error) {
    console.error('Error updating subscription status:', error);
  }
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  timestamp: number;
}

export async function saveSearchToHistory(userId: string, query: string): Promise<string> {
  try {
    const db = await getAdminDb();
    if (!db) throw new Error('Firestore is not initialized');

    const historyRef = db.collection('searchHistory').doc();
    const id = historyRef.id;
    
    const historyItem: SearchHistoryItem = {
      id,
      userId,
      query,
      timestamp: Date.now()
    };
    
    await historyRef.set(historyItem);
    return id;
  } catch (error) {
    console.error('Error saving search history:', error);
    throw error;
  }
}

export async function getUserSearchHistory(userId: string, limit = 20): Promise<SearchHistoryItem[]> {
  try {
    const db = await getAdminDb();
    if (!db) return [];

    const snapshot = await db.collection('searchHistory')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SearchHistoryItem));
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
}

export async function deleteSearchHistoryItem(id: string): Promise<void> {
  try {
    const db = await getAdminDb();
    if (!db) return;

    await db.collection('searchHistory').doc(id).delete();
  } catch (error) {
    console.error('Error deleting search history item:', error);
  }
}

export async function clearUserSearchHistory(userId: string): Promise<void> {
  try {
    const db = await getAdminDb();
    if (!db) return;

    const snapshot = await db.collection('searchHistory')
      .where('userId', '==', userId)
      .get();
      
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error clearing user search history:', error);
  }
}
