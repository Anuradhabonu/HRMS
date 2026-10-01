import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("hr");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      localStorage.setItem("loginEmail", email.trim());
      localStorage.setItem("loginRole", role);

      setMessage(data.message || "OTP sent successfully.");

      setTimeout(() => {
        navigate("/otp");
      }, 500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          HRMS
        </div>

        <h1>Welcome to HRMS</h1>

        <p className="login-subtitle">
          Human Resource Management System
        </p>

        <form onSubmit={handleSendOTP}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />


          <label>Role</label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="hr">HR</option>
            <option value="employee">Employee</option>
          </select>


          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {message && (
            <div className="login-success">
              {message}
            </div>
          )}


          <button
            type="submit"
            className="send-otp-btn"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;