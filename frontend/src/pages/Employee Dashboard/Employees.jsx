import React, { useEffect, useState } from "react";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiRefreshCw,
  FiArrowLeft,
} from "react-icons/fi";
import { apiFetch } from "../../api";
import "./Employees.css";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEmployees = async () => {
    setLoading(true);

    try {
      const data = await apiFetch("/employees/me");
      setEmployees(Array.isArray(data) ? [data] : data ? [data] : []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const closeModal = () => {
    setMode(null);
    setSelected(null);
  };

  return (
    <div className="employee-common-page">
      <div className="common-header">
        <div>
          <button className="common-back" onClick={() => window.history.back()}>
            <FiArrowLeft /> Back
          </button>
          <h1>My Profile / Employee</h1>
          <p>View your employee information</p>
        </div>

        <button className="common-refresh" onClick={loadEmployees}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div className="common-table-card">
        <div className="common-table-title">
          <div>
            <h2>Employee Information</h2>
            <span>{employees.length} record(s)</span>
          </div>
        </div>

        <div className="common-table-wrap">
          <table className="common-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="common-empty">
                    Loading...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="common-empty">
                    No employee data found
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id || employee.employee_id}>
                    <td>
                      <div className="common-person">
                        <div className="common-avatar">
                          {(employee.name || "E").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{employee.name || "-"}</strong>
                          <small>
                            {employee.employee_code ||
                              employee.employee_id ||
                              "-"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>{employee.email || "-"}</td>
                    <td>{employee.department || "-"}</td>
                    <td>{employee.designation || "-"}</td>
                    <td>
                      <span className="common-status">
                        {employee.status || "Active"}
                      </span>
                    </td>
                    <td>
                      <div className="common-actions">
                        <button
                          className="icon-view"
                          onClick={() => {
                            setSelected(employee);
                            setMode("view");
                          }}
                        >
                          <FiEye />
                        </button>

                        <button
                          className="icon-edit"
                          onClick={() => {
                            setSelected(employee);
                            setMode("edit");
                          }}
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          className="icon-delete"
                          onClick={() => {
                            setSelected(employee);
                            setMode("delete");
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mode && selected && (
        <div className="common-overlay">
          <div className="common-modal">
            <div className="common-modal-header">
              <h2>
                {mode === "view"
                  ? "View Employee"
                  : mode === "edit"
                  ? "Edit Employee"
                  : "Delete Employee"}
              </h2>

              <button onClick={closeModal}>
                <FiX />
              </button>
            </div>

            {mode === "delete" ? (
              <div className="delete-content">
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{selected.name}</strong>?
                </p>

                <div className="modal-buttons">
                  <button className="modal-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="modal-delete" onClick={closeModal}>
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="detail-grid">
                  <div>
                    <label>Name</label>
                    <span>{selected.name || "-"}</span>
                  </div>
                  <div>
                    <label>Email</label>
                    <span>{selected.email || "-"}</span>
                  </div>
                  <div>
                    <label>Phone</label>
                    <span>{selected.phone || "-"}</span>
                  </div>
                  <div>
                    <label>Department</label>
                    <span>{selected.department || "-"}</span>
                  </div>
                  <div>
                    <label>Designation</label>
                    <span>{selected.designation || "-"}</span>
                  </div>
                  <div>
                    <label>City</label>
                    <span>{selected.city || "-"}</span>
                  </div>
                </div>

                {mode === "edit" && (
                  <div className="modal-buttons">
                    <button className="modal-cancel" onClick={closeModal}>
                      Close
                    </button>
                    <button className="modal-save" onClick={closeModal}>
                      Save Changes
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;