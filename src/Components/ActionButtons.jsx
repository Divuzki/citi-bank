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
  // Hidden configuration for transaction approval/decline - toggleable for testing
  const [allowTransactions, setAllowTransactions] = useState(true); // Toggle this to simulate declined transactions
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  const actions = [
    {
      name: "Wire Transfer",
      description: "Send money to other banks",
      icon: "Svg/cash-svgrepo-com.svg",
      minAmount: 100,
      maxAmount: 50000,
      component: WireTransferForm,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      name: "Pay Bills",
      description: "Utilities, credit cards & more",
      icon: "Svg/bill-list-svgrepo-com.svg",
      minAmount: 10,
      maxAmount: 10000,
      component: BillPaymentForm,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      name: "Buy Crypto",
      description: "Invest in cryptocurrency",
      icon: "Svg/buy-crypto-svgrepo-com.svg",
      minAmount: 50,
      maxAmount: 25000,
      component: CryptoTradeForm,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      name: "Deposit Funds",
      description: "Add money to your account",
      icon: "Svg/atm-deposit-svgrepo-com.svg",
      minAmount: 10,
      maxAmount: 100000,
      component: DepositForm,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
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
      if (!allowTransactions) {
        // Simulate a declined transaction
        setTimeout(() => {
          setShowPinModal(false);
          setShowDeclineModal(true);
          setTimeout(() => {
            setShowDeclineModal(false);
            setShowTransactionModal(false);
          }, 2000);
        }, 500);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const amount =
        selectedAction.name === "Deposit Funds"
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
        ...transactionDetails.additionalDetails,
      };

      await updateDoc(userRef, {
        balance: newBalance,
        transactions: arrayUnion(transaction),
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

  // Transaction status is now controlled via the hidden configuration variable above
  // A developer toggle is added below for testing purposes

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 text-left overflow-hidden"
          >
            {/* Background gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            ></div>

            {/* Icon container */}
            <div
              className={`${action.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
              <img
                src={action.icon}
                alt={`${action.name} icon`}
                className="w-7 h-7"
              />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-800">
                {action.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {action.description}
              </p>

              {/* Amount range */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  ${action.minAmount.toLocaleString()} - $
                  {action.maxAmount.toLocaleString()}
                </span>
                <div
                  className={`w-6 h-6 rounded-full ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <svg
                    className={`w-3 h-3 ${action.textColor}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Developer toggle for transaction outcomes - only visible in development */}
      <div className="fixed hidden bottom-6 right-6 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50 text-sm max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-700">Dev Mode</span>
          <div
            className={`w-3 h-3 rounded-full ${
              allowTransactions ? "bg-green-500" : "bg-red-500"
            } animate-pulse`}
          ></div>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => setAllowTransactions(!allowTransactions)}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              allowTransactions
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {allowTransactions ? "✓ Success Mode" : "✗ Decline Mode"}
          </button>
          <p className="text-xs text-gray-500 text-center">
            {allowTransactions
              ? "Transactions will succeed"
              : "Transactions will be declined"}
          </p>
        </div>
      </div>
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all duration-300 animate-fadeIn overflow-hidden">
            {/* Modal Header */}
            <div
              className={`bg-gradient-to-r ${
                selectedAction?.color || "from-blue-500 to-blue-600"
              } px-6 py-4`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <img
                      src={selectedAction?.icon}
                      alt={`${selectedAction?.name} icon`}
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedAction?.name}
                    </h2>
                    <p className="text-white text-opacity-80 text-sm">
                      {selectedAction?.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-white hover:text-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-8 transform transition-all duration-500 animate-fadeIn">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Transaction Successful!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your {selectedAction?.name?.toLowerCase()} has been
                    processed successfully.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-700 font-medium">
                      ✓ Transaction completed and recorded
                    </p>
                  </div>
                </div>
              ) : showDeclineModal ? (
                <div className="text-center py-8 transform transition-all duration-500 animate-fadeIn">
                  <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Transaction Declined
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your {selectedAction?.name?.toLowerCase()} has been
                    declined.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700 font-medium">
                      ⚠ Please contact support or try again later
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-red-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-medium">{error}</span>
                      </div>
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

export default ActionButtons;
