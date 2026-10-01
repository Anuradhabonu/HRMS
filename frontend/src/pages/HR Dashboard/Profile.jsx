import React, { useEffect, useState } from "react";
import {
  MdPerson,
  MdRefresh,
  MdArrowBack,
  MdVisibility,
  MdEdit,
  MdClose,
  MdSave,
  MdEmail,
  MdPhone,
  MdLocationCity,
  MdBadge,
} from "react-icons/md";
import { apiFetch } from "../../api";
import "./Profile.css";

function Profile() {
  const emptyProfile = {
    id: "",
    employee_id: "",
    name: "",
    full_name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "",
  };

  const [profile, setProfile] = useState(emptyProfile);

  const [form, setForm] = useState(emptyProfile);

  const [loading, setLoading] = useState(true);

  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const loadProfile = async () => {
    setLoading(true);

    try {
      let data;

      try {
        data = await apiFetch("/profile/me");
      } catch (error) {
        data = await apiFetch("/profile");
      }

      if (data && typeof data === "object") {
        setProfile({
          ...emptyProfile,
          ...data,
        });

        setForm({
          ...emptyProfile,
          ...data,
        });
      }
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const getName = () => {
    return (
      profile.name ||
      profile.full_name ||
      profile.employee_name ||
      "Employee"
    );
  };

  const getEmployeeId = () => {
    return (
      profile.employee_id ||
      profile.id ||
      "-"
    );
  };

  const getPhone = () => {
    return profile.phone || "-";
  };

  const getEmail = () => {
    return profile.email || "-";
  };

  const getLocation = () => {
    const parts = [
      profile.city,
      profile.state,
      profile.country,
    ].filter(Boolean);

    return parts.length > 0
      ? parts.join(", ")
      : "-";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openView = () => {
    setShowView(true);
  };

  const openEdit = () => {
    setForm({
      ...emptyProfile,
      ...profile,
    });

    setShowEdit(true);
  };

  const closePopups = () => {
    setShowView(false);
    setShowEdit(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      let updated;

      try {
        updated = await apiFetch("/profile/me", {
          method: "PUT",
          body: JSON.stringify({
            name:
              form.name ||
              form.full_name,
            phone: form.phone,
            city: form.city,
            state: form.state,
            country: form.country,
          }),
        });
      } catch (error) {
        updated = await apiFetch("/profile", {
          method: "PUT",
          body: JSON.stringify({
            name:
              form.name ||
              form.full_name,
            phone: form.phone,
            city: form.city,
            state: form.state,
            country: form.country,
          }),
        });
      }

      if (updated && typeof updated === "object") {
        setProfile({
          ...profile,
          ...updated,
        });
      } else {
        setProfile({
          ...profile,
          ...form,
        });
      }

      closePopups();

      loadProfile();
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      alert("Unable to update profile.");
    }
  };

  return (
    <div className="profile-page">

      {/* ================= HEADER ================= */}

      <div className="profile-header">

        <div className="profile-header-left">

          <button
            className="profile-back-btn"
            onClick={() =>
              window.history.back()
            }
          >
            <MdArrowBack />
            <span>Back</span>
          </button>

          <div>

            <div className="profile-title-row">

              <h1>Employee Profile</h1>

              <span className="profile-live-badge">
                <span></span>
                HR Management
              </span>

            </div>

            <p>
              View and manage employee profile
              information.
            </p>

          </div>

        </div>

        <div className="profile-header-actions">

          <button
            className="profile-refresh-btn"
            onClick={loadProfile}
            disabled={loading}
          >
            <MdRefresh
              className={
                loading
                  ? "profile-refresh-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

      </div>

      {/* ================= PROFILE CARD ================= */}

      <div className="profile-main-card">

        <div className="profile-top-section">

          <div className="profile-large-avatar">
            {getName()
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="profile-main-info">

            <h2>{getName()}</h2>

            <p>
              Employee #{getEmployeeId()}
            </p>

            <span className="profile-active-badge">
              <span></span>
              Active Employee
            </span>

          </div>

          <div className="profile-top-actions">

            <button
              className="profile-view-btn"
              onClick={openView}
            >
              <MdVisibility />
              View
            </button>

            <button
              className="profile-edit-btn"
              onClick={openEdit}
            >
              <MdEdit />
              Edit
            </button>

          </div>

        </div>

        {/* ================= PROFILE DETAILS ================= */}

        <div className="profile-details-grid">

          <div className="profile-detail-card">

            <div className="profile-detail-icon blue">
              <MdBadge />
            </div>

            <div>
              <span>Employee ID</span>

              <strong>
                {getEmployeeId()}
              </strong>
            </div>

          </div>

          <div className="profile-detail-card">

            <div className="profile-detail-icon green">
              <MdPerson />
            </div>

            <div>
              <span>Full Name</span>

              <strong>
                {getName()}
              </strong>
            </div>

          </div>

          <div className="profile-detail-card">

            <div className="profile-detail-icon purple">
              <MdEmail />
            </div>

            <div>
              <span>Email</span>

              <strong>
                {getEmail()}
              </strong>
            </div>

          </div>

          <div className="profile-detail-card">

            <div className="profile-detail-icon orange">
              <MdPhone />
            </div>

            <div>
              <span>Phone</span>

              <strong>
                {getPhone()}
              </strong>
            </div>

          </div>

          <div className="profile-detail-card full">

            <div className="profile-detail-icon blue">
              <MdLocationCity />
            </div>

            <div>
              <span>Location</span>

              <strong>
                {getLocation()}
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* ================= VIEW POPUP ================= */}

      {showView && (

        <div
          className="profile-modal-overlay"
          onClick={closePopups}
        >

          <div
            className="profile-modal profile-view-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="profile-modal-header">

              <div>

                <div className="profile-modal-icon view">
                  <MdVisibility />
                </div>

                <div>

                  <h2>
                    Profile Details
                  </h2>

                  <p>
                    View complete employee
                    information.
                  </p>

                </div>

              </div>

              <button
                className="profile-modal-close"
                onClick={closePopups}
              >
                <MdClose />
              </button>

            </div>

            <div className="profile-view-top">

              <div className="profile-view-avatar">
                {getName()
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <h3>{getName()}</h3>

              <span>
                Employee #{getEmployeeId()}
              </span>

            </div>

            <div className="profile-view-details">

              <div className="profile-view-detail">

                <span>
                  Employee ID
                </span>

                <strong>
                  {getEmployeeId()}
                </strong>

              </div>

              <div className="profile-view-detail">

                <span>
                  Full Name
                </span>

                <strong>
                  {getName()}
                </strong>

              </div>

              <div className="profile-view-detail">

                <span>
                  Email
                </span>

                <strong>
                  {getEmail()}
                </strong>

              </div>

              <div className="profile-view-detail">

                <span>
                  Phone
                </span>

                <strong>
                  {getPhone()}
                </strong>

              </div>

              <div className="profile-view-detail full">

                <span>
                  Location
                </span>

                <strong>
                  {getLocation()}
                </strong>

              </div>

            </div>

            <div className="profile-modal-footer">

              <button
                className="profile-cancel-btn"
                onClick={closePopups}
              >
                Close
              </button>

              <button
                className="profile-edit-main-btn"
                onClick={() => {
                  setShowView(false);
                  openEdit();
                }}
              >
                <MdEdit />
                Edit Profile
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ================= EDIT POPUP ================= */}

      {showEdit && (

        <div
          className="profile-modal-overlay"
          onClick={closePopups}
        >

          <div
            className="profile-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="profile-modal-header">

              <div>

                <div className="profile-modal-icon edit">
                  <MdEdit />
                </div>

                <div>

                  <h2>
                    Edit Profile
                  </h2>

                  <p>
                    Update your profile
                    information.
                  </p>

                </div>

              </div>

              <button
                className="profile-modal-close"
                onClick={closePopups}
              >
                <MdClose />
              </button>

            </div>

            <form
              className="profile-edit-form"
              onSubmit={handleEdit}
            >

              <div className="profile-form-grid">

                <div className="profile-form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      form.name ||
                      form.full_name ||
                      ""
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter full name"
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    value={
                      form.email || ""
                    }
                    disabled
                  />

                  <small>
                    Email cannot be changed.
                  </small>

                </div>

                <div className="profile-form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={
                      form.phone || ""
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter phone number"
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      form.city || ""
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter city"
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={
                      form.state || ""
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter state"
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    Country
                  </label>

                  <input
                    type="text"
                    name="country"
                    value={
                      form.country || ""
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter country"
                  />

                </div>

              </div>

              <div className="profile-modal-footer">

                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={closePopups}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-btn"
                >
                  <MdSave />
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Profile;