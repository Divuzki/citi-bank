// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Header } from "../Components/Header";
import { Footer } from "../Components/Footer";
import { useAuth } from "../context/AuthContext";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import HistoryIcon from "@mui/icons-material/History";
import Select from "react-select";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../Firebase";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Mock bank data with logos
const mockBankData = [
  {
    bankName: "Bank of America",
    routineNumber: "021000322",
    accountNumber: "1234567890",
    fullName: "John Doe",
    logo: "/Svg/bankofamerica-icon.svg", // Example logo URL
  },
  {
    bankName: "Chase Bank",
    routineNumber: "021000021",
    accountNumber: "9876543210",
    fullName: "Jane Smith",
    logo: "/Svg/chase-logo-svgrepo-com.svg", // Example logo URL
  },
  {
    bankName: "Wells Fargo",
    routineNumber: "121000248",
    accountNumber: "5555555555",
    fullName: "Robert Johnson",
    logo: "/Svg/wells-fargo.svg", // Example logo URL
  },
  {
    bankName: "Quant Equity Bank",
    routineNumber: "021000089",
    accountNumber: "111122223333",
    fullName: "Emily Davis",
    logo: "/Svg/logo.png", // Example logo URL
  },
  {
    bankName: "U.S. Bank",
    routineNumber: "091000022",
    accountNumber: "444455556666",
    fullName: "Michael Brown",
    logo: "/Svg/us-bank-2.svg", // Example logo URL
  },
  {
    bankName: "PNC Bank",
    routineNumber: "043000096",
    accountNumber: "777788889999",
    fullName: "Sarah Wilson",
    logo: "/Svg/pnc.svg", // Example logo URL
  },
  {
    bankName: "TD Bank",
    routineNumber: "031201360",
    accountNumber: "222233334444",
    fullName: "David Martinez",
    logo: "/Svg/tdbank-icon.svg", // Example logo URL
  },
  {
    bankName: "Capital One",
    routineNumber: "056073502",
    accountNumber: "888899991111",
    fullName: "Laura Garcia",
    logo: "/Svg/Capital_One-Logo.wine.svg", // Example logo URL
  },
  {
    bankName: "HSBC Bank",
    routineNumber: "021001088",
    accountNumber: "333344445555",
    fullName: "James Anderson",
    logo: "/Svg/hsbc-icon.svg", // Example logo URL
  },
  {
    bankName: "Ally Bank",
    routineNumber: "124003116",
    accountNumber: "666677778888",
    fullName: "Olivia Taylor",
    logo: "/Svg/ally-bank.svg", // Example logo URL
  },
  {
    bankName: "First national bank of Texas(FNBT)",
    routineNumber: "111906271",
    accountNumber: "527290902",
    fullName: "Jerimiah Lopez",
    logo: "/Image/first.png", // Example logo URL
  },
  {
    bankName: "Discover Bank",
    routineNumber: "031100649",
    accountNumber: "999900001111",
    fullName: "William Thomas",
    logo: "/Svg/discover-svgrepo-com.svg", // Example logo URL
  },
  {
    bankName: "Barclays Bank",
    routineNumber: "075000522",
    accountNumber: "123412341234",
    fullName: "Sophia Clark",
    logo: "/Svg/barclays-icon.svg", // Example logo URL
  },
  {
    bankName: "Santander Bank",
    routineNumber: "231372691",
    accountNumber: "567856785678",
    fullName: "Daniel Lewis",
    logo: "/Svg/santander1.svg", // Example logo URL
  },
  {
    bankName: "BB&T Bank",
    routineNumber: "053101121",
    accountNumber: "987698769876",
    fullName: "Emma Walker",
    logo: "/Svg/bbt-icon.svg", // Example logo URL
  },
  {
    bankName: "SunTrust Bank",
    routineNumber: "061000104",
    accountNumber: "432143214321",
    fullName: "Noah Hall",
    logo: "/Svg/suntrust-bank.svg", // Example logo URL
  },
  {
    bankName: "Wildfire credit union",
    routineNumber: "272484713",
    accountNumber: "40074155",
    fullName: "Mellisa Stacy",
    logo: "/Image/wild.png", // Example logo URL
  },
  {
    bankName: "Regions Bank",
    routineNumber: "062000019",
    accountNumber: "876587658765",
    fullName: "Ava Green",
    logo: "/Svg/regions-bank-seeklogo.svg", // Example logo URL
  },
  {
    bankName: "Fifth Third Bank",
    routineNumber: "042000314",
    accountNumber: "234523452345",
    fullName: "Liam Adams",
    logo: "/Svg/fifth-third-bank.svg", // Example logo URL
  },
  {
    bankName: "KeyBank",
    routineNumber: "041001039",
    accountNumber: "678967896789",
    fullName: "Mia Nelson",
    logo: "/Svg/key-bank.svg", // Example logo URL
  },
  {
    bankName: "Huntington Bank",
    routineNumber: "044000024",
    accountNumber: "345634563456",
    fullName: "Ethan Carter",
    logo: "/Svg/huntington.svg", // Example logo URL
  },
  {
    bankName: "M&T Bank",
    routineNumber: "022000046",
    accountNumber: "789078907890",
    fullName: "Charlotte Mitchell",
    logo: "/Svg/m-t-bank.svg", // Example logo URL
  },
];

