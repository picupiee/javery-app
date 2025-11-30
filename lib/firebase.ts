import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBovbTv6dVFJSb-jR8C9LZqPjBzWS49AxI",
  authDomain: "javery-72191.firebaseapp.com",
  projectId: "javery-72191",
  storageBucket: "javery-72191.firebasestorage.app",
  messagingSenderId: "417678757547",
  appId: "1:417678757547:web:90e34274e7cdefaa3271ee",
  measurementId: "G-9MHDZ88CNH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
