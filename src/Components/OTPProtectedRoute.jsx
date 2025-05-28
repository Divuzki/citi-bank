import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const OTPProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Redirect to login page if user is not authenticated
    return <Navigate to="/" />;
  }

  // Check if OTP verification is completed
  const otpVerified = localStorage.getItem("otpVerified") === "true";

  if (!otpVerified) {
    // Redirect to OTP verification if not completed
    return <Navigate to="/otp-verification" replace />;
  }

  return children; // Render the protected component if the user is authenticated and OTP is verified
};

export default OTPProtectedRoute;
