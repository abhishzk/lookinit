import { getAdminAuth } from '../../../lib/firebase-admin';

export async function verifyIdToken(idToken: string) {
  try {
    console.log('Verifying ID token...');
    
    const auth = await getAdminAuth();
    if (!auth) {
      console.error('Firebase Admin Auth is not initialized');
      return null;
    }
    
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log('Token verified successfully for user:', decodedToken.uid);
    
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}