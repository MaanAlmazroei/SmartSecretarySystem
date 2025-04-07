import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    department: "IT Support",
    position: "Senior Technician",
    bio: "IT professional with 5+ years of experience in system administration and user support.",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setEditMode(false);
    // Here you would typically send data to your backend
    console.log("Profile updated:", userData);
  };

  return (
    <main>
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <div className="profile-actions">
            {editMode ? (
              <>
                <button className="save-btn" onClick={handleSave}>
                  Save Profile
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button className="edit-btn" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-avatar">
              <div className="avatar-circle">
                <span>{userData.name.charAt(0)}</span>
              </div>
              <h3>{userData.name}</h3>
              <p>{userData.position}</p>
            </div>

            <nav className="profile-nav">
              <NavLink
                to="/profile"
                end
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Overview
              </NavLink>
              <NavLink
                to="/profile/settings"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Settings
              </NavLink>
              <NavLink
                to="/profile/tickets"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                My Tickets
              </NavLink>
              <NavLink
                to="/profile/appointments"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Appointments
              </NavLink>
            </nav>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h3>Personal Information</h3>
              {editMode ? (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>Name:</strong> {userData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {userData.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {userData.phone}
                  </p>
                </>
              )}
            </div>

            <div className="detail-section">
              <h3>Professional Information</h3>
              {editMode ? (
                <>
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={userData.department}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      name="position"
                      value={userData.position}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>Department:</strong> {userData.department}
                  </p>
                  <p>
                    <strong>Position:</strong> {userData.position}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
