import React from "react";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-500 text-white p-2 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <NavLink to="/" className="hover:underline">
            Home
          </NavLink>
          <NavLink to="/aboutUs" className="hover:underline">
            About Us
          </NavLink>
          <NavLink to="/contactUs" className="hover:underline">
            Contact
          </NavLink>
          <NavLink to="/privacyPolicy" className="hover:underline">
            Privacy Policy
          </NavLink>
          <NavLink to="/terms" className="hover:underline">
            Terms of Service
          </NavLink>
        </div>
        <p className="text-sm">© 2024 URBAN CLAMP. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
