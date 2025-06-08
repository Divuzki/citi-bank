import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../svg/Logo";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../Firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const LoginPage = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Query Firestore to find the user document based on the identifier field
      const q = query(
        collection(db, "users"),
        where("identifier", "==", userId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // Get the email associated with the found user document
        const userEmail = userData.email;

        // Authenticate with Firebase using the email and password
        await signInWithEmailAndPassword(auth, userEmail, password);

        // Check the role of the authenticated user
        const userRole = userData.role; // Assuming role is stored in the user's Firestore document

        // Clear any previous OTP verification status
        localStorage.removeItem("otpVerified");

        // Redirect based on user role
        if (userRole === "admin") {
          navigate("/admin"); // Redirect to admin dashboard if the user is an admin
        } else if (userRole === "user") {
          navigate("/otp-verification"); // Redirect to OTP verification for regular users
        } else {
          setErrorMessage("Role not recognized.");
          console.error("Role not recognized.");
        }
      } else {
        setErrorMessage("User not found with this identifier.");
        console.error("No user found with this identifier.");
      }
    } catch (error) {
      console.error("Error during login:", error.code, error.message);
      if (error.code === "auth/wrong-password") {
        setErrorMessage("Incorrect password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        setErrorMessage("No user found with this identifier.");
      } else {
        setErrorMessage("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false); // Reset loading state when login completes
    }
  };

  return (
    <div className="flex font-lato flex-col md:flex-row h-screen relative overflow-x-hidden">
      {/* Left Section */}
      <div className="flex-1  bg-white  flex flex-col items-center justify-center  relative md:relative">
        <div className="hidden md:block">
          <Logo style={{ width: "300px", height: "150px" }} />
        </div>
        <div className="md:block hidden">
          <h1 className="text-gray-600 text-4xl font-bold mt-4">
            Welcome to Quant Equity Bank
          </h1>
          <p className="text-gray-600 text-lg mt-2 mb-6">
            Discover endless possibilities with us.
          </p>
          <div className="gridd grid-cols-3 gap-6 text-gray-600 hidden">
            <div className="flex flex-col items-center">
              <img
                src="/Svg/save-money-cash-savings-money-reserve-svgrepo-com.svg"
                className="w-10 h-10 mb-2"
                alt="Feature 1"
              />
              <span>Save More</span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src="/Svg/location-svgrepo-com.svg"
                className="w-10 h-10 mb-2"
                alt="Feature 2"
              />
              <span>Find Us</span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src="/Svg/more-svgrepo-com.svg"
                className="w-10 h-10 mb-2"
                alt="Feature 3"
              />
              <span>Explore More</span>
            </div>
          </div>
        </div>
        {/* Form for Mobile */}
        <div className="flex z-10 flex-col items-center justify-center md:hidden flex-grow">
          {/* Logo and Welcome Text */}
          <div className="text-center mb-8 w-full">
            <Logo />
            <h1 className="text-gray-600 text-2xl font-bold mt-2">
              Welcome to Quant Equity Bank
            </h1>
          </div>
          {/* Form with Line Inputs */}
          <form
            onSubmit={handleLogin}
            className="w-full max-w-sm flex flex-col items-center gap-8"
          >
            <input
              type="text"
              id="UserIdM"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <input
              type="password"
              id="passwordM"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="rememberMeM"
                className="w-4 h-4 bg-transparent border-2 border-gray-300 rounded-sm checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-600"
              />
              <label htmlFor="rememberMe" className="text-gray-600 text-sm">
                Remember My User ID
              </label>
            </div>
            <button
              type="submit"
              className={`w-full py-3 text-white bg-customBlue rounded-full ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
              disabled={loading} // Disable button when loading
            >
              {loading ? "Logging In..." : "Login"} {/* Show loading text */}
            </button>
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
          </form>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 hidden z-20 md:flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 bg-white rounded-md shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Sign On
          </h2>
          <form onSubmit={handleLogin}>
            {/* User ID and Password in a Line */}
            <div className="flex flex-col md:flex-row md:gap-4 mb-6">
              {/* User ID Field */}
              <div className="flex-1">
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-gray-700"
                >
                  User ID
                </label>
                <input
                  type="text"
                  id="userId"
                  className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter your User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              {/* Password Field */}
              <div className="flex-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                id="rememberMe"
                className="w-4 h-4 bg-transparent border-2 border-gray-300 rounded-sm checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-600"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700">
                Remember My User ID
              </label>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-2 text-white ${
                loading
                  ? "bg-gray-500 opacity-50 cursor-not-allowed"
                  : "bg-customColor hover:bg-blue-700"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1`}
              disabled={loading} // Disable button when loading
            >
              {loading ? "Logging In..." : "Sign On"} {/* Show loading text */}
            </button>

            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
          </form>
          {/* Links Section */}
          <div className="flex justify-between hiidden items-center mt-4 text-sm">
            {/* Register / Activate */}
            <a href="/signup" className="text-blue-600 hover:underline">
              Register / Activate
            </a>
            {/* Forgot User ID or Password */}
            <a href="/forgot" className="text-blue-600 hidden hover:underline">
              Forgot User ID or Password?
            </a>
          </div>
        </div>
      </div>
      {/* Bottom Icons Section */}
      <div className="flexx hidden justify-center items-center gap-8 py-4 bg-customColor">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-transparent border-blue-300 border rounded-full flex items-center justify-center">
            <img
              src="/Svg/save-money-cash-savings-money-reserve-svgrepo-com.svg"
              alt="Icon 1"
              className="w-8 h-8"
            />
          </div>
          <span className="text-white text-sm mt-2">Offers</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-transparent border-blue-300 border rounded-full flex items-center justify-center">
            <img
              src="/Svg/location-svgrepo-com.svg"
              alt="Icon 2"
              className="w-8 h-8"
            />
          </div>
          <span className="text-white text-sm mt-2">Quontic Locator</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-transparent border-blue-300 border rounded-full flex items-center justify-center">
            <img
              src="/Svg/more-svgrepo-com.svg"
              alt="Icon 3"
              className="w-8 h-8"
            />
          </div>
          <span className="text-white text-sm mt-2">More</span>
        </div>
      </div>
      {/* Larger White Boxes on Background in Diagonal Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="bg-white bg-opacity-5 w-96 h-96 rotate-12 absolute top-60 left-60 rounded-sm floating-animation"></div>
        {/* Smaller White Boxes Below with Reduced Opacity */}
        <div className="bg-white bg-opacity-5 w-56 h-56 rotate-12 absolute bottom-20 right-40 rounded-sm floating-animation"></div>
        <div className="bg-white bg-opacity-5 w-96 h-96 rotate-12 absolute bottom-30 left-40 rounded-sm floating-animation"></div>
        {/* Add more white boxes as needed */}
      </div>
    </div>
  );
};
export default LoginPage;
