import { Link, useLocation } from "react-router-dom";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutConfirmationModal from "./LogoutModel";
import { auth } from "../../Firebase"; // Import Firebase auth for logout

// Header Component
export const Header = () => {
  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        console.log("User logged out");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };
  const location = useLocation(); // Get the current location

  const routes = {
    HOME: "/dashboard", // Map HOME to /dashboard
    ACCOUNTS: "/accounts",
    TRANSFERS: "/transfers",
    PAYMENTS: "/payments",
    CARDS: "/cards",
  };
  return (
    <header className="relative bg-customColor h-56 md:h-auto text-white">
      {/* White Overlays */}
      <div className="absolute overflow-hidden inset-0">
        {/* Top Left White Shape */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-white opacity-5 transform -translate-x-10 -translate-y-10"></div>

        {/* Bottom Right White Shape */}
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-5 transform translate-x-10 translate-y-10"></div>

        {/* Diagonal White Stripe */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-white to-transparent opacity-5 transform -rotate-12"></div>
      </div>

      {/* Mobile Content (Hidden on Desktop) */}
      <div className="relative lg:hidden">
        {/* Top Row */}
        <div className="flex justify-between items-center px-4 py-3">
          {/* Burger Menu Icon */}
          <div className="">
            <LogoutConfirmationModal />
          </div>
          {/* <div>
            <MenuIcon fontSize="large" />
          </div> */}

          {/* Citi Logo */}
          <div className="flex items-center justify-start">
            <img src="/Svg/logo.png" alt="Logo" className="w-32" />
          </div>

          {/* Notification Icon */}
          <div>
            <NotificationsNoneIcon fontSize="large" />
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="flex justify-around bg-transparent py-2">
          {Object.keys(routes).map((item, index) => {
            const path = routes[item];
            const isActive = location.pathname === path; // Check if the path matches the current location

            return (
              <Link
                to={path}
                key={index}
                className={`text-white pb-2 text-sm font-semibold ${
                  isActive
                    ? "border-b-4 border-white"
                    : "hover:border-b-2 hover:border-white"
                } transition-all duration-300`}
              >
                {item}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden lg:flex h-screen w-64 z-30 fixed top-0 bg-customColor text-white flex-col items-start px-4 py-2">
        {/* Sidebar Background Overlays */}
        <div className="absolute overflow-hidden inset-0">
          {/* Top Left White Shape */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-white opacity-5 transform -translate-x-10 -translate-y-10"></div>

          {/* Bottom Right White Shape */}
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-5 transform translate-x-10 translate-y-10"></div>

          {/* Diagonal White Stripe */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-white to-transparent opacity-5 transform -rotate-12"></div>
        </div>

        {/* Sidebar Logo Section */}
        <div className="relative flex flex-col items-center justify-center mb-8">
          {/* Logo */}
          <img src="/Svg/logo.png" alt="Logo" className="w-32" />
          {/* Text Under the Logo */}
          <p className="text-lg font-bold">Quontic bank</p>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex flex-col w-full p-4 items-center relative z-30">
          {Object.keys(routes).map((item, index) => {
            const path = routes[item];
            const isActive = location.pathname === path; // Check if the path matches the current location

            return (
              <Link
                to={path}
                key={index}
                className={`py-4 px-4 rounded-lg text-sm font-semibold w-full text-left  ${
                  isActive
                    ? "bg-white text-customColor"
                    : "hover:bg-[#0076b6] transition-all duration-300 transform hover:scale-105 hover:translate-y-1 "
                }`}
              >
                {item}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-auto py-4 px-4 bg-cutomColor text-white font-semibold rounded-lg w-full text-left transition-all duration-300 transform hover:scale-105 hover:translate-y-1 hover:bg-[#0076b6]"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
