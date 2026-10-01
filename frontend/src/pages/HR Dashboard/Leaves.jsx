import React, { useEffect, useState } from "react";
import {
  MdEventNote,
  MdAdd,
  MdRefresh,
  MdArrowBack,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdClose,
  MdCheckCircle,
  MdCancel,
  MdSave,
  MdPerson,
  MdCalendarToday,
  MdDescription,
} from "react-icons/md";
import { apiFetch } from "../../api";
import "./Leaves.css";

function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const [statusAction, setStatusAction] = useState("");
  const [selectedLeave, setSelectedLeave] = useState(null);

  const emptyForm = {
    employee_id: "",
    leave_type: "Casual",
    start_date: "",
    end_date: "",
    reason: "",
    status: "Pending",
  };

  const [form, setForm] = useState(emptyForm);

  const loadLeaves = async () => {
    setLoading(true);

    try {
      const data = await apiFetch("/leaves");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAdd = () => {
    setForm(emptyForm);
    setShowAdd(true);
  };

  const openView = (leave) => {
    setSelectedLeave(leave);
    setShowView(true);
  };

  const openEdit = (leave) => {
    setSelectedLeave(leave);

    setForm({
      employee_id:
        leave.employee_id ||
        leave.employee?.id ||
        "",
      leave_type:
        leave.leave_type ||
        leave.type ||
        "Casual",
      start_date:
        leave.start_date ||
        "",
      end_date:
        leave.end_date ||
        "",
      reason:
        leave.reason ||
        leave.description ||
        "",
      status:
        leave.status ||
        "Pending",
    });

    setShowEdit(true);
  };

  const openDelete = (leave) => {
    setSelectedLeave(leave);
    setShowDelete(true);
  };

  const openStatusPopup = (leave, action) => {
    setSelectedLeave(leave);
    setStatusAction(action);
    setShowStatus(true);
  };

  const closeAllPopups = () => {
    setShowAdd(false);
    setShowView(false);
    setShowEdit(false);
    setShowDelete(false);
    setShowStatus(false);
    setSelectedLeave(null);
    setStatusAction("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/leaves", {
        method: "POST",
        body: JSON.stringify(form),
      });

      closeAllPopups();
      loadLeaves();
    } catch (error) {
      console.error("Add leave error:", error);
      alert("Unable to add leave.");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!selectedLeave) return;

    const leaveId =
      selectedLeave.id ||
      selectedLeave.leave_id;

    try {
      await apiFetch(`/leaves/${leaveId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      closeAllPopups();
      loadLeaves();
    } catch (error) {
      console.error("Edit leave error:", error);
      alert("Unable to update leave.");
    }
  };

  const handleDelete = async () => {
    if (!selectedLeave) return;

    const leaveId =
      selectedLeave.id ||
      selectedLeave.leave_id;

    try {
      await apiFetch(`/leaves/${leaveId}`, {
        method: "DELETE",
      });

      closeAllPopups();
      loadLeaves();
    } catch (error) {
      console.error("Delete leave error:", error);
      alert("Unable to delete leave.");
    }
  };

  const handleStatusChange = async () => {
    if (!selectedLeave) return;

    const leaveId =
      selectedLeave.id ||
      selectedLeave.leave_id;

    const newStatus =
      statusAction === "approve"
        ? "Approved"
        : "Rejected";

    try {
      await apiFetch(`/leaves/${leaveId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...selectedLeave,
          status: newStatus,
        }),
      });

      closeAllPopups();
      loadLeaves();
    } catch (error) {
      console.error("Leave status error:", error);
      alert(`Unable to ${statusAction} leave.`);
    }
  };

  const getEmployeeName = (leave) => {
    return (
      leave.employee_name ||
      leave.employee?.name ||
      leave.employee?.full_name ||
      `Employee #${leave.employee_id || "-"}`
    );
  };

  const getLeaveType = (leave) => {
    return (
      leave.leave_type ||
      leave.type ||
      "Casual"
    );
  };

  const getReason = (leave) => {
    return (
      leave.reason ||
      leave.description ||
      "-"
    );
  };

  const getStatus = (leave) => {
    return leave.status || "Pending";
  };

  const totalLeaves = leaves.length;

  const pendingLeaves = leaves.filter(
    (leave) =>
      String(getStatus(leave)).toLowerCase() ===
      "pending"
  ).length;

  const approvedLeaves = leaves.filter(
    (leave) =>
      String(getStatus(leave)).toLowerCase() ===
      "approved"
  ).length;

  const rejectedLeaves = leaves.filter(
    (leave) =>
      String(getStatus(leave)).toLowerCase() ===
      "rejected"
  ).length;

  return (
    <div className="leaves-page">

      {/* ================= HEADER ================= */}

      <div className="leaves-header">

        <div className="leaves-header-left">

          <button
            className="leaves-back-btn"
            onClick={() => window.history.back()}
          >
            <MdArrowBack />
            <span>Back</span>
          </button>

          <div>

            <div className="leaves-title-row">
              <h1>Leave Management</h1>

              <span className="leaves-live-badge">
                <span></span>
                HR Management
              </span>
            </div>

            <p>
              Review, approve and manage employee
              leave requests.
            </p>

          </div>

        </div>

        <div className="leaves-header-actions">

          <button
            className="leaves-refresh-btn"
            onClick={loadLeaves}
            disabled={loading}
          >
            <MdRefresh
              className={
                loading
                  ? "leaves-refresh-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            className="leaves-add-btn"
            onClick={openAdd}
          >
            <MdAdd />
            Add Leave
          </button>

        </div>

      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="leaves-summary-grid">

        <div className="leaves-summary-card blue">

          <div className="leaves-summary-icon">
            <MdEventNote />
          </div>

          <div>
            <span>Total Leaves</span>
            <strong>
              {loading ? "..." : totalLeaves}
            </strong>
          </div>

        </div>

        <div className="leaves-summary-card orange">

          <div className="leaves-summary-icon">
            <MdEventNote />
          </div>

          <div>
            <span>Pending</span>
            <strong>
              {loading ? "..." : pendingLeaves}
            </strong>
          </div>

        </div>

        <div className="leaves-summary-card green">

          <div className="leaves-summary-icon">
            <MdCheckCircle />
          </div>

          <div>
            <span>Approved</span>
            <strong>
              {loading ? "..." : approvedLeaves}
            </strong>
          </div>

        </div>

        <div className="leaves-summary-card red">

          <div className="leaves-summary-icon">
            <MdCancel />
          </div>

          <div>
            <span>Rejected</span>
            <strong>
              {loading ? "..." : rejectedLeaves}
            </strong>
          </div>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="leaves-table-card">

        <div className="leaves-table-header">

          <div>
            <h2>Leave Requests</h2>

            <p>
              View and manage all employee leave
              applications.
            </p>
          </div>

          <span className="leaves-count-badge">
            {leaves.length} Requests
          </span>

        </div>

        <div className="leaves-table-wrapper">

          <table className="leaves-table">

            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="7"
                    className="leaves-empty"
                  >
                    Loading leave requests...
                  </td>
                </tr>

              ) : leaves.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="leaves-empty"
                  >
                    <MdEventNote />

                    <strong>
                      No leave requests found
                    </strong>

                    <span>
                      Leave requests will appear here.
                    </span>
                  </td>
                </tr>

              ) : (

                leaves.map((leave, index) => {

                  const status =
                    getStatus(leave);

                  const statusClass =
                    String(status).toLowerCase();

                  return (

                    <tr
                      key={
                        leave.id ||
                        leave.leave_id ||
                        index
                      }
                    >

                      <td>

                        <div className="leave-employee-cell">

                          <div className="leave-avatar">
                            {getEmployeeName(
                              leave
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {getEmployeeName(
                                leave
                              )}
                            </strong>

                            <span>
                              Employee #
                              {leave.employee_id ||
                                "-"}
                            </span>
                          </div>

                        </div>

                      </td>

                      <td>
                        <span className="leave-type">
                          {getLeaveType(leave)}
                        </span>
                      </td>

                      <td>
                        <span className="leave-date">
                          <MdCalendarToday />
                          {leave.start_date || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="leave-date">
                          <MdCalendarToday />
                          {leave.end_date || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="leave-reason">
                          {getReason(leave)}
                        </span>
                      </td>

                      <td>

                        <span
                          className={`leave-status ${statusClass}`}
                        >

                          {statusClass ===
                          "approved" ? (
                            <MdCheckCircle />
                          ) : statusClass ===
                            "rejected" ? (
                            <MdCancel />
                          ) : (
                            <MdEventNote />
                          )}

                          {status}

                        </span>

                      </td>

                      <td>

                        <div className="leave-actions">

                          {/* VIEW */}

                          <button
                            className="leave-action-btn view"
                            title="View"
                            onClick={() =>
                              openView(leave)
                            }
                          >
                            <MdVisibility />
                          </button>

                          {/* EDIT */}

                          <button
                            className="leave-action-btn edit"
                            title="Edit"
                            onClick={() =>
                              openEdit(leave)
                            }
                          >
                            <MdEdit />
                          </button>

                          {/* APPROVE */}

                          {statusClass !==
                            "approved" && (
                            <button
                              className="leave-action-btn approve"
                              title="Approve"
                              onClick={() =>
                                openStatusPopup(
                                  leave,
                                  "approve"
                                )
                              }
                            >
                              <MdCheckCircle />
                            </button>
                          )}

                          {/* REJECT */}

                          {statusClass !==
                            "rejected" && (
                            <button
                              className="leave-action-btn reject"
                              title="Reject"
                              onClick={() =>
                                openStatusPopup(
                                  leave,
                                  "reject"
                                )
                              }
                            >
                              <MdCancel />
                            </button>
                          )}

                          {/* DELETE */}

                          <button
                            className="leave-action-btn delete"
                            title="Delete"
                            onClick={() =>
                              openDelete(leave)
                            }
                          >
                            <MdDelete />
                          </button>

                        </div>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================= ADD POPUP ================= */}

      {showAdd && (

        <div
          className="leave-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="leave-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="leave-modal-header">

              <div>

                <div className="leave-modal-icon add">
                  <MdAdd />
                </div>

                <div>
                  <h2>Add Leave</h2>
                  <p>
                    Create a new employee leave
                    request.
                  </p>
                </div>

              </div>

              <button
                className="leave-modal-close"
                onClick={closeAllPopups}
              >
                <MdClose />
              </button>

            </div>

            <form onSubmit={handleAdd}>

              <div className="leave-form-grid">

                <div className="leave-form-group">
                  <label>Employee ID</label>

                  <input
                    type="number"
                    name="employee_id"
                    value={form.employee_id}
                    onChange={handleInputChange}
                    placeholder="Enter employee ID"
                    required
                  />
                </div>

                <div className="leave-form-group">
                  <label>Leave Type</label>

                  <select
                    name="leave_type"
                    value={form.leave_type}
                    onChange={handleInputChange}
                  >
                    <option value="Casual">
                      Casual
                    </option>

                    <option value="Sick">
                      Sick
                    </option>

                    <option value="Emergency">
                      Emergency
                    </option>

                    <option value="Annual">
                      Annual
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="leave-form-group">
                  <label>Start Date</label>

                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="leave-form-group">
                  <label>End Date</label>

                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="leave-form-group full">
                  <label>Reason</label>

                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleInputChange}
                    placeholder="Enter leave reason"
                    rows="4"
                  />
                </div>

              </div>

              <div className="leave-modal-footer">

                <button
                  type="button"
                  className="leave-cancel-btn"
                  onClick={closeAllPopups}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="leave-save-btn"
                >
                  <MdSave />
                  Add Leave
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ================= VIEW POPUP ================= */}

      {showView && selectedLeave && (

        <div
          className="leave-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="leave-modal leave-view-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="leave-modal-header">

              <div>

                <div className="leave-modal-icon view">
                  <MdVisibility />
                </div>

                <div>
                  <h2>Leave Details</h2>
                  <p>
                    View complete leave request
                    information.
                  </p>
                </div>

              </div>

              <button
                className="leave-modal-close"
                onClick={closeAllPopups}
              >
                <MdClose />
              </button>

            </div>

            <div className="leave-view-profile">

              <div className="leave-large-avatar">
                {getEmployeeName(
                  selectedLeave
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <h3>
                {getEmployeeName(
                  selectedLeave
                )}
              </h3>

              <span>
                Employee #
                {selectedLeave.employee_id ||
                  "-"}
              </span>

            </div>

            <div className="leave-details-grid">

              <div className="leave-detail-item">
                <span>Leave Type</span>
                <strong>
                  {getLeaveType(
                    selectedLeave
                  )}
                </strong>
              </div>

              <div className="leave-detail-item">
                <span>Status</span>

                <strong>
                  <span
                    className={`leave-status ${
                      String(
                        getStatus(
                          selectedLeave
                        )
                      ).toLowerCase()
                    }`}
                  >
                    {getStatus(
                      selectedLeave
                    )}
                  </span>
                </strong>
              </div>

              <div className="leave-detail-item">
                <span>Start Date</span>
                <strong>
                  {selectedLeave.start_date ||
                    "-"}
                </strong>
              </div>

              <div className="leave-detail-item">
                <span>End Date</span>
                <strong>
                  {selectedLeave.end_date ||
                    "-"}
                </strong>
              </div>

              <div className="leave-detail-item full">
                <span>Reason</span>

                <strong>
                  {getReason(
                    selectedLeave
                  )}
                </strong>
              </div>

            </div>

            <div className="leave-modal-footer">

              <button
                className="leave-cancel-btn"
                onClick={closeAllPopups}
              >
                Close
              </button>

              <button
                className="leave-edit-main-btn"
                onClick={() => {
                  setShowView(false);
                  openEdit(selectedLeave);
                }}
              >
                <MdEdit />
                Edit Leave
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ================= EDIT POPUP ================= */}

      {showEdit && selectedLeave && (

        <div
          className="leave-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="leave-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="leave-modal-header">

              <div>

                <div className="leave-modal-icon edit">
                  <MdEdit />
                </div>

                <div>
                  <h2>Edit Leave</h2>
                  <p>
                    Update leave request details.
                  </p>
                </div>

              </div>

              <button
                className="leave-modal-close"
                onClick={closeAllPopups}
              >
                <MdClose />
              </button>

            </div>

            <form onSubmit={handleEdit}>

              <div className="leave-form-grid">

                <div className="leave-form-group">
                  <label>Employee ID</label>

                  <input
                    type="number"
                    name="employee_id"
                    value={form.employee_id}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="leave-form-group">
                  <label>Leave Type</label>

                  <select
                    name="leave_type"
                    value={form.leave_type}
                    onChange={handleInputChange}
                  >
                    <option value="Casual">
                      Casual
                    </option>

                    <option value="Sick">
                      Sick
                    </option>

                    <option value="Emergency">
                      Emergency
                    </option>

                    <option value="Annual">
                      Annual
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="leave-form-group">
                  <label>Start Date</label>

                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="leave-form-group">
                  <label>End Date</label>

                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="leave-form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Approved">
                      Approved
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>
                  </select>
                </div>

                <div className="leave-form-group full">
                  <label>Reason</label>

                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleInputChange}
                    rows="4"
                  />
                </div>

              </div>

              <div className="leave-modal-footer">

                <button
                  type="button"
                  className="leave-cancel-btn"
                  onClick={closeAllPopups}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="leave-save-btn"
                >
                  <MdSave />
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ================= APPROVE / REJECT POPUP ================= */}

      {showStatus && selectedLeave && (

        <div
          className="leave-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="leave-status-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div
              className={`leave-status-big-icon ${
                statusAction === "approve"
                  ? "approve"
                  : "reject"
              }`}
            >
              {statusAction === "approve" ? (
                <MdCheckCircle />
              ) : (
                <MdCancel />
              )}
            </div>

            <h2>
              {statusAction === "approve"
                ? "Approve Leave?"
                : "Reject Leave?"}
            </h2>

            <p>
              Are you sure you want to{" "}
              <strong>
                {statusAction === "approve"
                  ? "approve"
                  : "reject"}
              </strong>{" "}
              the leave request of{" "}
              <strong>
                {getEmployeeName(
                  selectedLeave
                )}
              </strong>
              ?
            </p>

            <div className="leave-status-actions">

              <button
                className="leave-cancel-btn"
                onClick={closeAllPopups}
              >
                Cancel
              </button>

              <button
                className={
                  statusAction === "approve"
                    ? "leave-confirm-approve"
                    : "leave-confirm-reject"
                }
                onClick={
                  handleStatusChange
                }
              >
                {statusAction === "approve" ? (
                  <>
                    <MdCheckCircle />
                    Approve
                  </>
                ) : (
                  <>
                    <MdCancel />
                    Reject
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ================= DELETE POPUP ================= */}

      {showDelete && selectedLeave && (

        <div
          className="leave-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="leave-delete-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="leave-delete-icon">
              <MdDelete />
            </div>

            <h2>
              Delete Leave?
            </h2>

            <p>
              Are you sure you want to delete
              the leave request of{" "}
              <strong>
                {getEmployeeName(
                  selectedLeave
                )}
              </strong>
              ?
            </p>

            <span className="leave-delete-warning">
              This action cannot be undone.
            </span>

            <div className="leave-delete-actions">

              <button
                className="leave-cancel-btn"
                onClick={closeAllPopups}
              >
                Cancel
              </button>

              <button
                className="leave-confirm-delete-btn"
                onClick={handleDelete}
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

export default Leaves;