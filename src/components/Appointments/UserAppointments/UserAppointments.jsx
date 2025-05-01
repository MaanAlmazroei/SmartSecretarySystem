import React, { useState, useEffect } from "react";
import "./UserAppointments.css";
import {
  createAppointment,
  getUserAllAppointments,
  checkAuth,
} from "../../../services/ApiService";
import { useAuth } from "../../../Context/AuthContext";

const UserAppointments = () => {
  const initialAppointmentState = {
    title: "",
    appointmentDate: "",
    appointmentTime: "",
    description: "",
    status: "In Progress",
    feedback: "",
    createdAt: "",
    lastUpdatedDate: "",
  };

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  const [appointment, setAppointment] = useState({
    ...initialAppointmentState,
  });
  const [errors, setErrors] = useState({});
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const { user } = useAuth();

  const fetchAppointments = async () => {
    if (user?.uid) {
      try {
        const response = await getUserAllAppointments(user.uid);
        if (response.error) {
          throw new Error(response.error);
        }
        setAppointmentsList(response);
      } catch (error) {
        console.error("Error fetching appointments:", error.message);
      }
    } else {
      setAppointmentsList([]);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user?.uid]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await checkAuth();
        if (response.error) {
          console.error("Authentication error:", response.error);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };
    checkAuthStatus();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!appointment.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!appointment.appointmentDate) {
      newErrors.appointmentDate = "Date is required";
    }
    if (!appointment.appointmentTime) {
      newErrors.appointmentTime = "Time is required";
    }
    if (!appointment.description.trim()) {
      newErrors.description = "Description is required";
    } else if (appointment.description.length < 10) {
      newErrors.description = "Description should be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTimeSelect = (time) => {
    setAppointment((prev) => ({
      ...prev,
      appointmentTime: time,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const now = new Date().toISOString();

    if (!user) {
      console.error("No user logged in.");
      return;
    }

    try {
      const response = await createAppointment({
        ...appointment,
        createdAt: now,
        lastUpdatedDate: now,
        userId: user.uid,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await fetchAppointments();
      setAppointment({ ...initialAppointmentState });
      setSelectedAppointmentId(null);
    } catch (error) {
      console.error("Error creating appointment:", error.message);
    }
  };

  const selectAppointment = (id) => {
    const selected = appointmentsList.find((a) => a.id === id);
    if (selected) {
      setAppointment(selected);
      setSelectedAppointmentId(id);
    }
  };

  const handleCancel = () => {
    setAppointment({ ...initialAppointmentState });
    setSelectedAppointmentId(null);
    setErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "In Progress":
        return "UserAppointments-status-in-progress";
      case "Approved":
        return "UserAppointments-status-approved";
      case "Rejected":
        return "UserAppointments-status-rejected";
      default:
        return "";
    }
  };

  return (
    <div className="UserAppointments-container">
      <header className="UserAppointments-header">
        <h1>Appointments Management</h1>
        <p>Schedule and track appointments</p>
      </header>

      <div className="UserAppointments-main">
        {/* Left Panel: Appointment List and New Appointment Button */}
        <section className="UserAppointments-list-section">
          <div className="UserAppointments-section-header">
            <h2>Your Appointments</h2>
            <button
              className="UserAppointments-new-appointment-btn"
              onClick={() => {
                setAppointment({ ...initialAppointmentState });
                setSelectedAppointmentId(null);
              }}
            >
              <span>+</span> New Appointment
            </button>
          </div>

          {appointmentsList.length === 0 ? (
            <div className="UserAppointments-no-appointments">
              <p>No appointments found. Create a new appointment to get started.</p>
            </div>
          ) : (
            <div className="UserAppointments-list">
              {appointmentsList.map((a) => (
                <div
                  key={a.id}
                  className={`UserAppointments-item ${
                    selectedAppointmentId === a.id ? "UserAppointments-selected" : ""
                  }`}
                  onClick={() => selectAppointment(a.id)}
                >
                  <div className="UserAppointments-item-header">
                    <h3>{a.title}</h3>
                    <span
                      className={`UserAppointments-status ${getStatusClass(a.status)}`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="UserAppointments-dates">
                    <span>Created: {formatDate(a.createdAt)}</span>
                    {a.createdAt !== a.lastUpdatedDate && (
                      <span>Updated: {formatDate(a.lastUpdatedDate)}</span>
                    )}
                  </div>
                  <p className="UserAppointments-description">
                    {a.description.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Panel: Appointment Detail View */}
        <section className="UserAppointments-detail-section">
          {selectedAppointmentId ? (
            <div>
              <div className="UserAppointments-detail-header">
                <h2>{appointment.title}</h2>
                <span
                  className={`UserAppointments-status ${getStatusClass(appointment.status)}`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="UserAppointments-detail-metadata">
                <div className="UserAppointments-metadata-item">
                  <span className="UserAppointments-label">Scheduled for:</span>
                  <span>
                    {appointment.appointmentDate} at {appointment.appointmentTime}
                  </span>
                </div>
                <div className="UserAppointments-metadata-item">
                  <span className="UserAppointments-label">Created on:</span>
                  <span>{formatDate(appointment.createdAt)}</span>
                </div>
                {appointment.createdAt !== appointment.lastUpdatedDate && (
                  <div className="UserAppointments-metadata-item">
                    <span className="UserAppointments-label">Last updated:</span>
                    <span>{formatDate(appointment.lastUpdatedDate)}</span>
                  </div>
                )}
              </div>

              <div className="UserAppointments-detail-description">
                <h3>Description</h3>
                <p>{appointment.description}</p>
              </div>

              {appointment.feedback && (
                <div className="UserAppointments-detail-feedback">
                  <h3>Feedback</h3>
                  <p>{appointment.feedback}</p>
                </div>
              )}

              <div className="UserAppointments-detail-actions">
                <button onClick={handleCancel}>Close</button>
              </div>
            </div>
          ) : (
            <form className="UserAppointments-form" onSubmit={handleSubmit}>
              <div className="UserAppointments-form-group">
                <label htmlFor="title">Appointment Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={appointment.title}
                  onChange={handleInputChange}
                  className={`UserAppointments-form-control ${errors.title ? "UserAppointments-error" : ""}`}
                />
                {errors.title && (
                  <span className="UserAppointments-error-message">{errors.title}</span>
                )}
              </div>

              <div className="UserAppointments-form-group">
                <label htmlFor="appointmentDate">Date *</label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={appointment.appointmentDate}
                  onChange={handleInputChange}
                  className={`UserAppointments-form-control ${
                    errors.appointmentDate ? "UserAppointments-error" : ""
                  }`}
                />
                {errors.appointmentDate && (
                  <span className="UserAppointments-error-message">
                    {errors.appointmentDate}
                  </span>
                )}
              </div>

              <div className="UserAppointments-form-group">
                <label>Time Slot *</label>
                <div className="UserAppointments-time-slots-container">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className={`UserAppointments-time-slot ${
                        appointment.appointmentTime === time ? "UserAppointments-selected" : ""
                      }`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </div>
                  ))}
                </div>
                {errors.appointmentTime && (
                  <span className="UserAppointments-error-message">
                    {errors.appointmentTime}
                  </span>
                )}
              </div>

              <div className="UserAppointments-form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={appointment.description}
                  onChange={handleInputChange}
                  className={`UserAppointments-form-control ${
                    errors.description ? "UserAppointments-error" : ""
                  }`}
                  rows="5"
                />
                {errors.description && (
                  <span className="UserAppointments-error-message">{errors.description}</span>
                )}
              </div>

              <div className="UserAppointments-form-actions">
                <button type="submit" className="UserAppointments-submit-btn">
                  Schedule Appointment
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserAppointments;