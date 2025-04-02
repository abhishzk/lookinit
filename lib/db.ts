export const runtime = "nodejs";

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { adminDb as firebaseDb } from './firebase-admin';
import { DocumentReference, CollectionReference } from 'firebase-admin/firestore';

// Initialize Firebase Admin if it hasn't been initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

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

// export async function createOrUpdateUserSubscription(data: UserSubscription): Promise<void> {
//   await db.collection('subscriptions').doc(data.userId).set(data, { merge: true });
// }
// Use dynamic imports for server-only modules
export async function createOrUpdateUserSubscription(data: any) {
  try {
    // Only import and use Firebase Admin in a server context
    if (typeof window === 'undefined') {
      const admin = require('firebase-admin');
      const { getFirestore } = require('firebase-admin/firestore');
      
      // Initialize Firebase Admin if not already initialized
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      }
      
      const db = getFirestore();
      const userRef = db.collection('users').doc(data.userId);
      const subscriptionRef = userRef.collection('subscriptions').doc(data.subscriptionId);
      
      await subscriptionRef.set(data, { merge: true });
      return true;
    } else {
      console.error('Attempted to use server-only function in client context');
      return false;
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const doc = await db.collection('subscriptions').doc(userId).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as UserSubscription;
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
  const data: Partial<UserSubscription> = {
    status,
    updatedAt: Date.now(),
  };
  
  if (currentPeriodEnd) {
    data.currentPeriodEnd = currentPeriodEnd;
  }
  
  await db.collection('subscriptions').doc(userId).update(data);
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  timestamp: number;
}

export async function saveSearchToHistory(userId: string, query: string): Promise<string> {
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
}

export async function getUserSearchHistory(userId: string, limit = 20): Promise<SearchHistoryItem[]> {
if (!db) throw new Error('Firestore is not initialized');

    const snapshot = await db.collection('searchHistory')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SearchHistoryItem));
    }

export async function deleteSearchHistoryItem(id: string): Promise<void> {
    if (!db) throw new Error('Firestore is not initialized');
  
    await db.collection('searchHistory').doc(id).delete();
}

export async function clearUserSearchHistory(userId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized');

  const snapshot = await db.collection('searchHistory')
    .where('userId', '==', userId)
    .get();
    
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}
