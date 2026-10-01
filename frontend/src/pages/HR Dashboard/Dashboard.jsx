
import React, { useEffect, useState } from "react";

import {
  MdDashboard,
  MdRefresh,
  MdArrowBack,
  MdGroups,
  MdWork,
  MdCalendarToday,
  MdFolder,
  MdCheckCircle,
  MdAccessTime,
  MdArrowForward,
} from "react-icons/md";

import { apiFetch } from "../../api";

import "./Dashboard.css";


function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [projects, setProjects] = useState([]);


  /* ================= LOAD DASHBOARD ================= */

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [
        employeesData,
        reportsData,
        leavesData,
        projectsData,
      ] = await Promise.all([
        apiFetch("/employees"),
        apiFetch("/reports"),
        apiFetch("/leaves"),
        apiFetch("/projects"),
      ]);


      setEmployees(
        Array.isArray(employeesData)
          ? employeesData
          : []
      );

      setReports(
        Array.isArray(reportsData)
          ? reportsData
          : []
      );

      setLeaves(
        Array.isArray(leavesData)
          ? leavesData
          : []
      );

      setProjects(
        Array.isArray(projectsData)
          ? projectsData
          : []
      );

    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      setEmployees([]);
      setReports([]);
      setLeaves([]);
      setProjects([]);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


  /* ================= HELPERS ================= */

  const getEmployeeName = (item) =>
    item?.employee_name ||
    item?.employee?.name ||
    item?.employee?.full_name ||
    `Employee #${item?.employee_id || "-"}`;


  const getProjectName = (project) =>
    project?.name ||
    project?.project_name ||
    project?.title ||
    "Project";


  const getProjectDescription = (project) =>
    project?.description ||
    project?.details ||
    "No project description available";


  const getLeaveType = (leave) =>
    leave?.leave_type ||
    leave?.type ||
    "Leave Request";


  const getReportText = (report) =>
    report?.report ||
    report?.description ||
    "Work Report";


  const getStatus = (item) =>
    item?.status ||
    "Pending";


  const getStatusClass = (status) => {
    const value =
      String(status || "")
        .toLowerCase();

    if (
      value === "approved" ||
      value === "completed"
    ) {
      return "dashboard-status approved";
    }

    if (
      value === "rejected" ||
      value === "cancelled"
    ) {
      return "dashboard-status rejected";
    }

    return "dashboard-status pending";
  };


  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };


  /* ================= RECENT DATA ================= */

  const recentReports =
    reports.slice(0, 5);

  const recentLeaves =
    leaves.slice(0, 5);

  const recentProjects =
    projects.slice(0, 4);


  /* ================= SUMMARY ================= */

  const totalEmployees =
    employees.length;

  const totalReports =
    reports.length;

  const totalLeaves =
    leaves.length;

  const totalProjects =
    projects.length;


  const approvedLeaves =
    leaves.filter(
      (leave) =>
        String(leave?.status || "")
          .toLowerCase() === "approved"
    ).length;


  /* ================= RENDER ================= */

  return (
    <div className="dashboard-page">


      {/* ================= HEADER ================= */}

      <div className="dashboard-header">

        <div className="dashboard-header-left">

          <button
            className="dashboard-back-btn"
            onClick={() =>
              window.history.back()
            }
          >
            <MdArrowBack />
            <span>Back</span>
          </button>


          <div>

            <div className="dashboard-title-row">

              <MdDashboard
                className="dashboard-title-icon"
              />

              <h1>
                Dashboard
              </h1>

              <span className="dashboard-live-badge">
                <span></span>
                HR Management
              </span>

            </div>


            <p>
              Overview of employees,
              reports, leaves and projects.
            </p>

          </div>

        </div>


        <div className="dashboard-header-actions">

          <button
            className="dashboard-refresh-btn"
            onClick={loadDashboard}
            disabled={loading}
          >

            <MdRefresh
              className={
                loading
                  ? "dashboard-refresh-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

      </div>


      {/* ================= SUMMARY ================= */}

      <div className="dashboard-summary-grid">


        {/* EMPLOYEES */}

        <div className="dashboard-summary-card blue">

          <div className="dashboard-summary-icon">
            <MdGroups />
          </div>

          <div>

            <span>
              Total Employees
            </span>

            <strong>
              {loading
                ? "..."
                : totalEmployees}
            </strong>

          </div>

        </div>


        {/* REPORTS */}

        <div className="dashboard-summary-card green">

          <div className="dashboard-summary-icon">
            <MdWork />
          </div>

          <div>

            <span>
              Total Reports
            </span>

            <strong>
              {loading
                ? "..."
                : totalReports}
            </strong>

          </div>

        </div>


        {/* LEAVES */}

        <div className="dashboard-summary-card orange">

          <div className="dashboard-summary-icon">
            <MdCalendarToday />
          </div>

          <div>

            <span>
              Total Leaves
            </span>

            <strong>
              {loading
                ? "..."
                : totalLeaves}
            </strong>

          </div>

        </div>


        {/* PROJECTS */}

        <div className="dashboard-summary-card purple">

          <div className="dashboard-summary-icon">
            <MdFolder />
          </div>

          <div>

            <span>
              Total Projects
            </span>

            <strong>
              {loading
                ? "..."
                : totalProjects}
            </strong>

          </div>

        </div>

      </div>


      {/* ================= MAIN CONTENT ================= */}

      <div className="dashboard-content-grid">


        {/* ================= RECENT REPORTS ================= */}

        <div className="dashboard-table-card">

          <div className="dashboard-table-header">

            <div>

              <h2>
                Recent Work Reports
              </h2>

              <p>
                Latest employee submitted
                work reports.
              </p>

            </div>


            <span className="dashboard-count-badge">
              {recentReports.length} Reports
            </span>

          </div>


          <div className="dashboard-list">

            {loading ? (

              <div className="dashboard-empty">
                Loading reports...
              </div>

            ) : recentReports.length === 0 ? (

              <div className="dashboard-empty">

                <MdWork />

                <strong>
                  No reports found
                </strong>

                <span>
                  Employee reports will
                  appear here.
                </span>

              </div>

            ) : (

              recentReports.map(
                (report, index) => (

                  <div
                    className="dashboard-list-item"
                    key={
                      report.id ||
                      report.report_id ||
                      index
                    }
                  >

                    <div className="dashboard-item-icon blue">
                      <MdWork />
                    </div>


                    <div className="dashboard-item-info">

                      <strong>
                        {getEmployeeName(
                          report
                        )}
                      </strong>

                      <span>
                        {getReportText(
                          report
                        )}
                      </span>

                      <small>
                        {formatDate(
                          report.submit_date
                        )}
                      </small>

                    </div>


                    <MdArrowForward
                      className="dashboard-item-arrow"
                    />

                  </div>

                )
              )

            )}

          </div>

        </div>


        {/* ================= RECENT LEAVES ================= */}

        <div className="dashboard-table-card">

          <div className="dashboard-table-header">

            <div>

              <h2>
                Recent Leaves
              </h2>

              <p>
                Latest employee leave
                requests.
              </p>

            </div>


            <span className="dashboard-count-badge">
              {recentLeaves.length} Leaves
            </span>

          </div>


          <div className="dashboard-list">

            {loading ? (

              <div className="dashboard-empty">
                Loading leaves...
              </div>

            ) : recentLeaves.length === 0 ? (

              <div className="dashboard-empty">

                <MdCalendarToday />

                <strong>
                  No leaves found
                </strong>

                <span>
                  Employee leave requests
                  will appear here.
                </span>

              </div>

            ) : (

              recentLeaves.map(
                (leave, index) => (

                  <div
                    className="dashboard-list-item"
                    key={
                      leave.id ||
                      index
                    }
                  >

                    <div className="dashboard-item-icon orange">
                      <MdCalendarToday />
                    </div>


                    <div className="dashboard-item-info">

                      <strong>
                        {getEmployeeName(
                          leave
                        )}
                      </strong>

                      <span>
                        {getLeaveType(
                          leave
                        )}
                      </span>

                      <small>
                        {formatDate(
                          leave.start_date ||
                          leave.from_date ||
                          leave.date
                        )}
                      </small>

                    </div>


                    <span
                      className={getStatusClass(
                        getStatus(leave)
                      )}
                    >
                      {getStatus(leave)}
                    </span>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>


      {/* ================= PROJECTS ================= */}

      <div className="dashboard-project-card">


        <div className="dashboard-table-header">

          <div>

            <h2>
              Recent Projects
            </h2>

            <p>
              Latest projects assigned
              by HR.
            </p>

          </div>


          <span className="dashboard-count-badge">
            {recentProjects.length} Projects
          </span>

        </div>


        <div className="dashboard-project-grid">

          {loading ? (

            <div className="dashboard-empty">
              Loading projects...
            </div>

          ) : recentProjects.length === 0 ? (

            <div className="dashboard-empty">

              <MdFolder />

              <strong>
                No projects found
              </strong>

              <span>
                Created projects will
                appear here.
              </span>

            </div>

          ) : (

            recentProjects.map(
              (project, index) => (

                <div
                  className="dashboard-project-item"
                  key={
                    project.id ||
                    index
                  }
                >

                  <div className="dashboard-project-icon">
                    <MdFolder />
                  </div>


                  <div className="dashboard-project-info">

                    <h3>
                      {getProjectName(
                        project
                      )}
                    </h3>

                    <p>
                      {getProjectDescription(
                        project
                      )}
                    </p>


                    <div className="dashboard-project-bottom">

                      <span>
                        {project.employee_name ||
                          project.employee ||
                          "Employee"}
                      </span>


                      <span
                        className={getStatusClass(
                          getStatus(project)
                        )}
                      >
                        {getStatus(project)}
                      </span>

                    </div>

                  </div>

                </div>

              )
            )

          )}

        </div>

      </div>


      {/* ================= QUICK STATUS ================= */}

      <div className="dashboard-status-card">

        <div className="dashboard-status-header">

          <div>

            <h2>
              Dashboard Summary
            </h2>

            <p>
              Current HR management
              information.
            </p>

          </div>

          <MdCheckCircle />

        </div>


        <div className="dashboard-status-grid">

          <div className="dashboard-status-box">

            <MdGroups />

            <div>

              <span>
                Employees
              </span>

              <strong>
                {totalEmployees}
              </strong>

            </div>

          </div>


          <div className="dashboard-status-box">

            <MdWork />

            <div>

              <span>
                Reports
              </span>

              <strong>
                {totalReports}
              </strong>

            </div>

          </div>


          <div className="dashboard-status-box">

            <MdCalendarToday />

            <div>

              <span>
                Approved Leaves
              </span>

              <strong>
                {approvedLeaves}
              </strong>

            </div>

          </div>


          <div className="dashboard-status-box">

            <MdFolder />

            <div>

              <span>
                Projects
              </span>

              <strong>
                {totalProjects}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Dashboard;
