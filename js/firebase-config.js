import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Live Firebase configuration for bhishipro
const firebaseConfig = {
  apiKey: "AIzaSyDFw2HClS8Ytg6ldXtMsBtx7kZf50Y3Lzc",
  authDomain: "bhishipro.firebaseapp.com",
  projectId: "bhishipro",
  storageBucket: "bhishipro.firebasestorage.app",
  messagingSenderId: "107311191105",
  appId: "1:107311191105:web:7b7cf765d7f78e4b1622c0",
  measurementId: "G-VH7FFJT95R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
