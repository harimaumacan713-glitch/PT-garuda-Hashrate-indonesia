import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
