import React, { useState, useMemo } from "react";
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
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import HomeIcon from "@mui/icons-material/Home";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TransactionsHistoryPage = () => {
  const { user, loading } = useAuth();
  const [transactionsToShow, setTransactionsToShow] = useState(6);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [viewMode, setViewMode] = useState("list"); // list, analytics
  const [selectedPeriod, setSelectedPeriod] = useState("month"); // week, month, year

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

  // Category mapping function
  const getCategoryFromDescription = (description) => {
    const desc = description?.toLowerCase() || "";
    if (
      desc.includes("grocery") ||
      desc.includes("supermarket") ||
      desc.includes("walmart") ||
      desc.includes("target")
    )
      return "shopping";
    if (
      desc.includes("restaurant") ||
      desc.includes("food") ||
      desc.includes("cafe") ||
      desc.includes("pizza")
    )
      return "dining";
    if (
      desc.includes("gas") ||
      desc.includes("fuel") ||
      desc.includes("shell") ||
      desc.includes("exxon")
    )
      return "fuel";
    if (
      desc.includes("rent") ||
      desc.includes("mortgage") ||
      desc.includes("utilities") ||
      desc.includes("electric")
    )
      return "housing";
    if (
      desc.includes("transfer") ||
      desc.includes("deposit") ||
      desc.includes("withdrawal")
    )
      return "banking";
    return "other";
  };

  // Enhanced transactions with categories and data validation
  const enhancedTransactions = (user.transactions || []).map((transaction) => ({
    ...transaction,
    // Ensure all required fields have default values
    id: transaction.id || Math.random().toString(36).substr(2, 9),
    date: transaction.date || new Date().toISOString(),
    amount: typeof transaction.amount === 'number' ? transaction.amount : 0,
    description: transaction.description || transaction.paymentName || transaction.recipient || 'Unknown Transaction',
    type: transaction.type || (transaction.amount < 0 ? 'expense' : 'income'),
    status: transaction.status || 'completed',
    category: transaction.category || getCategoryFromDescription(transaction.description || transaction.paymentName || ''),
    recipientBank: transaction.recipientBank || '',
    recipientName: transaction.recipientName || transaction.recipient || '',
  }));

  // Sort transactions by date (newest first by default)
  const sortedTransactions = [...enhancedTransactions].sort((a, b) => {
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

    // Filter by category
    if (
      selectedCategory !== "all" &&
      transaction.category !== selectedCategory
    ) {
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
        transaction.category?.toLowerCase().includes(query) ||
        String(Math.abs(transaction.amount)).includes(query)
      );
    }

    return true;
  });

  // Analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    let periodStart;

    switch (selectedPeriod) {
      case "week":
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        periodStart = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const periodTransactions = enhancedTransactions.filter(
      (t) => new Date(t.date) >= periodStart && new Date(t.date) <= now
    );

    const totalIncome = periodTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = periodTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const categorySpending = periodTransactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    const topCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalIncome,
      totalExpenses,
      netFlow: totalIncome - totalExpenses,
      categorySpending,
      topCategories,
      transactionCount: periodTransactions.length,
    };
  }, [enhancedTransactions, selectedPeriod]);

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
    setSelectedCategory("all");
    setStartDate(null);
    setEndDate(null);
    setSearchQuery("");
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "shopping":
        return <ShoppingCartIcon sx={{ color: "#10B981" }} />;
      case "dining":
        return <RestaurantIcon sx={{ color: "#F59E0B" }} />;
      case "fuel":
        return <LocalGasStationIcon sx={{ color: "#EF4444" }} />;
      case "housing":
        return <HomeIcon sx={{ color: "#8B5CF6" }} />;
      case "banking":
        return <AccountBalanceIcon sx={{ color: "#004D8E" }} />;
      default:
        return <MoreHorizIcon sx={{ color: "#6B7280" }} />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
    <div className="bg-gray-50 font-lato min-h-screen">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-customColor via-blue-700 to-blue-900 relative text-white">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          {/* Navigation */}
          <div className="flex items-center justify-between p-4">
            <Link
              to="/dashboard"
              className="text-white hover:text-blue-200 transition-colors"
            >
              <ArrowBackIcon sx={{ fontSize: 28 }} />
            </Link>
            <h1 className="text-xl font-semibold">Transaction History</h1>
            <button
              onClick={exportTransactions}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <GetAppIcon sx={{ fontSize: 24 }} />
            </button>
          </div>

          {/* Account Summary */}
          <div className="px-4 pb-6">
            <div className="text-center mb-6">
              <p className="text-blue-100 text-sm mb-1">
                Savings Account {user.accountNumber?.slice(-10) || "9876543210"}
              </p>
              <h2 className="text-4xl font-bold mb-2">
                {formatCurrency(user.balance || 0)}
              </h2>
              <p className="text-blue-100 text-sm">Available Balance</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 text-center">
                <TrendingUpIcon
                  className="mx-auto mb-1"
                  sx={{ fontSize: 20 }}
                />
                <p className="text-xs text-blue-100">Income</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(analytics.totalIncome)}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 text-center">
                <TrendingDownIcon
                  className="mx-auto mb-1"
                  sx={{ fontSize: 20 }}
                />
                <p className="text-xs text-blue-100">Expenses</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(analytics.totalExpenses)}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 text-center">
                <SwapVertIcon className="mx-auto mb-1" sx={{ fontSize: 20 }} />
                <p className="text-xs text-blue-100">Net Flow</p>
                <p
                  className={`text-sm font-semibold ${
                    analytics.netFlow >= 0 ? "text-green-200" : "text-red-200"
                  }`}
                >
                  {formatCurrency(analytics.netFlow)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-customColor shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setViewMode("analytics")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "analytics"
                  ? "bg-white text-customColor shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Analytics
            </button>
          </div>

          {viewMode === "analytics" && (
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-customColor focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          )}
        </div>
      </div>

      {/* Analytics View */}
      {viewMode === "analytics" && (
        <div className="p-4 space-y-6">
          {/* Spending Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Spending Overview</h3>
              <PieChartIcon className="text-customColor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-customColor">
                  {analytics.transactionCount}
                </p>
                <p className="text-sm text-gray-600">Total Transactions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">
                  {formatCurrency(analytics.totalExpenses)}
                </p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Spending Categories</h3>
              <BarChartIcon className="text-customColor" />
            </div>
            <div className="space-y-3">
              {analytics.topCategories.map(([category, amount], index) => {
                const percentage = analytics.totalExpenses > 0 
                  ? (amount / analytics.totalExpenses) * 100 
                  : 0;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getCategoryIcon(category)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {capitalizeFirst(category)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {percentage.toFixed(1)}% of spending
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Transactions List View */}
      {viewMode === "list" && (
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h2>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                  }
                  className="flex items-center text-customColor hover:text-blue-700 text-sm font-medium transition-colors"
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
            <div className="px-6 py-4 border-b bg-white">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fontSize="small" />
                  <input
                    type="text"
                    placeholder="Search transactions, recipients, or amounts..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-customColor focus:border-transparent text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Quick Filters */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterOpen 
                        ? "bg-customColor text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FilterListIcon fontSize="small" className="mr-2" />
                    {filterOpen ? "Hide Filters" : "Show Filters"}
                  </button>
                  
                  {(selectedType !== "all" || selectedCategory !== "all" || startDate || endDate || searchQuery) && (
                    <button
                      onClick={resetFilters}
                      className="text-sm text-customColor hover:text-blue-700 font-medium"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>

                {/* Advanced Filters */}
                {filterOpen && (
                  <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Transaction Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transaction Type
                        </label>
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-customColor focus:border-transparent"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-customColor focus:border-transparent"
                        >
                          <option value="all">All Categories</option>
                          <option value="shopping">Shopping</option>
                          <option value="dining">Dining</option>
                          <option value="fuel">Fuel</option>
                          <option value="housing">Housing</option>
                          <option value="banking">Banking</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Date Range Filters */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-customColor focus:border-transparent"
                          />
                          <CalendarTodayIcon
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            fontSize="small"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-customColor focus:border-transparent"
                          />
                          <CalendarTodayIcon
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            fontSize="small"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction List */}
            <div className="px-6 py-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ReceiptIcon className="text-gray-400" sx={{ fontSize: 32 }} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                  {(selectedType !== "all" ||
                    selectedCategory !== "all" ||
                    startDate ||
                    endDate ||
                    searchQuery) && (
                    <button
                      onClick={resetFilters}
                      className="bg-customColor text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions
                    .slice(0, transactionsToShow)
                    .map((transaction, index) => (
                      <div
                        key={index}
                        className={`border border-gray-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                          expandedTransaction === index 
                            ? "bg-blue-50 border-customColor shadow-md" 
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className="flex justify-between items-start cursor-pointer"
                          onClick={() => toggleExpand(index)}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                {getCategoryIcon(transaction.category)}
                              </div>
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {transaction.description}
                                </h4>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {capitalizeFirst(transaction.category)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mb-1">
                                {formatDate(transaction.date)} • {formatTime(transaction.date)}
                              </p>
                              {transaction.recipientBank && (
                                <p className="text-sm text-gray-500">
                                  {transaction.recipientBank}
                                  {transaction.recipientAccount && (
                                    <span className="ml-2">
                                      ••••{transaction.recipientAccount.slice(-4)}
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <p
                              className={`text-lg font-semibold ${
                                transaction.amount > 0
                                  ? "text-green-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {transaction.amount > 0 ? "+" : "-"}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                            <button className="text-customColor hover:text-blue-700 transition-colors">
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
                           <div className="mt-4 pt-4 border-t border-gray-200">
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                               {/* Transaction Info */}
                               <div className="space-y-4">
                                 <h4 className="font-semibold text-gray-900 flex items-center">
                                    <ReceiptIcon className="mr-2 text-customColor" sx={{ fontSize: 18 }} />
                                    Transaction Details
                                  </h4>
                                 <div className="space-y-3">
                                   <div className="flex justify-between items-center">
                                     <span className="text-sm text-gray-600">Transaction ID</span>
                                     <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                       {transaction.id || `TRX${Math.floor(Math.random() * 1000000)}`}
                                     </span>
                                   </div>
                                   <div className="flex justify-between items-center">
                                     <span className="text-sm text-gray-600">Category</span>
                                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                       {getCategoryIcon(transaction.category)}
                                       <span className="ml-1">{capitalizeFirst(transaction.category)}</span>
                                     </span>
                                   </div>
                                   <div className="flex justify-between items-center">
                                     <span className="text-sm text-gray-600">Type</span>
                                     <span className="text-sm font-medium text-gray-900 capitalize">
                                       {transaction.type}
                                     </span>
                                   </div>
                                   <div className="flex justify-between items-center">
                                     <span className="text-sm text-gray-600">Status</span>
                                     <span
                                       className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                         transaction.status === "Completed"
                                           ? "bg-green-100 text-green-800"
                                           : transaction.status === "Pending"
                                           ? "bg-yellow-100 text-yellow-800"
                                           : "bg-red-100 text-red-800"
                                       }`}
                                     >
                                       {transaction.status}
                                     </span>
                                   </div>
                                 </div>
                               </div>

                               {/* Amount & Recipient */}
                               <div className="space-y-4">
                                 <h4 className="font-semibold text-gray-900 flex items-center">
                                   <AccountBalanceIcon className="mr-2 text-customColor" sx={{ fontSize: 18 }} />
                                   Payment Details
                                 </h4>
                                 <div className="space-y-3">
                                   <div className="flex justify-between items-center">
                                     <span className="text-sm text-gray-600">Amount</span>
                                     <span
                                       className={`text-lg font-bold ${
                                         transaction.amount > 0
                                           ? "text-green-600"
                                           : "text-gray-900"
                                       }`}
                                     >
                                       {transaction.amount > 0 ? "+" : "-"}
                                       {formatCurrency(Math.abs(transaction.amount))}
                                     </span>
                                   </div>
                                   {transaction.recipientName && (
                                     <div className="flex justify-between items-center">
                                       <span className="text-sm text-gray-600">Recipient</span>
                                       <span className="text-sm font-medium text-gray-900">
                                         {transaction.recipientName}
                                       </span>
                                     </div>
                                   )}
                                   {transaction.recipientBank && (
                                     <div className="flex justify-between items-center">
                                       <span className="text-sm text-gray-600">Bank</span>
                                       <span className="text-sm text-gray-900">
                                         {transaction.recipientBank}
                                       </span>
                                     </div>
                                   )}
                                   {transaction.recipientAccount && (
                                     <div className="flex justify-between items-center">
                                       <span className="text-sm text-gray-600">Account</span>
                                       <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                         ••••{transaction.recipientAccount.slice(-4)}
                                       </span>
                                     </div>
                                   )}
                                 </div>
                               </div>

                               {/* Date & Notes */}
                               <div className="space-y-4">
                                 <h4 className="font-semibold text-gray-900 flex items-center">
                                   <CalendarTodayIcon className="mr-2 text-customColor" sx={{ fontSize: 18 }} />
                                   Additional Info
                                 </h4>
                                 <div className="space-y-3">
                                   <div className="flex justify-between items-center">
                                     <span className="text-sm text-gray-600">Date</span>
                                     <span className="text-sm text-gray-900">
                                       {formatDate(transaction.date)}
                                     </span>
                                   </div>
                                   <div className="flex justify-between items-center">
                                     <span className="text-sm text-gray-600">Time</span>
                                     <span className="text-sm text-gray-900">
                                       {formatTime(transaction.date)}
                                     </span>
                                   </div>
                                   {transaction.note && (
                                     <div className="pt-2">
                                       <span className="text-sm text-gray-600 block mb-2">Notes</span>
                                       <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                         {transaction.note}
                                       </p>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             </div>
                           </div>
                         )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Load More Button */}
            {showLoadMore && (
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={loadMoreTransactions}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                >
                  <span className="flex items-center justify-center">
                    <KeyboardArrowDownIcon className="mr-2" />
                    Load More Transactions
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
        )}
     

      {/* Enhanced Filter Button */}
      <button
        onClick={() => setFilterOpen(!filterOpen)}
        className="fixed bottom-6 right-6 bg-customColor hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        <FilterListIcon sx={{ fontSize: 24 }} />
      </button>
    </div>
  );
};

export default TransactionsHistoryPage;
