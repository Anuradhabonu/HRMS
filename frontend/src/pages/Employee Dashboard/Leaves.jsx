
import React, { useEffect, useState } from "react";
import {
  MdCalendarToday,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdClose,
  MdRefresh,
  MdArrowBack,
  MdCheckCircle,
  MdPendingActions,
  MdCancel,
} from "react-icons/md";

import { apiFetch } from "../../api";
import "./Leaves.css";

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedLeave, setSelectedLeave] = useState(null);

  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  /* =========================
     LOAD LEAVES
  ========================= */

  const loadLeaves = async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/leaves/me");

      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Leaves loading error:", error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  /* =========================
     FORM
  ========================= */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     ADD
  ========================= */

  const openAddPopup = () => {
    setFormData({
      leave_type: "",
      start_date: "",
      end_date: "",
      reason: "",
    });

    setShowAdd(true);
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/leaves/", {
        method: "POST",
        body: JSON.stringify({
          leave_type: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
        }),
      });

      closeAllPopups();
      await loadLeaves();

      alert("Leave applied successfully");
    } catch (error) {
      console.error("Add leave error:", error);
      alert("Failed to apply leave");
    }
  };

  /* =========================
     VIEW
  ========================= */

  const openViewPopup = (leave) => {
    setSelectedLeave(leave);
    setShowView(true);
  };

  /* =========================
     EDIT
  ========================= */

  const openEditPopup = (leave) => {
    setSelectedLeave(leave);

    setFormData({
      leave_type: leave.leave_type || "",
      start_date: leave.start_date
        ? String(leave.start_date).split("T")[0]
        : "",
      end_date: leave.end_date
        ? String(leave.end_date).split("T")[0]
        : "",
      reason: leave.reason || "",
    });

    setShowEdit(true);
  };

  const handleEditLeave = async (e) => {
    e.preventDefault();

    if (!selectedLeave) return;

    try {
      await apiFetch(`/leaves/${selectedLeave.id}`, {
        method: "PUT",
        body: JSON.stringify({
          leave_type: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
        }),
      });

      closeAllPopups();
      await loadLeaves();

      alert("Leave updated successfully");
    } catch (error) {
      console.error("Edit leave error:", error);
      alert("Failed to update leave");
    }
  };

  /* =========================
     DELETE
  ========================= */

  const openDeletePopup = (leave) => {
    setSelectedLeave(leave);
    setShowDelete(true);
  };

  const handleDeleteLeave = async () => {
    if (!selectedLeave) return;

    try {
      await apiFetch(`/leaves/${selectedLeave.id}`, {
        method: "DELETE",
      });

      closeAllPopups();
      await loadLeaves();

      alert("Leave deleted successfully");
    } catch (error) {
      console.error("Delete leave error:", error);
      alert("Failed to delete leave");
    }
  };

  /* =========================
     CLOSE POPUPS
  ========================= */

  const closeAllPopups = () => {
    setShowAdd(false);
    setShowView(false);
    setShowEdit(false);
    setShowDelete(false);
    setSelectedLeave(null);
  };

  /* =========================
     HELPERS
  ========================= */

  const formatDate = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString("en-IN");
  };

  const getStatus = (status) => {
    return status || "Pending";
  };

  const getStatusClass = (status) => {
    const value = String(status || "pending").toLowerCase();

    if (value === "approved") {
      return "employee-leave-approved";
    }

    if (value === "rejected") {
      return "employee-leave-rejected";
    }

    return "employee-leave-pending";
  };

  const totalLeaves = leaves.length;

  const approvedLeaves = leaves.filter(
    (leave) =>
      String(leave.status || "").toLowerCase() === "approved"
  ).length;

  const pendingLeaves = leaves.filter(
    (leave) =>
      String(leave.status || "").toLowerCase() === "pending"
  ).length;

  const rejectedLeaves = leaves.filter(
    (leave) =>
      String(leave.status || "").toLowerCase() === "rejected"
  ).length;

  return (
    <div className="employee-leaves-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="employee-leaves-header">

        <div className="employee-leaves-header-left">

          <button
            className="employee-leaves-back-btn"
            onClick={() => window.history.back()}
          >
            <MdArrowBack />
            Back
          </button>

          <div className="employee-leaves-title-area">

            <div className="employee-leaves-title-row">

              <div className="employee-leaves-title-icon">
                <MdCalendarToday />
              </div>

              <div>
                <h1>My Leaves</h1>
                <p>Manage your leave applications</p>
              </div>

            </div>

            <div className="employee-leaves-live-badge">
              <span></span>
              Employee Leaves
            </div>

          </div>

        </div>

        <div className="employee-leaves-header-actions">

          <button
            className="employee-leaves-refresh-btn"
            onClick={loadLeaves}
            disabled={loading}
          >
            <MdRefresh
              className={
                loading ? "employee-leaves-spin" : ""
              }
            />
            Refresh
          </button>

          <button
            className="employee-leaves-add-btn"
            onClick={openAddPopup}
          >
            <MdAdd />
            Apply Leave
          </button>

        </div>

      </div>

      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="employee-leaves-summary-grid">

        <div className="employee-leaves-summary-card blue-leave-card">

          <div className="employee-leaves-summary-icon">
            <MdCalendarToday />
          </div>

          <div>
            <span>Total Leaves</span>
            <strong>{totalLeaves}</strong>
            <small>Your applications</small>
          </div>

        </div>

        <div className="employee-leaves-summary-card green-leave-card">

          <div className="employee-leaves-summary-icon">
            <MdCheckCircle />
          </div>

          <div>
            <span>Approved</span>
            <strong>{approvedLeaves}</strong>
            <small>Approved leaves</small>
          </div>

        </div>

        <div className="employee-leaves-summary-card orange-leave-card">

          <div className="employee-leaves-summary-icon">
            <MdPendingActions />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingLeaves}</strong>
            <small>Waiting for approval</small>
          </div>

        </div>

        <div className="employee-leaves-summary-card red-leave-card">

          <div className="employee-leaves-summary-icon">
            <MdCancel />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedLeaves}</strong>
            <small>Rejected applications</small>
          </div>

        </div>

      </div>

      {/* =========================
          TABLE CARD
      ========================= */}

      <div className="employee-leaves-table-card">

        <div className="employee-leaves-table-header">

          <div>
            <h2>
              <MdCalendarToday />
              My Leave Applications
            </h2>

            <p>
              View, edit or delete your leave applications
            </p>
          </div>

          <span className="employee-leaves-count-badge">
            {totalLeaves}
          </span>

        </div>

        {loading ? (
          <div className="employee-leaves-empty-state">

            <MdRefresh className="employee-leaves-spin large-leave-spin" />

            <p>Loading leaves...</p>

          </div>
        ) : leaves.length === 0 ? (
          <div className="employee-leaves-empty-state">

            <MdCalendarToday />

            <p>No leave applications found.</p>

            <button
              className="employee-leaves-empty-add-btn"
              onClick={openAddPopup}
            >
              <MdAdd />
              Apply Your First Leave
            </button>

          </div>
        ) : (
          <div className="employee-leaves-table-wrapper">

            <table className="employee-leaves-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {leaves.map((leave) => (

                  <tr key={leave.id}>

                    <td>
                      <span className="employee-leave-id">
                        #{leave.id}
                      </span>
                    </td>

                    <td>
                      <span className="employee-leave-type">
                        {leave.leave_type || "-"}
                      </span>
                    </td>

                    <td>
                      <div className="employee-leave-date">
                        <MdCalendarToday />
                        {formatDate(leave.start_date)}
                      </div>
                    </td>

                    <td>
                      <div className="employee-leave-date">
                        <MdCalendarToday />
                        {formatDate(leave.end_date)}
                      </div>
                    </td>

                    <td>
                      <div className="employee-leave-reason">
                        {leave.reason || "-"}
                      </div>
                    </td>

                    <td>

                      <span
                        className={`employee-leave-status ${getStatusClass(
                          leave.status
                        )}`}
                      >
                        {getStatus(leave.status)}
                      </span>

                    </td>

                    <td>

                      <div className="employee-leave-actions">

                        {/* VIEW */}
                        <button
                          className="employee-leave-action-btn view-leave-action"
                          title="View"
                          onClick={() =>
                            openViewPopup(leave)
                          }
                        >
                          <MdVisibility />
                        </button>

                        {/* EDIT */}
                        <button
                          className="employee-leave-action-btn edit-leave-action"
                          title="Edit"
                          onClick={() =>
                            openEditPopup(leave)
                          }
                        >
                          <MdEdit />
                        </button>

                        {/* DELETE */}
                        <button
                          className="employee-leave-action-btn delete-leave-action"
                          title="Delete"
                          onClick={() =>
                            openDeletePopup(leave)
                          }
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

      {/* =====================================================
          ADD LEAVE POPUP
      ===================================================== */}

      {showAdd && (

        <div
          className="employee-leave-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="employee-leave-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-leave-modal-header">

              <div>

                <h2>
                  <MdAdd />
                  Apply Leave
                </h2>

                <p>Create a new leave application</p>

              </div>

              <button onClick={closeAllPopups}>
                <MdClose />
              </button>

            </div>

            <form
              className="employee-leave-form"
              onSubmit={handleAddLeave}
            >

              <div className="employee-leave-form-group">

                <label>Leave Type</label>

                <select
                  name="leave_type"
                  value={formData.leave_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">
                    Select Leave Type
                  </option>

                  <option value="Casual">
                    Casual
                  </option>

                  <option value="Sick">
                    Sick
                  </option>

                  <option value="Emergency">
                    Emergency
                  </option>

                  <option value="Personal">
                    Personal
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>

              <div className="employee-leave-form-group">

                <label>Start Date</label>

                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />

              </div>

              <div className="employee-leave-form-group">

                <label>End Date</label>

                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />

              </div>

              <div className="employee-leave-form-group full-leave-width">

                <label>Reason</label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Enter reason for leave..."
                  required
                />

              </div>

              <div className="employee-leave-modal-actions">

                <button
                  type="button"
                  className="employee-leave-cancel-btn"
                  onClick={closeAllPopups}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-leave-save-btn"
                >
                  <MdAdd />
                  Apply Leave
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          EDIT LEAVE POPUP
      ===================================================== */}

      {showEdit && selectedLeave && (

        <div
          className="employee-leave-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="employee-leave-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-leave-modal-header">

              <div>

                <h2>
                  <MdEdit />
                  Edit Leave
                </h2>

                <p>Update your leave application</p>

              </div>

              <button onClick={closeAllPopups}>
                <MdClose />
              </button>

            </div>

            <form
              className="employee-leave-form"
              onSubmit={handleEditLeave}
            >

              <div className="employee-leave-form-group">

                <label>Leave Type</label>

                <select
                  name="leave_type"
                  value={formData.leave_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">
                    Select Leave Type
                  </option>

                  <option value="Casual">
                    Casual
                  </option>

                  <option value="Sick">
                    Sick
                  </option>

                  <option value="Emergency">
                    Emergency
                  </option>

                  <option value="Personal">
                    Personal
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>

              <div className="employee-leave-form-group">

                <label>Start Date</label>

                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />

              </div>

              <div className="employee-leave-form-group">

                <label>End Date</label>

                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />

              </div>

              <div className="employee-leave-form-group full-leave-width">

                <label>Reason</label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="5"
                  required
                />

              </div>

              <div className="employee-leave-modal-actions">

                <button
                  type="button"
                  className="employee-leave-cancel-btn"
                  onClick={closeAllPopups}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-leave-save-btn edit-leave-save"
                >
                  <MdEdit />
                  Update Leave
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          VIEW LEAVE POPUP
      ===================================================== */}

      {showView && selectedLeave && (

        <div
          className="employee-leave-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="employee-leave-view-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-leave-modal-header">

              <div>

                <h2>
                  <MdVisibility />
                  Leave Details
                </h2>

                <p>View your leave application</p>

              </div>

              <button onClick={closeAllPopups}>
                <MdClose />
              </button>

            </div>

            <div className="employee-leave-view-content">

              <div className="employee-leave-detail-card">

                <span>Leave ID</span>

                <strong>
                  #{selectedLeave.id}
                </strong>

              </div>

              <div className="employee-leave-detail-card">

                <span>Leave Type</span>

                <strong>
                  {selectedLeave.leave_type || "-"}
                </strong>

              </div>

              <div className="employee-leave-detail-card">

                <span>Start Date</span>

                <strong>
                  {formatDate(selectedLeave.start_date)}
                </strong>

              </div>

              <div className="employee-leave-detail-card">

                <span>End Date</span>

                <strong>
                  {formatDate(selectedLeave.end_date)}
                </strong>

              </div>

              <div className="employee-leave-detail-card">

                <span>Status</span>

                <span
                  className={`employee-leave-status ${getStatusClass(
                    selectedLeave.status
                  )}`}
                >
                  {getStatus(selectedLeave.status)}
                </span>

              </div>

              <div className="employee-leave-detail-card full-leave-detail">

                <span>Reason</span>

                <p>
                  {selectedLeave.reason ||
                    "No reason provided"}
                </p>

              </div>

            </div>

            <div className="employee-leave-modal-actions">

              <button
                className="employee-leave-cancel-btn"
                onClick={closeAllPopups}
              >
                Close
              </button>

              <button
                className="employee-leave-save-btn edit-leave-save"
                onClick={() => {
                  setShowView(false);
                  openEditPopup(selectedLeave);
                }}
              >
                <MdEdit />
                Edit Leave
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          DELETE POPUP
      ===================================================== */}

      {showDelete && selectedLeave && (

        <div
          className="employee-leave-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="employee-leave-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-leave-delete-icon">
              <MdDelete />
            </div>

            <h2>
              Delete Leave?
            </h2>

            <p>
              Are you sure you want to delete Leave #
              {selectedLeave.id}?
            </p>

            <span>
              This action cannot be undone.
            </span>

            <div className="employee-leave-delete-actions">

              <button
                className="employee-leave-cancel-btn"
                onClick={closeAllPopups}
              >
                Cancel
              </button>

              <button
                className="employee-leave-confirm-delete-btn"
                onClick={handleDeleteLeave}
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

export default Leaves;
