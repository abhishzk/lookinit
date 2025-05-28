import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { CONFIG } from './config';

const app = initializeApp(CONFIG.firebase);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


