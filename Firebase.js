import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDn0yBrw01dJSet4e5AHdGFBnIv_DMMxkI",
  authDomain: "citi-banking-app.firebaseapp.com",
  projectId: "citi-banking-app",
  storageBucket: "citi-banking-app.firebasestorage.app",
  messagingSenderId: "238730609234",
  appId: "1:238730609234:web:d388423d4dfa9994db158b",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Set persistence to local storage
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to local storage.");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Initialize Firestore
const db = getFirestore(app);

export { auth, db, app };
