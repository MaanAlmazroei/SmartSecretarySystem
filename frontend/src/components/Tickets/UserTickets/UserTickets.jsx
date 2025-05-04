import React, { useState, useEffect, useCallback } from "react";
import "./UserTickets.css";
import { getUserAllTickets, createTicket } from "../../../services/ApiService";
import { useAuth } from "../../../Context/AuthContext";

const UserTickets = () => {
  const initialTicketState = {
    title: "",
    description: "",
    status: "In Progress",
    feedback: "",
    createdAt: "",
    lastUpdatedDate: "",
  };

  const [ticket, setTicket] = useState({ ...initialTicketState });
  const [errors, setErrors] = useState({});
  const [ticketsList, setTicketsList] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const { user } = useAuth();

  const fetchTickets = useCallback(async () => {
    if (user?.uid) {
      try {
        const response = await getUserAllTickets(user.uid);
        if (response.error) {
          throw new Error(response.error);
        }
        setTicketsList(response);
      } catch (error) {
        console.error("Error fetching tickets:", error.message);
      }
    } else {
      setTicketsList([]);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const validateForm = () => {
    const newErrors = {};

    if (!ticket.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!ticket.description.trim()) {
      newErrors.description = "Description is required";
    } else if (ticket.description.length < 10) {
      newErrors.description = "Description should be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicket((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const now = new Date().toISOString();

    try {
      const response = await createTicket({
        ...ticket,
        createdAt: now,
        lastUpdatedDate: now,
        userId: user.uid,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await fetchTickets();
      setTicket({ ...initialTicketState });
      setSelectedTicketId(null);
    } catch (error) {
      console.error("Error saving ticket:", error.message);
    }
  };

  const selectTicket = (id) => {
    const selected = ticketsList.find((t) => t.id === id);
    if (selected) {
      setTicket({ ...selected });
      setSelectedTicketId(id);
    }
  };

  const handleCancel = () => {
    setTicket({ ...initialTicketState });
    setSelectedTicketId(null);
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
        return "UserTickets-status-in-progress";
      case "Resolved":
        return "UserTickets-status-resolved";
      default:
        return "";
    }
  };

  return (
    <div className="UserTickets-container">
      <header className="UserTickets-header">
        <h1>Tickets Management</h1>
        <p>Create and track support tickets</p>
      </header>

      <div className="UserTickets-main">
        {/* Left Panel: Ticket List and New Ticket Button */}
        <section className="UserTickets-list-section">
          <div className="UserTickets-section-header">
            <h2>Your Tickets</h2>
            <button
              className="UserTickets-new-ticket-btn"
              onClick={() => {
                setTicket({ ...initialTicketState });
                setSelectedTicketId(null);
              }}
            >
              <span>+</span> New Ticket
            </button>
          </div>

          {ticketsList.length === 0 ? (
            <div className="UserTickets-no-tickets">
              <p>No tickets found. Create a new ticket to get started.</p>
            </div>
          ) : (
            <div className="UserTickets-list">
              {ticketsList.map((t) => (
                <div
                  key={t.id}
                  className={`UserTickets-item ${
                    selectedTicketId === t.id ? "UserTickets-selected" : ""
                  }`}
                  onClick={() => selectTicket(t.id)}
                >
                  <div className="UserTickets-item-header">
                    <h3>{t.title}</h3>
                    <span
                      className={`UserTickets-status ${getStatusClass(
                        t.status
                      )}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="UserTickets-dates">
                    <span>Created: {formatDate(t.createdAt)}</span>
                    {t.createdAt !== t.lastUpdatedDate && (
                      <span>Updated: {formatDate(t.lastUpdatedDate)}</span>
                    )}
                  </div>
                  <p className="UserTickets-description">
                    {t.description.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Panel: Ticket Detail View */}
        <section className="UserTickets-detail-section">
          {selectedTicketId ? (
            <div className="UserTickets-detail">
              <div className="UserTickets-detail-header">
                <h2>{ticket.title}</h2>
                <span
                  className={`UserTickets-status ${getStatusClass(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </span>
              </div>

              <div className="UserTickets-detail-metadata">
                <div className="UserTickets-metadata-item">
                  <span className="UserTickets-label">Submitted on:</span>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
                {ticket.createdAt !== ticket.lastUpdatedDate && (
                  <div className="UserTickets-metadata-item">
                    <span className="UserTickets-label">Last updated:</span>
                    <span>{formatDate(ticket.lastUpdatedDate)}</span>
                  </div>
                )}
              </div>

              <div className="UserTickets-detail-description">
                <h3>Description</h3>
                <p>{ticket.description}</p>
              </div>

              {ticket.feedback && (
                <div className="UserTickets-detail-feedback">
                  <h3>Feedback</h3>
                  <p>{ticket.feedback}</p>
                </div>
              )}

              <div className="UserTickets-detail-actions">
                <button onClick={handleCancel}>Close</button>
              </div>
            </div>
          ) : (
            <form className="UserTickets-form" onSubmit={handleSubmit}>
              <div className="UserTickets-form-group">
                <label htmlFor="title">Ticket Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={ticket.title}
                  onChange={handleInputChange}
                  className={`UserTickets-form-control ${
                    errors.title ? "UserTickets-error" : ""
                  }`}
                />
                {errors.title && (
                  <span className="UserTickets-error-message">
                    {errors.title}
                  </span>
                )}
              </div>

              <div className="UserTickets-form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={ticket.description}
                  onChange={handleInputChange}
                  className={`UserTickets-form-control ${
                    errors.description ? "UserTickets-error" : ""
                  }`}
                  rows="5"
                />
                {errors.description && (
                  <span className="UserTickets-error-message">
                    {errors.description}
                  </span>
                )}
              </div>

              <div className="UserTickets-form-actions">
                <button type="submit" className="UserTickets-submit-btn">
                  Submit Ticket
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserTickets;
