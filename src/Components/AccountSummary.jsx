import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export const AccountSummary = ({ balance, savings, debit }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div>User not authenticated</div>;
  }
  return (
    <div className="bg-white shadow-md rounded-lg relative  text-center p-4 mx-4 mt-4">
      {/* Account Balance Section (Mobile and Desktop) */}
      <div className="bg-customLightBlue p-4 rounded-lg">
        <h3 className="text-gray-600 font-medium">Account Balance</h3>
        <p className="text-3xl font-bold text-customColor mt-2">
          {" "}
          ${user.balance.toLocaleString()}
        </p>
      </div>

      {/* Savings and Debit Section for Mobile */}
      <div className="grid grid-cols-2 divide-x divide-gray-300 border-t border-b border-gray-200 mt-4 text-sm text-gray-600 lg:hidden">
        {/* Savings Section */}
        <div className="flex flex-col items-center border-gray-100 p-4">
          <span className="font-medium text-customGray">Savings A/c:</span>
          <span className="font-bold text-customColor mt-2">{savings}</span>
        </div>

        {/* Debit Section */}
        <div className="flex flex-col items-center border-gray-100 p-4">
          <span className="font-medium text-customGray">Debit Card:</span>
          <span className="font-bold text-customColor mt-2">{debit}</span>
        </div>
      </div>

      {/* Button (Mobile and Desktop) */}
      <Link to="/transactions">
        <button className="text-customBlue   border-customBlue border mt-6 py-2 px-6 rounded-full hover:text-white hover:bg-blue-700">
          Transactions History
        </button>
      </Link>

      {/* Desktop Layout */}
      <div className="hidden lg:flex gap-4 mt-8 p-6 border bg-customLightBlue rounded-lg">
        <div className="flex justify-between w-full">
          {/* Account Balance Section for Desktop */}
          <div className="flex flex-col items-start">
            <h3 className="text-gray-600 font-medium">Account Balance</h3>
            <p className="text-4xl font-bold text-customColor mt-2">
              ${user.balance.toLocaleString()}
            </p>
          </div>

          {/* Savings and Debit Section for Desktop */}
          <div className="flex space-x-8">
            <div className="flex flex-col items-start">
              <span className="font-medium text-customGray">Savings A/c:</span>
              <span className="font-bold text-customColor mt-2">{savings}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-customGray">Debit Card:</span>
              <span className="font-bold text-customColor mt-2">{debit}</span>
            </div>
          </div>
        </div>

        {/* Button for Desktop */}
        <div className="flex justify-center mt-6">
          <Link to="/cards">
            <button className="text-white bg-customBlue border-customBlue border py-3 px-8 rounded-full hover:bg-blue-700 transition-all duration-300 whitespace-nowrap">
              View Cards
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
