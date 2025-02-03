import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  // apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  // appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID

    apiKey: "AIzaSyDKzfTDkkjKH6f8sD64cLj7p_uMOVegET8",
    authDomain: "lookinit.com",  // ❌ Wrong domain
    databaseURL: "https://lookinit-36bf4-default-rtdb.firebaseio.com",
    projectId: "lookinit-36bf4",
    storageBucket: "lookinit-36bf4.firebasestorage.app",
    messagingSenderId: "792263615448",
    appId: "1:792263615448:web:a97507f28bf8800adcc8ad",
    measurementId: "G-DDES66KR9T"
  };
  
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
