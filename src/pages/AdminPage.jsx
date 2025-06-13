import { useState, useEffect } from "react";
import { db } from "../../Firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCardsModal, setShowCardsModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showCardCreateModal, setShowCardCreateModal] = useState(false);
  const [showCardEditModal, setShowCardEditModal] = useState(false);
  const [showTransactionCreateModal, setShowTransactionCreateModal] =
    useState(false);
  const [showTransactionEditModal, setShowTransactionEditModal] =
    useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    ssn: "",
    password: "",
    role: "user",
    balance: 0,
    accountStatus: "Active",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, "users");
      const querySnapshot = await getDocs(usersCollection);
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      setErrorMessage("Error fetching users.");
      console.error("Error fetching users: ", error);
      setLoading(false);
    }
  };

  const handleUpdate = async (userId, updatedData) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, updatedData);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, ...updatedData } : user
        )
      );
      setSuccessMessage("User updated successfully!");
      setShowEditModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Error updating user.");
      console.error("Error updating user: ", error);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((user) => user.id !== userId));
      setSuccessMessage("User deleted successfully!");
      setShowDeleteModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Error deleting user.");
      console.error("Error deleting user: ", error);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );
      const user = userCredential.user;

      // Create user document in Firestore
      const userData = {
        uid: user.uid,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        identifier: newUser.email,
        phoneNumber: newUser.phoneNumber,
        dateOfBirth: newUser.dateOfBirth,
        address: newUser.address,
        city: newUser.city,
        state: newUser.state,
        zipCode: newUser.zipCode,
        ssn: newUser.ssn,
        role: newUser.role,
        balance: parseFloat(newUser.balance),
        accountNumber:
          "ACC" + Math.random().toString(36).substr(2, 12).toUpperCase(),
        accountType: "Checking",
        accountStatus: newUser.accountStatus,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        transactions: [],
        cards: [],
        image: null,
      };

      await setDoc(doc(db, "users", user.uid), userData);

      setUsers([...users, { id: user.uid, ...userData }]);
      setSuccessMessage("User created successfully!");
      setShowCreateModal(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        ssn: "",
        password: "",
        role: "user",
        balance: 0,
        accountStatus: "Active",
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Error creating user: " + error.message);
      console.error("Error creating user: ", error);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Filter and sort users
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.accountNumber?.toLowerCase().includes(searchLower)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === "createdAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  // Card CRUD functions
  const handleCreateCard = async (cardData) => {
    try {
      if (!selectedUser || !selectedUser.id) {
        throw new Error("No user selected");
      }

      const userRef = doc(db, "users", selectedUser.id);
      const newCard = {
        id: Date.now().toString(),
        cardType: cardData.cardType,
        deliveryAddress: cardData.deliveryAddress || "",
        contactNumber: cardData.contactNumber || "",
        status: cardData.status || "Pending",
        requestDate: new Date().toISOString(),
        cardNumber: cardData.cardNumber || "",
        expiryDate: cardData.expiryDate || "",
        cvv: cardData.cvv || "",
        dailyWithdrawalLimit: Number(cardData.dailyWithdrawalLimit) || 1000,
        isBlocked: Boolean(cardData.isBlocked),
      };

      await updateDoc(userRef, {
        cards: arrayUnion(newCard),
      });

      setSuccessMessage("Card created successfully!");
      setShowCardCreateModal(false);
      fetchUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to create card: " + error.message);
      console.error("Error creating card:", error);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleUpdateCard = async (cardData) => {
    try {
      if (!selectedUser || !selectedUser.id) {
        throw new Error("No user selected");
      }
      if (!selectedCard || !selectedCard.id) {
        throw new Error("No card selected");
      }

      const userRef = doc(db, "users", selectedUser.id);
      const userCards = selectedUser.cards || [];
      const cardIndex = userCards.findIndex(
        (card) => card.id === selectedCard.id
      );

      if (cardIndex === -1) {
        throw new Error("Card not found");
      }

      const updatedCards = [...userCards];
      updatedCards[cardIndex] = {
        ...updatedCards[cardIndex],
        ...cardData,
        dailyWithdrawalLimit:
          Number(cardData.dailyWithdrawalLimit) ||
          updatedCards[cardIndex].dailyWithdrawalLimit,
        isBlocked: Boolean(cardData.isBlocked),
      };

      await updateDoc(userRef, {
        cards: updatedCards,
      });

      setSuccessMessage("Card updated successfully!");
      setShowCardEditModal(false);
      setSelectedCard(null);
      fetchUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to update card: " + error.message);
      console.error("Error updating card:", error);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      if (!selectedUser || !selectedUser.id) {
        throw new Error("No user selected");
      }
      if (!cardId) {
        throw new Error("No card ID provided");
      }

      const userRef = doc(db, "users", selectedUser.id);
      const cardToDelete = selectedUser.cards?.find(
        (card) => card.id === cardId
      );

      if (!cardToDelete) {
        throw new Error("Card not found");
      }

      await updateDoc(userRef, {
        cards: arrayRemove(cardToDelete),
      });

      setSuccessMessage("Card deleted successfully!");
      fetchUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to delete card: " + error.message);
      console.error("Error deleting card:", error);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Transaction CRUD functions
  const handleCreateTransaction = async (transactionData) => {
    try {
      if (!selectedUser || !selectedUser.id) {
        throw new Error("No user selected");
      }
      if (
        !transactionData.type ||
        !transactionData.description ||
        !transactionData.amount
      ) {
        throw new Error("Missing required transaction fields");
      }

      const userRef = doc(db, "users", selectedUser.id);
      const newTransaction = {
        id: Date.now().toString(),
        date: transactionData.date || new Date().toISOString(),
        type: transactionData.type,
        description: transactionData.description,
        amount: Number(transactionData.amount),
        status: transactionData.status || "Completed",
        recipientName: transactionData.recipientName || "",
        recipientBank: transactionData.recipientBank || "",
        recipientAccount: transactionData.recipientAccount || "",
        reference: transactionData.reference || "",
      };

      if (isNaN(newTransaction.amount)) {
        throw new Error("Invalid amount value");
      }

      await updateDoc(userRef, {
        transactions: arrayUnion(newTransaction),
      });

      setSuccessMessage("Transaction created successfully!");
      setShowTransactionCreateModal(false);
      fetchUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to create transaction: " + error.message);
      console.error("Error creating transaction:", error);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleUpdateTransaction = async (transactionData) => {
    try {
      if (!selectedUser || !selectedUser.id) {
        throw new Error("No user selected");
      }
      if (!selectedTransaction || !selectedTransaction.id) {
        throw new Error("No transaction selected");
      }
      if (
        !transactionData.type ||
        !transactionData.description ||
        !transactionData.amount
      ) {
        throw new Error("Missing required transaction fields");
      }

      const userRef = doc(db, "users", selectedUser.id);
      const userTransactions = selectedUser.transactions || [];
      const transactionIndex = userTransactions.findIndex(
        (transaction) => transaction.id === selectedTransaction.id
      );

      if (transactionIndex === -1) {
        throw new Error("Transaction not found");
      }

      const updatedTransactionData = {
        ...transactionData,
        amount: Number(transactionData.amount),
      };

      if (isNaN(updatedTransactionData.amount)) {
        throw new Error("Invalid amount value");
      }

      const updatedTransactions = [...userTransactions];
      updatedTransactions[transactionIndex] = {
        ...updatedTransactions[transactionIndex],
        ...updatedTransactionData,
      };

      await updateDoc(userRef, {
        transactions: updatedTransactions,
      });

      setSuccessMessage("Transaction updated successfully!");
      setShowTransactionEditModal(false);
      setSelectedTransaction(null);
      fetchUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to update transaction: " + error.message);
      console.error("Error updating transaction:", error);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      if (!selectedUser || !selectedUser.id) {
        throw new Error("No user selected");
      }
      if (!transactionId) {
        throw new Error("No transaction ID provided");
      }

      const userRef = doc(db, "users", selectedUser.id);
      const transactionToDelete = selectedUser.transactions?.find(
        (transaction) => transaction.id === transactionId
      );

      if (!transactionToDelete) {
        throw new Error("Transaction not found");
      }

      await updateDoc(userRef, {
        transactions: arrayRemove(transactionToDelete),
      });

      setSuccessMessage("Transaction deleted successfully!");
      fetchUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to delete transaction: " + error.message);
      console.error("Error deleting transaction:", error);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                User Administration
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage user accounts and permissions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Add User
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="firstName">First Name</option>
                  <option value="lastName">Last Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="balance">Balance</option>
                </select>
                <button
                  onClick={() =>
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortDirection === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {paginatedUsers.length} of {filteredUsers.length} users
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("firstName")}
                      >
                        Name{" "}
                        {sortField === "firstName" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("email")}
                      >
                        Email{" "}
                        {sortField === "email" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("role")}
                      >
                        Role{" "}
                        {sortField === "role" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("balance")}
                      >
                        Balance{" "}
                        {sortField === "balance" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("createdAt")}
                      >
                        Created{" "}
                        {sortField === "createdAt" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.image ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.image}
                                  alt=""
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.firstName?.[0]}
                                    {user.lastName?.[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.accountNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${user.balance?.toLocaleString() || "0"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowCardsModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Cards
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowTransactionsModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Transactions
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">{startIndex + 1}</span> to{" "}
                        <span className="font-medium">
                          {Math.min(
                            startIndex + itemsPerPage,
                            filteredUsers.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredUsers.length}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === i + 1
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New User
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newUser.phoneNumber}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phoneNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    value={newUser.dateOfBirth}
                    onChange={(e) =>
                      setNewUser({ ...newUser, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={newUser.address}
                    onChange={(e) =>
                      setNewUser({ ...newUser, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newUser.city}
                    onChange={(e) =>
                      setNewUser({ ...newUser, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newUser.state}
                    onChange={(e) =>
                      setNewUser({ ...newUser, state: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={newUser.zipCode}
                    onChange={(e) =>
                      setNewUser({ ...newUser, zipCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="SSN"
                    value={newUser.ssn}
                    onChange={(e) =>
                      setNewUser({ ...newUser, ssn: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Initial Balance"
                    value={newUser.balance}
                    onChange={(e) =>
                      setNewUser({ ...newUser, balance: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select
                    value={newUser.accountStatus}
                    onChange={(e) =>
                      setNewUser({ ...newUser, accountStatus: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit User: {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const updatedData = {
                    firstName: formData.get("firstName"),
                    lastName: formData.get("lastName"),
                    email: formData.get("email"),
                    phoneNumber: formData.get("phoneNumber"),
                    address: formData.get("address"),
                    city: formData.get("city"),
                    state: formData.get("state"),
                    zipCode: formData.get("zipCode"),
                    role: formData.get("role"),
                    balance: parseFloat(formData.get("balance")),
                    accountStatus: formData.get("accountStatus"),
                  };
                  handleUpdate(selectedUser.id, updatedData);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    defaultValue={selectedUser.firstName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    defaultValue={selectedUser.lastName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    defaultValue={selectedUser.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    name="phoneNumber"
                    type="tel"
                    placeholder="Phone Number"
                    defaultValue={selectedUser.phoneNumber}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="address"
                    type="text"
                    placeholder="Address"
                    defaultValue={selectedUser.address}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="city"
                    type="text"
                    placeholder="City"
                    defaultValue={selectedUser.city}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="state"
                    type="text"
                    placeholder="State"
                    defaultValue={selectedUser.state}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="zipCode"
                    type="text"
                    placeholder="ZIP Code"
                    defaultValue={selectedUser.zipCode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="balance"
                    type="number"
                    step="0.01"
                    placeholder="Balance"
                    defaultValue={selectedUser.balance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="role"
                    defaultValue={selectedUser.role}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select
                    name="accountStatus"
                    defaultValue={selectedUser.accountStatus}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {selectedUser.firstName}{" "}
                  {selectedUser.lastName}? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedUser.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards Management Modal */}
      {showCardsModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-5/6 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Manage Cards for {selectedUser.firstName}{" "}
                {selectedUser.lastName}
              </h3>

              <div className="mb-4">
                <button
                  onClick={() => setShowCardCreateModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  + Add Card
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Card Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Card Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(selectedUser.cards || []).map((card) => (
                      <tr key={card.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {card.cardType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {card.cardNumber
                            ? `****-****-****-${card.cardNumber.slice(-4)}`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${card.dailyWithdrawalLimit || 1000}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setShowCardEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!selectedUser.cards || selectedUser.cards.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No cards found for this user.
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowCardsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Management Modal */}
      {showTransactionsModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-5/6 max-w-5xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Manage Transactions for {selectedUser.firstName}{" "}
                {selectedUser.lastName}
              </h3>

              <div className="mb-4">
                <button
                  onClick={() => setShowTransactionCreateModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  + Add Transaction
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(selectedUser.transactions || []).map((transaction) => (
                      <tr
                        key={
                          transaction.id ||
                          transaction.date + transaction.amount
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {transaction.description}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            transaction.amount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : transaction.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowTransactionEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteTransaction(
                                transaction.id ||
                                  transaction.date + transaction.amount
                              )
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!selectedUser.transactions ||
                  selectedUser.transactions.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found for this user.
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowTransactionsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Create Modal */}
      {showCardCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Card
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const cardData = {
                    cardType: formData.get("cardType"),
                    deliveryAddress: formData.get("deliveryAddress"),
                    contactNumber: formData.get("contactNumber"),
                    status: formData.get("status"),
                    cardNumber: formData.get("cardNumber"),
                    expiryDate: formData.get("expiryDate"),
                    cvv: formData.get("cvv"),
                    dailyWithdrawalLimit: Number(
                      formData.get("dailyWithdrawalLimit")
                    ),
                    isBlocked: formData.get("isBlocked") === "on",
                  };
                  handleCreateCard(cardData);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Card Type
                    </label>
                    <select
                      name="cardType"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Standard Debit Card">
                        Standard Debit Card
                      </option>
                      <option value="Premium Debit Card">
                        Premium Debit Card
                      </option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234567890123456"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Daily Withdrawal Limit
                    </label>
                    <input
                      type="number"
                      name="dailyWithdrawalLimit"
                      defaultValue="1000"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Delivery Address
                    </label>
                    <textarea
                      name="deliveryAddress"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isBlocked"
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Block Card
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCardCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Create Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Card Edit Modal */}
      {showCardEditModal && selectedCard && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Card
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const cardData = {
                    cardType: formData.get("cardType"),
                    deliveryAddress: formData.get("deliveryAddress"),
                    contactNumber: formData.get("contactNumber"),
                    status: formData.get("status"),
                    cardNumber: formData.get("cardNumber"),
                    expiryDate: formData.get("expiryDate"),
                    cvv: formData.get("cvv"),
                    dailyWithdrawalLimit: Number(
                      formData.get("dailyWithdrawalLimit")
                    ),
                    isBlocked: formData.get("isBlocked") === "on",
                  };
                  handleUpdateCard(cardData);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Card Type
                    </label>
                    <select
                      name="cardType"
                      defaultValue={selectedCard.cardType}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Standard Debit Card">
                        Standard Debit Card
                      </option>
                      <option value="Premium Debit Card">
                        Premium Debit Card
                      </option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={selectedCard.status}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      defaultValue={selectedCard.cardNumber}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      defaultValue={selectedCard.expiryDate}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      defaultValue={selectedCard.cvv}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Daily Withdrawal Limit
                    </label>
                    <input
                      type="number"
                      name="dailyWithdrawalLimit"
                      defaultValue={selectedCard.dailyWithdrawalLimit || 1000}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Delivery Address
                    </label>
                    <textarea
                      name="deliveryAddress"
                      defaultValue={selectedCard.deliveryAddress}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      defaultValue={selectedCard.contactNumber}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isBlocked"
                        defaultChecked={selectedCard.isBlocked}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Block Card
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCardEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Create Modal */}
      {showTransactionCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Transaction
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const transactionData = {
                    type: formData.get("type"),
                    description: formData.get("description"),
                    amount: Number(formData.get("amount")),
                    status: formData.get("status"),
                    recipientName: formData.get("recipientName"),
                    recipientBank: formData.get("recipientBank"),
                    recipientAccount: formData.get("recipientAccount"),
                    reference: formData.get("reference"),
                    date: formData.get("date")
                      ? new Date(formData.get("date")).toISOString()
                      : new Date().toISOString(),
                  };
                  handleCreateTransaction(transactionData);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      name="type"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="transfer">Transfer</option>
                      <option value="deposit">Deposit</option>
                      <option value="withdrawal">Withdrawal</option>
                      <option value="payment">Payment</option>
                      <option value="purchase">Purchase</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recipient Bank
                    </label>
                    <input
                      type="text"
                      name="recipientBank"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recipient Account
                    </label>
                    <input
                      type="text"
                      name="recipientAccount"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reference
                    </label>
                    <input
                      type="text"
                      name="reference"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTransactionCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Create Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Edit Modal */}
      {showTransactionEditModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Transaction
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const transactionData = {
                    type: formData.get("type"),
                    description: formData.get("description"),
                    amount: Number(formData.get("amount")),
                    status: formData.get("status"),
                    recipientName: formData.get("recipientName"),
                    recipientBank: formData.get("recipientBank"),
                    recipientAccount: formData.get("recipientAccount"),
                    reference: formData.get("reference"),
                    date: formData.get("date")
                      ? new Date(formData.get("date")).toISOString()
                      : selectedTransaction.date,
                  };
                  handleUpdateTransaction(transactionData);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      name="type"
                      defaultValue={selectedTransaction.type}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="transfer">Transfer</option>
                      <option value="deposit">Deposit</option>
                      <option value="withdrawal">Withdrawal</option>
                      <option value="payment">Payment</option>
                      <option value="purchase">Purchase</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      defaultValue={selectedTransaction.description}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      defaultValue={selectedTransaction.amount}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={selectedTransaction.status}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      defaultValue={
                        selectedTransaction.date
                          ? new Date(selectedTransaction.date)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      defaultValue={selectedTransaction.recipientName}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recipient Bank
                    </label>
                    <input
                      type="text"
                      name="recipientBank"
                      defaultValue={selectedTransaction.recipientBank}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recipient Account
                    </label>
                    <input
                      type="text"
                      name="recipientAccount"
                      defaultValue={selectedTransaction.recipientAccount}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reference
                    </label>
                    <input
                      type="text"
                      name="reference"
                      defaultValue={selectedTransaction.reference}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTransactionEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
