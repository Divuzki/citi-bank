import { useState } from "react";
import { useNavigate } from "react-router-dom";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const correctOTP = "6578";

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const enteredOTP = otp.join("");

    if (enteredOTP.length !== 4) {
      setErrorMessage("Please enter a complete 4-digit OTP.");
      setLoading(false);
      return;
    }

    // Simulate verification delay
    setTimeout(() => {
      if (enteredOTP === correctOTP) {
        // Store OTP verification status in localStorage
        localStorage.setItem("otpVerified", "true");
        navigate("/dashboard");
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
        setOtp(["", "", "", ""]);
        document.getElementById("otp-0")?.focus();
      }
      setLoading(false);
    }, 1000);
  };

  const handleResendOTP = () => {
    setErrorMessage("");
    setOtp(["", "", "", ""]);
    setTimeout(() => {
      // In a real app, this would trigger sending a new OTP
      alert("OTP resent successfully!");
    }, 2000)
    
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* <Logo className="mx-auto mb-4" /> */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            OTP Verification
          </h1>
          <p className="text-gray-600 text-sm">
            Enter the 4-digit code sent to your registered device
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          {/* OTP Input Fields */}
          <div className="flex justify-center space-x-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                maxLength="1"
                autoComplete="off"
              />
            ))}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {errorMessage}
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
            >
              Resend OTP
            </button>
          </div>
        </form>

        {/* Demo Info */}
        <div className="mt-6 hidden p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-xs text-center">
            <strong>Demo Mode:</strong> Use OTP code <strong>6578</strong> to
            proceed
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
