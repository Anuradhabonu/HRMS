
import React, { useEffect, useState } from "react";
import {
  MdDescription,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdClose,
  MdRefresh,
  MdArrowBack,
  MdAccessTime,
  MdCalendarToday,
} from "react-icons/md";

import { apiFetch } from "../../api";
import "./Reports.css";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);

  const [formData, setFormData] = useState({
    submit_date: "",
    duration: "",
    report: "",
  });

  const loadReports = async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/reports/me");

      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Reports loading error:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddPopup = () => {
    setFormData({
      submit_date: new Date().toISOString().split("T")[0],
      duration: "",
      report: "",
    });

    setShowAdd(true);
  };

  const openEditPopup = (report) => {
    setSelectedReport(report);

    setFormData({
      submit_date: report.submit_date
        ? String(report.submit_date).split("T")[0]
        : "",
      duration: report.duration || "",
      report: report.report || "",
    });

    setShowEdit(true);
  };

  const openViewPopup = (report) => {
    setSelectedReport(report);
    setShowView(true);
  };

  const openDeletePopup = (report) => {
    setSelectedReport(report);
    setShowDelete(true);
  };

  const closeAllPopups = () => {
    setShowAdd(false);
    setShowEdit(false);
    setShowView(false);
    setShowDelete(false);
    setSelectedReport(null);
  };

  const handleAddReport = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/reports/", {
        method: "POST",
        body: JSON.stringify({
          submit_date: formData.submit_date,
          duration: Number(formData.duration),
          report: formData.report,
        }),
      });

      closeAllPopups();
      await loadReports();

      alert("Report added successfully");
    } catch (error) {
      console.error("Add report error:", error);
      alert("Failed to add report");
    }
  };

  const handleEditReport = async (e) => {
    e.preventDefault();

    if (!selectedReport) return;

    try {
      await apiFetch(`/reports/${selectedReport.id}`, {
        method: "PUT",
        body: JSON.stringify({
          submit_date: formData.submit_date,
          duration: Number(formData.duration),
          report: formData.report,
        }),
      });

      closeAllPopups();
      await loadReports();

      alert("Report updated successfully");
    } catch (error) {
      console.error("Edit report error:", error);
      alert("Failed to update report");
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;

    try {
      await apiFetch(`/reports/${selectedReport.id}`, {
        method: "DELETE",
      });

      closeAllPopups();
      await loadReports();

      alert("Report deleted successfully");
    } catch (error) {
      console.error("Delete report error:", error);
      alert("Failed to delete report");
    }
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
    <div className="employee-reports-page">

      {/* HEADER */}
      <div className="employee-reports-header">

        <div className="employee-reports-header-left">

          <button
            className="employee-reports-back-btn"
            onClick={() => window.history.back()}
          >
            <MdArrowBack />
            Back
          </button>

          <div className="employee-reports-title-area">

            <div className="employee-reports-title-row">
              <div className="employee-reports-title-icon">
                <MdDescription />
              </div>

              <div>
                <h1>My Work Reports</h1>
                <p>Manage your submitted work reports</p>
              </div>
            </div>

            <div className="employee-reports-live-badge">
              <span></span>
              Employee Reports
            </div>

          </div>
        </div>

        <div className="employee-reports-header-actions">

          <button
            className="employee-reports-refresh-btn"
            onClick={loadReports}
            disabled={loading}
          >
            <MdRefresh className={loading ? "employee-reports-spin" : ""} />
            Refresh
          </button>

          <button
            className="employee-reports-add-btn"
            onClick={openAddPopup}
          >
            <MdAdd />
            Add Report
          </button>

        </div>

      </div>

      {/* SUMMARY */}
      <div className="employee-reports-summary-grid">

        <div className="employee-reports-summary-card blue-report-card">
          <div className="employee-reports-summary-icon">
            <MdDescription />
          </div>

          <div>
            <span>Total Reports</span>
            <strong>{reports.length}</strong>
            <small>Your submitted reports</small>
          </div>
        </div>

        <div className="employee-reports-summary-card green-report-card">
          <div className="employee-reports-summary-icon">
            <MdCalendarToday />
          </div>

          <div>
            <span>Submitted</span>
            <strong>{reports.length}</strong>
            <small>Completed submissions</small>
          </div>
        </div>

        <div className="employee-reports-summary-card orange-report-card">
          <div className="employee-reports-summary-icon">
            <MdAccessTime />
          </div>

          <div>
            <span>Total Duration</span>
            <strong>
              {reports.reduce(
                (total, item) =>
                  total + Number(item.duration || 0),
                0
              )}
            </strong>
            <small>Total hours</small>
          </div>
        </div>

      </div>

      {/* REPORT TABLE */}
      <div className="employee-reports-table-card">

        <div className="employee-reports-table-header">

          <div>
            <h2>
              <MdDescription />
              My Reports
            </h2>
            <p>View, edit or delete your work reports</p>
          </div>

          <span className="employee-reports-count-badge">
            {reports.length}
          </span>

        </div>

        {loading ? (
          <div className="employee-reports-empty-state">
            <MdRefresh className="employee-reports-spin large-spin" />
            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="employee-reports-empty-state">
            <MdDescription />
            <p>No work reports found.</p>

            <button
              className="employee-reports-empty-add-btn"
              onClick={openAddPopup}
            >
              <MdAdd />
              Add Your First Report
            </button>
          </div>
        ) : (
          <div className="employee-reports-table-wrapper">

            <table className="employee-reports-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Submit Date</th>
                  <th>Duration</th>
                  <th>Report</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {reports.map((report) => (
                  <tr key={report.id}>

                    <td>
                      <span className="employee-report-id">
                        #{report.id}
                      </span>
                    </td>

                    <td>
                      <div className="employee-report-date">
                        <MdCalendarToday />
                        {formatDate(report.submit_date)}
                      </div>
                    </td>

                    <td>
                      <span className="employee-report-duration">
                        <MdAccessTime />
                        {report.duration || 0} hrs
                      </span>
                    </td>

                    <td>
                      <div className="employee-report-description">
                        {report.report || "-"}
                      </div>
                    </td>

                    <td>
                      <div className="employee-report-actions">

                        <button
                          className="employee-report-action-btn view-action"
                          title="View"
                          onClick={() => openViewPopup(report)}
                        >
                          <MdVisibility />
                        </button>

                        <button
                          className="employee-report-action-btn edit-action"
                          title="Edit"
                          onClick={() => openEditPopup(report)}
                        >
                          <MdEdit />
                        </button>

                        <button
                          className="employee-report-action-btn delete-action"
                          title="Delete"
                          onClick={() => openDeletePopup(report)}
                        >
                          <MdDelete />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ADD POPUP */}
      {showAdd && (
        <div
          className="employee-report-modal-overlay"
          onClick={closeAllPopups}
        >
          <div
            className="employee-report-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-report-modal-header">
              <div>
                <h2>
                  <MdAdd />
                  Add Report
                </h2>
                <p>Create a new work report</p>
              </div>

              <button onClick={closeAllPopups}>
                <MdClose />
              </button>
            </div>

            <form
              className="employee-report-form"
              onSubmit={handleAddReport}
            >

              <div className="employee-report-form-group">
                <label>Submit Date</label>
                <input
                  type="date"
                  name="submit_date"
                  value={formData.submit_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="employee-report-form-group">
                <label>Duration (Hours)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  placeholder="Enter duration"
                  required
                />
              </div>

              <div className="employee-report-form-group full-width">
                <label>Work Report</label>
                <textarea
                  name="report"
                  value={formData.report}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Enter your work report..."
                  required
                />
              </div>

              <div className="employee-report-modal-actions">

                <button
                  type="button"
                  className="employee-report-cancel-btn"
                  onClick={closeAllPopups}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-report-save-btn"
                >
                  <MdAdd />
                  Add Report
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* EDIT POPUP */}
      {showEdit && selectedReport && (
        <div
          className="employee-report-modal-overlay"
          onClick={closeAllPopups}
        >
          <div
            className="employee-report-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-report-modal-header">
              <div>
                <h2>
                  <MdEdit />
                  Edit Report
                </h2>
                <p>Update your work report</p>
              </div>

              <button onClick={closeAllPopups}>
                <MdClose />
              </button>
            </div>

            <form
              className="employee-report-form"
              onSubmit={handleEditReport}
            >

              <div className="employee-report-form-group">
                <label>Submit Date</label>
                <input
                  type="date"
                  name="submit_date"
                  value={formData.submit_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="employee-report-form-group">
                <label>Duration (Hours)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  required
                />
              </div>

              <div className="employee-report-form-group full-width">
                <label>Work Report</label>
                <textarea
                  name="report"
                  value={formData.report}
                  onChange={handleInputChange}
                  rows="5"
                  required
                />
              </div>

              <div className="employee-report-modal-actions">

                <button
                  type="button"
                  className="employee-report-cancel-btn"
                  onClick={closeAllPopups}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-report-save-btn edit-save"
                >
                  <MdEdit />
                  Update Report
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* VIEW POPUP */}
      {showView && selectedReport && (
        <div
          className="employee-report-modal-overlay"
          onClick={closeAllPopups}
        >
          <div
            className="employee-report-view-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-report-modal-header">
              <div>
                <h2>
                  <MdVisibility />
                  Report Details
                </h2>
                <p>View your submitted report</p>
              </div>

              <button onClick={closeAllPopups}>
                <MdClose />
              </button>
            </div>

            <div className="employee-report-view-content">

              <div className="employee-report-detail-card">
                <span>Report ID</span>
                <strong>#{selectedReport.id}</strong>
              </div>

              <div className="employee-report-detail-card">
                <span>Submit Date</span>
                <strong>
                  {formatDate(selectedReport.submit_date)}
                </strong>
              </div>

              <div className="employee-report-detail-card">
                <span>Duration</span>
                <strong>
                  {selectedReport.duration || 0} Hours
                </strong>
              </div>

              <div className="employee-report-detail-card full-detail">
                <span>Work Report</span>
                <p>
                  {selectedReport.report ||
                    "No report description"}
                </p>
              </div>

            </div>

            <div className="employee-report-modal-actions">
              <button
                className="employee-report-cancel-btn"
                onClick={closeAllPopups}
              >
                Close
              </button>

              <button
                className="employee-report-save-btn edit-save"
                onClick={() => {
                  setShowView(false);
                  openEditPopup(selectedReport);
                }}
              >
                <MdEdit />
                Edit Report
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE POPUP */}
      {showDelete && selectedReport && (
        <div
          className="employee-report-modal-overlay"
          onClick={closeAllPopups}
        >
          <div
            className="employee-report-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-report-delete-icon">
              <MdDelete />
            </div>

            <h2>Delete Report?</h2>

            <p>
              Are you sure you want to delete Report #
              {selectedReport.id}?
            </p>

            <span>
              This action cannot be undone.
            </span>

            <div className="employee-report-delete-actions">

              <button
                className="employee-report-cancel-btn"
                onClick={closeAllPopups}
              >
                Cancel
              </button>

              <button
                className="employee-report-confirm-delete-btn"
                onClick={handleDeleteReport}
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
};

export default Reports;
