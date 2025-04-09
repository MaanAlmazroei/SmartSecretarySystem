import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const location = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState({
    name: "Name",
    email: "example@example.com",
    phone: "123456789",
    role: "User",
    password: "",
  });
  const [settings, setSettings] = useState({
    notifications: true,
    language: "English",
  });

  // Sync activeTab with current route
  useEffect(() => {
    if (location.pathname.includes("settings")) {
      setActiveTab("settings");
    } else {
      setActiveTab("overview");
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    setEditMode(false);
    console.log("Profile updated:", userData);
    console.log("Settings updated:", settings);
    // Here you would typically send data to your backend
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-actions">
          {editMode ? (
            <>
              <button className="save-btn" onClick={handleSave}>
                Save Profile
              </button>
              <button className="cancel-btn" onClick={() => setEditMode(false)}>
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
            <h3>{userData.name}</h3>
            <p>{userData.role}</p>
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
          </nav>
        </div>

        <div className="profile-details">
          {activeTab === "settings" ? (
            <div className="settings-section">
              <h2>Account Settings</h2>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={settings.notifications}
                    onChange={handleSettingsChange}
                  />
                  Email Notifications
                </label>
              </div>
              <div className="setting-item">
                <label>Language</label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleSettingsChange}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="detail-section">
              <h2>Personal Information</h2>
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
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={userData.password}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
