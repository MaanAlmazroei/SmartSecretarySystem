import React, { useState, useEffect } from "react";
import "./Appointments.css";
import {
  createAppointment,
  getUserAllAppointments,
} from "../../services/FirebaseDB";
import { currentUser } from "../../services/FirebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/FirebaseConfig";

const Appointments = () => {
  const initialAppointmentState = {
    title: "",
    appointmentDate: "",
    appointmentTime: "",
    description: "",
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

    if (!currentUserId) {
      console.error("No user logged in.");
      return;
    }

    try {
      await createAppointment(
        {
          title: appointment.title,
          description: appointment.description,
          appointmentTime: appointment.appointmentTime,
          appointmentDate: appointment.appointmentDate,
          status: "Scheduled",
          feedback: "",
          lastUpdatedDate: now,
          createdAt: now,
          userId: currentUserId,
        },
        currentUserId
      );

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
      setAppointment({
        title: selected.title,
        description: selected.description,
        appointmentTime: selected.appointmentTime,
        appointmentDate: selected.appointmentDate,
      });
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
      case "Scheduled":
        return "status-scheduled";
      case "Completed":
        return "status-completed";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  return (
    <div className="appointments-container">
      <header className="appointments-header">
        <h1>Appointments Management</h1>
        <p>Schedule and track appointments</p>
      </header>

      <div className="appointments-main">
        {/* Left Panel: Appointment List and New Appointment Button */}
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
                    <h3>{a.title}</h3>
                    <span
                      className={`appointment-status ${getStatusClass(
                        a.status
                      )}`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="appointment-dates">
                    <span>Created: {formatDate(a.createdAt)}</span>
                  </div>
                  <p className="appointment-description">
                    {a.description.substring(0, 100)}
                    {a.description.length > 100 ? "..." : ""}
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
                <h2>{appointment.title}</h2>
              </div>

              <div className="detail-metadata">
                <div className="metadata-item">
                  <span className="label">Date:</span>
                  <span>{appointment.appointmentDate}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Time:</span>
                  <span>{appointment.appointmentTime}</span>
                </div>
              </div>

              <div className="detail-description">
                <h3>Description</h3>
                <p>{appointment.description}</p>
              </div>

              <div className="detail-actions">
                <button onClick={handleCancel}>Close</button>
              </div>
            </div>
          ) : (
            <form className="appointment-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Appointment Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={appointment.title}
                  onChange={handleInputChange}
                  className={`form-control ${errors.title ? "error" : ""}`}
                />
                {errors.title && (
                  <p className="error-message">{errors.title}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="appointmentDate">Date *</label>
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
                <label>Time Slot *</label>
                <div className="time-slots-container">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className={`time-slot ${
                        appointment.appointmentTime === time ? "selected" : ""
                      }`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </div>
                  ))}
                </div>
                {errors.appointmentTime && (
                  <p className="error-message">{errors.appointmentTime}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={appointment.description}
                  onChange={handleInputChange}
                  className={`form-control ${
                    errors.description ? "error" : ""
                  }`}
                />
                {errors.description && (
                  <p className="error-message">{errors.description}</p>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Schedule
                </button>
                <button
                  type="button"
                  className="clear-btn"
                  onClick={handleCancel}
                >
                  Clear
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
