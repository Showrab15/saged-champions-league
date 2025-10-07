// /* eslint-disable no-unused-vars */
// import axios from "axios";
// import {
//   createUserWithEmailAndPassword,
//   GoogleAuthProvider,
//   onAuthStateChanged,
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   signOut,
// } from "firebase/auth";
// import { createContext, useContext, useEffect, useState } from "react";
// import { auth } from "../firebase/config";

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const API_URL = "http://localhost:5000"; // Change for production

//   // Sync user with backend
//   const syncUserWithBackend = async (firebaseUser) => {
//     if (firebaseUser) {
//       try {
//         await axios.post(`${API_URL}/users`, {
//           uid: firebaseUser.uid,
//           email: firebaseUser.email,
//           displayName: firebaseUser.displayName,
//           photoURL: firebaseUser.photoURL,
//         });
//       } catch (error) {
//         console.error("Failed to sync user:", error);
//       }
//     }
//   };

//   const signup = async (email, password, displayName) => {
//     const userCredential = await createUserWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     await syncUserWithBackend(userCredential.user);
//     return userCredential;
//   };

//   const login = async (email, password) => {
//     const userCredential = await signInWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     await syncUserWithBackend(userCredential.user);
//     return userCredential;
//   };

//   const loginWithGoogle = async () => {
//     const provider = new GoogleAuthProvider();
//     const userCredential = await signInWithPopup(auth, provider);
//     await syncUserWithBackend(userCredential.user);
//     return userCredential;
//   };

//   const logout = () => signOut(auth);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
//       if (user) {
//         await syncUserWithBackend(user);
//       }
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const value = {
//     currentUser,
//     signup,
//     login,
//     loginWithGoogle,
//     logout,
//     loading,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };
