
import React, { useEffect, useState } from "react";
import {
  MdPeople,
  MdPersonAdd,
  MdRefresh,
  MdArrowBack,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdClose,
  MdEmail,
  MdPhone,
  MdBusiness,
  MdBadge,
  MdCheckCircle,
  MdCancel,
  MdSave,
} from "react-icons/md";
import { apiFetch } from "../../api";
import "./Employees.css";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  const loadEmployees = async () => {
    setLoading(true);

    try {
      const data = await apiFetch("/employees");

      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Employees loading error:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
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

  const openView = (employee) => {
    setSelectedEmployee(employee);
    setShowView(true);
  };

  const openEdit = (employee) => {
    setSelectedEmployee(employee);

    setForm({
      name: employee.name || employee.full_name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "",
      designation: employee.designation || "",
      status: employee.status || "Active",
    });

    setShowEdit(true);
  };

  const openDelete = (employee) => {
    setSelectedEmployee(employee);
    setShowDelete(true);
  };

  const closeAllPopups = () => {
    setShowAdd(false);
    setShowView(false);
    setShowEdit(false);
    setShowDelete(false);
    setSelectedEmployee(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/employees", {
        method: "POST",
        body: JSON.stringify(form),
      });

      closeAllPopups();
      loadEmployees();
    } catch (error) {
      console.error("Add employee error:", error);
      alert("Unable to add employee.");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!selectedEmployee) return;

    const employeeId =
      selectedEmployee.id || selectedEmployee.employee_id;

    try {
      await apiFetch(`/employees/${employeeId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      closeAllPopups();
      loadEmployees();
    } catch (error) {
      console.error("Edit employee error:", error);
      alert("Unable to update employee.");
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    const employeeId =
      selectedEmployee.id || selectedEmployee.employee_id;

    try {
      await apiFetch(`/employees/${employeeId}`, {
        method: "DELETE",
      });

      closeAllPopups();
      loadEmployees();
    } catch (error) {
      console.error("Delete employee error:", error);
      alert("Unable to delete employee.");
    }
  };

  const getName = (employee) =>
    employee?.name ||
    employee?.full_name ||
    employee?.employee_name ||
    "Employee";

  const getId = (employee) =>
    employee?.employee_id ||
    employee?.id ||
    "-";

  const activeEmployees = employees.filter(
    (employee) =>
      String(employee.status || "Active").toLowerCase() ===
      "active"
  ).length;

  const departments = new Set(
    employees
      .map((employee) => employee.department)
      .filter(Boolean)
  ).size;

  const designations = new Set(
    employees
      .map((employee) => employee.designation)
      .filter(Boolean)
  ).size;

  return (
    <div className="employees-page">

      {/* ================= HEADER ================= */}

      <div className="employees-header">

        <div className="employees-header-left">

          <button
            className="employees-back-btn"
            onClick={() => window.history.back()}
          >
            <MdArrowBack />
            <span>Back</span>
          </button>

          <div>
            <div className="employees-title-row">

              <h1>Employees</h1>

              <span className="employees-live-badge">
                <span></span>
                HR Management
              </span>

            </div>

            <p>
              Manage employee information, roles and
              organization details.
            </p>
          </div>

        </div>

        <div className="employees-header-actions">

          <button
            className="employees-refresh-btn"
            onClick={loadEmployees}
            disabled={loading}
          >
            <MdRefresh
              className={loading ? "employees-refresh-spin" : ""}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="employees-add-btn"
            onClick={openAdd}
          >
            <MdPersonAdd />
            Add Employee
          </button>

        </div>

      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="employees-summary-grid">

        <div className="employees-summary-card blue">
          <div className="employees-summary-icon">
            <MdPeople />
          </div>

          <div>
            <span>Total Employees</span>
            <strong>{loading ? "..." : employees.length}</strong>
          </div>
        </div>

        <div className="employees-summary-card green">
          <div className="employees-summary-icon">
            <MdCheckCircle />
          </div>

          <div>
            <span>Active Employees</span>
            <strong>{loading ? "..." : activeEmployees}</strong>
          </div>
        </div>

        <div className="employees-summary-card orange">
          <div className="employees-summary-icon">
            <MdBusiness />
          </div>

          <div>
            <span>Departments</span>
            <strong>{loading ? "..." : departments}</strong>
          </div>
        </div>

        <div className="employees-summary-card purple">
          <div className="employees-summary-icon">
            <MdBadge />
          </div>

          <div>
            <span>Designations</span>
            <strong>{loading ? "..." : designations}</strong>
          </div>
        </div>

      </div>

      {/* ================= TABLE CARD ================= */}

      <div className="employees-table-card">

        <div className="employees-table-header">

          <div>
            <h2>Employee Directory</h2>
            <p>
              View and manage all registered employees.
            </p>
          </div>

          <span className="employees-count-badge">
            {employees.length} Employees
          </span>

        </div>

        <div className="employees-table-wrapper">

          <table className="employees-table">

            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="8"
                    className="employees-empty"
                  >
                    Loading employees...
                  </td>
                </tr>

              ) : employees.length === 0 ? (

                <tr>
                  <td
                    colSpan="8"
                    className="employees-empty"
                  >
                    <MdPeople />
                    <strong>No employees found</strong>
                    <span>
                      Add an employee to see them here.
                    </span>
                  </td>
                </tr>

              ) : (

                employees.map((employee, index) => {

                  const name = getName(employee);

                  const status =
                    employee.status || "Active";

                  return (
                    <tr
                      key={
                        employee.id ||
                        employee.employee_id ||
                        index
                      }
                    >

                      <td>
                        <span className="employee-id">
                          #{getId(employee)}
                        </span>
                      </td>

                      <td>

                        <div className="employee-name-cell">

                          <div className="employee-avatar">
                            {name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{name}</strong>

                            <span>
                              Employee
                            </span>
                          </div>

                        </div>

                      </td>

                      <td>
                        <span className="employee-email">
                          <MdEmail />
                          {employee.email || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="employee-phone">
                          <MdPhone />
                          {employee.phone || "-"}
                        </span>
                      </td>

                      <td>
                        {employee.department || "-"}
                      </td>

                      <td>
                        {employee.designation || "-"}
                      </td>

                      <td>

                        <span
                          className={`employee-status ${
                            String(status).toLowerCase() ===
                            "active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {String(status).toLowerCase() ===
                          "active" ? (
                            <MdCheckCircle />
                          ) : (
                            <MdCancel />
                          )}

                          {status}
                        </span>

                      </td>

                      <td>

                        <div className="employee-actions">

                          <button
                            className="employee-action-btn view"
                            title="View"
                            onClick={() =>
                              openView(employee)
                            }
                          >
                            <MdVisibility />
                          </button>

                          <button
                            className="employee-action-btn edit"
                            title="Edit"
                            onClick={() =>
                              openEdit(employee)
                            }
                          >
                            <MdEdit />
                          </button>

                          <button
                            className="employee-action-btn delete"
                            title="Delete"
                            onClick={() =>
                              openDelete(employee)
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

      {/* ================= ADD EMPLOYEE POPUP ================= */}

      {showAdd && (

        <div
          className="employee-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="employee-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-modal-header">

              <div>
                <div className="employee-modal-icon add">
                  <MdPersonAdd />
                </div>

                <div>
                  <h2>Add Employee</h2>
                  <p>
                    Create a new employee record.
                  </p>
                </div>
              </div>

              <button
                className="employee-modal-close"
                onClick={closeAllPopups}
              >
                <MdClose />
              </button>

            </div>

            <form onSubmit={handleAdd}>

              <div className="employee-form-grid">

                <div className="employee-form-group">
                  <label>Employee Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Enter employee name"
                    required
                  />
                </div>

                <div className="employee-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div className="employee-form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="employee-form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleInputChange}
                    placeholder="Enter department"
                  />
                </div>

                <div className="employee-form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleInputChange}
                    placeholder="Enter designation"
                  />
                </div>

                <div className="employee-form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>

                </div>

              </div>

              <div className="employee-modal-footer">

                <button
                  type="button"
                  className="employee-cancel-btn"
                  onClick={closeAllPopups}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-save-btn"
                >
                  <MdSave />
                  Add Employee
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ================= VIEW POPUP ================= */}

      {showView && selectedEmployee && (

        <div
          className="employee-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="employee-modal employee-view-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-modal-header">

              <div>
                <div className="employee-modal-icon view">
                  <MdVisibility />
                </div>

                <div>
                  <h2>Employee Details</h2>
                  <p>
                    View employee information.
                  </p>
                </div>
              </div>

              <button
                className="employee-modal-close"
                onClick={closeAllPopups}
              >
                <MdClose />
              </button>

            </div>

            <div className="employee-profile-preview">

              <div className="employee-large-avatar">
                {getName(selectedEmployee)
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <h3>{getName(selectedEmployee)}</h3>

              <span>
                {selectedEmployee.designation ||
                  "Employee"}
              </span>

            </div>

            <div className="employee-details-grid">

              <div className="employee-detail-item">
                <span>Employee ID</span>
                <strong>
                  #{getId(selectedEmployee)}
                </strong>
              </div>

              <div className="employee-detail-item">
                <span>Email</span>
                <strong>
                  {selectedEmployee.email || "-"}
                </strong>
              </div>

              <div className="employee-detail-item">
                <span>Phone</span>
                <strong>
                  {selectedEmployee.phone || "-"}
                </strong>
              </div>

              <div className="employee-detail-item">
                <span>Department</span>
                <strong>
                  {selectedEmployee.department || "-"}
                </strong>
              </div>

              <div className="employee-detail-item">
                <span>Designation</span>
                <strong>
                  {selectedEmployee.designation || "-"}
                </strong>
              </div>

              <div className="employee-detail-item">
                <span>Status</span>

                <strong>
                  <span
                    className={`employee-status ${
                      String(
                        selectedEmployee.status ||
                          "Active"
                      ).toLowerCase() === "active"
                        ? "active"
                        : "inactive"
                    }`}
                  >
                    {selectedEmployee.status ||
                      "Active"}
                  </span>
                </strong>

              </div>

            </div>

            <div className="employee-modal-footer">

              <button
                className="employee-cancel-btn"
                onClick={closeAllPopups}
              >
                Close
              </button>

              <button
                className="employee-edit-main-btn"
                onClick={() => {
                  setShowView(false);
                  openEdit(selectedEmployee);
                }}
              >
                <MdEdit />
                Edit Employee
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ================= EDIT POPUP ================= */}

      {showEdit && selectedEmployee && (

        <div
          className="employee-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="employee-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-modal-header">

              <div>
                <div className="employee-modal-icon edit">
                  <MdEdit />
                </div>

                <div>
                  <h2>Edit Employee</h2>
                  <p>
                    Update employee information.
                  </p>
                </div>
              </div>

              <button
                className="employee-modal-close"
                onClick={closeAllPopups}
              >
                <MdClose />
              </button>

            </div>

            <form onSubmit={handleEdit}>

              <div className="employee-form-grid">

                <div className="employee-form-group">
                  <label>Employee Name</label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="employee-form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="employee-form-group">
                  <label>Phone</label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="employee-form-group">
                  <label>Department</label>

                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="employee-form-group">
                  <label>Designation</label>

                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="employee-form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>

                </div>

              </div>

              <div className="employee-modal-footer">

                <button
                  type="button"
                  className="employee-cancel-btn"
                  onClick={closeAllPopups}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-save-btn"
                >
                  <MdSave />
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ================= DELETE POPUP ================= */}

      {showDelete && selectedEmployee && (

        <div
          className="employee-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="employee-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="employee-delete-icon">
              <MdDelete />
            </div>

            <h2>Delete Employee?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                {getName(selectedEmployee)}
              </strong>
              ?
            </p>

            <span className="employee-delete-warning">
              This action cannot be undone.
            </span>

            <div className="employee-delete-actions">

              <button
                className="employee-cancel-btn"
                onClick={closeAllPopups}
              >
                Cancel
              </button>

              <button
                className="employee-confirm-delete-btn"
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

export default Employees;
