import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
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
  const { user } = useAuth();

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
        if (!user) {
          throw new Error("No user logged in");
        }

        // Get user data from our API
        const response = await getUser(user.uid);
        if (response.error) {
          throw new Error(response.error);
        }

        setUserData({
          firstName: response.firstName || "",
          lastName: response.lastName || "",
          email: user.email || "",
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
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUser(user.uid, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setEditMode(false);
    } catch (error) {
      console.error("Error updating user data:", error);
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="profile-container">
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
            <div className="overview-section">
              <div className="profile-header">
                <h2>Profile Overview</h2>
                <button
                  className="edit-button"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </div>

                {editMode && (
                  <div className="form-actions">
                    <button type="submit" className="save-button">
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
