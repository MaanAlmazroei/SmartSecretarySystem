import React, { useState } from "react";
import "./Appointments.css";

const Appointments = () => {
  const initialAppointmentState = {
    title: "",
    date: "",
    time: "",
    description: "",
    status: "Scheduled",
  };

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  const [appointment, setAppointment] = useState({ ...initialAppointmentState });
  const [errors, setErrors] = useState({});
  const [appointmentsList, setAppointmentsList] = useState([
    {
      id: "1",
      title: "Academic Advising",
      date: "2025-04-23",
      time: "10:00 AM",
      status: "Scheduled",
      description: "Discuss course registration and academic planning.",
      createdAt: "2025-04-15T10:30:00",
    },
    {
      id: "2",
      title: "Graduation Check",
      date: "2025-04-18",
      time: "01:30 PM",
      status: "Completed",
      description: "Verify eligibility for graduation.",
      createdAt: "2025-04-10T14:15:00",
      updatedAt: "2025-04-18T13:45:00",
    },
  ]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!appointment.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!appointment.date) {
      newErrors.date = "Date is required";
    }

    if (!appointment.time) {
      newErrors.time = "Time is required";
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
      time: time,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const now = new Date().toISOString();
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };

    setAppointmentsList([newAppointment, ...appointmentsList]);
    setAppointment({ ...initialAppointmentState });
    setSelectedAppointmentId(null);
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
              <p>No appointments found. Create a new appointment to get started.</p>
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
                      className={`appointment-status ${getStatusClass(a.status)}`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="appointment-dates">
                    <span>Date: {a.date} at {a.time}</span>
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
                <span
                  className={`appointment-status ${getStatusClass(appointment.status)}`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="detail-metadata">
                <div className="metadata-item">
                  <span className="label">Date:</span>
                  <span>{appointment.date}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Time:</span>
                  <span>{appointment.time}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Created on:</span>
                  <span>{formatDate(appointment.createdAt)}</span>
                </div>
                {appointment.createdAt !== appointment.updatedAt && (
                  <div className="metadata-item">
                    <span className="label">Last updated:</span>
                    <span>{formatDate(appointment.updatedAt)}</span>
                  </div>
                )}
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
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={appointment.date}
                  onChange={handleInputChange}
                  className={`form-control ${errors.date ? "error" : ""}`}
                />
                {errors.date && (
                  <p className="error-message">{errors.date}</p>
                )}
              </div>
              
              <div className="form-group">
                <label>Time Slot *</label>
                <div className="time-slots-container">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className={`time-slot ${appointment.time === time ? "selected" : ""}`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </div>
                  ))}
                </div>
                {errors.time && (
                  <p className="error-message">{errors.time}</p>
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