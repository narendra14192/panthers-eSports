import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD0_lRI9VG4eVRTRF4U-k7e3yy0L9HJFg4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "panthers-esports-8d613.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "panthers-esports-8d613",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "panthers-esports-8d613.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "424113470532",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:424113470532:web:ce0cc658e9a17394395011",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MNMJNZTE0Q"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore Database
export const db = getFirestore(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

