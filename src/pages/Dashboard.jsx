import React from "react";
import { AccountSummary } from "../Components/AccountSummary";
import { ActionButtons } from "../Components/ActionButtons";
import { Header } from "../Components/Header";
import { UserInfo } from "../Components/UserInfo";
import { ProfilePicture } from "../Components/ProfilePicture";
import { Footer } from "../Components/Footer";
import LoadingSpinner from "../Components/LoadingSpinner"; // Import the spinner
import { useAuth } from "../context/AuthContext"; // Import the auth context

const Dashboard = () => {
  const { user, loading } = useAuth(); // Access user and loading state from context

  if (loading) {
    // Show the spinner if user data is still loading
    return <LoadingSpinner />;
  }

  if (!user) {
    // Handle the case where the user isn't authenticated
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <h2 className="text-xl text-red-500">User not authenticated!</h2>
      </div>
    );
  }

  const users = {
    name: user.name || "Michael Rosco Vargas",
    lastLogin: user.lastLogin || "22 June, 2017 04:25 CST",
    balance: user.balance || "0.00",
    savings: user.savings || "9876543210",
    debit: user.debit || "9876 **** **** 3210",
    profilePicture: user.imageUrl || "/Image/new.jpeg",
  };

  return (
    <div className="bg-gray-100 font-lato min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="lg:ml-64 md:px-4 flex-grow">
        <UserInfo
          name={users.name}
          lastLogin={users.lastLogin}
          profilePicture={users.profilePicture}
        />
        <ProfilePicture />
        <AccountSummary
          balance={users.balance}
          savings={users.savings}
          debit={users.debit}
        />
        <div className="pb-10">
          <ActionButtons />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
