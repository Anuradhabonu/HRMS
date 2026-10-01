import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";

import "./OTP.css";

function OTP() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef([]);

  const email = localStorage.getItem("loginEmail");
  const role = localStorage.getItem("loginRole");

  useEffect(() => {
    if (!email || !role) {
      navigate("/login");
    }
  }, [email, role, navigate]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const newOtp = [...otp];

    newOtp[index] = value;

    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6 digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp: otpValue,
          role,
        }),
      });

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "userRole",
        data.user?.role || role
      );

      localStorage.setItem(
        "userId",
        String(data.user?.id || "")
      );

      localStorage.setItem(
        "userName",
        data.user?.name || ""
      );

      localStorage.setItem(
        "userEmail",
        data.user?.email || email
      );

      localStorage.setItem(
        "employeeId",
        String(data.user?.employee_id || "")
      );

      if (role === "hr") {
        navigate("/hr/dashboard", {
          replace: true,
        });
      } else {
        navigate("/employee/dashboard", {
          replace: true,
        });
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-page">

      <div className="otp-card">

        <h1>Verify OTP</h1>

        <p>
          OTP sent to
        </p>

        <strong>
          {email}
        </strong>

        <form onSubmit={handleVerify}>

          <div className="otp-inputs">

            {otp.map((value, index) => (
              <input
                key={index}
                ref={(el) =>
                  (inputRefs.current[index] = el)
                }
                type="text"
                maxLength="1"
                value={value}
                onChange={(e) =>
                  handleChange(
                    e.target.value,
                    index
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, index)
                }
              />
            ))}

          </div>

          {error && (
            <div className="otp-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Verify & Login"}
          </button>

        </form>

        <button
          className="otp-back"
          onClick={() => navigate("/login")}
        >
          ← Back to Login
        </button>

      </div>

    </div>
  );
}

export default OTP;