import React, { useState, useEffect } from "react";
import { Header } from "../Components/Header";
import { Footer } from "../Components/Footer";
import { useAuth } from "../context/AuthContext";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";

const TransactionsHistoryPage = () => {
  const { user, loading } = useAuth();
  const [transactionsToShow, setTransactionsToShow] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest"); // newest or oldest
  const [viewMode, setViewMode] = useState("all"); // all, income, expenses
  const [selectedPeriod, setSelectedPeriod] = useState("all"); // all, today, week, month, year

  // Function to determine category based on transaction description
  const getCategoryFromDescription = (description) => {
    description = description.toLowerCase();

    if (
      description.includes("coffee") ||
      description.includes("restaurant") ||
      description.includes("cafe") ||
      description.includes("food") ||
      description.includes("dinner")
    ) {
      return "food";
    } else if (
      description.includes("uber") ||
      description.includes("lyft") ||
      description.includes("taxi") ||
      description.includes("transport") ||
      description.includes("metro") ||
      description.includes("subway")
    ) {
      return "transportation";
    } else if (
      description.includes("amazon") ||
      description.includes("walmart") ||
      description.includes("target") ||
      description.includes("purchase") ||
      description.includes("buy") ||
      description.includes("shop")
    ) {
      return "shopping";
    } else if (
      description.includes("bill") ||
      description.includes("utility") ||
      description.includes("electric") ||
      description.includes("water") ||
      description.includes("gas") ||
      description.includes("internet") ||
      description.includes("phone")
    ) {
      return "bills";
    } else if (
      description.includes("salary") ||
      description.includes("paycheck") ||
      description.includes("deposit") ||
      description.includes("income")
    ) {
      return "income";
    } else if (
      description.includes("transfer") ||
      description.includes("bank") ||
      description.includes("account")
    ) {
      return "banking";
    } else if (
      description.includes("entertainment") ||
      description.includes("movie") ||
      description.includes("netflix") ||
      description.includes("spotify") ||
      description.includes("subscription")
    ) {
      return "entertainment";
    } else if (
      description.includes("health") ||
      description.includes("doctor") ||
      description.includes("pharmacy") ||
      description.includes("medicine") ||
      description.includes("hospital")
    ) {
      return "health";
    }

    return "other";
  };

  // Enhance transactions with default values and categories
  const enhanceTransactions = (transactions) => {
    if (!transactions) return [];

    return transactions.map((transaction) => {
      // Ensure all transactions have a category
      if (!transaction.category) {
        transaction.category = getCategoryFromDescription(
          transaction.description || ""
        );
      }

      // Ensure all transactions have a type (income or expense)
      if (!transaction.type) {
        transaction.type = transaction.amount > 0 ? "income" : "expense";
      }

      return transaction;
    });
  };

  // Filter and sort transactions based on user selections
  useEffect(() => {
    if (!user || !user.transactions) return;

    let filtered = [...enhanceTransactions(user.transactions)];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.description && t.description.toLowerCase().includes(query)) ||
          (t.recipientName && t.recipientName.toLowerCase().includes(query)) ||
          (t.category && t.category.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((t) => t.type === selectedType);
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Apply date range filter
    if (startDate && endDate) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Apply view mode filter
    if (viewMode === "income") {
      filtered = filtered.filter((t) => t.amount > 0);
    } else if (viewMode === "expenses") {
      filtered = filtered.filter((t) => t.amount < 0);
    }

    // Apply period filter
    if (selectedPeriod !== "all") {
      const today = new Date();
      let periodStartDate;

      switch (selectedPeriod) {
        case "today":
          periodStartDate = new Date(today.setHours(0, 0, 0, 0));
          filtered = filtered.filter(
            (t) => new Date(t.date) >= periodStartDate
          );
          break;
        case "week":
          periodStartDate = new Date(today);
          periodStartDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(
            (t) => new Date(t.date) >= periodStartDate
          );
          break;
        case "month":
          periodStartDate = new Date(today);
          periodStartDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(
            (t) => new Date(t.date) >= periodStartDate
          );
          break;
        case "year":
          periodStartDate = new Date(today);
          periodStartDate.setFullYear(today.getFullYear() - 1);
          filtered = filtered.filter(
            (t) => new Date(t.date) >= periodStartDate
          );
          break;
        default:
          break;
      }
    }

    // Apply sort order
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setTransactionsToShow(filtered);
  }, [
    user,
    searchQuery,
    selectedType,
    selectedCategory,
    startDate,
    endDate,
    sortOrder,
    viewMode,
    selectedPeriod,
  ]);

  // Calculate analytics
  const calculateAnalytics = () => {
    if (!transactionsToShow.length)
      return { totalIncome: 0, totalExpenses: 0, categorySpending: {} };

    let totalIncome = 0;
    let totalExpenses = 0;
    let categorySpending = {};

    transactionsToShow.forEach((transaction) => {
      if (transaction.amount > 0) {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += Math.abs(transaction.amount);

        // Track spending by category
        const category = transaction.category || "other";
        if (!categorySpending[category]) {
          categorySpending[category] = 0;
        }
        categorySpending[category] += Math.abs(transaction.amount);
      }
    });

    return { totalIncome, totalExpenses, categorySpending };
  };

  const analytics = calculateAnalytics();

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedCategory("all");
    setStartDate(null);
    setEndDate(null);
    setSortOrder("newest");
    setViewMode("all");
    setSelectedPeriod("all");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-customColor"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700 mb-4">
            Please log in to view your transactions
          </p>
          <Link
            to="/login"
            className="bg-customColor text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 font-lato min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="lg:ml-64 md:px-4 -mt-20 md:mt-0 z-20 flex-grow p-6">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
              Transaction History
            </h1>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchIcon
                  className="absolute left-3 top-2.5 text-gray-400"
                  fontSize="small"
                />
              </div>

              {/* Filter Button */}
              <button
                className={`flex items-center justify-center px-4 py-2 border ${
                  filterOpen
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-300 text-gray-700"
                } rounded-md hover:bg-gray-50`}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <FilterListIcon fontSize="small" className="mr-1" />
                Filters
              </button>

              {/* Sort Order Toggle */}
              <button
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() =>
                  setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                }
              >
                {sortOrder === "newest" ? (
                  <>
                    <ArrowDownwardIcon fontSize="small" className="mr-1" />
                    Newest
                  </>
                ) : (
                  <>
                    <ArrowUpwardIcon fontSize="small" className="mr-1" />
                    Oldest
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">
                  Filter Transactions
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setFilterOpen(false)}
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Transaction Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="transfer">Transfers</option>
                    <option value="payment">Payments</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="food">Food & Dining</option>
                    <option value="transportation">Transportation</option>
                    <option value="shopping">Shopping</option>
                    <option value="bills">Bills & Utilities</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="health">Health</option>
                    <option value="banking">Banking</option>
                    <option value="income">Income</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Time Period Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Period
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Date Range
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Start Date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        dateFormat="MMM d, yyyy"
                      />
                    </div>
                    <div className="flex-1">
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        placeholderText="End Date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        dateFormat="MMM d, yyyy"
                      />
                    </div>
                  </div>
                </div>

                {/* View Mode Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    View Mode
                  </label>
                  <div className="flex space-x-2">
                    <button
                      className={`flex-1 py-2 px-4 rounded-md ${
                        viewMode === "all"
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setViewMode("all")}
                    >
                      All
                    </button>
                    <button
                      className={`flex-1 py-2 px-4 rounded-md ${
                        viewMode === "income"
                          ? "bg-green-100 text-green-700 font-medium"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setViewMode("income")}
                    >
                      Income
                    </button>
                    <button
                      className={`flex-1 py-2 px-4 rounded-md ${
                        viewMode === "expenses"
                          ? "bg-red-100 text-red-700 font-medium"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setViewMode("expenses")}
                    >
                      Expenses
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 mr-2"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
                <button
                  className="px-4 py-2 bg-customColor text-white rounded-md hover:bg-blue-700"
                  onClick={() => setFilterOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Transactions */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-700 mb-2">
                Total Transactions
              </h3>
              <p className="text-2xl font-bold text-blue-800">
                {transactionsToShow.length}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {selectedPeriod === "all"
                  ? "All time"
                  : selectedPeriod === "today"
                  ? "Today"
                  : selectedPeriod === "week"
                  ? "Last 7 days"
                  : selectedPeriod === "month"
                  ? "Last 30 days"
                  : "Last year"}
              </p>
            </div>

            {/* Total Income */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-700 mb-2">
                Total Income
              </h3>
              <p className="text-2xl font-bold text-green-800">
                ${analytics.totalIncome.toFixed(2)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {viewMode === "all"
                  ? "All transactions"
                  : viewMode === "income"
                  ? "Income only"
                  : ""}
              </p>
            </div>

            {/* Total Expenses */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <h3 className="text-sm font-medium text-red-700 mb-2">
                Total Expenses
              </h3>
              <p className="text-2xl font-bold text-red-800">
                ${analytics.totalExpenses.toFixed(2)}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {viewMode === "all"
                  ? "All transactions"
                  : viewMode === "expenses"
                  ? "Expenses only"
                  : ""}
              </p>
            </div>
          </div>

          {/* Transactions List */}
          {transactionsToShow.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {transactionsToShow.map((transaction, index) => (
                <div key={index} className="py-4">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() =>
                      setExpandedTransaction(
                        expandedTransaction === index ? null : index
                      )
                    }
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          transaction.amount > 0 ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {transaction.amount > 0 ? (
                          <ArrowUpwardIcon
                            sx={{ fontSize: 20, color: "#047857" }}
                          />
                        ) : (
                          <ArrowDownwardIcon
                            sx={{ fontSize: 20, color: "#b91c1c" }}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {transaction.description || "Transaction"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString(
                            "en-US",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-3">
                        <p
                          className={`font-semibold ${
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}$
                          {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getCategoryBadgeColor(
                            transaction.category
                          )}`}
                        >
                          {transaction.category || "other"}
                        </span>
                      </div>
                      {expandedTransaction === index ? (
                        <ExpandLessIcon sx={{ color: "#6b7280" }} />
                      ) : (
                        <ExpandMoreIcon sx={{ color: "#6b7280" }} />
                      )}
                    </div>
                  </div>

                  {/* Expanded Transaction Details */}
                  {expandedTransaction === index && (
                    <div className="mt-3 pl-13 ml-10 border-l-2 border-gray-200">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Transaction ID</p>
                            <p className="font-mono">
                              {transaction.id || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Type</p>
                            <p className="capitalize">{transaction.type}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <p>{transaction.status || "Completed"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Category</p>
                            <p className="capitalize">
                              {transaction.category || "Other"}
                            </p>
                          </div>
                          {transaction.recipientName && (
                            <div>
                              <p className="text-gray-500">Recipient</p>
                              <p>{transaction.recipientName}</p>
                            </div>
                          )}
                          {transaction.recipientBank && (
                            <div>
                              <p className="text-gray-500">Bank</p>
                              <p>{transaction.recipientBank}</p>
                            </div>
                          )}
                          {transaction.note && (
                            <div className="col-span-2">
                              <p className="text-gray-500">Note</p>
                              <p>{transaction.note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon sx={{ fontSize: 32, color: "#9CA3AF" }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={resetFilters}
                className="bg-customColor text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Helper function to get badge color based on category
const getCategoryBadgeColor = (category) => {
  switch (category) {
    case "food":
      return "bg-yellow-100 text-yellow-800";
    case "transportation":
      return "bg-blue-100 text-blue-800";
    case "shopping":
      return "bg-purple-100 text-purple-800";
    case "bills":
      return "bg-gray-100 text-gray-800";
    case "entertainment":
      return "bg-pink-100 text-pink-800";
    case "health":
      return "bg-green-100 text-green-800";
    case "banking":
      return "bg-indigo-100 text-indigo-800";
    case "income":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default TransactionsHistoryPage;
