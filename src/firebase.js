// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6of6J7JT7iYWPj_23H-3UnJLdTauTrTY",
  authDomain: "intern-dashboard-addbf.firebaseapp.com",
  projectId: "intern-dashboard-addbf",
  storageBucket: "intern-dashboard-addbf.firebasestorage.app",
  messagingSenderId: "978721421112",
  appId: "1:978721421112:web:a35a40bbcc02639a8933cd",
  measurementId: "G-KV7B0MSNZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

// Export Firestore so it can be used in App.jsx
export { db };
