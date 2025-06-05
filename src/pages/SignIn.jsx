import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { db, app } from "../../Firebase";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create a new user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Set default balance (e.g., $100)
      const defaultBalance = 100;

      // Mock transaction history
      const mockTransactions = [
        {
          date: new Date("2023-10-01").toISOString(),
          paymentName: "Electricity Bill",
          recipient: "PowerGrid Corp",
          amount: 50,
        },
        {
          date: new Date("2023-10-05").toISOString(),
          paymentName: "Internet Bill",
          recipient: "SpectraNet",
          amount: 30,
        },
        {
          date: new Date("2023-10-10").toISOString(),
          paymentName: "Groceries",
          recipient: "FreshMart",
          amount: 20,
        },
      ];

      // Create user data in Firestore with the default balance and mock transactions
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        firstName,
        lastName,
        email,
        balance: defaultBalance, // Setting default balance
        transactions: mockTransactions, // Adding mock transaction history
        createdAt: new Date(),
      });

      alert("User created successfully with default balance and mock transactions!");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-in-form">
      <h2>Create Account</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default SignIn;
