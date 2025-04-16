import { useState, useEffect } from "react";
import { Header } from "../Components/Header";
import LoadingSpinner from "../Components/LoadingSpinner";
import { Footer } from "../Components/Footer";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../Firebase";

const CardsPage = () => {
  const { user, loading } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    cardType: "Standard Debit Card",
    deliveryAddress: "",
    contactNumber: "",
  });
  const [formErrors, setFormErrors] = useState({
    deliveryAddress: "",
    contactNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  // If user has cards in their Firebase document, use the most recent one
  const [userCards, setUserCards] = useState([]);

  // Get cards data from user or use default mock data if no cards exist yet
  const cardsData = {
    debitCard: user.debit || "9876 **** **** 3210",
    cardStatus: "Active",
    expiryDate: "12/25",
    cardLimit: "$5,000",
    dailyWithdrawalLimit: "$1,000",
    cardType: "Standard Debit Card",
    recentTransactions: [
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
    ],
  };

  useEffect(() => {
    if (user && user.cards) {
      setUserCards(user.cards);

      // If there are approved cards, update the cardsData with the most recent one
      const approvedCards = user.cards.filter(
        (card) => card.status === "Approved"
      );
      if (approvedCards.length > 0) {
        const latestCard = approvedCards[approvedCards.length - 1];
        cardsData.cardType = latestCard.cardType;
        // You could update other card details here if they were stored in the card object
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Cards array is now automatically created in AuthContext when user data is loaded
  // This ensures the cards array exists before any card-related features are accessed

  if (loading) {
    return <LoadingSpinner />; // Loading state
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <h2 className="text-xl text-red-500">User not authenticated!</h2>
      </div>
    );
  }

  // Card type details for comparison
  const cardTypes = [
    {
      type: "Standard Debit Card",
      color: "bg-gradient-to-r from-blue-400 to-blue-600",
      benefits: ["No annual fee", "Online shopping", "ATM access worldwide"],
      limit: "$5,000",
    },
    {
      type: "Premium Debit Card",
      color: "bg-gradient-to-r from-indigo-500 to-purple-600",
      benefits: [
        "Priority customer service",
        "Extended warranty on purchases",
        "Higher daily limits",
      ],
      limit: "$10,000",
    },
    {
      type: "Platinum Debit Card",
      color: "bg-gradient-to-r from-gray-800 to-gray-900",
      benefits: [
        "Concierge service",
        "Travel insurance",
        "Exclusive discounts",
        "Premium rewards",
      ],
      limit: "$25,000",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Reset any validation errors when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Get selected card type details
  const selectedCardType = cardTypes.find(
    (card) => card.type === formData.cardType
  );

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!formData.deliveryAddress.trim()) {
      errors.deliveryAddress = "Delivery address is required";
    }

    const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$|^\d{10}$/;
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = "Contact number is required";
    } else if (!phoneRegex.test(formData.contactNumber.replace(/\s/g, ""))) {
      errors.contactNumber = "Please enter a valid phone number";
    }

    // If there are errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get a reference to the user's document
      const userRef = doc(db, "users", user.uid);

      // Create a new card request object
      const newCardRequest = {
        id: Date.now().toString(),
        cardType: formData.cardType,
        deliveryAddress: formData.deliveryAddress,
        contactNumber: formData.contactNumber,
        status: "Pending",
        requestDate: new Date().toISOString(),
      };

      // Add the new card request to the cards array
      // We can use arrayUnion since we know the cards array always exists now
      await updateDoc(userRef, {
        cards: [...(user.cards || []), newCardRequest],
      });

      setIsSubmitting(false);
      setRequestSuccess(true);
      setShowRequestForm(false);

      // Reset form data
      setFormData({
        cardType: "Standard Debit Card",
        deliveryAddress: "",
        contactNumber: "",
      });

      // Reset form after successful submission
      setTimeout(() => {
        setRequestSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting card request:", error);
      setIsSubmitting(false);
      // You could add error handling here to show an error message to the user
    }
  };

  return (
    <div className="bg-gray-100 font-lato min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="lg:ml-64 md:px-4 flex-grow p-6 -mt-16 md:mt-0 relative z-10">
        {/* Success Message */}
        {requestSuccess && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">
              Your card request has been submitted successfully. We&#39;ll
              process it shortly.
            </span>
          </div>
        )}

        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Cards</h1>
          {!showRequestForm && (
            <button
              onClick={() => setShowRequestForm(true)}
              className="bg-customBlue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Request New Card
            </button>
          )}
        </div>

        {/* Card Request Form */}
        {showRequestForm ? (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border-t-4 border-customBlue">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Request a New Debit Card
              </h2>
              <button
                onClick={() => setShowRequestForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestSubmit}>
              {/* Card Type Selection with Visual Cards */}
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="cardType"
                >
                  Card Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {cardTypes.map((card) => (
                    <div
                      key={card.type}
                      onClick={() =>
                        setFormData({ ...formData, cardType: card.type })
                      }
                      className={`${
                        card.color
                      } rounded-xl p-4 text-white cursor-pointer transform transition-transform duration-300 hover:scale-105 ${
                        formData.cardType === card.type
                          ? "ring-4 ring-customBlue scale-105"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="text-xs opacity-80">Citi</div>
                          <div className="text-sm font-bold">Banking</div>
                        </div>
                        <img
                          src="/Svg/atm-card-credit-svgrepo-com.svg"
                          alt="Card icon"
                          className="w-8 h-8"
                        />
                      </div>
                      <div className="mb-6">
                        <div className="text-xs opacity-80">Card Number</div>
                        <div className="font-mono">**** **** **** ****</div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-xs opacity-80">Card Type</div>
                          <div className="font-bold">
                            {card.type.split(" ")[0]}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-80">Expires</div>
                          <div>**/**</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Benefits */}
                {selectedCardType && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Benefits of {selectedCardType.type}
                    </h3>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {selectedCardType.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold">Card Limit:</span>{" "}
                      {selectedCardType.limit}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="deliveryAddress"
                >
                  Delivery Address
                </label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border ${
                    formErrors.deliveryAddress
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                  rows="3"
                  required
                ></textarea>
                {formErrors.deliveryAddress && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.deliveryAddress}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="contactNumber"
                >
                  Contact Number
                </label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border ${
                    formErrors.contactNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                  placeholder="(123) 456-7890"
                  required
                />
                {formErrors.contactNumber && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.contactNumber}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-customBlue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
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
                    "Submit Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white p-4 flex flex-col gap-6 shadow-lg rounded-lg">
            {/* Visual Debit Card Section */}
            <div className="relative overflow-hidden">
              {/* Find the card type from cardTypes array */}
              {(() => {
                const cardTypeInfo =
                  cardTypes.find((card) => card.type === cardsData.cardType) ||
                  cardTypes[0];
                return (
                  <div
                    className={`${cardTypeInfo.color} rounded-xl p-6 text-white shadow-lg transform transition-all duration-500 hover:scale-[1.02]`}
                  >
                    {/* Card Chip and Logo */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="text-sm opacity-80">Citi</div>
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
                        {cardsData.debitCard}
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
                        <div>{cardsData.expiryDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-80">Status</div>
                        <div className="font-semibold">
                          {cardsData.cardStatus}
                        </div>
                      </div>
                    </div>

                    {/* Card Type Badge */}
                    <div className="absolute top-2 right-2 bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                      {cardsData.cardType.split(" ")[0]}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Card Details */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <img
                  src="/Svg/atm-card-credit-svgrepo-com.svg"
                  alt="Card Details"
                  className="w-6 h-6 mr-2"
                />
                Card Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-customLightBlue rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Card Limit
                  </h3>
                  <p className="text-customColor text-xl font-bold">
                    {cardsData.cardLimit}
                  </p>
                  <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-customBlue h-full rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    65% of limit used
                  </p>
                </div>
                <div className="bg-customLightBlue rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Daily Withdrawal Limit
                  </h3>
                  <p className="text-customColor text-xl font-bold">
                    {cardsData.dailyWithdrawalLimit}
                  </p>
                  <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-customBlue h-full rounded-full"
                      style={{ width: "30%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    30% of daily limit used
                  </p>
                </div>
              </div>
            </div>

            {/* Requested Cards Section */}
            {userCards.length > 0 && (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                  <img
                    src="/Svg/atm-card-credit-svgrepo-com.svg"
                    alt="Requested Cards"
                    className="w-6 h-6 mr-2"
                  />
                  Requested Cards
                </h2>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Card Type
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Request Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Estimated Delivery
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userCards.map((card) => {
                        // Calculate estimated delivery date (7 days from request date for pending cards)
                        const requestDate = new Date(card.requestDate);
                        const estimatedDelivery = new Date(requestDate);
                        estimatedDelivery.setDate(requestDate.getDate() + 7);

                        return (
                          <tr key={card.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {card.cardType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(card.requestDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  card.status === "Approved"
                                    ? "bg-green-100 text-green-800"
                                    : card.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {card.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {card.status === "Approved"
                                ? "Shipped"
                                : card.status === "Rejected"
                                ? "N/A"
                                : estimatedDelivery.toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Card Transactions */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <img
                  src="/Svg/bill-list-svgrepo-com.svg"
                  alt="Transactions"
                  className="w-6 h-6 mr-2"
                />
                Recent Card Transactions
              </h2>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Merchant
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cardsData.recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {transaction.merchant}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {transaction.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.type === "purchase"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card Services */}
            <div className="mt-4 bg-gradient-to-r from-[#54b1ed] to-[#004D8E] p-4 rounded-lg">
              <div className="flex flex-col md:flex-row justify-between items-center text-white">
                <div className="flex items-center mb-4 md:mb-0">
                  <img
                    src="/Svg/atm-card-credit-svgrepo-com.svg"
                    alt="Card Services"
                    className="w-8 h-8 mr-3"
                  />
                  <div>
                    <h3 className="font-semibold">Card Services</h3>
                    <p className="text-sm opacity-80">
                      Manage your card settings
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button className="bg-white text-customBlue px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition duration-300 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
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
                    Block Card
                  </button>
                  <button className="bg-white text-customBlue px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition duration-300 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    Set PIN
                  </button>
                  <button className="bg-white text-customBlue px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition duration-300 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
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
                    Manage Limits
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CardsPage;
