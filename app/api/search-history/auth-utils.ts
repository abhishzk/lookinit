import { getAdminAuth } from '../../../lib/firebase-admin';

export async function verifyIdToken(token: string) {
  try {
    const auth = await getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}