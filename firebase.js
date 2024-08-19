// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirebase } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdnavutRmbWjqpGifleWXQmUU_Zzdi8SA",
  authDomain: "flashcardsaas-6aaf3.firebaseapp.com",
  projectId: "flashcardsaas-6aaf3",
  storageBucket: "flashcardsaas-6aaf3.appspot.com",
  messagingSenderId: "826552894522",
  appId: "1:826552894522:web:31fb14ddbeab2181906103",
  measurementId: "G-6F444NCEWE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirebase(app);

export { db };
