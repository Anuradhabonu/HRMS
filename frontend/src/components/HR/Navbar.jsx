import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MdMenu,
  MdClose,
  MdPerson,
  MdLogout,
  MdKeyboardArrowDown,
} from "react-icons/md";

import { useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar({
  mobileOpen = false,
  setMobileOpen,
}) {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const profileRef = useRef(null);

  const userName =
    localStorage.getItem("userName") ||
    "HR Admin";

  const userEmail =
    localStorage.getItem("userEmail") ||
    "hr@company.com";

  /* =====================================================
     MOBILE SIDEBAR
     ===================================================== */

  const handleMobileMenu = () => {
    if (setMobileOpen) {
      setMobileOpen((previous) => !previous);
    }
  };

  /* =====================================================
     CLOSE PROFILE DROPDOWN
     ===================================================== */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
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

  /* =====================================================
     PROFILE
     ===================================================== */

  const handleProfile = () => {
    setShowProfileMenu(false);

    if (setMobileOpen) {
      setMobileOpen(false);
    }

    navigate("/hr/profile");
  };

  /* =====================================================
     LOGOUT
     ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("otp_verified");
    localStorage.removeItem("loginEmail");

    sessionStorage.clear();

    setShowProfileMenu(false);

    if (setMobileOpen) {
      setMobileOpen(false);
    }

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="hr-navbar">

      {/* =================================================
          LEFT
          ================================================= */}

      <div className="hr-navbar-left">

        {/* MOBILE MENU */}

        <button
          type="button"
          className="hr-mobile-menu-button"
          onClick={handleMobileMenu}
          aria-label={
            mobileOpen
              ? "Close sidebar"
              : "Open sidebar"
          }
        >
          {mobileOpen ? (
            <MdClose />
          ) : (
            <MdMenu />
          )}
        </button>

        {/* TITLE */}

        <div className="hr-navbar-title">

          <span className="hr-navbar-title-main">
            HRMS
          </span>

          <span className="hr-navbar-title-divider">
            /
          </span>

          <span className="hr-navbar-title-sub">
            Human Resource Management
          </span>

        </div>

      </div>

      {/* =================================================
          RIGHT
          ================================================= */}

      <div className="hr-navbar-right">

        <div
          className="hr-navbar-profile-wrapper"
          ref={profileRef}
        >

          {/* PROFILE BUTTON */}

          <button
            type="button"
            className="hr-navbar-profile-button"
            onClick={() =>
              setShowProfileMenu(
                (previous) => !previous
              )
            }
            aria-label="Open profile menu"
          >

            <span className="hr-navbar-avatar">
              <MdPerson />
            </span>

            <span className="hr-navbar-user-info">

              <span className="hr-navbar-user-name">
                {userName}
              </span>

              <span className="hr-navbar-user-role">
                HR Administrator
              </span>

            </span>

            <MdKeyboardArrowDown
              className={`hr-navbar-arrow ${
                showProfileMenu
                  ? "open"
                  : ""
              }`}
            />

          </button>

          {/* =================================================
              DROPDOWN
              ================================================= */}

          {showProfileMenu && (
            <div className="hr-navbar-dropdown">

              <div className="hr-dropdown-user">

                <span className="hr-dropdown-avatar">
                  <MdPerson />
                </span>

                <div className="hr-dropdown-user-details">

                  <strong>
                    {userName}
                  </strong>

                  <span>
                    {userEmail}
                  </span>

                </div>

              </div>

              <div className="hr-dropdown-divider" />

              {/* PROFILE */}

              <button
                type="button"
                className="hr-dropdown-item"
                onClick={handleProfile}
              >

                <span className="hr-dropdown-icon">
                  <MdPerson />
                </span>

                <span>
                  My Profile
                </span>

              </button>

              {/* LOGOUT */}

              <button
                type="button"
                className="hr-dropdown-item hr-dropdown-logout"
                onClick={handleLogout}
              >

                <span className="hr-dropdown-icon">
                  <MdLogout />
                </span>

                <span>
                  Logout
                </span>

              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;