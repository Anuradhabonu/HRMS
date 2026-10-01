
import React, { useEffect, useState } from "react";
import {
  MdDashboard,
  MdRefresh,
  MdArrowBack,
  MdDescription,
  MdCalendarToday,
  MdFolder,
  MdCheckCircle,
  MdAccessTime,
  MdPendingActions,
  MdArrowForward,
} from "react-icons/md";

import { apiFetch } from "../../api";
import "./Dashboard.css";

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [reportsData, leavesData, projectsData] =
        await Promise.all([
          apiFetch("/reports/me"),
          apiFetch("/leaves/me"),
          apiFetch("/projects/me"),
        ]);

      setReports(Array.isArray(reportsData) ? reportsData : []);
      setLeaves(Array.isArray(leavesData) ? leavesData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalReports = reports.length;
  const totalLeaves = leaves.length;
  const totalProjects = projects.length;

  const approvedLeaves = leaves.filter(
    (leave) =>
      String(leave.status || "").toLowerCase() === "approved"
  ).length;

  const pendingLeaves = leaves.filter(
    (leave) =>
      String(leave.status || "").toLowerCase() === "pending"
  ).length;

  const recentReports = [...reports]
    .sort(
      (a, b) =>
        new Date(b.submit_date || 0) -
        new Date(a.submit_date || 0)
    )
    .slice(0, 5);

  const recentLeaves = [...leaves]
    .sort(
      (a, b) =>
        new Date(b.start_date || 0) -
        new Date(a.start_date || 0)
    )
    .slice(0, 5);

  const recentProjects = [...projects].slice(0, 5);

  const getStatusClass = (status) => {
    const value = String(status || "Pending").toLowerCase();

    if (value === "approved" || value === "completed") {
      return "employee-status-approved";
    }

    if (value === "rejected" || value === "cancelled") {
      return "employee-status-rejected";
    }

    if (value === "in progress") {
      return "employee-status-progress";
    }

    return "employee-status-pending";
  };

  const getStatusText = (status) => {
    return status || "Pending";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString("en-IN");
  };

  return (
    <div className="employee-dashboard-page">

      {/* HEADER */}
      <div className="employee-dashboard-header">

        <div className="employee-dashboard-header-left">

          <button
            className="employee-dashboard-back-btn"
            onClick={() => window.history.back()}
          >
            <MdArrowBack />
            Back
          </button>

          <div className="employee-dashboard-title-area">

            <div className="employee-dashboard-title-row">
              <div className="employee-dashboard-title-icon">
                <MdDashboard />
              </div>

              <div>
                <h1>Employee Dashboard</h1>
                <p>Welcome to your HRMS dashboard</p>
              </div>
            </div>

            <div className="employee-dashboard-live-badge">
              <span></span>
              Employee Portal
            </div>

          </div>
        </div>

        <button
          className="employee-dashboard-refresh-btn"
          onClick={loadDashboard}
          disabled={loading}
        >
          <MdRefresh className={loading ? "employee-spin" : ""} />
          Refresh
        </button>

      </div>

      {/* SUMMARY CARDS */}
      <div className="employee-dashboard-summary-grid">

        <div className="employee-dashboard-summary-card blue-card">
          <div className="employee-dashboard-card-icon">
            <MdDescription />
          </div>

          <div>
            <span>Total Reports</span>
            <strong>{totalReports}</strong>
            <small>Your submitted reports</small>
          </div>
        </div>

        <div className="employee-dashboard-summary-card green-card">
          <div className="employee-dashboard-card-icon">
            <MdCalendarToday />
          </div>

          <div>
            <span>Total Leaves</span>
            <strong>{totalLeaves}</strong>
            <small>Leave applications</small>
          </div>
        </div>

        <div className="employee-dashboard-summary-card orange-card">
          <div className="employee-dashboard-card-icon">
            <MdPendingActions />
          </div>

          <div>
            <span>Pending Leaves</span>
            <strong>{pendingLeaves}</strong>
            <small>Waiting for approval</small>
          </div>
        </div>

        <div className="employee-dashboard-summary-card purple-card">
          <div className="employee-dashboard-card-icon">
            <MdFolder />
          </div>

          <div>
            <span>My Projects</span>
            <strong>{totalProjects}</strong>
            <small>Assigned projects</small>
          </div>
        </div>

      </div>

      {/* CONTENT */}
      <div className="employee-dashboard-content-grid">

        {/* REPORTS */}
        <div className="employee-dashboard-table-card">

          <div className="employee-dashboard-table-header">

            <div>
              <h2>
                <MdDescription />
                Recent Work Reports
              </h2>
              <p>Your latest submitted reports</p>
            </div>

            <span className="employee-dashboard-count-badge">
              {totalReports}
            </span>

          </div>

          {recentReports.length === 0 ? (
            <div className="employee-dashboard-empty-state">
              <MdDescription />
              <p>No work reports found.</p>
            </div>
          ) : (
            <div className="employee-dashboard-list">

              {recentReports.map((report) => (
                <div
                  className="employee-dashboard-list-item"
                  key={report.id}
                >

                  <div className="employee-dashboard-item-icon blue-icon">
                    <MdDescription />
                  </div>

                  <div className="employee-dashboard-item-content">

                    <div className="employee-dashboard-item-top">
                      <strong>
                        Report #{report.id}
                      </strong>

                      <span>
                        {formatDate(report.submit_date)}
                      </span>
                    </div>

                    <p>
                      {report.report || "No report description"}
                    </p>

                    <small>
                      Duration: {report.duration || 0} hours
                    </small>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* LEAVES */}
        <div className="employee-dashboard-table-card">

          <div className="employee-dashboard-table-header">

            <div>
              <h2>
                <MdCalendarToday />
                Recent Leaves
              </h2>
              <p>Your latest leave applications</p>
            </div>

            <span className="employee-dashboard-count-badge">
              {totalLeaves}
            </span>

          </div>

          {recentLeaves.length === 0 ? (
            <div className="employee-dashboard-empty-state">
              <MdCalendarToday />
              <p>No leave applications found.</p>
            </div>
          ) : (
            <div className="employee-dashboard-list">

              {recentLeaves.map((leave) => (
                <div
                  className="employee-dashboard-list-item"
                  key={leave.id}
                >

                  <div className="employee-dashboard-item-icon green-icon">
                    <MdCalendarToday />
                  </div>

                  <div className="employee-dashboard-item-content">

                    <div className="employee-dashboard-item-top">
                      <strong>
                        {leave.leave_type || "Leave"}
                      </strong>

                      <span>
                        {formatDate(leave.start_date)}
                      </span>
                    </div>

                    <p>
                      {leave.reason || "No reason provided"}
                    </p>

                    <span
                      className={`employee-dashboard-status ${getStatusClass(
                        leave.status
                      )}`}
                    >
                      {getStatusText(leave.status)}
                    </span>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      {/* PROJECTS */}
      <div className="employee-dashboard-project-card">

        <div className="employee-dashboard-table-header">

          <div>
            <h2>
              <MdFolder />
              My Projects
            </h2>

            <p>Projects assigned to you</p>
          </div>

          <span className="employee-dashboard-count-badge">
            {totalProjects}
          </span>

        </div>

        {recentProjects.length === 0 ? (
          <div className="employee-dashboard-empty-state">
            <MdFolder />
            <p>No projects assigned.</p>
          </div>
        ) : (
          <div className="employee-dashboard-project-grid">

            {recentProjects.map((project) => (
              <div
                className="employee-dashboard-project-item"
                key={project.id}
              >

                <div className="employee-dashboard-project-icon">
                  <MdFolder />
                </div>

                <div className="employee-dashboard-project-info">

                  <h3>
                    {project.name ||
                      project.project_name ||
                      project.title ||
                      "Project"}
                  </h3>

                  <p>
                    {project.description ||
                      "No project description"}
                  </p>

                  <span
                    className={`employee-dashboard-status ${getStatusClass(
                      project.status
                    )}`}
                  >
                    {getStatusText(project.status)}
                  </span>

                </div>

                <MdArrowForward className="employee-dashboard-project-arrow" />

              </div>
            ))}

          </div>
        )}

      </div>

      {/* STATUS SUMMARY */}
      <div className="employee-dashboard-status-card">

        <div className="employee-dashboard-table-header">

          <div>
            <h2>
              <MdCheckCircle />
              My Dashboard Summary
            </h2>

            <p>Quick overview of your HRMS activity</p>
          </div>

        </div>

        <div className="employee-dashboard-status-grid">

          <div className="employee-dashboard-status-box">
            <MdDescription />
            <span>Reports</span>
            <strong>{totalReports}</strong>
          </div>

          <div className="employee-dashboard-status-box">
            <MdCalendarToday />
            <span>Leaves</span>
            <strong>{totalLeaves}</strong>
          </div>

          <div className="employee-dashboard-status-box">
            <MdCheckCircle />
            <span>Approved Leaves</span>
            <strong>{approvedLeaves}</strong>
          </div>

          <div className="employee-dashboard-status-box">
            <MdFolder />
            <span>Projects</span>
            <strong>{totalProjects}</strong>
          </div>

          <div className="employee-dashboard-status-box">
            <MdAccessTime />
            <span>Pending Leaves</span>
            <strong>{pendingLeaves}</strong>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
