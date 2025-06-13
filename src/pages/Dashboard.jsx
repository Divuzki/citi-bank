import { AccountSummary } from "../Components/AccountSummary";
import { ActionButtons } from "../Components/ActionButtons";
import { Header } from "../Components/Header";
import { UserInfo } from "../Components/UserInfo";
import { ProfilePicture } from "../Components/ProfilePicture";
import { Footer } from "../Components/Footer";
import LoadingSpinner from "../Components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access your dashboard</p>
        </div>
      </div>
    );
  }

  // Format user data with proper fallbacks and formatting
  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return "Welcome! First time login";
    try {
      const date = new Date(lastLogin);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return lastLogin;
    }
  };

  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return "****-****-****-0000";
    const str = accountNumber.toString();
    if (str.length >= 4) {
      return `****-****-****-${str.slice(-4)}`;
    }
    return accountNumber;
  };

  const userData = {
    name: `${user.firstName || 'User'} ${user.lastName || ''}`.trim(),
    lastLogin: formatLastLogin(user.lastLogin),
    balance: typeof user.balance === 'number' ? user.balance : 0,
    accountNumber: formatAccountNumber(user.accountNumber),
    accountType: user.accountType || 'Checking',
    accountStatus: user.accountStatus || 'Active',
    profilePicture: user.image || "/Image/new.jpeg",
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    memberSince: user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()
  };

  // Quick stats for dashboard overview
  const quickStats = [
    {
      title: "Available Balance",
      value: `$${userData.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: "💰",
      trend: "+2.5%",
      trendUp: true
    },
    {
      title: "This Month",
      value: user.transactions ? `${user.transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const currentMonth = new Date().getMonth();
        return transactionDate.getMonth() === currentMonth;
      }).length} transactions` : "0 transactions",
      icon: "📊",
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Cards Active",
      value: user.cards ? `${user.cards.length} cards` : "0 cards",
      icon: "💳",
      trend: "Stable",
      trendUp: null
    },
    {
      title: "Account Status",
      value: userData.accountStatus,
      icon: "✅",
      trend: "Verified",
      trendUp: true
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 font-sans min-h-screen flex flex-col">
      <Header />
      
      <div className="lg:ml-64 flex-grow">
        {/* Welcome Section */}
        <div className="px-4 md:px-6 lg:px-8 py-6">
          <UserInfo
            name={userData.name}
            lastLogin={userData.lastLogin}
            profilePicture={userData.profilePicture}
          />
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  {stat.trendUp !== null && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.trend}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Account Summary - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <AccountSummary
                balance={userData.balance}
                savings={userData.accountNumber}
                debit={userData.accountNumber}
                accountType={userData.accountType}
                accountStatus={userData.accountStatus}
              />
            </div>
            
            {/* Profile Section - Takes 1 column */}
            <div className="space-y-6">
              <ProfilePicture />
              
              {/* Account Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-medium text-gray-900">{userData.accountType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      userData.accountStatus === 'Active' ? 'text-green-600' : 'text-yellow-600'
                    }`}>{userData.accountStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium text-gray-900">{userData.memberSince}</span>
                  </div>
                  {userData.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900 text-sm">{userData.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-gray-600">Manage your finances with these convenient tools</p>
            </div>
            <ActionButtons />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
