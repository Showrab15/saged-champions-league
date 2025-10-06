import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAq1N_yVuoC8JziYxrAZJoXi0c03qSkOY8",
  authDomain: "saged-champions-league.firebaseapp.com",
  projectId: "saged-champions-league",
  storageBucket: "saged-champions-league.firebasestorage.app",
  messagingSenderId: "91491203899",
  appId: "1:91491203899:web:0ec58e30cf1bbb6cd9551e",
  measurementId: "G-QL04195RV3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
