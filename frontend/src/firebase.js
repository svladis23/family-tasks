// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAY-OmMEm4xvAfs98RvQWpvGEgBtimCRbE",
  authDomain: "family-tasks-718cd.firebaseapp.com",
  projectId: "family-tasks-718cd",
  storageBucket: "family-tasks-718cd.firebasestorage.app",
  messagingSenderId: "295129252689",
  appId: "1:295129252689:web:ab51a3688dac251dea8970"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
