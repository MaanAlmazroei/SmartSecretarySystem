import React, { useState, useEffect, useCallback } from "react";
import "./SecretaryAppointments.css";
import {
  getAllAppointments,
  updateAppointment,
  getUser,
} from "../../../services/ApiService";

const SecretaryAppointments = () => {
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [newFeedback, setNewFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  // Add function to fetch user details
  const fetchUserDetails = useCallback(async (userId) => {
    try {
      const response = await getUser(userId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      return null;
    }
  }, []);

  // Fetch all appointments with user details
  const fetchAllAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllAppointments();
      if (response.error) {
        throw new Error(response.error);
      }

      // Fetch user details for each appointment
      const appointmentsWithUserDetails = await Promise.all(
        response.map(async (appointment) => {
          const userInfo = await fetchUserDetails(appointment.userId);
          return {
            ...appointment,
            userFirstName: userInfo?.firstName || "Unknown",
            userLastName: userInfo?.lastName || "User",
          };
        })
      );

      setAppointmentsList(appointmentsWithUserDetails);
      applyFilters(appointmentsWithUserDetails, statusFilter, searchTerm);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error.message);
      setLoading(false);
    }
  }, [statusFilter, searchTerm, fetchUserDetails]);

  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  // Apply filters to appointments
  const applyFilters = (appointments, status, term) => {
    let filtered = [...appointments];

    // Apply status filter
    if (status !== "All") {
      filtered = filtered.filter(
        (appointment) => appointment.status === status
      );
    }

    // Apply search filter
    if (term) {
      const searchLower = term.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          appointment.title.toLowerCase().includes(searchLower) ||
          appointment.description.toLowerCase().includes(searchLower) ||
          `${appointment.userFirstName} ${appointment.userLastName}`
            .toLowerCase()
            .includes(searchLower) ||
          (appointment.appointmentDate &&
            appointment.appointmentDate.toLowerCase().includes(searchLower)) ||
          (appointment.appointmentTime &&
            appointment.appointmentTime.toLowerCase().includes(searchLower))
      );
    }

    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    applyFilters(appointmentsList, statusFilter, searchTerm);
  }, [statusFilter, searchTerm, appointmentsList]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const selectAppointment = (id) => {
    const selected = appointmentsList.find((a) => a.id === id);
    if (selected) {
      setSelectedAppointment(selected);
      setSelectedAppointmentId(id);
      setNewFeedback(selected.feedback || "");
    }
  };

  // Update the appointment status
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await updateAppointment(appointmentId, {
        status: newStatus,
      });
      if (response.error) {
        throw new Error(response.error);
      }

      // Update the selected appointment locally before fetching all appointments
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment({
          ...selectedAppointment,
          status: newStatus,
          lastUpdatedDate: new Date().toISOString(),
        });
      }

      // Then refresh all appointments
      await fetchAllAppointments();
    } catch (error) {
      console.error("Error updating appointment status:", error.message);
    }
  };

  const handleFeedbackSubmit = async (appointmentId) => {
    if (!newFeedback.trim()) return;

    try {
      const response = await updateAppointment(appointmentId, {
        feedback: newFeedback,
        lastUpdatedDate: new Date().toISOString(),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setNewFeedback("");
      await fetchAllAppointments();
    } catch (error) {
      console.error("Error adding feedback:", error.message);
    }
  };

  const closeAppointmentDetails = () => {
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
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
        return "appointment-status-in-progress";
      case "Approved":
        return "appointment-status-approved";
      case "Rejected":
        return "appointment-status-rejected";
      default:
        return "";
    }
  };

  return (
    <div className="secretary-appointment-container">
      <header className="secretary-appointment-header">
        <h1>Secretary Appointments Dashboard</h1>
        <p>Manage and respond to all user appointment requests</p>
      </header>

      <div className="secretary-appointment-filters">
        <div className="secretary-appointment-filter-group secretary-appointment-status-filter">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="secretary-appointment-filter-select"
          >
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="secretary-appointment-filter-group secretary-appointment-search-group">
          <label htmlFor="appointmentSearch">Search Appointments:</label>
          <input
            type="text"
            id="appointmentSearch"
            placeholder="Search by title, description or name"
            value={searchTerm}
            onChange={handleSearchChange}
            className="secretary-appointment-search-input"
          />
        </div>
      </div>

      <div className="secretary-appointment-main">
        {/* Left Panel: Appointments List */}
        <section className="secretary-appointment-list-section">
          <div className="secretary-appointment-section-header">
            <h2>All Appointments</h2>
            <span className="secretary-appointment-count">
              {filteredAppointments.length} appointments
            </span>
          </div>

          {loading ? (
            <div className="secretary-appointment-loading-indicator">
              <p>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="secretary-appointment-no-appointments">
              <p>No appointments found matching your criteria.</p>
            </div>
          ) : (
            <div className="secretary-appointment-list">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`secretary-appointment-item ${
                    selectedAppointmentId === appointment.id
                      ? "secretary-appointment-selected"
                      : ""
                  }`}
                  onClick={() => selectAppointment(appointment.id)}
                >
                  <div className="secretary-appointment-header">
                    <h3>{appointment.title}</h3>
                    <span
                      className={`secretary-appointment-status ${getStatusClass(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <div className="secretary-appointment-schedule">
                    <span>Date: {appointment.appointmentDate}</span>
                    <span>Time: {appointment.appointmentTime}</span>
                  </div>
                  <p className="secretary-appointment-description">
                    {appointment.description.substring(0, 50)}...
                  </p>
                  <div className="secretary-appointment-user-info">
                    <span>
                      User: {appointment.userFirstName}{" "}
                      {appointment.userLastName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Panel: Appointment Detail View */}
        <section className="secretary-appointment-detail-section">
          {selectedAppointmentId && selectedAppointment ? (
            <div className="secretary-appointment-detail">
              <div className="secretary-appointment-detail-header">
                <h2>{selectedAppointment.title}</h2>
                <div className="secretary-appointment-status-actions">
                  <span
                    className={`secretary-appointment-status ${getStatusClass(
                      selectedAppointment.status
                    )}`}
                  >
                    {selectedAppointment.status}
                  </span>
                  <button
                    className="secretary-appointment-close-detail-btn"
                    onClick={closeAppointmentDetails}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="secretary-appointment-detail-metadata">
                <div className="secretary-appointment-metadata-item">
                  <span className="secretary-appointment-label">
                    Submitted by:
                  </span>
                  <span>
                    {selectedAppointment.userFirstName}{" "}
                    {selectedAppointment.userLastName}
                  </span>
                </div>
                <div className="secretary-appointment-metadata-item">
                  <span className="secretary-appointment-label">
                    Scheduled for:
                  </span>
                  <span>
                    {selectedAppointment.appointmentDate} at{" "}
                    {selectedAppointment.appointmentTime}
                  </span>
                </div>
                <div className="secretary-appointment-metadata-item">
                  <span className="secretary-appointment-label">
                    Submitted on:
                  </span>
                  <span>{formatDate(selectedAppointment.createdAt)}</span>
                </div>
                {selectedAppointment.createdAt !==
                  selectedAppointment.lastUpdatedDate && (
                  <div className="secretary-appointment-metadata-item">
                    <span className="secretary-appointment-label">
                      Last updated:
                    </span>
                    <span>
                      {formatDate(selectedAppointment.lastUpdatedDate)}
                    </span>
                  </div>
                )}
              </div>

              <div className="secretary-appointment-detail-description">
                <h3>Description</h3>
                <p>{selectedAppointment.description}</p>
              </div>

              <div className="secretary-appointment-status-management">
                <h3>Update Status</h3>
                <div className="secretary-appointment-status-buttons">
                  <button
                    className={`secretary-appointment-status-btn ${
                      selectedAppointment.status === "In Progress"
                        ? "secretary-appointment-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleStatusChange(selectedAppointment.id, "In Progress")
                    }
                  >
                    In Progress
                  </button>
                  <button
                    className={`secretary-appointment-status-btn ${
                      selectedAppointment.status === "Approved"
                        ? "secretary-appointment-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleStatusChange(selectedAppointment.id, "Approved")
                    }
                  >
                    Approved
                  </button>
                  <button
                    className={`secretary-appointment-status-btn ${
                      selectedAppointment.status === "Rejected"
                        ? "secretary-appointment-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleStatusChange(selectedAppointment.id, "Rejected")
                    }
                  >
                    Rejected
                  </button>
                </div>
              </div>

              <div className="secretary-appointment-add-comment-section">
                <h3>Add Feedback</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleFeedbackSubmit(selectedAppointment.id);
                  }}
                  className="secretary-appointment-comment-form"
                >
                  <textarea
                    placeholder="Type your feedback here..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    className="secretary-appointment-comment-input"
                  />
                  <button
                    type="submit"
                    className="secretary-appointment-submit-comment-btn"
                  >
                    Add Feedback
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="secretary-appointment-no-appointment-selected">
              <div className="secretary-appointment-no-selection-content">
                <div className="secretary-appointment-selection-icon">📅</div>
                <h3>No Appointment Selected</h3>
                <p>
                  Select an appointment from the list to view details and manage
                  it.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SecretaryAppointments;
