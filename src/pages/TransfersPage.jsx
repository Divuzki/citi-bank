// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { Header } from "../Components/Header";
import { Footer } from "../Components/Footer";
import { useAuth } from "../context/AuthContext";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import Select from "react-select";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../Firebase"
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
    bankName: "Citibank",
    routineNumber: "021000089",
    accountNumber: "111122223333",
    fullName: "Emily Davis",
    logo: "/Svg/Footer.svg", // Example logo URL
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

  const validateBankDetails = () => {
    const matchedBank = mockBankData.find(
      bank =>
        bank.bankName === selectedBank?.value
    );

    if (matchedBank) {
      setIsVerifying(true);
      setTimeout(() => {
        setVerifiedUser(matchedBank);
        setIsVerifying(false);
      }, 3000);
    } else {
        setIsVerifying(true);
        setTimeout(() => {
          setVerifiedUser(matchedBank);
          setIsVerifying(false);
        }, 3000);
      // alert("Invalid bank details. Please check routing and account numbers");
      setVerifiedUser(null);
    }
  };

  const handleConfirmTransfer = async () => {
    if (pin !== "4456") {
      setTransferError("Incorrect PIN");
      return;
    }
  
    // Check if user has sufficient balance
    if (Number(amount) > user.balance) {
      setTransferError("Insufficient funds");
      return;
    }
  
    setIsProcessing(true);
    setTransferError("");
  
    try {
      const userRef = doc(db, "users", user.uid);
      
      // Calculate new balance
      const newBalance = user.balance - Number(amount);
      
      await updateDoc(userRef, {
        balance: newBalance,
        transactions: arrayUnion({
          date: new Date().toISOString(),
          type: "transfer",
          description: "Bank Transfer",
          recipientBank: verifiedUser.bankName,
          recipientAccount: verifiedUser.accountNumber,
          amount: -Number(amount),
          status: "Completed",
        }),
      });
  
      setTimeout(() => {
        setIsProcessing(false);
        setShowReceipt(true);
      }, 3000);
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
    setPin("");
    setShowReceipt(false);
    setIsProcessing(false);
    setTransferError("");
  };

  const bankOptions = mockBankData.map(bank => ({
    value: bank.bankName,
    label: (
      <div className="flex items-center">
        <img src={bank.logo} alt={`${bank.bankName} logo`} className="w-6 h-6 mr-2" />
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
    {/* Pre-Registered Payees Section */}
    <div className="bg-white shadow-md rounded-lg p-6 mt-4">
      <h2 className="text-lg text-customGray">To Pre Registered Payees</h2>
      <div className="flex items-center justify-between pb-2">
        <div>
          <p className="py-4 border-b">Another Citi A/C of Mine</p>
          <p className="py-4 border-b">Another Citi A/C</p>
        </div>
        <div>
          <img src="/Svg/Footer.svg" alt="Shared Icon" className="w-18 h-18" />
        </div>
      </div>
      <div className="flex items-center justify-between pb-2">
        <div>
          <p className="py-4 border-b">Another Citi A/C of Mine</p>
          <p className="py-4 border-b">Another Citi A/C</p>
        </div>
        <div>
          <img src="/Svg/bank-2-svgrepo-com.svg" alt="Shared Icon" className="w-20 h-14" />
        </div>
      </div>
    </div>

    {/* Other Payees Section */}
    <div className="bg-white shadow-md rounded-lg p-6 mt-4">
      <h2 className="text-lg font-semibold text-gray-700">To Other Payees</h2>
      <ul className="mt-4">
        <li className="flex items-center justify-between border-b border-gray-300 pb-4">
          <button className="flex flex-col items-start hover:bg-gray-300 w-full p-2 rounded-lg">
            <span>Order Demand Draft</span>
            <span className="text-sm text-gray-500">Request for Demand Draft online</span>
          </button>
          <ArrowForwardIosOutlinedIcon sx={{ color: "#9fa7ae" }} />
        </li>
        <li className="flex items-center justify-between pb-4 pt-4">
          <button
            className="flex flex-col items-start hover:bg-gray-300 w-full p-2 rounded-lg"
            onClick={() => setIsModalOpen(true)}
          >
            <span>One Time Transfer via IMPS</span>
            <span className="text-sm text-gray-500">To any bank account immediately</span>
          </button>
          <ArrowForwardIosOutlinedIcon />
        </li>
      </ul>
    </div>
  </div>

  {/* Footer */}
  <Footer />

  {/* Transfer Modal */}
  {isModalOpen && (
   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
   <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
     {/* Modal Header */}
     <div className="bg-gradient-to-r from-customBlue to-customColor p-6">
       <div className="flex justify-between items-center">
         <div className="flex items-center space-x-3">
           <img src="/Svg/Footer.svg" alt="Bank Logo" className="w-10 h-10" />
           <h2 className="text-xl font-semibold text-white">IMPS Transfer</h2>
         </div>
         <button
           className="text-white hover:text-gray-200 transition-colors"
           onClick={() => {
             setIsModalOpen(false);
             setVerifiedUser(null);
             setAmount("");
             setSelectedBank(null);
             setPin("");
             setShowReceipt(false);
             setIsProcessing(false);
             setTransferError("");
           }}
         >
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
       </div>
     </div>
 
     {/* Modal Body */}
     <div className="p-6">
       {!verifiedUser ? (
         // Bank Selection Form
         <>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank</label>
               <Select
                 options={bankOptions}
                 value={selectedBank}
                 onChange={(selectedOption) => setSelectedBank(selectedOption)}
                 className="react-select-container"
                 classNamePrefix="react-select"
                 placeholder="Choose a bank"
               />
             </div>
 
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Routine Number</label>
                 <input
                   type="text"
                   value={routineNumber}
                   onChange={(e) => setRoutineNumber(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Enter routine number"
                 />
               </div>
 
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                 <input
                   type="text"
                   value={accountNumber}
                   onChange={(e) => setAccountNumber(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Enter account number"
                 />
               </div>
             </div>
           </div>
 
           <button
             className="w-full mt-6 bg-customColor hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors disabled:bg-gray-400"
             onClick={validateBankDetails}
             disabled={isVerifying}
           >
             {isVerifying ? (
               <div className="flex items-center justify-center">
                 <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                 </svg>
                 Verifying...
               </div>
             ) : (
               "Continue"
             )}
           </button>
         </>
       ) : (
         // Transfer Confirmation and Receipt
         <>
           {!showReceipt && !isProcessing && (
             <>
               <div className="bg-blue-50 p-4 rounded-lg mb-6">
                 <div className="flex items-center space-x-3">
                   <div className="flex-1">
                     <p className="text-sm text-gray-600">Recipient Details</p>
                     <p className="font-medium text-gray-800">{verifiedUser.fullName}</p>
                     <p className="text-sm text-gray-600">{verifiedUser.bankName}</p>
                     <p className="text-sm text-gray-600">••••{verifiedUser.accountNumber.slice(-4)}</p>
                   </div>
                   <div className="text-blue-600">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                   </div>
                 </div>
               </div>
 
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Amount</label>
                   <div className="relative">
                     <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                     <input
                       type="number"
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                       className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="0.00"
                     />
                   </div>
                 </div>
 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Security PIN</label>
                   <input
                     type="password"
                     value={pin}
                     onChange={(e) => setPin(e.target.value.replace(/\D/, ''))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="Enter 4-digit PIN"
                     maxLength="4"
                     inputMode="numeric"
                   />
                 </div>
 
                 {transferError && (
                   <div className="text-red-500 text-sm mt-2">{transferError}</div>
                 )}
 
                 <button
                   className="w-full bg-customColor hover:bg-blue-600 text-white font-medium py-3 rounded-md transition-colors"
                   onClick={handleConfirmTransfer}
                 >
                   Confirm Transfer
                 </button>
               </div>
             </>
           )}
 
           {isProcessing && (
             <div className="p-6 text-center">
               <div className="flex flex-col items-center space-y-4">
                 <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                 </svg>
                 <p className="text-gray-700">Processing your transfer...</p>
               </div>
             </div>
           )}
 
           {showReceipt && (
             <div className="space-y-6">
               <div className="text-center">
                 <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                   <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                 </div>
                 <h3 className="mt-4 text-xl font-semibold text-gray-800">Transfer Successful</h3>
               </div>
 
               <div className="space-y-3 text-sm text-gray-600">
                 <div className="flex justify-between">
                   <span>Date & Time</span>
                   <span className="text-gray-800">{new Date().toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Recipient</span>
                   <span className="text-gray-800">{verifiedUser.fullName}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Bank</span>
                   <span className="text-gray-800">{verifiedUser.bankName}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Amount</span>
                   <span className="text-gray-800 font-medium">${amount}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Transaction ID</span>
                   <span className="text-gray-800">{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                 </div>
               </div>
 
               <button
                 className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-md transition-colors"
                 onClick={() => {
                  setIsModalOpen(false);
                  setVerifiedUser(null);
                  setAmount("");
                  setSelectedBank(null);
                  setPin("");
                  setShowReceipt(false);
                  setIsProcessing(false);
                  setTransferError("");
                }}
               >
                 Close
               </button>
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
