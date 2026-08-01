import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCwH4dDAfqZznP11hjspsLtTrbB0hAE5GY",
  authDomain: "vitta-5ec1e.firebaseapp.com",
  projectId: "vitta-5ec1e",
  storageBucket: "vitta-5ec1e.firebasestorage.app",
  messagingSenderId: "733443225670",
  appId: "1:733443225670:web:9334e443d9f13b0092b247",
  measurementId: "G-2WJY644V9Q"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);