import React, { useEffect, useState } from "react";

import {
  MdAnalytics,
  MdRefresh,
  MdArrowBack,
  MdPeople,
  MdWork,
  MdEventNote,
  MdAssignment,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdTrendingUp,
  MdBarChart,
} from "react-icons/md";

import { apiFetch } from "../../api";

import "./Analytics.css";

function Analytics() {
  // =====================================================
  // ANALYTICS STATE
  // =====================================================

  const [analytics, setAnalytics] = useState({
    total_employees: 0,
    active_employees: 0,

    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,

    total_leaves: 0,
    pending_leaves: 0,
    approved_leaves: 0,
    rejected_leaves: 0,

    total_reports: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // BACKEND CONNECTION
  // =====================================================

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      let data;

      // First API endpoint
      try {
        data = await apiFetch("/analytics/summary");
      } catch (summaryError) {
        console.warn(
          "/analytics/summary failed. Trying /analytics..."
        );

        // Fallback API endpoint
        data = await apiFetch("/analytics");
      }

      console.log("Analytics Backend Response:", data);

      // Backend response ni state lo store cheyyadam
      if (data && typeof data === "object") {
        setAnalytics((previousData) => ({
          ...previousData,
          ...data,
        }));
      } else {
        setError("Invalid analytics data received from backend.");
      }
    } catch (error) {
      console.error("Analytics Backend Error:", error);

      setError(
        error?.message ||
          "Analytics data could not be loaded from backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAGE LOAD → BACKEND API CALL
  // =====================================================

  useEffect(() => {
    loadAnalytics();
  }, []);

  // =====================================================
  // GET VALUE SAFELY
  // =====================================================

  const getValue = (...keys) => {
    for (const key of keys) {
      if (
        analytics &&
        analytics[key] !== undefined &&
        analytics[key] !== null
      ) {
        return analytics[key];
      }
    }

    return 0;
  };

  // =====================================================
  // EMPLOYEE DATA
  // =====================================================

  const totalEmployees = getValue(
    "total_employees",
    "employees",
    "employee_count"
  );

  const activeEmployees = getValue(
    "active_employees",
    "active_employee_count"
  );

  // =====================================================
  // PROJECT DATA
  // =====================================================

  const totalProjects = getValue(
    "total_projects",
    "projects",
    "project_count"
  );

  const activeProjects = getValue(
    "active_projects",
    "active_project_count"
  );

  const completedProjects = getValue(
    "completed_projects",
    "completed_project_count"
  );

  // =====================================================
  // LEAVE DATA
  // =====================================================

  const totalLeaves = getValue(
    "total_leaves",
    "leaves",
    "leave_count"
  );

  const pendingLeaves = getValue(
    "pending_leaves",
    "pending_leave_count"
  );

  const approvedLeaves = getValue(
    "approved_leaves",
    "approved_leave_count"
  );

  const rejectedLeaves = getValue(
    "rejected_leaves",
    "rejected_leave_count"
  );

  // =====================================================
  // REPORT DATA
  // =====================================================

  const totalReports = getValue(
    "total_reports",
    "reports",
    "report_count"
  );

  return (
    <div className="analytics-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="analytics-header">

        <div className="analytics-header-left">

          <button
            className="analytics-back-btn"
            onClick={() => window.history.back()}
          >
            <MdArrowBack />
            <span>Back</span>
          </button>

          <div>

            <div className="analytics-title-row">

              <h1>Analytics Dashboard</h1>

              <span className="analytics-live-badge">
                <span></span>
                HR Management
              </span>

            </div>

            <p>
              View employee, project, leave and
              work report analytics.
            </p>

          </div>

        </div>

        <div className="analytics-header-actions">

          <button
            className="analytics-refresh-btn"
            onClick={loadAnalytics}
            disabled={loading}
          >

            <MdRefresh
              className={
                loading
                  ? "analytics-refresh-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

      </div>

      {/* =================================================
          BACKEND ERROR
      ================================================= */}

      {error && (
        <div className="analytics-error">

          <strong>Backend Error:</strong>

          <span>{error}</span>

          <button onClick={loadAnalytics}>
            Try Again
          </button>

        </div>
      )}

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="analytics-summary-grid">

        {/* TOTAL EMPLOYEES */}

        <div className="analytics-summary-card blue">

          <div className="analytics-summary-icon">
            <MdPeople />
          </div>

          <div>

            <span>Total Employees</span>

            <strong>
              {loading
                ? "..."
                : totalEmployees}
            </strong>

          </div>

        </div>

        {/* ACTIVE EMPLOYEES */}

        <div className="analytics-summary-card green">

          <div className="analytics-summary-icon">
            <MdCheckCircle />
          </div>

          <div>

            <span>Active Employees</span>

            <strong>
              {loading
                ? "..."
                : activeEmployees}
            </strong>

          </div>

        </div>

        {/* TOTAL PROJECTS */}

        <div className="analytics-summary-card orange">

          <div className="analytics-summary-icon">
            <MdWork />
          </div>

          <div>

            <span>Total Projects</span>

            <strong>
              {loading
                ? "..."
                : totalProjects}
            </strong>

          </div>

        </div>

        {/* TOTAL REPORTS */}

        <div className="analytics-summary-card purple">

          <div className="analytics-summary-icon">
            <MdAssignment />
          </div>

          <div>

            <span>Total Reports</span>

            <strong>
              {loading
                ? "..."
                : totalReports}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          PROJECT + LEAVE ANALYTICS
      ================================================= */}

      <div className="analytics-main-grid">

        {/* PROJECT ANALYTICS */}

        <div className="analytics-card">

          <div className="analytics-card-header">

            <div className="analytics-card-title">

              <div className="analytics-card-icon blue">
                <MdWork />
              </div>

              <div>

                <h2>Project Analytics</h2>

                <p>
                  Project status overview
                </p>

              </div>

            </div>

            <MdTrendingUp className="analytics-trend-icon" />

          </div>

          <div className="analytics-stat-list">

            {/* TOTAL PROJECTS */}

            <div className="analytics-stat-row">

              <div>
                <MdAssignment />
                <span>Total Projects</span>
              </div>

              <strong>
                {loading
                  ? "..."
                  : totalProjects}
              </strong>

            </div>

            {/* ACTIVE PROJECTS */}

            <div className="analytics-stat-row">

              <div>
                <MdCheckCircle />
                <span>Active Projects</span>
              </div>

              <strong className="green-text">
                {loading
                  ? "..."
                  : activeProjects}
              </strong>

            </div>

            {/* COMPLETED PROJECTS */}

            <div className="analytics-stat-row">

              <div>
                <MdBarChart />
                <span>Completed Projects</span>
              </div>

              <strong className="blue-text">
                {loading
                  ? "..."
                  : completedProjects}
              </strong>

            </div>

          </div>

        </div>

        {/* LEAVE ANALYTICS */}

        <div className="analytics-card">

          <div className="analytics-card-header">

            <div className="analytics-card-title">

              <div className="analytics-card-icon orange">
                <MdEventNote />
              </div>

              <div>

                <h2>Leave Analytics</h2>

                <p>
                  Employee leave overview
                </p>

              </div>

            </div>

            <MdEventNote className="analytics-trend-icon" />

          </div>

          <div className="analytics-stat-list">

            {/* TOTAL LEAVES */}

            <div className="analytics-stat-row">

              <div>
                <MdEventNote />
                <span>Total Leaves</span>
              </div>

              <strong>
                {loading
                  ? "..."
                  : totalLeaves}
              </strong>

            </div>

            {/* PENDING */}

            <div className="analytics-stat-row">

              <div>
                <MdPending />
                <span>Pending Leaves</span>
              </div>

              <strong className="orange-text">
                {loading
                  ? "..."
                  : pendingLeaves}
              </strong>

            </div>

            {/* APPROVED */}

            <div className="analytics-stat-row">

              <div>
                <MdCheckCircle />
                <span>Approved Leaves</span>
              </div>

              <strong className="green-text">
                {loading
                  ? "..."
                  : approvedLeaves}
              </strong>

            </div>

            {/* REJECTED */}

            <div className="analytics-stat-row">

              <div>
                <MdCancel />
                <span>Rejected Leaves</span>
              </div>

              <strong className="red-text">
                {loading
                  ? "..."
                  : rejectedLeaves}
              </strong>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          EMPLOYEE + REPORT + LEAVE
      ================================================= */}

      <div className="analytics-bottom-grid">

        {/* EMPLOYEE */}

        <div className="analytics-info-card">

          <div className="analytics-info-icon">
            <MdPeople />
          </div>

          <div>

            <span>Employee Overview</span>

            <strong>

              {loading
                ? "..."
                : activeEmployees}

              {" "}
              Active

            </strong>

            <p>
              Out of {totalEmployees} total
              employees
            </p>

          </div>

        </div>

        {/* REPORTS */}

        <div className="analytics-info-card">

          <div className="analytics-info-icon purple">
            <MdAssignment />
          </div>

          <div>

            <span>Work Reports</span>

            <strong>
              {loading
                ? "..."
                : totalReports}
            </strong>

            <p>
              Total submitted work reports
            </p>

          </div>

        </div>

        {/* APPROVED LEAVES */}

        <div className="analytics-info-card">

          <div className="analytics-info-icon green">
            <MdCheckCircle />
          </div>

          <div>

            <span>Approved Leaves</span>

            <strong>
              {loading
                ? "..."
                : approvedLeaves}
            </strong>

            <p>
              Approved employee leaves
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          FOOTER CARD
      ================================================= */}

      <div className="analytics-footer-card">

        <div className="analytics-footer-icon">
          <MdAnalytics />
        </div>

        <div>

          <h2>HR Analytics Overview</h2>

          <p>
            Monitor employees, projects,
            leaves and work reports from
            one place.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Analytics;