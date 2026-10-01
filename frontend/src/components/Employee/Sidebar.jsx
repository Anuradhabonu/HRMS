
import React from "react";

import {
  MdDashboard,
  MdAssessment,
  MdEventNote,
  MdWork,
  MdNotifications,
  MdPerson,
  MdLogout,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

import { useLocation, useNavigate } from "react-router-dom";

import "./Sidebar.css";

function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: <MdDashboard />,
      path: "/employee/dashboard",
    },
    {
      name: "Reports",
      icon: <MdAssessment />,
      path: "/employee/reports",
    },
    {
      name: "Leaves",
      icon: <MdEventNote />,
      path: "/employee/leaves",
    },
    {
      name: "Projects",
      icon: <MdWork />,
      path: "/employee/projects",
    },
    {
      name: "Notifications",
      icon: <MdNotifications />,
      path: "/employee/notifications",
    },
  ];

  /* =========================================================
     DESKTOP COLLAPSE
     ========================================================= */

  const handleToggle = () => {
    setCollapsed((prev) => !prev);
  };

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const handleNavigation = (path) => {
    navigate(path);

    // Close only on mobile
    if (window.innerWidth <= 900) {
      setMobileOpen(false);
    }
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

    sessionStorage.clear();

    setMobileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
          ===================================================== */}

      {mobileOpen && (
        <div
          className="employee-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`
          employee-sidebar
          ${collapsed ? "employee-sidebar-collapsed" : ""}
          ${mobileOpen ? "employee-sidebar-mobile-open" : ""}
        `}
      >

        {/* =================================================
            TOP
            ================================================= */}

        <div className="employee-sidebar-top">

          <div className="employee-sidebar-logo">

            <div className="employee-logo-box">
              H
            </div>

            {!collapsed && (
              <div className="employee-logo-text">
                <strong>HRMS</strong>
                <span>Employee</span>
              </div>
            )}

          </div>

          {/* Desktop collapse */}
          <button
            type="button"
            className="employee-collapse-button"
            onClick={handleToggle}
            title={
              collapsed
                ? "Expand Sidebar"
                : "Collapse Sidebar"
            }
            aria-label={
              collapsed
                ? "Expand Sidebar"
                : "Collapse Sidebar"
            }
          >
            {collapsed ? (
              <MdChevronRight />
            ) : (
              <MdChevronLeft />
            )}
          </button>

        </div>

        {/* =================================================
            MAIN MENU
            ================================================= */}

        <nav className="employee-sidebar-menu">

          {!collapsed && (
            <div className="employee-menu-label">
              MAIN MENU
            </div>
          )}

          {menuItems.map((item) => {

            const active =
              location.pathname === item.path ||
              location.pathname.startsWith(
                `${item.path}/`
              );

            return (
              <button
                type="button"
                key={item.path}
                className={`
                  employee-sidebar-item
                  ${active ? "active" : ""}
                `}
                onClick={() =>
                  handleNavigation(item.path)
                }
                title={
                  collapsed
                    ? item.name
                    : ""
                }
                aria-label={item.name}
              >

                <span className="employee-sidebar-icon">
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="employee-sidebar-name">
                    {item.name}
                  </span>
                )}

              </button>
            );
          })}

        </nav>

        {/* =================================================
            BOTTOM
            ================================================= */}

        <div className="employee-sidebar-bottom">

          {/* PROFILE */}

          <button
            type="button"
            className={`
              employee-sidebar-bottom-item
              employee-profile-item
              ${
                location.pathname ===
                  "/employee/profile" ||
                location.pathname.startsWith(
                  "/employee/profile/"
                )
                  ? "active"
                  : ""
              }
            `}
            onClick={() =>
              handleNavigation("/employee/profile")
            }
            title={
              collapsed
                ? "Profile"
                : ""
            }
            aria-label="Profile"
          >

            <span className="employee-bottom-icon">
              <MdPerson />
            </span>

            {!collapsed && (
              <span className="employee-bottom-name">
                Profile
              </span>
            )}

          </button>

          {/* LOGOUT */}

          <button
            type="button"
            className="
              employee-sidebar-bottom-item
              employee-logout-item
            "
            onClick={handleLogout}
            title={
              collapsed
                ? "Logout"
                : ""
            }
            aria-label="Logout"
          >

            <span className="employee-bottom-icon">
              <MdLogout />
            </span>

            {!collapsed && (
              <span className="employee-bottom-name">
                Logout
              </span>
            )}

          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;
