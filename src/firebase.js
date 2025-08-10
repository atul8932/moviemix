// Import the functions you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// (Optional) Analytics if you still want it
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdxM1pJV8oAEcpp3stf1lU-i3cc1aVgZQ",
  authDomain: "moviemix-e1c54.firebaseapp.com",
  projectId: "moviemix-e1c54",
  storageBucket: "moviemix-e1c54.firebasestorage.app",
  messagingSenderId: "332490065737",
  appId: "1:332490065737:web:03f6eff180357e5d15fc98",
  measurementId: "G-FTHTD2939Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);
