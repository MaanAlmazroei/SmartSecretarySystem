import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../services/FirebaseAuth";
import { getUser, updateUser } from "../../services/ApiService";
import "./Profile.css";

const Profile = () => {
  const location = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [settings, setSettings] = useState({
    notifications: true,
    language: "English",
  });

  useEffect(() => {
    if (location.pathname.includes("settings")) {
      setActiveTab("settings");
    } else {
      setActiveTab("overview");
    }
  }, [location]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          throw new Error("No user logged in");
        }

        // Get email from Firebase Auth
        const email = currentUser.email;

        // Get other user data from our API
        const response = await getUser(currentUser.uid);
        if (response.error) {
          throw new Error(response.error);
        }

        setUserData({
          firstName: response.firstName || "",
          lastName: response.lastName || "",
          email: email || "",
          phone: response.phone || "",
          password: "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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

  const handleSave = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error("No user logged in");
      }

      const response = await updateUser(currentUser.uid, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        password: userData.password || undefined,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setEditMode(false);
      setUserData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="profile-container">Error: {error}</div>;
  }

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
            <h3>{`${userData.firstName} ${userData.lastName}`}</h3>
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
                </select>
              </div>
            </div>
          ) : (
            <div className="detail-section">
              <h2>Personal Information</h2>
              {editMode ? (
                <>
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      disabled
                      className="disabled-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      required
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
                    <strong>Name:</strong>{" "}
                    {`${userData.firstName} ${userData.lastName}`}
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
