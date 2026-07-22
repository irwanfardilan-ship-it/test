import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

const appConfig = typeof window !== 'undefined' && (window as any).APP_CONFIG ? (window as any).APP_CONFIG : { FIREBASE: {} };

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appConfig.FIREBASE.apiKey || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appConfig.FIREBASE.authDomain || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appConfig.FIREBASE.projectId || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appConfig.FIREBASE.storageBucket || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appConfig.FIREBASE.messagingSenderId || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appConfig.FIREBASE.appId || firebaseConfigJson.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || appConfig.FIREBASE.measurementId || firebaseConfigJson.measurementId
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics conditionally (only in browser)
let analytics = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    console.warn('Analytics initialization failed:', err);
  }
}

const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId);
const auth = getAuth(app);

export { app, analytics, db, auth };

