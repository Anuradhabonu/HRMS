
import React, { useEffect, useState } from "react";
import {
  MdWork,
  MdRefresh,
  MdArrowBack,
  MdVisibility,
  MdDelete,
  MdClose,
  MdCheckCircle,
  MdGroups,
  MdAccessTime,
  MdDescription,
} from "react-icons/md";
import { apiFetch } from "../../api";
import "./Reports.css";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);

  /* ================= LOAD REPORTS ================= */

  const loadReports = async () => {
    setLoading(true);

    try {
      const data = await apiFetch("/reports");

      setReports(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Reports loading error:",
        error
      );

      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  /* ================= POPUPS ================= */

  const openView = (report) => {
    setSelectedReport(report);
    setShowView(true);
  };

  const openDelete = (report) => {
    setSelectedReport(report);
    setShowDelete(true);
  };

  const closeAllPopups = () => {
    setShowView(false);
    setShowDelete(false);
    setSelectedReport(null);
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!selectedReport) return;

    const reportId =
      selectedReport.id ||
      selectedReport.report_id;

    try {
      await apiFetch(
        `/reports/${reportId}`,
        {
          method: "DELETE",
        }
      );

      closeAllPopups();
      loadReports();
    } catch (error) {
      console.error(
        "Delete report error:",
        error
      );

      alert(
        "Unable to delete work report."
      );
    }
  };

  /* ================= HELPERS ================= */

  const getReportId = (report) =>
    report?.id ||
    report?.report_id ||
    "-";

  const getEmployeeName = (report) =>
    report?.employee_name ||
    report?.employee?.name ||
    report?.employee?.full_name ||
    `Employee #${
      report?.employee_id || "-"
    }`;

  const getEmployeeEmail = (report) =>
    report?.employee_email ||
    report?.employee?.email ||
    "-";

  const getReportText = (report) =>
    report?.report ||
    report?.description ||
    "-";

  const getDuration = (report) =>
    report?.duration || "-";

  const getSubmitDate = (report) => {
    if (!report?.submit_date) {
      return "-";
    }

    try {
      return new Date(
        report.submit_date
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return report.submit_date;
    }
  };

  /* ================= SUMMARY ================= */

  const totalReports = reports.length;

  const totalEmployees = new Set(
    reports
      .map(
        (report) =>
          report.employee_id
      )
      .filter(Boolean)
  ).size;

  const totalDuration = reports.reduce(
    (total, report) => {
      const duration = Number(
        report.duration
      );

      return total + (
        Number.isNaN(duration)
          ? 0
          : duration
      );
    },
    0
  );

  const submittedReports =
    reports.filter(
      (report) =>
        report.submit_date
    ).length;

  return (
    <div className="reports-page">

      {/* ================= HEADER ================= */}

      <div className="reports-header">

        <div className="reports-header-left">

          <button
            className="reports-back-btn"
            onClick={() =>
              window.history.back()
            }
          >
            <MdArrowBack />
            <span>Back</span>
          </button>

          <div>

            <div className="reports-title-row">

              <h1>Work Reports</h1>

              <span className="reports-live-badge">
                <span></span>
                HR Management
              </span>

            </div>

            <p>
              View and manage employee
              work reports.
            </p>

          </div>

        </div>

        <div className="reports-header-actions">

          <button
            className="reports-refresh-btn"
            onClick={loadReports}
            disabled={loading}
          >
            <MdRefresh
              className={
                loading
                  ? "reports-refresh-spin"
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

      <div className="reports-summary-grid">

        <div className="reports-summary-card blue">

          <div className="reports-summary-icon">
            <MdWork />
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

        <div className="reports-summary-card green">

          <div className="reports-summary-icon">
            <MdCheckCircle />
          </div>

          <div>
            <span>Submitted Reports</span>

            <strong>
              {loading
                ? "..."
                : submittedReports}
            </strong>
          </div>

        </div>

        <div className="reports-summary-card orange">

          <div className="reports-summary-icon">
            <MdGroups />
          </div>

          <div>
            <span>Employees</span>

            <strong>
              {loading
                ? "..."
                : totalEmployees}
            </strong>
          </div>

        </div>

        <div className="reports-summary-card purple">

          <div className="reports-summary-icon">
            <MdAccessTime />
          </div>

          <div>
            <span>Total Duration</span>

            <strong>
              {loading
                ? "..."
                : totalDuration}
            </strong>
          </div>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="reports-table-card">

        <div className="reports-table-header">

          <div>

            <h2>Work Report Directory</h2>

            <p>
              View employee submitted
              work reports.
            </p>

          </div>

          <span className="reports-count-badge">
            {reports.length} Reports
          </span>

        </div>

        <div className="reports-table-wrapper">

          <table className="reports-table">

            <thead>

              <tr>
                <th>Report ID</th>
                <th>Employee</th>
                <th>Email</th>
                <th>Submit Date</th>
                <th>Duration</th>
                <th>Report</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="reports-empty"
                  >
                    Loading reports...
                  </td>

                </tr>

              ) : reports.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="reports-empty"
                  >

                    <MdWork />

                    <strong>
                      No work reports found
                    </strong>

                    <span>
                      Employee submitted
                      reports will appear
                      here.
                    </span>

                  </td>

                </tr>

              ) : (

                reports.map(
                  (report, index) => (

                    <tr
                      key={
                        report.id ||
                        report.report_id ||
                        index
                      }
                    >

                      {/* REPORT ID */}

                      <td>

                        <span className="report-id">
                          #
                          {getReportId(
                            report
                          )}
                        </span>

                      </td>

                      {/* EMPLOYEE */}

                      <td>

                        <div className="report-employee-cell">

                          <div className="report-avatar">
                            <MdGroups />
                          </div>

                          <div>

                            <strong>
                              {getEmployeeName(
                                report
                              )}
                            </strong>

                            <span>
                              Employee #
                              {report.employee_id ||
                                "-"}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td>

                        <span className="report-email">
                          {getEmployeeEmail(
                            report
                          )}
                        </span>

                      </td>

                      {/* DATE */}

                      <td>

                        <div className="report-date-cell">

                          <MdDescription />

                          <span>
                            {getSubmitDate(
                              report
                            )}
                          </span>

                        </div>

                      </td>

                      {/* DURATION */}

                      <td>

                        <div className="report-duration-cell">

                          <MdAccessTime />

                          <span>
                            {getDuration(
                              report
                            )}
                          </span>

                        </div>

                      </td>

                      {/* REPORT */}

                      <td>

                        <span className="report-description">
                          {getReportText(
                            report
                          )}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="report-actions">

                          <button
                            className="report-action-btn view"
                            title="View"
                            onClick={() =>
                              openView(
                                report
                              )
                            }
                          >
                            <MdVisibility />
                          </button>

                          <button
                            className="report-action-btn delete"
                            title="Delete"
                            onClick={() =>
                              openDelete(
                                report
                              )
                            }
                          >
                            <MdDelete />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          VIEW REPORT POPUP
      ====================================================== */}

      {showView &&
        selectedReport && (

          <div
            className="report-modal-overlay"
            onClick={
              closeAllPopups
            }
          >

            <div
              className="report-modal report-view-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="report-modal-header">

                <div>

                  <div className="report-modal-header-left">

                    <div className="report-modal-icon view">
                      <MdVisibility />
                    </div>

                    <div>

                      <h2>
                        Work Report Details
                      </h2>

                      <p>
                        View complete
                        employee report
                        information.
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  className="report-modal-close"
                  onClick={
                    closeAllPopups
                  }
                >
                  <MdClose />
                </button>

              </div>

              {/* VIEW TOP */}

              <div className="report-view-top">

                <div className="report-large-icon">
                  <MdWork />
                </div>

                <h3>
                  {getEmployeeName(
                    selectedReport
                  )}
                </h3>

                <span>
                  Report #
                  {getReportId(
                    selectedReport
                  )}
                </span>

              </div>

              {/* DETAILS */}

              <div className="report-details-grid">

                <div className="report-detail-item">

                  <span>
                    Employee Name
                  </span>

                  <strong>
                    {getEmployeeName(
                      selectedReport
                    )}
                  </strong>

                </div>

                <div className="report-detail-item">

                  <span>
                    Employee ID
                  </span>

                  <strong>
                    #
                    {selectedReport.employee_id ||
                      "-"}
                  </strong>

                </div>

                <div className="report-detail-item">

                  <span>
                    Employee Email
                  </span>

                  <strong>
                    {getEmployeeEmail(
                      selectedReport
                    )}
                  </strong>

                </div>

                <div className="report-detail-item">

                  <span>
                    Submit Date
                  </span>

                  <strong>
                    {getSubmitDate(
                      selectedReport
                    )}
                  </strong>

                </div>

                <div className="report-detail-item">

                  <span>
                    Duration
                  </span>

                  <strong>
                    {getDuration(
                      selectedReport
                    )}
                  </strong>

                </div>

                <div className="report-detail-item">

                  <span>
                    Report ID
                  </span>

                  <strong>
                    #
                    {getReportId(
                      selectedReport
                    )}
                  </strong>

                </div>

                <div className="report-detail-item full">

                  <span>
                    Work Report
                  </span>

                  <strong className="report-full-text">
                    {getReportText(
                      selectedReport
                    )}
                  </strong>

                </div>

              </div>

              {/* FOOTER */}

              <div className="report-modal-footer">

                <button
                  className="report-cancel-btn"
                  onClick={
                    closeAllPopups
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

      {/* =====================================================
          DELETE POPUP
      ====================================================== */}

      {showDelete &&
        selectedReport && (

          <div
            className="report-modal-overlay"
            onClick={
              closeAllPopups
            }
          >

            <div
              className="report-delete-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="report-delete-icon">
                <MdDelete />
              </div>

              <h2>
                Delete Work Report?
              </h2>

              <p>

                Are you sure you want to
                delete the report submitted
                by{" "}

                <strong>
                  {getEmployeeName(
                    selectedReport
                  )}
                </strong>
                ?

              </p>

              <span className="report-delete-warning">
                This action cannot be undone.
              </span>

              <div className="report-delete-actions">

                <button
                  className="report-cancel-btn"
                  onClick={
                    closeAllPopups
                  }
                >
                  Cancel
                </button>

                <button
                  className="report-confirm-delete-btn"
                  onClick={
                    handleDelete
                  }
                >
                  <MdDelete />
                  Delete
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Reports;
