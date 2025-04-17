import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../Firebase";

const BlockCardModal = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Check if the active card is already blocked when modal opens
  useEffect(() => {
    if (isOpen && user && user.cards) {
      const activeCard = user.cards.find((card) => card.status === "Approved");
      if (activeCard) {
        setIsBlocked(activeCard.isBlocked || false);
      }
      setError("");
      setSuccess(false);
    }
  }, [isOpen, user]);

  const handleToggleBlock = async () => {
    setError("");
    setLoading(true);

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

      // Toggle the blocked status
      const newBlockedStatus = !isBlocked;

      // Update the card status
      cards[activeCardIndex] = {
        ...cards[activeCardIndex],
        isBlocked: newBlockedStatus,
        blockUpdatedAt: new Date().toISOString(),
      };

      // Update the user document in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { cards });

      setIsBlocked(newBlockedStatus);
      setSuccess(true);

      // Close modal after success message is shown
      setTimeout(() => {
        if (newBlockedStatus) {
          onClose(); // Close immediately if card was blocked
        } else {
          setSuccess(false); // Reset success state if card was unblocked
        }
      }, 2000);
    } catch (error) {
      console.error("Error updating card block status:", error);
      setError("Failed to update card status. Please try again.");
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          {isBlocked ? "Unblock Card" : "Block Card"}
        </h2>

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">
              Your card has been {isBlocked ? "blocked" : "unblocked"}{" "}
              successfully.
            </span>
          </div>
        ) : (
          <div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}

            <div className="mb-6">
              <div
                className={`p-4 rounded-lg ${
                  isBlocked ? "bg-red-50" : "bg-yellow-50"
                }`}
              >
                <h3 className="font-semibold text-gray-800 mb-2">
                  {isBlocked
                    ? "Your card is currently blocked"
                    : "Block your card temporarily?"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {isBlocked
                    ? "Your card is currently blocked and cannot be used for any transactions. You can unblock it anytime."
                    : "If your card is lost or stolen, you can block it temporarily. All transactions will be declined until you unblock it."}
                </p>

                {isBlocked && (
                  <div className="bg-white p-3 rounded border border-red-200 mb-4">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-red-700 font-medium">
                        Card Blocked
                      </span>
                    </div>
                  </div>
                )}
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
                type="button"
                onClick={handleToggleBlock}
                className={`${
                  isBlocked
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center`}
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
                ) : isBlocked ? (
                  "Unblock Card"
                ) : (
                  "Block Card"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockCardModal;
