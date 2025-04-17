import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../Components/LoadingSpinner";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GetAppIcon from "@mui/icons-material/GetApp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TransactionsHistoryPage = () => {
  const { user, loading } = useAuth();
  const [transactionsToShow, setTransactionsToShow] = useState(6);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");

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

  // Sort transactions by date (newest first by default)
  const sortedTransactions = [...(user.transactions || [])].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Apply filters
  const filteredTransactions = sortedTransactions.filter((transaction) => {
    // Filter by type
    if (selectedType !== "all" && transaction.type !== selectedType) {
      return false;
    }

    // Filter by date range
    if (startDate && endDate) {
      const transactionDate = new Date(transaction.date);
      if (transactionDate < startDate || transactionDate > endDate) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description?.toLowerCase().includes(query) ||
        transaction.recipientBank?.toLowerCase().includes(query) ||
        transaction.recipientName?.toLowerCase().includes(query) ||
        transaction.type?.toLowerCase().includes(query) ||
        transaction.status?.toLowerCase().includes(query) ||
        String(Math.abs(transaction.amount)).includes(query)
      );
    }

    return true;
  });

  const showLoadMore = filteredTransactions.length > transactionsToShow;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadMoreTransactions = () => {
    setTransactionsToShow((prev) => prev + 6);
  };

  const toggleExpand = (index) => {
    setExpandedTransaction(expandedTransaction === index ? null : index);
  };

  const resetFilters = () => {
    setSelectedType("all");
    setStartDate(null);
    setEndDate(null);
    setSearchQuery("");
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "transfer":
        return <AccountBalanceIcon sx={{ color: "#004D8E" }} />;
      case "payment":
        return <PaymentIcon sx={{ color: "#004D8E" }} />;
      case "deposit":
        return <ReceiptIcon sx={{ color: "#004D8E" }} />;
      case "withdrawal":
        return <CreditCardIcon sx={{ color: "#004D8E" }} />;
      default:
        return <ReceiptIcon sx={{ color: "#004D8E" }} />;
    }
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ["Date", "Description", "Amount", "Type", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((t) => {
        return [
          formatDate(t.date),
          `"${t.description}"`,
          t.amount,
          t.type,
          t.status,
        ].join(",");
      }),
    ].join("\n");

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-100 font-lato min-h-screen flex flex-col">
      {/* Account Summary */}
      <div className="bg-customColor relative flex justify-evenly items-center text-white h-56">
        <div className="absolute overflow-hidden inset-0">
          <Link
            to="/dashboard"
            className="absolute top-4 cursor-pointer left-4 z-50 text-white"
          >
            <ArrowBackIcon sx={{ color: "white" }} />
          </Link>
        </div>
        <div className="flex flex-col items-center gap-8">
          <p className="text-lg">
            Savings A/c {user.accountNumber?.slice(-10) || "9876543210"}
          </p>
          <div className="flex flex-col items-center">
            <p className="text-sm mt-1">Available Balance</p>
            <h2 className="text-4xl mt-2">
              ${user.balance?.toFixed(2) || 0.0}
            </h2>
          </div>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white mt-4 p-4 mx-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Transactions History
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={exportTransactions}
              className="flex items-center text-customColor hover:text-blue-700 text-sm font-medium"
            >
              <GetAppIcon fontSize="small" className="mr-1" />
              Export
            </button>
            <button
              onClick={() =>
                setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
              }
              className="flex items-center text-customColor hover:text-blue-700 text-sm font-medium"
            >
              {sortOrder === "newest" ? (
                <KeyboardArrowDownIcon fontSize="small" className="mr-1" />
              ) : (
                <KeyboardArrowUpIcon fontSize="small" className="mr-1" />
              )}
              {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-4">
          <div className="flex items-center bg-gray-50 rounded-lg p-2">
            <SearchIcon className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="bg-transparent border-none outline-none flex-grow text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Panel */}
        <div className="mb-4">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center text-customColor hover:text-blue-700 text-sm font-medium mb-2"
          >
            <FilterListIcon fontSize="small" className="mr-1" />
            {filterOpen ? "Hide Filters" : "Show Filters"}
          </button>

          {filterOpen && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Transaction Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="transfer">Transfers</option>
                    <option value="payment">Payments</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="Select start date"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                    <CalendarTodayIcon
                      className="absolute right-2 top-2 text-gray-400"
                      fontSize="small"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      placeholderText="Select end date"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                    <CalendarTodayIcon
                      className="absolute right-2 top-2 text-gray-400"
                      fontSize="small"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors mr-2"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions found matching your filters.</p>
            {(selectedType !== "all" ||
              startDate ||
              endDate ||
              searchQuery) && (
              <button
                onClick={resetFilters}
                className="mt-2 text-customColor hover:text-blue-700 text-sm font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 mt-4">
            {filteredTransactions
              .slice(0, transactionsToShow)
              .map((transaction, index) => (
                <li
                  key={index}
                  className={`py-4 ${
                    expandedTransaction === index ? "bg-blue-50" : ""
                  }`}
                >
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleExpand(index)}
                  >
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          {formatDate(transaction.date)}
                        </p>
                        <p className="text-gray-800 font-medium">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.recipientBank}
                          {transaction.recipientAccount && (
                            <span className="ml-2 text-gray-400">
                              ••••{transaction.recipientAccount.slice(-4)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p
                        className={`font-semibold ${
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : "-"}$
                        {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full mt-1 ${
                          transaction.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                      <button className="text-customColor mt-1 text-xs">
                        {expandedTransaction === index ? (
                          <KeyboardArrowUpIcon fontSize="small" />
                        ) : (
                          <KeyboardArrowDownIcon fontSize="small" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Transaction Details */}
                  {expandedTransaction === index && (
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">
                        Transaction Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Transaction ID</p>
                          <p className="font-medium">
                            {transaction.id ||
                              `TRX${Math.floor(Math.random() * 1000000)}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date & Time</p>
                          <p className="font-medium">
                            {formatDate(transaction.date)} at{" "}
                            {formatTime(transaction.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Type</p>
                          <p className="font-medium capitalize">
                            {transaction.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p className="font-medium">{transaction.status}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p
                            className={`font-medium ${
                              transaction.amount > 0
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : "-"}$
                            {Math.abs(transaction.amount).toFixed(2)}
                          </p>
                        </div>
                        {transaction.recipientName && (
                          <div>
                            <p className="text-gray-500">Recipient</p>
                            <p className="font-medium">
                              {transaction.recipientName}
                            </p>
                          </div>
                        )}
                        {transaction.recipientBank && (
                          <div>
                            <p className="text-gray-500">Bank</p>
                            <p className="font-medium">
                              {transaction.recipientBank}
                            </p>
                          </div>
                        )}
                        {transaction.note && (
                          <div className="col-span-2">
                            <p className="text-gray-500">Note</p>
                            <p className="font-medium">{transaction.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
          </ul>
        )}

        {showLoadMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMoreTransactions}
              className="bg-customColor hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Load More Transactions
            </button>
          </div>
        )}
      </div>

      {/* Filter Button */}
      <button
        onClick={() => setFilterOpen(!filterOpen)}
        className="fixed bottom-6 right-6 bg-customColor text-white p-4 rounded-full shadow-lg"
      >
        <FilterListIcon />
      </button>
    </div>
  );
};

export default TransactionsHistoryPage;