const TransfersPage = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [routineNumber, setRoutineNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [transferType, setTransferType] = useState("immediate"); // immediate or scheduled
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [transferNote, setTransferNote] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [frequentRecipients, setFrequentRecipients] = useState([]);
  // Hidden configuration for transaction approval/decline - toggleable for testing
  const [allowTransactions, setAllowTransactions] = useState(true); // Toggle this to simulate declined transactions
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  // Get recent transfer transactions
  useEffect(() => {
    if (user && user.transactions) {
      // Filter only transfer transactions and sort by date (newest first)
      const transfers = user.transactions
        .filter((transaction) => transaction.type === "transfer")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5); // Get only the 5 most recent transfers

      setRecentTransactions(transfers);

      // Extract frequent recipients from transfer transactions
      const recipients = {};
      user.transactions
        .filter((transaction) => transaction.type === "transfer")
        .forEach((transaction) => {
          const key = `${transaction.recipientBank}-${transaction.recipientAccount}`;
          if (recipients[key]) {
            recipients[key].count += 1;
          } else {
            recipients[key] = {
              bank: transaction.recipientBank,
              account: transaction.recipientAccount,
              name: transaction.recipientName || "Unknown",
              count: 1,
            };
          }
        });

      // Convert to array and sort by frequency
      const frequentRecipientsList = Object.values(recipients)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3); // Get top 3 frequent recipients

      setFrequentRecipients(frequentRecipientsList);
    }
  }, [user]);

  const validateBankDetails = () => {
    // Input validation
    if (!selectedBank) {
      setTransferError("Please select a bank");
      return;
    }

    if (!routineNumber || routineNumber.length < 9) {
      setTransferError("Please enter a valid routing number (9 digits)");
      return;
    }

    if (!accountNumber || accountNumber.length < 8) {
      setTransferError(
        "Please enter a valid account number (at least 8 digits)"
      );
      return;
    }

    setTransferError(""); // Clear any previous errors

    const matchedBank = mockBankData.find(
      (bank) => bank.bankName === selectedBank?.value
    );

    if (matchedBank) {
      setIsVerifying(true);
      setTimeout(() => {
        setVerifiedUser(matchedBank);
        setIsVerifying(false);
      }, 2000);
    } else {
      setIsVerifying(true);
      setTimeout(() => {
        setVerifiedUser(null);
        setIsVerifying(false);
        setTransferError(
          "Bank details could not be verified. Please check and try again."
        );
      }, 2000);
    }
  };

  const handleConfirmTransfer = async () => {
    // Validate PIN
    if (pin !== "4456") {
      setTransferError("Incorrect PIN");
      return;
    }

    // Validate amount
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setTransferError("Please enter a valid amount");
      return;
    }

    // Check if user has sufficient balance
    if (Number(amount) > user.balance) {
      setTransferError("Insufficient funds");
      return;
    }

    // For scheduled transfers, validate date
    if (
      transferType === "scheduled" &&
      (!scheduledDate || scheduledDate < new Date())
    ) {
      setTransferError("Please select a future date for scheduled transfer");
      return;
    }

    setIsProcessing(true);
    setTransferError("");

    try {
      if (!allowTransactions) {
        // Simulate a declined transaction
        setTimeout(() => {
          setIsProcessing(false);
          setShowDeclineModal(true);
          setTimeout(() => {
            setShowDeclineModal(false);
            closeModal();
          }, 2000);
        }, 500);
        return;
      }

      const userRef = doc(db, "users", user.uid);

      // Calculate new balance
      const newBalance = user.balance - Number(amount);

      // Create transaction object
      const transactionData = {
        date: new Date().toISOString(),
        type: "transfer",
        description:
          transferType === "scheduled"
            ? "Scheduled Bank Transfer"
            : "Bank Transfer",
        recipientBank: verifiedUser.bankName,
        recipientAccount: verifiedUser.accountNumber,
        recipientName: verifiedUser.fullName,
        amount: -Number(amount),
        status: transferType === "scheduled" ? "Scheduled" : "Completed",
        note: transferNote || "",
      };

      // Add scheduled date if applicable
      if (transferType === "scheduled") {
        transactionData.scheduledDate = scheduledDate.toISOString();
      }

      // Only update balance for immediate transfers
      if (transferType === "immediate") {
        await updateDoc(userRef, {
          balance: newBalance,
          transactions: arrayUnion(transactionData),
        });
      } else {
        // For scheduled transfers, just add the transaction
        await updateDoc(userRef, {
          transactions: arrayUnion(transactionData),
        });
      }

      setTimeout(() => {
        setIsProcessing(false);
        setShowReceipt(true);
      }, 2000);
    } catch (error) {
      setTransferError("Transfer failed: " + error.message);
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setVerifiedUser(null);
    setAmount("");
    setSelectedBank(null);
    setRoutineNumber("");
    setAccountNumber("");
    setPin("");
    setShowReceipt(false);
    setIsProcessing(false);
    setTransferError("");
    setTransferType("immediate");
    setScheduledDate(new Date());
    setTransferNote("");
  };

  const bankOptions = mockBankData.map((bank) => ({
    value: bank.bankName,
    label: (
      <div className="flex items-center">
        <img
          src={bank.logo}
          alt={`${bank.bankName} logo`}
          className="w-6 h-6 mr-2"
        />
        {bank.bankName}
      </div>
    ),
  }));

  return (
    <div className="bg-gray-100 font-lato min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="lg:ml-64 md:px-4 -mt-20 md:mt-0 z-20 flex-grow p-6">
        {/* Account Balance Card */}
        <div className="bg-gradient-to-br from-customColor via-blue-600 to-blue-800 shadow-xl rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="flex justify-between items-start relative z-10">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <h2 className="text-lg font-medium opacity-90">
                  Available Balance
                </h2>
              </div>
              <p className="text-4xl font-bold mt-2 mb-1 tracking-tight">
                ${user?.balance?.toLocaleString() || "0.00"}
              </p>
              <p className="text-sm opacity-75 flex items-center">
                <span className="mr-2">Account Number:</span>
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-mono">
                  •••• {user?.accountNumber?.slice(-4) || "255"}
                </span>
              </p>
            </div>
            <div className="bg-white bg-opacity-15 p-4 rounded-2xl backdrop-blur-sm border border-white border-opacity-20">
              <AccountBalanceIcon sx={{ fontSize: 40 }} />
            </div>
          </div>

          <div className="mt-8 flex space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-customColor font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all duration-300 flex-1 flex items-center justify-center transform hover:scale-105 active:scale-95"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>New Transfer</span>
            </button>
            <Link
              to="/transactions"
              className="bg-white bg-opacity-20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white border-opacity-20 transform hover:scale-105 active:scale-95"
            >
              <HistoryIcon className="mr-2" fontSize="small" />
              <span>History</span>
            </Link>
          </div>
        </div>

        {/* Frequent Recipients Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Frequent Recipients
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Quick access to your most used contacts
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-customColor text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
            >
              <svg
                className="w-4 h-4 inline mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New
            </button>
          </div>

          {frequentRecipients.length > 0 ? (
            <div className="grid gap-4">
              {frequentRecipients.map((recipient, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-customColor hover:shadow-md cursor-pointer transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                  onClick={() => {
                    // Pre-fill the transfer form with this recipient
                    const bank = mockBankData.find(
                      (b) => b.bankName === recipient.bank
                    );
                    if (bank) {
                      setSelectedBank({
                        value: bank.bankName,
                        label: (
                          <div className="flex items-center">
                            <img
                              src={bank.logo}
                              alt={`${bank.bankName} logo`}
                              className="w-6 h-6 mr-2"
                            />
                            {bank.bankName}
                          </div>
                        ),
                      });
                      setRoutineNumber(bank.routineNumber);
                      setAccountNumber(bank.accountNumber);
                      setIsModalOpen(true);
                      // Automatically validate after a short delay
                      setTimeout(() => validateBankDetails(), 500);
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl mr-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                      <AccountBalanceIcon
                        sx={{ fontSize: 24, color: "#004D8E" }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-customColor transition-colors duration-300">
                        {recipient.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <span className="mr-2">{recipient.bank}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          •••• {recipient.account.slice(-4)}
                        </span>
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {recipient.count} transfers
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ArrowForwardIosOutlinedIcon
                      sx={{ color: "#9fa7ae", fontSize: 16 }}
                      className="group-hover:text-customColor transition-colors duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AccountBalanceIcon sx={{ fontSize: 40, color: "#9CA3AF" }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No frequent recipients yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start making transfers to see your frequent contacts here
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-customColor text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
              >
                Make your first transfer
              </button>
            </div>
          )}
        </div>

        {/* Recent Transfers Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Recent Transfers
            </h2>
            <Link
              to="/transactions"
              className="text-customColor hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="py-4 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center">
                      <div className="bg-blue-50 p-2 rounded-full mr-3">
                        <AccountBalanceIcon
                          sx={{ fontSize: 20, color: "#004D8E" }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {transaction.recipientBank}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString(
                            "en-US",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-500">
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No recent transfers</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 text-customColor hover:text-blue-700 text-sm font-medium"
              >
                Make your first transfer
              </button>
            </div>
          )}
        </div>

        {/* Transfer Options Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Transfer Options
          </h2>
          <ul className="space-y-3">
            <li
              className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <AccountBalanceIcon sx={{ fontSize: 24, color: "#004D8E" }} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Bank Transfer</p>
                  <p className="text-sm text-gray-500">
                    Transfer to any bank account
                  </p>
                </div>
              </div>
              <ArrowForwardIosOutlinedIcon
                sx={{ color: "#9fa7ae", fontSize: 16 }}
              />
            </li>
            <li
              className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setTransferType("scheduled");
                setIsModalOpen(true);
              }}
            >
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <CalendarMonthIcon sx={{ fontSize: 24, color: "#004D8E" }} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    Scheduled Transfer
                  </p>
                  <p className="text-sm text-gray-500">
                    Set up a future-dated transfer
                  </p>
                </div>
              </div>
              <ArrowForwardIosOutlinedIcon
                sx={{ color: "#9fa7ae", fontSize: 16 }}
              />
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Developer toggle for transaction outcomes - only visible in development */}
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-lg shadow-lg z-50 text-xs">
        <div className="flex items-center space-x-2">
          <span>Transaction Mode:</span>
          <button
            onClick={() => setAllowTransactions(!allowTransactions)}
            className={`px-2 py-1 rounded ${
              allowTransactions ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {allowTransactions ? "Success" : "Decline"}
          </button>
          <div
            className={`w-2 h-2 rounded-full ${
              allowTransactions
                ? "bg-green-500 animate-pulse"
                : "bg-red-500 animate-pulse"
            }`}
          ></div>
        </div>
        <div className="text-gray-300 text-xs mt-1">
          {allowTransactions
            ? "Transactions will succeed"
            : "Transactions will be declined"}
        </div>
      </div>

      {/* Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-customBlue to-customColor p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img
                    src="/favicon.ico"
                    alt="Bank Logo"
                    className="w-10 h-10"
                  />
                  <h2 className="text-xl font-semibold text-white">
                    {transferType === "scheduled"
                      ? "Scheduled Transfer"
                      : "Bank Transfer"}
                  </h2>
                </div>
                <button
                  className="text-white hover:text-gray-200 transition-colors"
                  onClick={closeModal}
                >
                  <svg
                    className="w-6 h-6"
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

            {/* Modal Body */}
            <div className="p-6">
              {!verifiedUser ? (
                // Bank Selection Form
                <>
                  {/* Transfer Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transfer Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className={`flex items-center justify-center p-3 rounded-lg border ${
                          transferType === "immediate"
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setTransferType("immediate")}
                      >
                        <span className="font-medium">Immediate</span>
                      </button>
                      <button
                        type="button"
                        className={`flex items-center justify-center p-3 rounded-lg border ${
                          transferType === "scheduled"
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setTransferType("scheduled")}
                      >
                        <span className="font-medium">Scheduled</span>
                      </button>
                    </div>
                  </div>

                  {/* Scheduled Date (only shown for scheduled transfers) */}
                  {transferType === "scheduled" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transfer Date
                      </label>
                      <DatePicker
                        selected={scheduledDate}
                        onChange={(date) => setScheduledDate(date)}
                        minDate={new Date()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        dateFormat="MMMM d, yyyy"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Bank
                      </label>
                      <Select
                        options={bankOptions}
                        value={selectedBank}
                        onChange={(selectedOption) =>
                          setSelectedBank(selectedOption)
                        }
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Choose a bank"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Routing Number
                        </label>
                        <input
                          type="text"
                          value={routineNumber}
                          onChange={(e) =>
                            setRoutineNumber(
                              e.target.value.replace(/[^0-9]/g, "")
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="9-digit number"
                          maxLength="9"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) =>
                            setAccountNumber(
                              e.target.value.replace(/[^0-9]/g, "")
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter account number"
                        />
                      </div>
                    </div>
                  </div>

                  {transferError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      {transferError}
                    </div>
                  )}

                  <button
                    className="w-full mt-6 bg-customColor hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors disabled:bg-gray-400"
                    onClick={validateBankDetails}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-3 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Verifying...
                      </div>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </>
              ) : showDeclineModal ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-shake">
                    <svg
                      className="w-10 h-10 text-white"
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
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    Transfer Declined
                  </p>
                  <p className="text-md text-gray-600 max-w-xs mx-auto">
                    Your transfer has been declined. Please try again later.
                  </p>
                </div>
              ) : (
                // Transfer Confirmation and Receipt
                <>
                  {!showReceipt && !isProcessing && (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              Recipient Details
                            </p>
                            <p className="font-medium text-gray-800">
                              {verifiedUser.fullName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {verifiedUser.bankName}
                            </p>
                            <p className="text-sm text-gray-600">
                              ••••{verifiedUser.accountNumber.slice(-4)}
                            </p>
                          </div>
                          <div className="text-blue-600">
                            <svg
                              className="w-8 h-8"
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
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Transfer Type Display */}
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <span className="text-sm font-medium text-gray-700">
                            Transfer Type
                          </span>
                          <span className="text-sm text-gray-800">
                            {transferType === "scheduled"
                              ? "Scheduled"
                              : "Immediate"}
                          </span>
                        </div>

                        {/* Scheduled Date (only shown for scheduled transfers) */}
                        {transferType === "scheduled" && (
                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                            <span className="text-sm font-medium text-gray-700">
                              Transfer Date
                            </span>
                            <span className="text-sm text-gray-800">
                              {scheduledDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transfer Amount
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
                            />
                          </div>
                        </div>

                        {/* Transfer Note */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Note (Optional)
                          </label>
                          <textarea
                            value={transferNote}
                            onChange={(e) => setTransferNote(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add a note for this transfer"
                            rows="2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Security PIN
                          </label>
                          <input
                            type="password"
                            value={pin}
                            onChange={(e) =>
                              setPin(e.target.value.replace(/\D/, ""))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter 4-digit PIN"
                            maxLength="4"
                            inputMode="numeric"
                          />
                          <p className="text-xs hidden text-gray-500 mt-1">
                            For testing, use PIN: 4456
                          </p>
                        </div>

                        {transferError && (
                          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                            {transferError}
                          </div>
                        )}

                        <button
                          className="w-full bg-customColor hover:bg-blue-600 text-white font-medium py-3 rounded-md transition-colors"
                          onClick={handleConfirmTransfer}
                        >
                          {transferType === "scheduled"
                            ? "Schedule Transfer"
                            : "Confirm Transfer"}
                        </button>
                      </div>
                    </>
                  )}

                  {isProcessing && (
                    <div className="p-6 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <svg
                          className="animate-spin h-8 w-8 text-blue-600"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <p className="text-gray-700">
                          {transferType === "scheduled"
                            ? "Scheduling your transfer..."
                            : "Processing your transfer..."}
                        </p>
                      </div>
                    </div>
                  )}

                  {showReceipt && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                          <svg
                            className="w-6 h-6 text-green-600"
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
                        <h3 className="mt-4 text-xl font-semibold text-gray-800">
                          {transferType === "scheduled"
                            ? "Transfer Scheduled"
                            : "Transfer Successful"}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {transferType === "scheduled"
                            ? `Your transfer will be processed on ${scheduledDate.toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}`
                            : "Your transfer has been processed successfully"}
                        </p>
                      </div>

                      <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span>Date & Time</span>
                          <span className="text-gray-800">
                            {new Date().toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recipient</span>
                          <span className="text-gray-800">
                            {verifiedUser.fullName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bank</span>
                          <span className="text-gray-800">
                            {verifiedUser.bankName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Account</span>
                          <span className="text-gray-800">
                            ••••{verifiedUser.accountNumber.slice(-4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount</span>
                          <span className="text-gray-800 font-medium">
                            ${Number(amount).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transaction ID</span>
                          <span className="text-gray-800">
                            {Math.random()
                              .toString(36)
                              .substr(2, 9)
                              .toUpperCase()}
                          </span>
                        </div>
                        {transferNote && (
                          <div className="flex justify-between">
                            <span>Note</span>
                            <span className="text-gray-800">
                              {transferNote}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-3 mt-6">
                        <button
                          className="flex-1 bg-customColor hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors"
                          onClick={closeModal}
                        >
                          Done
                        </button>
                        <button
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-md transition-colors"
                          onClick={() => {
                            closeModal();
                            setIsModalOpen(true);
                            setTransferType("immediate");
                          }}
                        >
                          New Transfer
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersPage;
