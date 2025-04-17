import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../Firebase";

const ManageLimitsModal = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    dailySpendingLimit: "",
    dailyWithdrawalLimit: "",
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && user && user.cards) {
      const activeCard = user.cards.find((card) => card.status === "Approved");
      if (activeCard) {
        setFormData({
          dailySpendingLimit: activeCard.dailySpendingLimit || "5000",
          dailyWithdrawalLimit: activeCard.dailyWithdrawalLimit || "1000",
        });
      }
      setError("");
      setSuccess(false);
    }
  }, [isOpen, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate limits
    if (
      !formData.dailySpendingLimit ||
      parseInt(formData.dailySpendingLimit) < 100
    ) {
      setError("Daily spending limit must be at least $100");
      setLoading(false);
      return;
    }

    if (
      !formData.dailyWithdrawalLimit ||
      parseInt(formData.dailyWithdrawalLimit) < 50
    ) {
      setError("Daily withdrawal limit must be at least $50");
      setLoading(false);
      return;
    }

    try {
      // Get the current cards array
      const cards = [...user.cards];

      // Find the active card
      const activeCardIndex = cards.findIndex(
        (card) => card.status === "Approved"
      );

      if (activeCardIndex === -1) {
        setError("No active card found");
        setLoading(false);
        return;
      }

      // Update the card limits
      cards[activeCardIndex] = {
        ...cards[activeCardIndex],
        dailySpendingLimit: formData.dailySpendingLimit,
        dailyWithdrawalLimit: formData.dailyWithdrawalLimit,
        limitsUpdatedAt: new Date().toISOString(),
      };

      // Update the user document in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { cards });

      setSuccess(true);

      // Close modal after success message is shown
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error updating card limits:", error);
      setError("Failed to update card limits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-customBlue"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          Manage Card Limits
        </h2>

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">
              Your card limits have been updated successfully.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}

            <div className="mb-6">
              <div className="p-4 rounded-lg bg-blue-50">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Set Your Card Limits
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Customize your daily spending and withdrawal limits to manage
                  your finances better.
                </p>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="dailySpendingLimit"
                  >
                    Daily Spending Limit ($)
                  </label>
                  <input
                    id="dailySpendingLimit"
                    name="dailySpendingLimit"
                    type="text"
                    inputMode="numeric"
                    value={formData.dailySpendingLimit}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum: $100</p>
                </div>

                <div className="mb-2">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="dailyWithdrawalLimit"
                  >
                    Daily ATM Withdrawal Limit ($)
                  </label>
                  <input
                    id="dailyWithdrawalLimit"
                    name="dailyWithdrawalLimit"
                    type="text"
                    inputMode="numeric"
                    value={formData.dailyWithdrawalLimit}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum: $50</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 transition duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-customBlue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
                disabled={loading}
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
                    Processing...
                  </>
                ) : (
                  "Update Limits"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManageLimitsModal;
