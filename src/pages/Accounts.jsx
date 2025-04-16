import { Link } from "react-router-dom";
import { Header } from "../Components/Header";
import LoadingSpinner from "../Components/LoadingSpinner";
import { Footer } from "../Components/Footer";
import { useAuth } from "../context/AuthContext";

const AccountsPage = () => {
  const { user, loading } = useAuth();

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

  // Example mock data (replace these with actual values from your backend or context)
  const accountsData = {
    debitCard: "9865 4321 9876 3212",
    availableCash: "44,650.00",
    lineAmount: "0.00",
    fundsInClearing: "326.00",
    multiDepositBalance: "4,769.00",
  };
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(user.balance);
  return (
    <div className="bg-gray-100 font-lato min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="lg:ml-64 md:px-4 flex-grow p-6 -mt-16 md:mt-0 relative z-10">
        {/* Main */}
        <div className="bg-white p-2 flex flex-col gap-4 shadow-lg rounded-lg">
          {/* Debit Card and Available Cash Section */}
          <div className="bg-customLightBlue border border-blue-300 rounded-lg p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">
                  Debit Card
                </h2>
                <p className="text-customColor">{accountsData.debitCard}</p>
              </div>
              <img
                src="Svg/atm-card-credit-svgrepo-com.svg"
                alt="Debit Card Icon"
                className="w-10 h-10"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">
                  Available Cash
                </h2>
                <p className="text-customColor text-xl font-bold">
                  ${user.balance.toLocaleString()}
                </p>
              </div>
              <img
                src="Svg/cash-payment-svgrepo-com.svg"
                alt="Available Cash Icon"
                className="w-10 h-10"
              />
            </div>
          </div>

          {/* Other Account Details */}
          <div className="bg-white shadow-md rounded-lg p-6 mt-4">
            <div className="flex flex-col items-center sm:items-start space-y-4">
              <div className="w-full border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-700 text-center sm:text-left">
                  Line Amount
                </h2>
                <p className="text-customColor text-center sm:text-left">
                  ${accountsData.lineAmount}
                </p>
              </div>
              <div className="w-full border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-700 text-center sm:text-left">
                  Funds in Clearing
                </h2>
                <p className="text-customColor text-center sm:text-left">
                  ${accountsData.fundsInClearing}
                </p>
              </div>
              <div className="w-full">
                <h2 className="text-lg font-semibold text-gray-700 text-center sm:text-left">
                  Multi Deposit Balance
                </h2>
                <p className="text-customColor text-center sm:text-left">
                  ${accountsData.multiDepositBalance}
                </p>
              </div>
            </div>
          </div>

          {/* Request a New Debit Card Section */}
          <div className="mt-6 bg-gradient-to-r from-blue-400 to-blue-600 justify-between p-4 rounded-lg flex items-center space-x-2 relative">
            {/* SVG Image */}
            <div className="flex gap-4">
              <img
                src="Svg/atm-card-credit-svgrepo-com.svg"
                alt="Card Icon"
                className="w-8 h-8"
              />

              {/* Text */}
              <div>
                <h2 className="text-base font-semibold text-white">
                  Request a New Debit Card
                </h2>
                <p className="text-sm text-white opacity-80">
                  Standard, Premium, or Platinum options
                </p>
                <p className="text-sm text-white opacity-80">
                  SECURE CONTACTLESS PAYMENTS
                </p>
              </div>
            </div>

            {/* Plus Button with Link to Cards Page */}
            <Link to="/cards">
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-customBlue text-white rounded-full w-16 h-16 flex items-center justify-center hover:bg-blue-700 transition duration-300">
                <span className="text-xl font-bold">+</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AccountsPage;
