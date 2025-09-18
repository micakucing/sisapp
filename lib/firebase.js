// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiqCTHeZJQ6Teo3M_tEebp3exhIOy3Bas",
  authDomain: "nextsis-c11bb.firebaseapp.com",
  projectId: "nextsis-c11bb",
  storageBucket: "nextsis-c11bb.firebasestorage.app",
  messagingSenderId: "852897305961",
  appId: "1:852897305961:web:6f90177f5de2a3112519f8"
};

// Initialize Firebase

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;