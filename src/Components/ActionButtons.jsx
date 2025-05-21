import React, { useState } from "react";
import TransactionPin from "./TransactionPin";
import WireTransferForm from "./WireTransferForm";
import BillPaymentForm from "./BillPaymentForm";
import CryptoTradeForm from "./CryptoTradeForm";
import DepositForm from "./DepositForm";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../Firebase";
import { useAuth } from "../context/AuthContext";

export const ActionButtons = () => {
  const { user } = useAuth();
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const actions = [
    { 
      name: "Wire Transfer", 
      icon: "Svg/cash-svgrepo-com.svg",
      minAmount: 100,
      maxAmount: 50000,
      component: WireTransferForm
    },
    { 
      name: "Pay Bills", 
      icon: "Svg/bill-list-svgrepo-com.svg",
      minAmount: 10,
      maxAmount: 10000,
      component: BillPaymentForm
    },
    { 
      name: "Buy Crypto", 
      icon: "Svg/buy-crypto-svgrepo-com.svg",
      minAmount: 50,
      maxAmount: 25000,
      component: CryptoTradeForm
    },
    { 
      name: "Deposit Funds", 
      icon: "Svg/atm-deposit-svgrepo-com.svg",
      minAmount: 10,
      maxAmount: 100000,
      component: DepositForm
    }
  ];

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setShowTransactionModal(true);
    setError("");
    setSuccess(false);
    setTransactionDetails(null);
  };

  const handleTransactionSubmit = (details) => {
    const amount = Number(details.amount);
    
    if (amount < selectedAction.minAmount) {
      setError(`Minimum amount is $${selectedAction.minAmount}`);
      return;
    }

    if (amount > selectedAction.maxAmount) {
      setError(`Maximum amount is $${selectedAction.maxAmount}`);
      return;
    }

    if (selectedAction.name !== "Deposit Funds" && amount > user.balance) {
      setError("Insufficient funds");
      return;
    }

    setTransactionDetails(details);
    setShowPinModal(true);
  };

  const handlePinConfirm = async () => {
    setProcessing(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const amount = selectedAction.name === "Deposit Funds" 
        ? Number(transactionDetails.amount) 
        : -Number(transactionDetails.amount);
      
      const newBalance = user.balance + amount;

      const transaction = {
        type: selectedAction.name.toLowerCase().replace(" ", "_"),
        amount,
        description: getTransactionDescription(),
        date: new Date().toISOString(),
        status: "Completed",
        recipientName: transactionDetails.recipientName,
        recipientBank: transactionDetails.recipientBank,
        recipientAccount: transactionDetails.recipientAccount,
        reference: transactionDetails.reference,
        ...transactionDetails.additionalDetails
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
        setTransactionDetails(null);
      }, 2000);
    } catch (err) {
      setError("Transaction failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionDescription = () => {
    switch (selectedAction.name) {
      case "Wire Transfer":
        return `Wire Transfer to ${transactionDetails.recipientName}`;
      case "Pay Bills":
        return `Bill Payment - ${transactionDetails.billType}`;
      case "Buy Crypto":
        return `Crypto Purchase - ${transactionDetails.cryptoType}`;
      case "Deposit Funds":
        return `Deposit via ${transactionDetails.depositMethod}`;
      default:
        return selectedAction.name;
    }
  };

  const FormComponent = selectedAction?.component;

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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedAction.name}
              </h2>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-800">Transaction Successful!</p>
                <p className="text-sm text-gray-600 mt-2">
                  Your {selectedAction.name.toLowerCase()} has been processed successfully.
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {FormComponent && (
                  <FormComponent
                    onSubmit={handleTransactionSubmit}
                    onCancel={() => setShowTransactionModal(false)}
                    minAmount={selectedAction.minAmount}
                    maxAmount={selectedAction.maxAmount}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showPinModal && (
        <TransactionPin
          onSubmit={handlePinConfirm}
          onCancel={() => setShowPinModal(false)}
          amount={Number(transactionDetails.amount)}
          transactionType={selectedAction.name}
          transactionDetails={transactionDetails}
        />
      )}
    </>
  );
};