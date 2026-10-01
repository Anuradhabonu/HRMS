import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    if (userRole === "hr") {
      return <Navigate to="/hr/dashboard" replace />;
    }

    if (userRole === "employee") {
      return <Navigate to="/employee/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;