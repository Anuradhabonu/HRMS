
import React, { useState, useRef, useEffect } from "react";
import {
  MdMenu,
  MdAccountCircle,
  MdKeyboardArrowDown,
  MdPerson,
  MdLogout,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef(null);

  const userName =
    localStorage.getItem("userName") || "Employee";

  /* =========================================================
     MOBILE SIDEBAR
     ========================================================= */

  const handleMenuClick = () => {
    if (setMobileOpen) {
      setMobileOpen((prev) => !prev);
    }
  };

  /* =========================================================
     PROFILE MENU
     ========================================================= */

  const handleProfileClick = () => {
    setShowProfileMenu((prev) => !prev);
  };

  /* =========================================================
     OPEN PROFILE
     ========================================================= */

  const handleOpenProfile = () => {
    setShowProfileMenu(false);
    navigate("/employee/profile");
  };

  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("otp_verified");

    setShowProfileMenu(false);

    navigate("/login");
  };

  /* =========================================================
     CLOSE DROPDOWN OUTSIDE CLICK
     ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  return (
    <header className="employee-navbar">

      {/* =====================================================
          LEFT
          ===================================================== */}

      <div className="employee-navbar-left">

        {/* Mobile Sidebar Button */}
        <button
          type="button"
          className="employee-menu-button"
          onClick={handleMenuClick}
          aria-label="Open Sidebar"
        >
          <MdMenu />
        </button>

        {/* Brand */}
        <div className="employee-brand">
          <h2>HRMS</h2>
          <span>Employee Portal</span>
        </div>

      </div>

      {/* =====================================================
          RIGHT
          ===================================================== */}

      <div
        className="employee-navbar-right"
        ref={profileRef}
      >

        {/* Profile Button */}
        <button
          type="button"
          className="employee-profile-button"
          onClick={handleProfileClick}
          aria-label="Profile Menu"
        >
          <MdAccountCircle className="employee-profile-icon" />

          <div className="employee-profile-details">
            <strong>{userName}</strong>
            <span>Employee</span>
          </div>

          <MdKeyboardArrowDown
            className={`employee-profile-arrow ${
              showProfileMenu ? "open" : ""
            }`}
          />
        </button>

        {/* =================================================
            DROPDOWN
            ================================================= */}

        {showProfileMenu && (
          <div className="employee-profile-dropdown">

            {/* User Header */}
            <div className="employee-dropdown-header">
              <MdAccountCircle />

              <div>
                <strong>{userName}</strong>
                <span>Employee</span>
              </div>
            </div>

            <div className="employee-dropdown-divider" />

            {/* Profile */}
            <button
              type="button"
              className="employee-dropdown-item"
              onClick={handleOpenProfile}
            >
              <MdPerson />
              <span>Profile</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              className="employee-dropdown-item logout"
              onClick={handleLogout}
            >
              <MdLogout />
              <span>Logout</span>
            </button>

          </div>
        )}

      </div>

    </header>
  );
}

export default Navbar;