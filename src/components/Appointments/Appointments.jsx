import React, { useState, useEffect } from "react";
import "./Appointments.css";
import { currentUser } from "../../services/FirebaseAuth";
import {
  getUserAllAppointments,
  createAppointment,
} from "../../services/FirebaseDB";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/FirebaseConfig";

const Appointments = () => {
  const initialAppointmentState = {
    appointmentDate: "",
    status: "Scheduled",
    reason: "",
    lastUpdated: "",
  };

  const [appointment, setAppointment] = useState({
    ...initialAppointmentState,
  });
  const [errors, setErrors] = useState({});
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(currentUser());

  const fetchAppointments = async () => {
    if (currentUserId) {
      try {
        const appointments = await getUserAllAppointments(currentUserId);
        setAppointmentsList(appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error.message);
      }
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUserId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!appointment.appointmentDate.trim()) {
      newErrors.appointmentDate = "Appointment date is required";
    }

    if (!appointment.reason.trim()) {
      newErrors.reason = "Reason is required";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const now = new Date().toISOString();

    try {
      await createAppointment(
        {
          ...appointment,
          lastUpdated: now,
        },
        currentUserId
      );
      await fetchAppointments();
      setAppointment({ ...initialAppointmentState });
      setSelectedAppointmentId(null);
    } catch (error) {
      console.error("Error saving appointment:", error.message);
    }
  };

  const selectAppointment = (id) => {
    const selected = appointmentsList.find((a) => a.id === id);
    if (selected) {
      setAppointment({ ...selected });
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

  return (
    <div className="appointments-container">
      <header className="appointments-header">
        <h1>Appointments Management</h1>
        <p>Manage your appointments</p>
      </header>

      <div className="appointments-main">
        {/* Left Panel: Appointment List and Booking Button */}
        <section className="appointments-list-section">
          <div className="section-header">
            <h2>Your Appointments</h2>
            <button
              className="new-appointment-btn"
              onClick={() => {
                setAppointment({ ...initialAppointmentState });
                setSelectedAppointmentId(null);
              }}
            >
              <span>+</span> New Appointment
            </button>
          </div>

          {appointmentsList.length === 0 ? (
            <div className="no-appointments">
              <p>
                No appointments found. Create a new appointment to get started.
              </p>
            </div>
          ) : (
            <div className="appointments-list">
              {appointmentsList.map((a) => (
                <div
                  key={a.id}
                  className={`appointment-item ${
                    selectedAppointmentId === a.id ? "selected" : ""
                  }`}
                  onClick={() => selectAppointment(a.id)}
                >
                  <div className="appointment-header">
                    <h3>Appointment</h3>
                  </div>
                  <div className="appointment-dates">
                    <span>Scheduled: {formatDate(a.appointmentDate)}</span>
                    <span>Status: {a.status}</span>
                  </div>
                  <p className="appointment-reason">
                    {a.reason.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Panel: Appointment Detail View */}
        <section className="appointment-detail-section">
          {selectedAppointmentId ? (
            <div className="appointment-detail">
              <div className="detail-header">
                <h2>Appointment Details</h2>
              </div>

              <div className="detail-metadata">
                <div className="metadata-item">
                  <span className="label">Appointment Date:</span>
                  <span>{formatDate(appointment.appointmentDate)}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Status:</span>
                  <span>{appointment.status}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Last Updated:</span>
                  <span>{formatDate(appointment.lastUpdated)}</span>
                </div>
              </div>

              <div className="detail-description">
                <h3>Reason</h3>
                <p>{appointment.reason}</p>
              </div>

              <div className="detail-actions">
                <button onClick={handleCancel}>Close</button>
              </div>
            </div>
          ) : (
            <form className="appointment-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="appointmentDate">Appointment Date *</label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={appointment.appointmentDate}
                  onChange={handleInputChange}
                  className={`form-control ${
                    errors.appointmentDate ? "error" : ""
                  }`}
                />
                {errors.appointmentDate && (
                  <p className="error-message">{errors.appointmentDate}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={appointment.status}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="reason">Reason *</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={appointment.reason}
                  onChange={handleInputChange}
                  className={`form-control ${errors.reason ? "error" : ""}`}
                />
                {errors.reason && (
                  <p className="error-message">{errors.reason}</p>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Save Appointment
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default Appointments;
