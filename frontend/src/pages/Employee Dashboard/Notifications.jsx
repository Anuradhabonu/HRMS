import React, { useEffect, useState } from "react";
import {
MdNotifications,
MdVisibility,
MdRefresh,
MdArrowBack,
MdClose,
MdCalendarToday,
MdAccessTime,
} from "react-icons/md";
import { apiFetch } from "../../api";
import "./Notifications.css";

const Notifications = () => {
const [notifications, setNotifications] = useState([]);
const [loading, setLoading] = useState(true);

const [showView, setShowView] = useState(false);
const [selectedNotification, setSelectedNotification] =
useState(null);

const loadNotifications = async () => {
try {
setLoading(true);


  const data = await apiFetch("/notifications/me");

  setNotifications(Array.isArray(data) ? data : []);
} catch (error) {
  console.error("Notifications loading error:", error);
  setNotifications([]);
} finally {
  setLoading(false);
}


};

useEffect(() => {
loadNotifications();
}, []);

const openViewPopup = (notification) => {
setSelectedNotification(notification);
setShowView(true);
};

const closeViewPopup = () => {
setShowView(false);
setSelectedNotification(null);
};

const formatDate = (date) => {
if (!date) return "-";


const value = new Date(date);

if (Number.isNaN(value.getTime())) {
  return date;
}

return value.toLocaleDateString("en-IN");


};

const getTitle = (notification) =>
notification.title ||
notification.subject ||
notification.message ||
"Notification";

return ( <div className="employee-notifications-page">


  {/* HEADER */}
  <div className="employee-notifications-header">

    <div className="employee-notifications-header-left">

      <button
        className="employee-notifications-back-btn"
        onClick={() => window.history.back()}
      >
        <MdArrowBack />
        Back
      </button>

      <div className="employee-notifications-title-area">

        <div className="employee-notifications-title-row">

          <div className="employee-notifications-title-icon">
            <MdNotifications />
          </div>

          <div>
            <h1>My Notifications</h1>
            <p>View your latest notifications</p>
          </div>

        </div>

        <div className="employee-notifications-live-badge">
          <span></span>
          Employee Notifications
        </div>

      </div>

    </div>

    <div className="employee-notifications-header-actions">

      <button
        className="employee-notifications-refresh-btn"
        onClick={loadNotifications}
        disabled={loading}
      >
        <MdRefresh
          className={
            loading
              ? "employee-notifications-spin"
              : ""
          }
        />
        Refresh
      </button>

    </div>

  </div>

  {/* SUMMARY */}
  <div className="employee-notifications-summary-grid">

    <div className="employee-notifications-summary-card blue-notification-card">
      <div className="employee-notifications-summary-icon">
        <MdNotifications />
      </div>

      <div>
        <span>Total Notifications</span>
        <strong>{notifications.length}</strong>
        <small>Your notifications</small>
      </div>
    </div>

    <div className="employee-notifications-summary-card green-notification-card">
      <div className="employee-notifications-summary-icon">
        <MdNotifications />
      </div>

      <div>
        <span>Unread</span>
        <strong>
          {
            notifications.filter(
              (item) =>
                item.is_read === false ||
                item.read === false ||
                item.status === "unread"
            ).length
          }
        </strong>
        <small>Unread notifications</small>
      </div>
    </div>

    <div className="employee-notifications-summary-card orange-notification-card">
      <div className="employee-notifications-summary-icon">
        <MdNotifications />
      </div>

      <div>
        <span>Messages</span>
        <strong>{notifications.length}</strong>
        <small>Available messages</small>
      </div>
    </div>

  </div>

  {/* TABLE */}
  <div className="employee-notifications-table-card">

    <div className="employee-notifications-table-header">

      <div>
        <h2>
          <MdNotifications />
          Notifications
        </h2>

        <p>View your notification details</p>
      </div>

      <span className="employee-notifications-count-badge">
        {notifications.length}
      </span>

    </div>

    {loading ? (
      <div className="employee-notifications-empty-state">
        <MdRefresh className="employee-notifications-spin large-spin" />
        <p>Loading notifications...</p>
      </div>
    ) : notifications.length === 0 ? (
      <div className="employee-notifications-empty-state">
        <MdNotifications />
        <p>No notifications found.</p>
      </div>
    ) : (
      <div className="employee-notifications-table-wrapper">

        <table className="employee-notifications-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {notifications.map((notification) => {

              const isUnread =
                notification.is_read === false ||
                notification.read === false ||
                notification.status === "unread";

              return (
                <tr key={notification.id}>

                  <td>
                    <span className="employee-notification-id">
                      #{notification.id}
                    </span>
                  </td>

                  <td>
                    <div className="employee-notification-title">
                      <MdNotifications />
                      {getTitle(notification)}
                    </div>
                  </td>

                  <td>
                    <div className="employee-notification-message">
                      {notification.message || "-"}
                    </div>
                  </td>

                  <td>
                    <div className="employee-notification-date">
                      <MdCalendarToday />
                      {formatDate(
                        notification.created_at ||
                          notification.date ||
                          notification.created_date
                      )}
                    </div>
                  </td>

                  <td>
                    <span
                      className={
                        isUnread
                          ? "employee-notification-status unread"
                          : "employee-notification-status read"
                      }
                    >
                      {isUnread ? "Unread" : "Read"}
                    </span>
                  </td>

                  <td>
                    <div className="employee-notification-actions">

                      <button
                        className="employee-notification-action-btn view-action"
                        title="View"
                        onClick={() =>
                          openViewPopup(notification)
                        }
                      >
                        <MdVisibility />
                      </button>

                    </div>
                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>
    )}

  </div>

  {/* VIEW POPUP */}
  {showView && selectedNotification && (
    <div
      className="employee-notification-modal-overlay"
      onClick={closeViewPopup}
    >

      <div
        className="employee-notification-view-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="employee-notification-modal-header">

          <div>
            <h2>
              <MdVisibility />
              Notification Details
            </h2>

            <p>View your notification</p>
          </div>

          <button onClick={closeViewPopup}>
            <MdClose />
          </button>

        </div>

        <div className="employee-notification-view-content">

          <div className="employee-notification-detail-card">

            <span>Notification ID</span>

            <strong>
              #{selectedNotification.id}
            </strong>

          </div>

          <div className="employee-notification-detail-card">

            <span>Title</span>

            <strong>
              {getTitle(selectedNotification)}
            </strong>

          </div>

          <div className="employee-notification-detail-card">

            <span>
              <MdCalendarToday />
              Date
            </span>

            <strong>
              {formatDate(
                selectedNotification.created_at ||
                  selectedNotification.date ||
                  selectedNotification.created_date
              )}
            </strong>

          </div>

          <div className="employee-notification-detail-card">

            <span>
              <MdAccessTime />
              Status
            </span>

            <strong>
              {selectedNotification.is_read === false ||
              selectedNotification.read === false ||
              selectedNotification.status === "unread"
                ? "Unread"
                : "Read"}
            </strong>

          </div>

          <div className="employee-notification-detail-card full-detail">

            <span>Message</span>

            <p>
              {selectedNotification.message ||
                "No notification message available"}
            </p>

          </div>

        </div>

        <div className="employee-notification-modal-actions">

          <button
            className="employee-notification-close-btn"
            onClick={closeViewPopup}
          >
            <MdClose />
            Close
          </button>

        </div>

      </div>

    </div>
  )}

</div>

);
};

export default Notifications;
