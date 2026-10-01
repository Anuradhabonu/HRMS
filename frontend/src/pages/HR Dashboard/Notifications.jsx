import React, { useEffect, useState } from "react";
import {
  MdNotifications,
  MdAdd,
  MdRefresh,
  MdArrowBack,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdClose,
  MdSave,
  MdGroups,
  MdCheckCircle,
  MdSelectAll,
  MdSend,
  MdInfo,
  MdWarning,
  MdError,
  MdPerson,
} from "react-icons/md";
import { apiFetch } from "../../api";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedNotification, setSelectedNotification] =
    useState(null);

  const emptyForm = {
    title: "",
    message: "",
    type: "General",
    employee_ids: [],
  };

  const [form, setForm] = useState(emptyForm);

  /* ================= LOAD NOTIFICATIONS ================= */

  const loadNotifications = async () => {
    setLoading(true);

    try {
      const data = await apiFetch("/notifications");

      setNotifications(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Notifications loading error:",
        error
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD EMPLOYEES ================= */

  const loadEmployees = async () => {
    try {
      const data = await apiFetch("/employees");

      setEmployees(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Employees loading error:",
        error
      );

      setEmployees([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadEmployees();
  }, []);

  /* ================= INPUT ================= */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= POPUPS ================= */

  const openAdd = () => {
    setForm(emptyForm);
    setShowAdd(true);
  };

  const openView = (notification) => {
    setSelectedNotification(notification);
    setShowView(true);
  };

  const openEdit = (notification) => {
    setSelectedNotification(notification);

    setForm({
      title:
        notification.title ||
        notification.notification_title ||
        "",
      message:
        notification.message ||
        notification.content ||
        "",
      type:
        notification.type ||
        "General",
      employee_ids:
        getEmployeeIds(notification),
    });

    setShowEdit(true);
  };

  const openDelete = (notification) => {
    setSelectedNotification(notification);
    setShowDelete(true);
  };

  const closeAllPopups = () => {
    setShowAdd(false);
    setShowView(false);
    setShowEdit(false);
    setShowDelete(false);

    setSelectedNotification(null);
  };

  /* ================= EMPLOYEE IDS ================= */

  const getEmployeeIds = (notification) => {
    if (
      Array.isArray(
        notification?.employee_ids
      )
    ) {
      return notification.employee_ids.map(
        Number
      );
    }

    if (
      Array.isArray(
        notification?.employeeIds
      )
    ) {
      return notification.employeeIds.map(
        Number
      );
    }

    if (
      Array.isArray(
        notification?.employees
      )
    ) {
      return notification.employees
        .map(
          (employee) =>
            employee.id ||
            employee.employee_id
        )
        .filter(Boolean)
        .map(Number);
    }

    if (notification?.employee_id) {
      return [
        Number(notification.employee_id),
      ];
    }

    return [];
  };

  /* ================= EMPLOYEE CHECKBOX ================= */

  const toggleEmployee = (employeeId) => {
    const id = Number(employeeId);

    setForm((prev) => {
      const exists =
        prev.employee_ids.includes(id);

      return {
        ...prev,
        employee_ids: exists
          ? prev.employee_ids.filter(
              (item) => item !== id
            )
          : [...prev.employee_ids, id],
      };
    });
  };

  /* ================= SELECT ALL ================= */

  const selectAllEmployees = () => {
    const allIds = employees
      .map(
        (employee) =>
          employee.id ||
          employee.employee_id
      )
      .filter(Boolean)
      .map(Number);

    setForm((prev) => ({
      ...prev,
      employee_ids: allIds,
    }));
  };

  /* ================= CLEAR ALL ================= */

  const clearAllEmployees = () => {
    setForm((prev) => ({
      ...prev,
      employee_ids: [],
    }));
  };

  const allEmployeesSelected =
    employees.length > 0 &&
    form.employee_ids.length ===
      employees.length;

  /* ================= ADD ================= */

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/notifications", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          type: form.type,
          employee_ids:
            form.employee_ids,
        }),
      });

      closeAllPopups();
      loadNotifications();
    } catch (error) {
      console.error(
        "Add notification error:",
        error
      );

      alert(
        "Unable to add notification."
      );
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!selectedNotification) return;

    const notificationId =
      selectedNotification.id ||
      selectedNotification.notification_id;

    try {
      await apiFetch(
        `/notifications/${notificationId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: form.title,
            message: form.message,
            type: form.type,
            employee_ids:
              form.employee_ids,
          }),
        }
      );

      closeAllPopups();
      loadNotifications();
    } catch (error) {
      console.error(
        "Edit notification error:",
        error
      );

      alert(
        "Unable to update notification."
      );
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!selectedNotification) return;

    const notificationId =
      selectedNotification.id ||
      selectedNotification.notification_id;

    try {
      await apiFetch(
        `/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      closeAllPopups();
      loadNotifications();
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      alert(
        "Unable to delete notification."
      );
    }
  };

  /* ================= HELPERS ================= */

  const getNotificationTitle = (
    notification
  ) =>
    notification?.title ||
    notification?.notification_title ||
    "Notification";

  const getNotificationMessage = (
    notification
  ) =>
    notification?.message ||
    notification?.content ||
    "-";

  const getNotificationId = (
    notification
  ) =>
    notification?.notification_id ||
    notification?.id ||
    "-";

  const getNotificationType = (
    notification
  ) =>
    notification?.type ||
    "General";

  const getEmployeeNames = (
    notification
  ) => {
    if (
      Array.isArray(
        notification?.employees
      )
    ) {
      return notification.employees
        .map(
          (employee) =>
            employee.name ||
            employee.full_name ||
            employee.employee_name ||
            `Employee #${
              employee.id ||
              employee.employee_id ||
              "-"
            }`
        )
        .join(", ");
    }

    const ids =
      getEmployeeIds(notification);

    if (ids.length === 0) {
      return "No employees assigned";
    }

    return ids
      .map((id) => {
        const employee =
          employees.find(
            (item) =>
              Number(
                item.id ||
                  item.employee_id
              ) === Number(id)
          );

        return employee
          ? employee.name ||
              employee.full_name ||
              employee.employee_name
          : `Employee #${id}`;
      })
      .join(", ");
  };

  const getTypeIcon = (type) => {
    const value = String(
      type || "General"
    ).toLowerCase();

    if (value === "success") {
      return <MdCheckCircle />;
    }

    if (value === "warning") {
      return <MdWarning />;
    }

    if (value === "error") {
      return <MdError />;
    }

    return <MdInfo />;
  };

  /* ================= SUMMARY ================= */

  const totalNotifications =
    notifications.length;

  const generalNotifications =
    notifications.filter(
      (item) =>
        String(
          getNotificationType(item)
        ).toLowerCase() === "general"
    ).length;

  const employeeNotifications =
    notifications.filter(
      (item) =>
        getEmployeeIds(item).length > 0
    ).length;

  const selectedNotifications =
    notifications.filter(
      (item) =>
        getEmployeeIds(item).length > 1
    ).length;

  return (
    <div className="notifications-page">

      {/* ================= HEADER ================= */}

      <div className="notifications-header">

        <div className="notifications-header-left">

          <button
            className="notifications-back-btn"
            onClick={() =>
              window.history.back()
            }
          >
            <MdArrowBack />
            <span>Back</span>
          </button>

          <div>

            <div className="notifications-title-row">

              <h1>Notifications</h1>

              <span className="notifications-live-badge">
                <span></span>
                HR Management
              </span>

            </div>

            <p>
              Create and manage notifications
              for employees.
            </p>

          </div>

        </div>

        <div className="notifications-header-actions">

          <button
            className="notifications-refresh-btn"
            onClick={() => {
              loadNotifications();
              loadEmployees();
            }}
            disabled={loading}
          >
            <MdRefresh
              className={
                loading
                  ? "notifications-refresh-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            className="notifications-add-btn"
            onClick={openAdd}
          >
            <MdAdd />
            Add Notification
          </button>

        </div>

      </div>

      {/* ================= SUMMARY ================= */}

      <div className="notifications-summary-grid">

        <div className="notifications-summary-card blue">

          <div className="notifications-summary-icon">
            <MdNotifications />
          </div>

          <div>
            <span>Total Notifications</span>
            <strong>
              {loading
                ? "..."
                : totalNotifications}
            </strong>
          </div>

        </div>

        <div className="notifications-summary-card green">

          <div className="notifications-summary-icon">
            <MdCheckCircle />
          </div>
          
          <div>
            <span>General</span>
            <strong>
              {loading
                ? "..."
                : generalNotifications}
            </strong>
          </div>

        </div>

        <div className="notifications-summary-card orange">

          <div className="notifications-summary-icon">
            <MdPerson />
          </div>

          <div>
            <span>Employee Notifications</span>
            <strong>
              {loading
                ? "..."
                : employeeNotifications}
            </strong>
          </div>

        </div>

        <div className="notifications-summary-card purple">

          <div className="notifications-summary-icon">
            <MdGroups />
          </div>

          <div>
            <span>Multiple Employees</span>
            <strong>
              {loading
                ? "..."
                : selectedNotifications}
            </strong>
          </div>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="notifications-table-card">

        <div className="notifications-table-header">

          <div>

            <h2>
              Notification Directory
            </h2>

            <p>
              View and manage all employee
              notifications.
            </p>

          </div>

          <span className="notifications-count-badge">
            {notifications.length} Notifications
          </span>

        </div>

        <div className="notifications-table-wrapper">

          <table className="notifications-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Notification</th>
                <th>Message</th>
                <th>Employees</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="notifications-empty"
                  >
                    Loading notifications...
                  </td>

                </tr>

              ) : notifications.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="notifications-empty"
                  >

                    <MdNotifications />

                    <strong>
                      No notifications found
                    </strong>

                    <span>
                      Add a notification to
                      see it here.
                    </span>

                  </td>

                </tr>

              ) : (

                notifications.map(
                  (
                    notification,
                    index
                  ) => {

                    const type =
                      getNotificationType(
                        notification
                      );

                    const typeClass =
                      String(
                        type
                      ).toLowerCase();

                    return (

                      <tr
                        key={
                          notification.id ||
                          notification.notification_id ||
                          index
                        }
                      >

                        <td>

                          <span className="notification-id">
                            #
                            {getNotificationId(
                              notification
                            )}
                          </span>

                        </td>

                        <td>

                          <div className="notification-name-cell">

                            <div
                              className={`notification-avatar ${typeClass}`}
                            >
                              {getTypeIcon(
                                type
                              )}
                            </div>

                            <div>

                              <strong>
                                {getNotificationTitle(
                                  notification
                                )}
                              </strong>

                              <span>
                                Notification
                              </span>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="notification-message">

                            {getNotificationMessage(
                              notification
                            )}

                          </span>

                        </td>

                        <td>

                          <div className="notification-employee-cell">

                            <MdGroups />

                            <span>
                              {getEmployeeNames(
                                notification
                              )}
                            </span>

                          </div>

                        </td>

                        <td>

                          <span
                            className={`notification-type ${typeClass}`}
                          >

                            {getTypeIcon(
                              type
                            )}

                            {type}

                          </span>

                        </td>

                        <td>

                          <div className="notification-actions">

                            <button
                              className="notification-action-btn view"
                              title="View"
                              onClick={() =>
                                openView(
                                  notification
                                )
                              }
                            >
                              <MdVisibility />
                            </button>

                            <button
                              className="notification-action-btn edit"
                              title="Edit"
                              onClick={() =>
                                openEdit(
                                  notification
                                )
                              }
                            >
                              <MdEdit />
                            </button>

                            <button
                              className="notification-action-btn delete"
                              title="Delete"
                              onClick={() =>
                                openDelete(
                                  notification
                                )
                              }
                            >
                              <MdDelete />
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          ADD POPUP
      ====================================================== */}

      {showAdd && (

        <div
          className="notification-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="notification-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="notification-modal-header">

              <div>

                <div className="notification-modal-icon add">
                  <MdAdd />
                </div>

                <div>

                  <h2>
                    Add Notification
                  </h2>

                  <p>
                    Create and send a notification
                    to employees.
                  </p>

                </div>

              </div>

              <button
                className="notification-modal-close"
                onClick={closeAllPopups}
              >
                <MdClose />
              </button>

            </div>

            <form onSubmit={handleAdd}>

              <div className="notification-form-grid">

                <div className="notification-form-group">

                  <label>
                    Notification Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter notification title"
                    required
                  />

                </div>

                <div className="notification-form-group">

                  <label>
                    Type
                  </label>

                  <select
                    name="type"
                    value={form.type}
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="General">
                      General
                    </option>

                    <option value="Success">
                      Success
                    </option>

                    <option value="Warning">
                      Warning
                    </option>

                    <option value="Error">
                      Error
                    </option>

                  </select>

                </div>

                <div className="notification-form-group full">

                  <label>
                    Message
                  </label>

                  <textarea
                    name="message"
                    value={form.message}
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter notification message"
                    rows="4"
                    required
                  />

                </div>

              </div>

              {/* EMPLOYEES */}

              <div className="notification-assignment-box">

                <div className="notification-assignment-header">

                  <div>

                    <h3>
                      Select Employees
                    </h3>

                    <p>
                      Select one or multiple
                      employees.
                    </p>

                  </div>

                  <span>
                    {form.employee_ids.length}{" "}
                    Selected
                  </span>

                </div>

                <div className="notification-select-actions">

                  <button
                    type="button"
                    onClick={
                      selectAllEmployees
                    }
                    className={
                      allEmployeesSelected
                        ? "selected"
                        : ""
                    }
                  >
                    <MdSelectAll />
                    Select All
                  </button>

                  <button
                    type="button"
                    onClick={
                      clearAllEmployees
                    }
                  >
                    <MdClose />
                    Clear All
                  </button>

                </div>

                <div className="notification-employee-list">

                  {employees.length ===
                  0 ? (

                    <div className="notification-no-employees">
                      No employees found.
                    </div>

                  ) : (

                    employees.map(
                      (
                        employee,
                        index
                      ) => {

                        const id =
                          employee.id ||
                          employee.employee_id;

                        const name =
                          employee.name ||
                          employee.full_name ||
                          employee.employee_name ||
                          `Employee #${id}`;

                        const checked =
                          form.employee_ids.includes(
                            Number(id)
                          );

                        return (

                          <label
                            className={`notification-employee-option ${
                              checked
                                ? "checked"
                                : ""
                            }`}
                            key={
                              id || index
                            }
                          >

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleEmployee(
                                  id
                                )
                              }
                            />

                            <span className="notification-custom-checkbox">
                              {checked && "✓"}
                            </span>

                            <div className="notification-small-avatar">
                              {name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="notification-employee-info">

                              <strong>
                                {name}
                              </strong>

                              <span>
                                Employee #
                                {id}
                              </span>

                            </div>

                          </label>

                        );
                      }
                    )

                  )}

                </div>

              </div>

              <div className="notification-modal-footer">

                <button
                  type="button"
                  className="notification-cancel-btn"
                  onClick={
                    closeAllPopups
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="notification-save-btn"
                >
                  <MdSend />
                  Send Notification
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          VIEW POPUP
      ====================================================== */}

      {showView &&
        selectedNotification && (

          <div
            className="notification-modal-overlay"
            onClick={closeAllPopups}
          >

            <div
              className="notification-modal notification-view-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="notification-modal-header">

                <div>

                  <div className="notification-modal-icon view">
                    <MdVisibility />
                  </div>

                  <div>

                    <h2>
                      Notification Details
                    </h2>

                    <p>
                      View complete notification
                      information.
                    </p>

                  </div>

                </div>

                <button
                  className="notification-modal-close"
                  onClick={
                    closeAllPopups
                  }
                >
                  <MdClose />
                </button>

              </div>

              <div className="notification-view-top">

                <div className="notification-large-icon">
                  {getTypeIcon(
                    getNotificationType(
                      selectedNotification
                    )
                  )}
                </div>

                <h3>
                  {getNotificationTitle(
                    selectedNotification
                  )}
                </h3>

                <span>
                  Notification #
                  {getNotificationId(
                    selectedNotification
                  )}
                </span>

              </div>

              <div className="notification-details-grid">

                <div className="notification-detail-item">

                  <span>
                    Title
                  </span>

                  <strong>
                    {getNotificationTitle(
                      selectedNotification
                    )}
                  </strong>

                </div>

                <div className="notification-detail-item">

                  <span>
                    Type
                  </span>

                  <strong>

                    <span
                      className={`notification-type ${String(
                        getNotificationType(
                          selectedNotification
                        )
                      ).toLowerCase()}`}
                    >
                      {getNotificationType(
                        selectedNotification
                      )}
                    </span>

                  </strong>

                </div>

                <div className="notification-detail-item full">

                  <span>
                    Message
                  </span>

                  <strong>
                    {getNotificationMessage(
                      selectedNotification
                    )}
                  </strong>

                </div>

                <div className="notification-detail-item full">

                  <span>
                    Employees
                  </span>

                  <strong className="notification-view-employees">

                    <MdGroups />

                    {getEmployeeNames(
                      selectedNotification
                    )}

                  </strong>

                </div>

              </div>

              <div className="notification-modal-footer">

                <button
                  className="notification-cancel-btn"
                  onClick={
                    closeAllPopups
                  }
                >
                  Close
                </button>

                <button
                  className="notification-edit-main-btn"
                  onClick={() => {
                    setShowView(false);

                    openEdit(
                      selectedNotification
                    );
                  }}
                >
                  <MdEdit />
                  Edit Notification
                </button>

              </div>

            </div>

          </div>

        )}

      {/* =====================================================
          EDIT POPUP
      ====================================================== */}

      {showEdit &&
        selectedNotification && (

          <div
            className="notification-modal-overlay"
            onClick={closeAllPopups}
          >

            <div
              className="notification-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="notification-modal-header">

                <div>

                  <div className="notification-modal-icon edit">
                    <MdEdit />
                  </div>

                  <div>

                    <h2>
                      Edit Notification
                    </h2>

                    <p>
                      Update notification and
                      employee selection.
                    </p>

                  </div>

                </div>

                <button
                  className="notification-modal-close"
                  onClick={
                    closeAllPopups
                  }
                >
                  <MdClose />
                </button>

              </div>

              <form onSubmit={handleEdit}>

                <div className="notification-form-grid">

                  <div className="notification-form-group">

                    <label>
                      Notification Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={
                        handleInputChange
                      }
                      required
                    />

                  </div>

                  <div className="notification-form-group">

                    <label>
                      Type
                    </label>

                    <select
                      name="type"
                      value={form.type}
                      onChange={
                        handleInputChange
                      }
                    >

                      <option value="General">
                        General
                      </option>

                      <option value="Success">
                        Success
                      </option>

                      <option value="Warning">
                        Warning
                      </option>

                      <option value="Error">
                        Error
                      </option>

                    </select>

                  </div>

                  <div className="notification-form-group full">

                    <label>
                      Message
                    </label>

                    <textarea
                      name="message"
                      value={form.message}
                      onChange={
                        handleInputChange
                      }
                      rows="4"
                      required
                    />

                  </div>

                </div>

                <div className="notification-assignment-box">

                  <div className="notification-assignment-header">

                    <div>

                      <h3>
                        Select Employees
                      </h3>

                      <p>
                        Select one or multiple
                        employees.
                      </p>

                    </div>

                    <span>
                      {form.employee_ids.length}{" "}
                      Selected
                    </span>

                  </div>

                  <div className="notification-select-actions">

                    <button
                      type="button"
                      onClick={
                        selectAllEmployees
                      }
                      className={
                        allEmployeesSelected
                          ? "selected"
                          : ""
                      }
                    >
                      <MdSelectAll />
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearAllEmployees
                      }
                    >
                      <MdClose />
                      Clear All
                    </button>

                  </div>

                  <div className="notification-employee-list">

                    {employees.map(
                      (
                        employee,
                        index
                      ) => {

                        const id =
                          employee.id ||
                          employee.employee_id;

                        const name =
                          employee.name ||
                          employee.full_name ||
                          employee.employee_name ||
                          `Employee #${id}`;

                        const checked =
                          form.employee_ids.includes(
                            Number(id)
                          );

                        return (

                          <label
                            className={`notification-employee-option ${
                              checked
                                ? "checked"
                                : ""
                            }`}
                            key={
                              id || index
                            }
                          >

                            <input
                              type="checkbox"
                              checked={
                                checked
                              }
                              onChange={() =>
                                toggleEmployee(
                                  id
                                )
                              }
                            />

                            <span className="notification-custom-checkbox">
                              {checked && "✓"}
                            </span>

                            <div className="notification-small-avatar">
                              {name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="notification-employee-info">

                              <strong>
                                {name}
                              </strong>

                              <span>
                                Employee #
                                {id}
                              </span>

                            </div>

                          </label>

                        );
                      }
                    )}

                  </div>

                </div>

                <div className="notification-modal-footer">

                  <button
                    type="button"
                    className="notification-cancel-btn"
                    onClick={
                      closeAllPopups
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="notification-save-btn"
                  >
                    <MdSave />
                    Save Changes
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      {/* =====================================================
          DELETE POPUP
      ====================================================== */}

      {showDelete &&
        selectedNotification && (

          <div
            className="notification-modal-overlay"
            onClick={closeAllPopups}
          >

            <div
              className="notification-delete-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="notification-delete-icon">
                <MdDelete />
              </div>

              <h2>
                Delete Notification?
              </h2>

              <p>
                Are you sure you want to
                delete{" "}
                <strong>
                  {getNotificationTitle(
                    selectedNotification
                  )}
                </strong>
                ?
              </p>

              <span className="notification-delete-warning">
                This action cannot be undone.
              </span>

              <div className="notification-delete-actions">

                <button
                  className="notification-cancel-btn"
                  onClick={
                    closeAllPopups
                  }
                >
                  Cancel
                </button>

                <button
                  className="notification-confirm-delete-btn"
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

export default Notifications;