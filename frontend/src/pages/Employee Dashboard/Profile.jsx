


import React, { useEffect, useState } from "react";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdBadge,
  MdEdit,
  MdVisibility,
  MdRefresh,
  MdArrowBack,
  MdClose,
  MdSave,
} from "react-icons/md";
import { apiFetch } from "../../api";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "",
    employee_id: "",
  });

  const loadProfile = async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/profile/me");

      setProfile(data);

      setFormData({
        name: data?.name || "",
        email: data?.email || "",
        phone: data?.phone || "",
        city: data?.city || "",
        state: data?.state || "",
        country: data?.country || "",
        employee_id: data?.employee_id || data?.id || "",
      });
    } catch (error) {
      console.error("Profile loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const updated = await apiFetch("/profile/me", {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          country: formData.country,
        }),
      });

      setProfile(updated);

      setFormData({
        name: updated?.name || "",
        email: updated?.email || "",
        phone: updated?.phone || "",
        city: updated?.city || "",
        state: updated?.state || "",
        country: updated?.country || "",
        employee_id: updated?.employee_id || updated?.id || "",
      });

      setShowEdit(false);
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Profile update failed");
    }
  };

  const getLocation = () => {
    const location = [
      profile?.city,
      profile?.state,
      profile?.country,
    ].filter(Boolean);

    return location.length ? location.join(", ") : "Not Available";
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">

        <div>
          <button
            className="profile-back-btn"
            onClick={() => window.history.back()}
          >
            <MdArrowBack />
            Back
          </button>

          <h1>My Profile</h1>
          <p>View and manage your employee profile</p>
        </div>

        <button
          className="profile-refresh-btn"
          onClick={loadProfile}
        >
          <MdRefresh />
          Refresh
        </button>

      </div>

      {/* PROFILE TOP CARD */}
      <div className="profile-main-card">

        <div className="profile-avatar">
          <MdPerson />
        </div>

        <div className="profile-main-info">
          <h2>{profile?.name || "Employee"}</h2>
          <p>{profile?.email || "Email not available"}</p>

          <span className="profile-active-badge">
            Active Employee
          </span>
        </div>

        <div className="profile-main-actions">

          <button
            className="profile-view-btn"
            onClick={() => setShowView(true)}
          >
            <MdVisibility />
            View
          </button>

          <button
            className="profile-edit-btn"
            onClick={() => setShowEdit(true)}
          >
            <MdEdit />
            Edit
          </button>

        </div>

      </div>

      {/* SUMMARY CARDS */}
      <div className="profile-summary-grid">

        <div className="profile-summary-card blue">
          <div className="profile-summary-icon">
            <MdBadge />
          </div>
          <div>
            <span>Employee ID</span>
            <strong>
              {profile?.employee_id || profile?.id || "N/A"}
            </strong>
          </div>
        </div>

        <div className="profile-summary-card green">
          <div className="profile-summary-icon">
            <MdEmail />
          </div>
          <div>
            <span>Email</span>
            <strong>
              {profile?.email || "N/A"}
            </strong>
          </div>
        </div>

        <div className="profile-summary-card orange">
          <div className="profile-summary-icon">
            <MdPhone />
          </div>
          <div>
            <span>Phone</span>
            <strong>
              {profile?.phone || "N/A"}
            </strong>
          </div>
        </div>

        <div className="profile-summary-card purple">
          <div className="profile-summary-icon">
            <MdLocationOn />
          </div>
          <div>
            <span>Location</span>
            <strong>
              {getLocation()}
            </strong>
          </div>
        </div>

      </div>

      {/* PROFILE DETAILS */}
      <div className="profile-details-card">

        <div className="profile-section-title">
          <div>
            <h2>Personal Information</h2>
            <p>Your employee account details</p>
          </div>

          <button
            className="small-edit-btn"
            onClick={() => setShowEdit(true)}
          >
            <MdEdit />
            Edit
          </button>
        </div>

        <div className="profile-details-grid">

          <div className="profile-detail-item">
            <span>Full Name</span>
            <strong>
              <MdPerson />
              {profile?.name || "Not Available"}
            </strong>
          </div>

          <div className="profile-detail-item">
            <span>Email Address</span>
            <strong>
              <MdEmail />
              {profile?.email || "Not Available"}
            </strong>
          </div>

          <div className="profile-detail-item">
            <span>Phone Number</span>
            <strong>
              <MdPhone />
              {profile?.phone || "Not Available"}
            </strong>
          </div>

          <div className="profile-detail-item">
            <span>Employee ID</span>
            <strong>
              <MdBadge />
              {profile?.employee_id || profile?.id || "Not Available"}
            </strong>
          </div>

          <div className="profile-detail-item">
            <span>City</span>
            <strong>
              <MdLocationOn />
              {profile?.city || "Not Available"}
            </strong>
          </div>

          <div className="profile-detail-item">
            <span>State</span>
            <strong>
              <MdLocationOn />
              {profile?.state || "Not Available"}
            </strong>
          </div>

          <div className="profile-detail-item">
            <span>Country</span>
            <strong>
              <MdLocationOn />
              {profile?.country || "Not Available"}
            </strong>
          </div>

        </div>

      </div>

      {/* VIEW POPUP */}
      {showView && profile && (
        <div
          className="profile-modal-overlay"
          onClick={() => setShowView(false)}
        >
          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="profile-modal-header">
              <div>
                <h2>Profile Details</h2>
                <p>Employee information</p>
              </div>

              <button
                className="modal-close-btn"
                onClick={() => setShowView(false)}
              >
                <MdClose />
              </button>
            </div>

            <div className="profile-view-grid">

              <div>
                <span>Employee ID</span>
                <strong>
                  {profile.employee_id || profile.id || "N/A"}
                </strong>
              </div>

              <div>
                <span>Name</span>
                <strong>
                  {profile.name || "N/A"}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {profile.email || "N/A"}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {profile.phone || "N/A"}
                </strong>
              </div>

              <div>
                <span>City</span>
                <strong>
                  {profile.city || "N/A"}
                </strong>
              </div>

              <div>
                <span>State</span>
                <strong>
                  {profile.state || "N/A"}
                </strong>
              </div>

              <div>
                <span>Country</span>
                <strong>
                  {profile.country || "N/A"}
                </strong>
              </div>

            </div>

            <div className="profile-modal-footer">
              <button
                className="modal-cancel-btn"
                onClick={() => setShowView(false)}
              >
                Close
              </button>

              <button
                className="modal-edit-btn"
                onClick={() => {
                  setShowView(false);
                  setShowEdit(true);
                }}
              >
                <MdEdit />
                Edit Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT POPUP */}
      {showEdit && (
        <div
          className="profile-modal-overlay"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="profile-modal edit-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="profile-modal-header">
              <div>
                <h2>Edit Profile</h2>
                <p>Update your personal information</p>
              </div>

              <button
                className="modal-close-btn"
                onClick={() => setShowEdit(false)}
              >
                <MdClose />
              </button>
            </div>

            <div className="profile-form-grid">

              <div className="profile-form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <MdPerson />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Email</label>
                <div className="input-with-icon disabled-input">
                  <MdEmail />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Phone</label>
                <div className="input-with-icon">
                  <MdPhone />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Employee ID</label>
                <div className="input-with-icon disabled-input">
                  <MdBadge />
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    disabled
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>City</label>
                <div className="input-with-icon">
                  <MdLocationOn />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>State</label>
                <div className="input-with-icon">
                  <MdLocationOn />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Country</label>
                <div className="input-with-icon">
                  <MdLocationOn />
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>

            </div>

            <div className="profile-modal-footer">

              <button
                className="modal-cancel-btn"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>

              <button
                className="modal-save-btn"
                onClick={handleSave}
              >
                <MdSave />
                Save Changes
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
