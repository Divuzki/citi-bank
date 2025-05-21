import React from "react";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

export const UserInfo = ({ name, lastLogin, profilePicture }) => (
  <div className="hidden lg:flex bg-customColor  text-white py-6 px-12 items-center justify-between mt-2 rounded-md shadow-lg">
    <div className="absolute overflow-hidden z-[-1] inset-0">
    {/* Top Left White Shape */}
    <div className="absolute top-0 left-0 w-48 h-48 bg-white opacity-5 transform -translate-x-10 -translate-y-10"></div>

    {/* Bottom Right White Shape */}
    <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-5 transform translate-x-10 translate-y-10"></div>

    {/* Diagonal White Stripe */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-white to-transparent opacity-5 transform -rotate-12"></div>
  </div>
    {/* Left Section: Welcome Text */}
    <div>
      <h2 className="text-xl font-bold mb-2">Welcome, {name}</h2>
      <p className="text-sm">Last login: {lastLogin}</p>
    </div>

    {/* Right Section: Profile Picture and Notification Icon */}
    <div className="flex items-center space-x-4">
      {/* Profile Picture */}
      <img
        src={profilePicture || "/default-profile.jpg"} // Replace with the actual default profile picture path
        alt="Profile"
        className="w-16 h-16 rounded-full object-cover border-2 border-white"
      />
      {/* Notification Icon */}
      <NotificationsNoneIcon fontSize="large" />
    </div>
  </div>
);
