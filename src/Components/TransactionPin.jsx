import React, { useState } from "react";

const TransactionPin = ({ onSubmit, onCancel, amount, transactionType }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === "4456") {
      // In a real app, this would be validated against stored PIN
      onSubmit();
    } else {
      setError("Incorrect PIN. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          Confirm Transaction
        </h2>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl mb-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Transaction Type</p>
          <p className="font-semibold text-gray-800 text-lg">
            {transactionType}
          </p>
          {amount && (
            <>
              <p className="text-sm font-medium text-gray-600 mt-3">Amount</p>
              <p className="font-semibold text-gray-800 text-lg">
                ${amount.toLocaleString()}
              </p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter PIN to Confirm
            </label>
            <input
              type="password"
              maxLength="4"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
              placeholder="Enter 4-digit PIN"
              required
            />
            <p className="text-xs hidden text-gray-500 mt-1">
              For testing, use PIN: 4456
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-lg text-sm border-l-4 border-red-500 animate-shake">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-white bg-gradient-to-r from-customBlue to-blue-600 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionPin;
