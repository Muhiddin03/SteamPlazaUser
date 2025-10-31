// src/firebase/firebase.jsx

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase konsolida olingan o'z konfiguratsiya ma'lumotlaringizni kiriting.
const firebaseConfig = {
   apiKey: "AIzaSyCyXrI7ziLNB-JAD7CHkfAcQD51oZRHXUA",
  authDomain: "maktab-bog-cha.firebaseapp.com",
  projectId: "maktab-bog-cha",
  storageBucket: "maktab-bog-cha.firebasestorage.app",
  messagingSenderId: "516800515222",
  appId: "1:516800515222:web:b8794f436385e5e67486b7",
  measurementId: "G-XNG408S58S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };