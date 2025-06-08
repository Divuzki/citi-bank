import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../svg/Logo";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, app } from "../../Firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { uploadToS3 } from "../config/awsConfig";

const SignIn = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    ssn: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const db = getFirestore(app);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrorMessage("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async (file, userId) => {
    try {
      const fileName = `${userId}_${Date.now()}_${file.name}`;
      const downloadURL = await uploadToS3(file, fileName);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload profile image");
    }
  };

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.dateOfBirth ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode ||
      !formData.ssn ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setErrorMessage("Please fill in all required fields");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ""))) {
      setErrorMessage("Please enter a valid 11-digit phone number");
      return false;
    }

    const ssnRegex = /^\d{9}$/;
    if (!ssnRegex.test(formData.ssn.replace(/\D/g, ""))) {
      setErrorMessage("Please enter a valid 9-digit SSN");
      return false;
    }

    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Generate unique user ID
    let userId = formData.email;
    let isUnique = false;

    try {
      // Check if email already exists
      const emailQuery = query(
        collection(db, "users"),
        where("email", "==", formData.email)
      );
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
        setErrorMessage("An account with this email already exists");
        setLoading(false);
        return;
      }

      // Upload profile image if provided
      let profileImageURL = null;

      if (formData.profileImage) {
        profileImageURL = await uploadProfileImage(
          formData.profileImage,
          userId
        );
      }

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      while (!isUnique) {
        userId = formData.email;
        const userIdQuery = query(
          collection(db, "users"),
          where("identifier", "==", userId)
        );
        const userIdSnapshot = await getDocs(userIdQuery);
        isUnique = userIdSnapshot.empty;
      }

      // Save user data to Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        identifier: userId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        ssn: formData.ssn, // In production, this should be encrypted
        image: profileImageURL,
        role: "user",
        balance: 0,
        accountNumber:
          "ACC" + Math.random().toString(36).substr(2, 12).toUpperCase(),
        accountType: "Checking",
        accountStatus: "Active",
        createdAt: new Date().toISOString(),
        lastLogin: null,
      });

      setSuccessMessage(
        `Account created successfully! Your User ID is: ${userId}`
      );

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error during sign up:", error);
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("An account with this email already exists");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage(
          "Password is too weak. Please choose a stronger password"
        );
      } else {
        setErrorMessage(
          "An error occurred during registration. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex font-lato flex-col md:flex-row h-screen relative overflow-x-hidden">
      {/* Left Section */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center relative md:relative">
        <div className="hidden md:block">
          <Logo style={{ width: "300px", height: "150px" }} />
        </div>
        <div className="md:block hidden">
          <h1 className="text-gray-600 text-4xl font-bold mt-4">
            Join Quant Equity Bank
          </h1>
          <p className="text-gray-600 text-lg mt-2 mb-6">
            Start your banking journey with us today.
          </p>
        </div>

        {/* Form for Mobile */}
        <div className="flex z-10 flex-col items-center justify-center md:hidden flex-grow overflow-y-auto py-8">
          {/* Logo and Welcome Text */}
          <div className="text-center mb-6 w-full">
            <Logo />
            <h1 className="text-gray-600 text-xl font-bold mt-2">
              Join Quant Equity Bank
            </h1>
          </div>

          {/* Form with Line Inputs */}
          <form
            onSubmit={handleSignUp}
            className="w-full max-w-sm flex flex-col items-center gap-4"
          >
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-20 h-20 rounded-full border-2 border-blue-300 flex items-center justify-center overflow-hidden mb-2">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs text-center">
                    Profile Photo
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-gray-600"
              />
            </div>

            <input
              type="text"
              name="firstName"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phoneNumber"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            <input
              type="date"
              name="dateOfBirth"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="address"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="Street Address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="city"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="City"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="state"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="State"
              value={formData.state}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="zipCode"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="ZIP Code"
              value={formData.zipCode}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="ssn"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="Social Security Number"
              value={formData.ssn}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              className="w-full px-3 py-2 text-gray-600 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />

            <button
              type="submit"
              className={`w-full py-3 text-white bg-customBlue rounded-full mt-4 ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {errorMessage && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p className="text-green-500 text-sm mt-2 text-center">
                {successMessage}
              </p>
            )}

            <p className="text-gray-600 text-sm mt-4 text-center">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Right Section - Desktop */}
      <div className="flex-1 hidden z-20 md:flex items-center justify-center bg-white">
        <div className="w-full max-w-2xl p-6 bg-white rounded-md shadow-lg max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Your Account
          </h2>
          <form onSubmit={handleSignUp}>
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full border-2 border-blue-300 flex items-center justify-center overflow-hidden mb-3">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm text-center">
                    Profile Photo
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-600"
              />
            </div>

            {/* Name Fields */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Date of Birth and SSN */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Social Security Number
                </label>
                <input
                  type="text"
                  name="ssn"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="XXX-XX-XXXX"
                  value={formData.ssn}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* City, State, ZIP */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-2 text-white ${
                loading
                  ? "bg-gray-500 opacity-50 cursor-not-allowed"
                  : "bg-customColor hover:bg-blue-700"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1`}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {errorMessage && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p className="text-green-500 text-sm mt-2 text-center">
                {successMessage}
              </p>
            )}
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="bg-white bg-opacity-5 w-96 h-96 rotate-12 absolute top-60 left-60 rounded-sm floating-animation"></div>
        <div className="bg-white bg-opacity-5 w-56 h-56 rotate-12 absolute bottom-20 right-40 rounded-sm floating-animation"></div>
        <div className="bg-white bg-opacity-5 w-96 h-96 rotate-12 absolute bottom-30 left-40 rounded-sm floating-animation"></div>
      </div>
    </div>
  );
};

export default SignIn;
