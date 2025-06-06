import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../Firebase";
import { getFirestore, doc, onSnapshot, updateDoc } from "firebase/firestore";

// Create a Context for Auth
const AuthContext = createContext();

// Create a provider for the Auth context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const db = getFirestore(); // Initialize Firestore

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true); // Start loading
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);

          // Set up real-time listener
          const unsubscribeSnapshot = onSnapshot(
            userDocRef,
            (userDocSnap) => {
              if (userDocSnap.exists()) {
                const userDocData = userDocSnap.data();
                
                // Check if cards array exists in the document, if not create it
                if (!userDocData.cards) {
                  console.log("Creating cards array for user", firebaseUser.uid);
                  updateDoc(userDocRef, {
                    cards: []
                  }).catch(err => {
                    console.error("Error creating cards array:", err);
                  });
                }
                
                const userData = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  balance: userDocData.balance,
                  lastName: userDocData.lastName,
                  firstName: userDocData.firstName,
                  lastLogin: firebaseUser.metadata.lastSignInTime,
                  transactions: userDocData.transactions || [],
                  cards: userDocData.cards || [],
                  // accountNumber: userDocData.accountNumber,
                  // Add other fields as needed
                };
                setUser(userData);
              } else {
                setUser(null);
              }
              setLoading(false); // End loading once snapshot is received
            },
            (err) => {
              console.error("Error listening to user data: ", err);
              setError(err);
              setLoading(false); // End loading if there's an error
            }
          );

          // Optionally, if you need to clean up the snapshot listener separately:
          // you might store unsubscribeSnapshot in a ref or state and call it on unmount.
        } catch (err) {
          console.error("Error setting up real-time listener: ", err);
          setError(err);
          setLoading(false); // End loading on error
        }
      } else {
        // No user is logged in
        setUser(null);
        setLoading(false);
      }
    });

    // Clean up the auth listener on unmount
    return () => unsubscribeAuth();
  }, [db]);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the AuthContext to be used in other components
export const useAuth = () => React.useContext(AuthContext);