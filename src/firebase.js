// Import the functions you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
// (Optional) Analytics if you still want it
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCdxM1pJV8oAEcpp3stf1lU-i3cc1aVgZQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "moviemix-e1c54.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "moviemix-e1c54",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "moviemix-e1c54.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "332490065737",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:332490065737:web:03f6eff180357e5d15fc98",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FTHTD2939Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth with persistent session (no expiry)
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Ignore persistence errors; default persistence will apply
});
