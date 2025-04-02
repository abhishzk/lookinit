import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

export async function createOrUpdateUserSubscription(data: UserSubscription): Promise<void> {
  await db.collection('subscriptions').doc(data.userId).set(data, { merge: true });
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
