import React, { useState } from 'react';

const TransactionPin = ({ onSubmit, onCancel, amount, transactionType }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '4456') { // In a real app, this would be validated against stored PIN
      onSubmit();
    } else {
      setError('Incorrect PIN. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Transaction</h2>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">Transaction Type</p>
          <p className="font-medium text-gray-800">{transactionType}</p>
          {amount && (
            <>
              <p className="text-sm text-gray-600 mt-2">Amount</p>
              <p className="font-medium text-gray-800">${amount.toLocaleString()}</p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter PIN to Confirm
            </label>
            <input
              type="password"
              maxLength="4"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter 4-digit PIN"
              required
            />
            <p className="text-xs hidden text-gray-500 mt-1">For testing, use PIN: 4456</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-customBlue rounded-md hover:bg-blue-600"
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