import React, { useState, useEffect, useCallback } from "react";
import "./UserAppointments.css";
import {
  createAppointment,
  getUserAllAppointments,
  checkAuth,
  checkTimeSlotAvailability,
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
  const [bookedTimeSlots, setBookedTimeSlots] = useState({});

  const fetchAppointments = useCallback(async () => {
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
  }, [user?.uid]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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

  const checkAvailability = async (date, time) => {
    try {
      const response = await checkTimeSlotAvailability(date, time);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.isAvailable;
    } catch (error) {
      console.error("Error checking time slot availability:", error.message);
      return false;
    }
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Add one day to get tomorrow's date
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isTimeSlotInPast = (date, time) => {
    if (!date || !time) return false;

    const today = new Date();
    const appointmentDate = new Date(date);

    // Compare dates first
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const selectedDate = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate()
    );

    // If the selected date is before today, all slots are passed
    if (selectedDate < todayDate) {
      return true;
    }
    // If the selected date is after today, no slots are passed
    if (selectedDate > todayDate) {
      return false;
    }

    // For today's date, check if the time slot is in the past
    const [hours, minutes] = time.split(":");
    const [timeValue, period] = minutes.split(" ");
    let hour = parseInt(hours);

    // Convert to 24-hour format
    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    const minute = parseInt(timeValue);
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    // Compare hours and minutes
    if (hour < currentHour) {
      return true;
    } else if (hour === currentHour && minute < currentMinute) {
      return true;
    }

    return false;
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setAppointment((prev) => ({ ...prev, appointmentDate: date }));

    // Reset time slot selection when date changes
    setAppointment((prev) => ({ ...prev, appointmentTime: "" }));

    // Check availability for all time slots for the selected date
    const availabilityPromises = timeSlots.map((time) =>
      checkAvailability(date, time)
    );

    const availabilities = await Promise.all(availabilityPromises);
    const bookedSlots = {};
    timeSlots.forEach((time, index) => {
      bookedSlots[time] =
        !availabilities[index] || isTimeSlotInPast(date, time);
    });
    setBookedTimeSlots(bookedSlots);
  };

  const handleTimeSelect = async (time) => {
    if (bookedTimeSlots[time]) return;

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
        setErrors({ ...errors, timeSlot: response.error });
        return;
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
      setBookedTimeSlots({});
    }
  };

  const handleCancel = () => {
    setAppointment({ ...initialAppointmentState });
    setSelectedAppointmentId(null);
    setErrors({});
    setBookedTimeSlots({});
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
                setBookedTimeSlots({});
              }}
            >
              <span>+</span> New Appointment
            </button>
          </div>

          {appointmentsList.length === 0 ? (
            <div className="UserAppointments-no-appointments">
              <p>
                No appointments found. Create a new appointment to get started.
              </p>
            </div>
          ) : (
            <div className="UserAppointments-list">
              {appointmentsList.map((a) => (
                <div
                  key={a.id}
                  className={`UserAppointments-item ${
                    selectedAppointmentId === a.id
                      ? "UserAppointments-selected"
                      : ""
                  }`}
                  onClick={() => selectAppointment(a.id)}
                >
                  <div className="UserAppointments-item-header">
                    <h3>{a.title}</h3>
                    <span
                      className={`UserAppointments-status ${getStatusClass(
                        a.status
                      )}`}
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
                  className={`UserAppointments-status ${getStatusClass(
                    appointment.status
                  )}`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="UserAppointments-detail-metadata">
                <div className="UserAppointments-metadata-item">
                  <span className="UserAppointments-label">Scheduled for:</span>
                  <span>
                    {appointment.appointmentDate} at{" "}
                    {appointment.appointmentTime}
                  </span>
                </div>
                <div className="UserAppointments-metadata-item">
                  <span className="UserAppointments-label">Created on:</span>
                  <span>{formatDate(appointment.createdAt)}</span>
                </div>
                {appointment.createdAt !== appointment.lastUpdatedDate && (
                  <div className="UserAppointments-metadata-item">
                    <span className="UserAppointments-label">
                      Last updated:
                    </span>
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
                  className={`UserAppointments-form-control ${
                    errors.title ? "UserAppointments-error" : ""
                  }`}
                />
                {errors.title && (
                  <span className="UserAppointments-error-message">
                    {errors.title}
                  </span>
                )}
              </div>

              <div className="UserAppointments-form-group">
                <label htmlFor="appointmentDate">Date *</label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={appointment.appointmentDate}
                  onChange={handleDateChange}
                  min={getMinDate()}
                  onKeyDown={(e) => e.preventDefault()}
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
                  {timeSlots.map((time) => {
                    const isBooked = bookedTimeSlots[time] || false;
                    const isPast = isTimeSlotInPast(
                      appointment.appointmentDate,
                      time
                    );
                    return (
                      <div
                        key={time}
                        className={`UserAppointments-time-slot ${
                          appointment.appointmentTime === time
                            ? "UserAppointments-selected"
                            : ""
                        } ${isBooked ? "UserAppointments-booked" : ""}`}
                        onClick={() => handleTimeSelect(time)}
                        title={
                          isBooked
                            ? isPast
                              ? "This time slot has already passed"
                              : "This time slot is already booked"
                            : ""
                        }
                      >
                        {time}
                        {isBooked && (
                          <span className="UserAppointments-booked-badge">
                            {isPast ? "Passed" : "Booked"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {errors.appointmentTime && (
                  <span className="UserAppointments-error-message">
                    {errors.appointmentTime}
                  </span>
                )}
                {errors.timeSlot && (
                  <span className="UserAppointments-error-message">
                    {errors.timeSlot}
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
                  <span className="UserAppointments-error-message">
                    {errors.description}
                  </span>
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
