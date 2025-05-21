import React, { useState } from "react";
import TransactionPin from "./TransactionPin";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../Firebase";
import { useAuth } from "../context/AuthContext";

export const ActionButtons = () => {
  const { user } = useAuth();
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [amount, setAmount] = useState("");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const actions = [
    { 
      name: "Wire Transfer", 
      icon: "Svg/cash-svgrepo-com.svg",
      minAmount: 100,
      maxAmount: 50000
    },
    { 
      name: "Pay Bills", 
      icon: "Svg/bill-list-svgrepo-com.svg",
      minAmount: 10,
      maxAmount: 10000
    },
    { 
      name: "Buy Crypto", 
      icon: "Svg/buy-crypto-svgrepo-com.svg",
      minAmount: 50,
      maxAmount: 25000
    },
    { 
      name: "Deposit Funds", 
      icon: "Svg/atm-deposit-svgrepo-com.svg",
      minAmount: 10,
      maxAmount: 100000
    }
  ];

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setShowTransactionModal(true);
    setError("");
    setSuccess(false);
  };

  const handleTransactionSubmit = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const numAmount = Number(amount);
    if (numAmount < selectedAction.minAmount) {
      setError(`Minimum amount is $${selectedAction.minAmount}`);
      return;
    }

    if (numAmount > selectedAction.maxAmount) {
      setError(`Maximum amount is $${selectedAction.maxAmount}`);
      return;
    }

    if (selectedAction.name !== "Deposit Funds" && numAmount > user.balance) {
      setError("Insufficient funds");
      return;
    }

    setShowPinModal(true);
  };

  const handlePinConfirm = async () => {
    setProcessing(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const transactionAmount = selectedAction.name === "Deposit Funds" ? Number(amount) : -Number(amount);
      const newBalance = user.balance + transactionAmount;

      const transaction = {
        type: "transfer",
        amount: transactionAmount,
        description: selectedAction.name,
        date: new Date().toISOString(),
        status: "Completed"
      };

      await updateDoc(userRef, {
        balance: newBalance,
        transactions: arrayUnion(transaction)
      });

      setSuccess(true);
      setShowPinModal(false);
      setTimeout(() => {
        setShowTransactionModal(false);
        setSuccess(false);
        setAmount("");
      }, 2000);
    } catch (err) {
      setError("Transaction failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-md shadow-md mx-4 mt-6">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className="p-4 text-center rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 transition-all duration-300"
          >
            <img
              src={action.icon}
              alt={`${action.name} icon`}
              className="w-10 h-10 mb-2"
            />
            <p className="text-sm whitespace-nowrap">{action.name}</p>
          </button>
        ))}
      </div>

      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedAction.name}
            </h2>

            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-800">Transaction Successful!</p>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleTransactionSubmit();
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Min: ${selectedAction.minAmount} | Max: ${selectedAction.maxAmount.toLocaleString()}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowTransactionModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-customBlue rounded-md hover:bg-blue-600"
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Continue"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showPinModal && (
        <TransactionPin
          onSubmit={handlePinConfirm}
          onCancel={() => setShowPinModal(false)}
          amount={Number(amount)}
          transactionType={selectedAction.name}
        />
      )}
    </>
  );
};