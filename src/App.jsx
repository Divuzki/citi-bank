import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OTPVerification from "./pages/OTPVerification";
import OTPProtectedRoute from "./Components/OTPProtectedRoute";
import AdminRoute from "./Components/AdminRoute";
import AccountsPage from "./pages/Accounts";
import TransfersPage from "./pages/TransfersPage";
import PaymentsPage from "./pages/Payments";
import TransactionsHistoryPage from "./pages/Transaction";
import AdminPage from "./pages/AdminPage";
import CardsPage from "./pages/Cards";
import SignIn from "./pages/SignIn";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Define the route for the login page */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* OTP Verification Route */}
          <Route path="/otp-verification" element={<OTPVerification />} />

          {/* Protected Route for Dashboard */}
          <Route
            path="/dashboard"
            element={
              <OTPProtectedRoute>
                <Dashboard />
              </OTPProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <OTPProtectedRoute>
                <AccountsPage />
              </OTPProtectedRoute>
            }
          />
          <Route
            path="/transfers"
            element={
              <OTPProtectedRoute>
                <TransfersPage />
              </OTPProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <OTPProtectedRoute>
                <PaymentsPage />
              </OTPProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <OTPProtectedRoute>
                <TransactionsHistoryPage />
              </OTPProtectedRoute>
            }
          />
          <Route
            path="/cards"
            element={
              <OTPProtectedRoute>
                <CardsPage />
              </OTPProtectedRoute>
            }
          />

          {/* Admin Route - Protected for admin users only */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } 
          />

          <Route path="/signup" element={<SignIn />} />

          {/* Default Route */}

          {/* 404 Page Not Found */}
          <Route
            path="*"
            element={
              <div className="h-screen flex items-center justify-center">
                <h1 className="text-2xl text-gray-700">404 - Page Not Found</h1>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
