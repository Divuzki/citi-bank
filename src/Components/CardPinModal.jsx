import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../Firebase';

const CardPinModal = ({ isOpen, onClose, user }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setPin('');
      setConfirmPin('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate PIN
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    // Confirm PIN match
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);

    try {
      // Get the current cards array
      const cards = [...user.cards];
      
      // Find the active card (assuming the first approved card is the active one)
      const activeCardIndex = cards.findIndex(card => card.status === 'Approved');
      
      if (activeCardIndex === -1) {
        setError('No active card found');
        setLoading(false);
        return;
      }
      
      // Update the PIN for the active card
      cards[activeCardIndex] = {
        ...cards[activeCardIndex],
        pin: pin, // In a real app, this should be encrypted/hashed
        pinUpdatedAt: new Date().toISOString()
      };
      
      // Update the user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { cards });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000); // Close after 2 seconds
    } catch (error) {
      console.error('Error updating PIN:', error);
      setError('Failed to update PIN. Please try again.');
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
          Set Card PIN
        </h2>
        
        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">Your card PIN has been updated.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pin">
                New PIN (4 digits)
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength="4"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter 4-digit PIN"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPin">
                Confirm PIN
              </label>
              <input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                maxLength="4"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Confirm 4-digit PIN"
                required
              />
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
                  "Set PIN"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CardPinModal;