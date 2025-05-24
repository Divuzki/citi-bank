import React from "react";

export const Footer = () => {
  return (
    <footer className="md:bg-white bg-customColor text-white  flex justify-center items-center md:text-black py-10">
      <div className="max-w-screen-xl mx-auto flex justify-center items-center space-x-4">
        {/* Logo */}
        <div className="md:block hidden">
          <img
            src="/Svg/logo.png" // Replace with your logo path
            alt="Bank Logo"
            className="w-16 h-12 object-contain object-center"
          />
        </div>
        <div className="md:hidden block">
          <img
            src="/Svg/logo.png" // Replace with your logo path
            alt="Bank Logo"
            className="w-16 h-12 object-contain object-center"
          />
        </div>
        {/* Text */}
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Quant Equity Banking. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};
