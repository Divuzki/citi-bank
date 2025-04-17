import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../Components/Header";
import LoadingSpinner from "../Components/LoadingSpinner";
import { Footer } from "../Components/Footer";
import { useAuth } from "../context/AuthContext";
import BlockCardModal from "../Components/BlockCardModal";
import CardPinModal from "../Components/CardPinModal";
import ManageLimitsModal from "../Components/ManageLimitsModal";

const CardDetailsPage = () => {
  const { user, loading } = useAuth();
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [showBlockCardModal, setShowBlockCardModal] = useState(false);
  const [showCardPinModal, setShowCardPinModal] = useState(false);
  const [showManageLimitsModal, setShowManageLimitsModal] = useState(false);
  const [activeTransactionTab, setActiveTransactionTab] = useState("all");

  useEffect(() => {
    if (user && user.cards) {
      // Find the card with the matching ID
      const foundCard = user.cards.find((c) => c.id === cardId);

      // If card not found, use the first approved card
      if (!foundCard) {
        const approvedCard = user.cards.find((c) => c.status === "Approved");
        if (approvedCard) {
          setCard(approvedCard);
        } else {
          // No approved cards, redirect to cards page
          navigate("/cards");
        }
      } else {
        setCard(foundCard);
      }
    }
  }, [user, cardId, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <h2 className="text-xl text-red-500">User not authenticated!</h2>
      </div>
    );
  }

  if (!card) {
    return <LoadingSpinner />;
  }

  // Card type details for styling
  const cardTypes = [
    {
      type: "Standard Debit Card",
      color: "bg-gradient-to-r from-blue-400 to-blue-600",
    },
    {
      type: "Premium Debit Card",
      color: "bg-gradient-to-r from-indigo-500 to-purple-600",
    },
    {
      type: "Platinum Debit Card",
      color: "bg-gradient-to-r from-gray-800 to-gray-900",
    },
    {
      type: "Virtual Debit Card",
      color: "bg-gradient-to-r from-green-400 to-teal-500",
    },
  ];

  // Get card styling based on type
  const cardTypeInfo =
    cardTypes.find((c) => c.type === card.cardType) || cardTypes[0];

  // Mock transaction data - in a real app, this would come from the database
  const mockTransactions = [
    {
      id: 1,
      merchant: "Amazon",
      amount: "$42.99",
      date: "2023-06-15",
      type: "purchase",
    },
    {
      id: 2,
      merchant: "Starbucks",
      amount: "$5.75",
      date: "2023-06-14",
      type: "purchase",
    },
    {
      id: 3,
      merchant: "ATM Withdrawal",
      amount: "$200.00",
      date: "2023-06-10",
      type: "withdrawal",
    },
    {
      id: 4,
      merchant: "Target",
      amount: "$67.32",
      date: "2023-06-08",
      type: "purchase",
    },
    {
      id: 5,
      merchant: "Netflix",
      amount: "$14.99",
      date: "2023-06-05",
      type: "subscription",
    },
  ];

  // Filter transactions based on active tab
  const filteredTransactions =
    activeTransactionTab === "all"
      ? mockTransactions
      : mockTransactions.filter((t) => t.type === activeTransactionTab);

  return (
    <div className="bg-gray-100 font-lato min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="lg:ml-64 md:px-4 flex-grow p-6 -mt-16 md:mt-0 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/cards")}
          className="flex items-center text-customBlue mb-4 hover:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Cards
        </button>

        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Card Details</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowManageLimitsModal(true)}
              className="bg-customBlue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Manage Limits
            </button>
            <button
              onClick={() => setShowCardPinModal(true)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Change PIN
            </button>
            <button
              onClick={() => setShowBlockCardModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              {card.isBlocked ? "Unblock Card" : "Block Card"}
            </button>
          </div>
        </div>

        {/* Card Display */}
        <div className="bg-white p-6 shadow-lg rounded-lg mb-6">
          <div
            className={`${cardTypeInfo.color} rounded-xl p-6 text-white shadow-lg transform transition-all duration-500 hover:scale-[1.02] mb-6`}
          >
            {/* Card Chip and Logo */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-sm opacity-80">Quontic</div>
                <div className="text-lg font-bold">Banking</div>
              </div>
              <img
                src="/Svg/atm-card-credit-svgrepo-com.svg"
                alt="Debit Card Icon"
                className="w-12 h-12"
              />
            </div>

            {/* Card Number */}
            <div className="mb-8">
              <div className="text-xs opacity-80">Card Number</div>
              <div className="font-mono text-xl tracking-wider">
                {card.cardNumber || "**** **** **** ****"}
              </div>
            </div>

            {/* Card Details Bottom Row */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs opacity-80">Card Holder</div>
                <div className="font-bold">
                  {user.firstName} {user.lastName}
                </div>
              </div>
              <div>
                <div className="text-xs opacity-80">Expires</div>
                <div>{card.expiryDate || "MM/YY"}</div>
              </div>
            </div>
          </div>

          {/* Card Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Card Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Card Type:</span>
                  <span className="font-medium">{card.cardType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${
                      card.isBlocked ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {card.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">
                    {new Date(card.requestDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Spending Limit:</span>
                  <span className="font-medium">
                    ${card.dailySpendingLimit || "5,000"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Withdrawal Limit:</span>
                  <span className="font-medium">
                    ${card.dailyWithdrawalLimit || "1,000"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Address:</span>
                  <span className="font-medium text-right">
                    {card.deliveryAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact Number:</span>
                  <span className="font-medium">{card.contactNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent Transactions
          </h2>

          {/* Transaction Tabs */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTransactionTab("all")}
              className={`py-2 px-4 rounded ${
                activeTransactionTab === "all"
                  ? "bg-customBlue text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTransactionTab("purchase")}
              className={`py-2 px-4 rounded ${
                activeTransactionTab === "purchase"
                  ? "bg-customBlue text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Purchases
            </button>
            <button
              onClick={() => setActiveTransactionTab("withdrawal")}
              className={`py-2 px-4 rounded ${
                activeTransactionTab === "withdrawal"
                  ? "bg-customBlue text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Withdrawals
            </button>
          </div>

          {/* Transaction List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Merchant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.merchant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-500">
                      {transaction.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No transactions found
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BlockCardModal
        isOpen={showBlockCardModal}
        onClose={() => setShowBlockCardModal(false)}
        user={user}
      />
      <CardPinModal
        isOpen={showCardPinModal}
        onClose={() => setShowCardPinModal(false)}
        user={user}
      />
      <ManageLimitsModal
        isOpen={showManageLimitsModal}
        onClose={() => setShowManageLimitsModal(false)}
        user={user}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CardDetailsPage;
