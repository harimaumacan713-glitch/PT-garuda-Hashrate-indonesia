import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeAuth, 
  getAuth, 
  GoogleAuthProvider, 
  indexedDBLocalPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence 
} from "firebase/auth";
import { getDatabase, goOnline, goOffline } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC_BCg9v3GWguBcNXEwr8JCW1Z0nNgcoGU",
  authDomain: "brusa-crypto-garuda.firebaseapp.com",
  databaseURL: "https://brusa-crypto-garuda-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "brusa-crypto-garuda",
  storageBucket: "brusa-crypto-garuda.firebasestorage.app",
  messagingSenderId: "163946023429",
  appId: "1:163946023429:web:bb816e6bbac01f3638ea6c",
  measurementId: "G-7P8BVLWXP5"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth with multi-tier fallback persistence (IndexedDB -> LocalStorage -> SessionStorage -> Memory)
let authInstance;
try {
  if (typeof window !== 'undefined') {
    authInstance = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence]
    });
  } else {
    authInstance = getAuth(app);
  }
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// Safeguard against browser tab visibility changes and IndexedDB closing/hidden race conditions
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Reconnect Realtime Database when returning from background / hidden tab
  document.addEventListener('visibilitychange', () => {
    try {
      if (document.visibilityState === 'visible') {
        goOnline(db);
      }
    } catch {
      // Ignore reconnect attempt errors
    }
  });

  // Catch and prevent unhandled promise rejections from closing/hidden database states
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : (reason?.message || reason?.name || '');
    if (
      msg.includes('Database is closing') ||
      msg.includes('Database is closed') ||
      msg.includes('closing/hidden') ||
      msg.includes('Indexed Database') ||
      msg.includes('database is closing') ||
      msg.includes('QuotaExceededError')
    ) {
      event.preventDefault();
      console.warn('[Storage/Database] Caught benign backgrounding or closing connection event.');
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('Database is closing') ||
      msg.includes('Database is closed') ||
      msg.includes('closing/hidden') ||
      msg.includes('Indexed Database') ||
      msg.includes('database is closing')
    ) {
      event.preventDefault();
      console.warn('[Storage/Database] Handled database closing/hidden event gracefully.');
    }
  });
}

export function initializeFirebase() {
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  console.log(`[Firebase] Initialized for project: ${firebaseConfig.projectId}`);
  console.log(`[Firebase] Current host domain: ${currentDomain}`);
  return { app, auth, db, firebaseConfig };
}
