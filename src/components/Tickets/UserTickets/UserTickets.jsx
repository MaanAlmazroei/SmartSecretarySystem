import React, { useState, useEffect } from "react";
import "./UserTickets.css";
import { getCurrentUser } from "../../../services/FirebaseAuth";
import { getUserAllTickets, createTicket } from "../../../services/ApiService";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../services/FirebaseConfig";

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
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  const fetchTickets = async () => {
    if (currentUser?.uid) {
      try {
        const response = await getUserAllTickets(currentUser.uid);
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
  };

  useEffect(() => {
    fetchTickets();
  }, [currentUser?.uid]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

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
        userId: currentUser.uid,
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
        return "ticket-status-in-progress";
      case "Resolved":
        return "ticket-status-resolved";
      default:
        return "";
    }
  };

  return (
    <div className="tickets-container">
      <header className="tickets-header">
        <h1>Tickets Management</h1>
        <p>Create and track support tickets</p>
      </header>

      <div className="tickets-main">
        {/* Left Panel: Ticket List and Booking Button */}
        <section className="tickets-list-section">
          <div className="section-header">
            <h2>Your Tickets</h2>
            <button
              className="new-ticket-btn"
              onClick={() => {
                setTicket({ ...initialTicketState });
                setSelectedTicketId(null);
              }}
            >
              <span>+</span> New Ticket
            </button>
          </div>

          {ticketsList.length === 0 ? (
            <div className="no-tickets">
              <p>No tickets found. Create a new ticket to get started.</p>
            </div>
          ) : (
            <div className="tickets-list">
              {ticketsList.map((t) => (
                <div
                  key={t.id}
                  className={`ticket-item ${
                    selectedTicketId === t.id ? "selected" : ""
                  }`}
                  onClick={() => selectTicket(t.id)}
                >
                  <div className="ticket-header">
                    <h3>{t.title}</h3>
                    <span
                      className={`ticket-status ${getStatusClass(t.status)}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="ticket-dates">
                    <span>Created: {formatDate(t.createdAt)}</span>
                    {t.createdAt !== t.lastUpdatedDate && (
                      <span>Updated: {formatDate(t.lastUpdatedDate)}</span>
                    )}
                  </div>
                  <p className="ticket-description">
                    {t.description.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Panel: Ticket Detail View */}
        <section className="ticket-detail-section">
          {selectedTicketId ? (
            <div className="ticket-detail">
              <div className="detail-header">
                <h2>{ticket.title}</h2>
                <span
                  className={`ticket-status ${getStatusClass(ticket.status)}`}
                >
                  {ticket.status}
                </span>
              </div>

              <div className="detail-metadata">
                <div className="metadata-item">
                  <span className="label">Submitted on:</span>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
                {ticket.createdAt !== ticket.lastUpdatedDate && (
                  <div className="metadata-item">
                    <span className="label">Last updated:</span>
                    <span>{formatDate(ticket.lastUpdatedDate)}</span>
                  </div>
                )}
              </div>

              <div className="detail-description">
                <h3>Description</h3>
                <p>{ticket.description}</p>
              </div>

              <div className="detail-feedback">
                <h3>Feedback</h3>
                <p>{ticket.feedback || "No feedback provided yet"}</p>
              </div>

              <div className="detail-actions">
                <button onClick={handleCancel}>Close</button>
              </div>
            </div>
          ) : (
            <form className="ticket-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Ticket Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={ticket.title}
                  onChange={handleInputChange}
                  className={`form-control ${errors.title ? "error" : ""}`}
                />
                {errors.title && (
                  <span className="error-message">{errors.title}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={ticket.description}
                  onChange={handleInputChange}
                  className={`form-control ${
                    errors.description ? "error" : ""
                  }`}
                  rows="5"
                />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
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
