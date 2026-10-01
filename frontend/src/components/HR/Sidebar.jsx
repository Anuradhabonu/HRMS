import React from "react";

import {
  MdDashboard,
  MdAnalytics,
  MdPeople,
  MdAssignment,
  MdEventNote,
  MdWork,
  MdNotifications,
  MdPerson,
  MdLogout,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
} from "react-icons/md";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Sidebar.css";

function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const userName =
    localStorage.getItem("userName") ||
    "HR Manager";

  const userEmail =
    localStorage.getItem("userEmail") ||
    "hr@example.com";

  const menuItems = [
    {
      label: "Dashboard",
      icon: <MdDashboard />,
      path: "/hr/dashboard",
    },
    {
      label: "Employees",
      icon: <MdPeople />,
      path: "/hr/employees",
    },
    {
      label: "Leaves",
      icon: <MdEventNote />,
      path: "/hr/leaves",
    },
    {
      label: "Work Reports",
      icon: <MdAssignment />,
      path: "/hr/reports",
    },
    {
      label: "Projects",
      icon: <MdWork />,
      path: "/hr/projects",
    },
    {
      label: "Analytics",
      icon: <MdAnalytics />,
      path: "/hr/analytics",
    },
    {
      label: "Notifications",
      icon: <MdNotifications />,
      path: "/hr/notifications",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  /* =====================================================
     NAVIGATION
     ===================================================== */

  const handleNavigation = (path) => {
    navigate(path);

    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  /* =====================================================
     PROFILE
     ===================================================== */

  const handleProfile = () => {
    navigate("/hr/profile");

    if (setMobileOpen) {
      setMobileOpen(false);
    }
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

    if (setMobileOpen) {
      setMobileOpen(false);
    }

    navigate("/login", {
      replace: true,
    });
  };

  /* =====================================================
     CLOSE MOBILE SIDEBAR
     ===================================================== */

  const closeMobileSidebar = () => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* =================================================
          MOBILE OVERLAY
          ================================================= */}

      {mobileOpen && (
        <div
          className="hr-sidebar-overlay"
          onClick={closeMobileSidebar}
        />
      )}

      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside
        className={`
          hr-sidebar
          ${collapsed ? "hr-sidebar-collapsed" : ""}
          ${mobileOpen ? "hr-sidebar-mobile-open" : ""}
        `}
      >

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="hr-sidebar-header">

          {!collapsed && (
            <div className="hr-sidebar-brand">

              <div className="hr-brand-icon">
                HR
              </div>

              <div className="hr-brand-text">

                <span className="hr-brand-title">
                  HRMS
                </span>

                <span className="hr-brand-subtitle">
                  Management
                </span>

              </div>

            </div>
          )}

          {collapsed && (
            <div className="hr-brand-icon hr-brand-icon-small">
              HR
            </div>
          )}

          {/* MOBILE CLOSE */}

          

          {/* DESKTOP COLLAPSE */}

          <button
            type="button"
            className="hr-sidebar-collapse-btn"
            onClick={() =>
              setCollapsed(!collapsed)
            }
            title={
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
            NAVIGATION
            ================================================= */}

        <nav className="hr-sidebar-nav">

          <div className="hr-nav-section-title">
            {!collapsed && "MAIN MENU"}
          </div>

          {menuItems.map((item) => (
            <button
              type="button"
              key={item.path}
              className={`
                hr-sidebar-item
                ${
                  isActive(item.path)
                    ? "hr-sidebar-item-active"
                    : ""
                }
              `}
              onClick={() =>
                handleNavigation(item.path)
              }
              title={
                collapsed
                  ? item.label
                  : ""
              }
            >

              <span className="hr-sidebar-item-icon">
                {item.icon}
              </span>

              {!collapsed && (
                <span className="hr-sidebar-item-label">
                  {item.label}
                </span>
              )}

              {!collapsed &&
                isActive(item.path) && (
                  <span className="hr-active-indicator" />
                )}

            </button>
          ))}

        </nav>

        {/* =================================================
            BOTTOM
            ================================================= */}

        <div className="hr-sidebar-bottom">

          {/* PROFILE */}

          <button
            type="button"
            className={`
              hr-sidebar-item
              hr-profile-item
              ${
                isActive("/hr/profile")
                  ? "hr-sidebar-item-active"
                  : ""
              }
            `}
            onClick={handleProfile}
            title={
              collapsed
                ? "Profile"
                : ""
            }
          >

            <span className="hr-sidebar-item-icon">
              <MdPerson />
            </span>

            {!collapsed && (
              <div className="hr-profile-info">

                <span className="hr-profile-name">
                  {userName}
                </span>

                <span className="hr-profile-email">
                  {userEmail}
                </span>

              </div>
            )}

          </button>

          {/* LOGOUT */}

          <button
            type="button"
            className="hr-sidebar-item hr-logout-item"
            onClick={handleLogout}
            title={
              collapsed
                ? "Logout"
                : ""
            }
          >

            <span className="hr-sidebar-item-icon">
              <MdLogout />
            </span>

            {!collapsed && (
              <span className="hr-sidebar-item-label">
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