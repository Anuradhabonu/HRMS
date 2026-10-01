import React, {
  useState,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Auth/Login";
import OTP from "./pages/Auth/OTP";

import ProtectedRoute from "./ProtectedRoute";

import "./App.css";

/* =========================================================
   HR COMPONENTS
   ========================================================= */

import HRNavbar from "./components/HR/Navbar";
import HRSidebar from "./components/HR/Sidebar";

/* =========================================================
   HR PAGES
   ========================================================= */

import HRDashboard from "./pages/HR Dashboard/Dashboard";
import HREmployees from "./pages/HR Dashboard/Employees";
import HRLeaves from "./pages/HR Dashboard/Leaves";
import HRReports from "./pages/HR Dashboard/Reports";
import HRProjects from "./pages/HR Dashboard/Projects";
import HRNotifications from "./pages/HR Dashboard/Notifications";
import HRAnalytics from "./pages/HR Dashboard/Analytics";
import HRProfile from "./pages/HR Dashboard/Profile";

/* =========================================================
   EMPLOYEE COMPONENTS
   ========================================================= */

import EmployeeNavbar from "./components/Employee/Navbar";
import EmployeeSidebar from "./components/Employee/Sidebar";

/* =========================================================
   EMPLOYEE PAGES
   ========================================================= */

import EmployeeDashboard from "./pages/Employee Dashboard/Dashboard";
import EmployeeLeaves from "./pages/Employee Dashboard/Leaves";
import EmployeeReports from "./pages/Employee Dashboard/Reports";
import EmployeeProjects from "./pages/Employee Dashboard/Projects";
import EmployeeNotifications from "./pages/Employee Dashboard/Notifications";
import EmployeeProfile from "./pages/Employee Dashboard/Profile";

/* =========================================================
   HR LAYOUT
   ========================================================= */

function HRLayout({ children }) {
  const [collapsed, setCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <div
      className={`
        app-shell
        ${
          collapsed
            ? "sidebar-collapsed"
            : "sidebar-expanded"
        }
      `}
    >

      <HRNavbar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="page-layout">

        <HRSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="main-content">
          {children}
        </main>

      </div>
    </div>
  );
}

/* =========================================================
   EMPLOYEE LAYOUT
   ========================================================= */

function EmployeeLayout({ children }) {
  const [collapsed, setCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <div
      className={`
        app-shell
        employee-app-shell
        ${
          collapsed
            ? "sidebar-collapsed"
            : "sidebar-expanded"
        }
      `}
    >

      <EmployeeNavbar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="page-layout employee-page-layout">

        <EmployeeSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="main-content employee-main-content">
          {children}
        </main>

      </div>
    </div>
  );
}

/* =========================================================
   APP CONTENT
   ========================================================= */

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const canShowBack =
    location.pathname !== "/" &&
    location.pathname !== "/login" &&
    location.pathname !== "/otp";

  return (
    <>

      {/* =================================================
          GLOBAL BACK BUTTON
          ================================================= */}

      
        
      
      {/* =================================================
          ROUTES
          ================================================= */}

      <Routes>

        {/* AUTH */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/otp"
          element={<OTP />}
        />

        {/* =================================================
            HR
            ================================================= */}

        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute role="hr">
              <HRLayout>
                <HRDashboard />
              </HRLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/employees"
          element={
            <ProtectedRoute role="hr">
              <HRLayout>
                <HREmployees />
              </HRLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/leaves"
          element={
            <ProtectedRoute role="hr">
              <HRLayout>
                <HRLeaves />
              </HRLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/reports"
          element={
            <ProtectedRoute role="hr">
              <HRLayout>
                <HRReports />
              </HRLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/projects"
          element={
            <ProtectedRoute role="hr">
              <HRLayout>
                <HRProjects />
              </HRLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/notifications"
          element={
            <ProtectedRoute role="hr">
              <HRLayout>
                <HRNotifications />
              </HRLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/analytics"
          element={
            <ProtectedRoute role="hr">
              <HRLayout>
                <HRAnalytics />
              </HRLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/profile"
          element={
            <ProtectedRoute role="hr">
              <HRLayout>
                <HRProfile />
              </HRLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            EMPLOYEE
            ================================================= */}

        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout>
                <EmployeeDashboard />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/leaves"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout>
                <EmployeeLeaves />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/reports"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout>
                <EmployeeReports />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/projects"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout>
                <EmployeeProjects />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/notifications"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout>
                <EmployeeNotifications />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout>
                <EmployeeProfile />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            DEFAULT
            ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* INVALID */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </>
  );
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;