import React, { useState, useEffect } from "react";
import "./Tickets.css";

const Tickets = () => {
  const initialTicketState = {
    title: "",
    description: "",
    status: "New",
    submissionDate: "",
    updateDate: "",
    feedback: "",
    rating: 0,
  };

  const [ticket, setTicket] = useState({ ...initialTicketState });

  const [errors, setErrors] = useState({});

  const [isEditMode, setIsEditMode] = useState(false);

  const [isTicketClosed, setIsTicketClosed] = useState(false);

  const [ticketsList, setTicketsList] = useState([
    {
      id: 1,
      title: "test1",
      description: "test1 description.",
      status: "In Progress",
      submissionDate: "2025-04-05T10:30:00",
      updateDate: "2025-04-07T15:45:00",
      feedback: "",
      rating: 0,
    },
    {
      id: 2,
      title: "test2",
      description: "test2 description.",
      status: "Open",
      submissionDate: "2025-04-08T09:15:00",
      updateDate: "2025-04-08T09:15:00",
      feedback: "",
      rating: 0,
    },
    {
      id: 3,
      title: "test3",
      description: "test3 description.",
      status: "Closed",
      submissionDate: "2025-03-25T14:00:00",
      updateDate: "2025-04-02T11:30:00",
      feedback: "Issue was resolved quickly. Thank you for the refund.",
      rating: 4,
    },
  ]);

  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
    if (ticket.status === "Closed") {
      setIsTicketClosed(true);
    } else {
      setIsTicketClosed(false);
    }
  }, [ticket.status]);

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

    if (isTicketClosed) {
      if (!ticket.feedback.trim()) {
        newErrors.feedback =
          "Please provide feedback before closing the ticket";
      }

      if (ticket.rating === 0) {
        newErrors.rating = "Please provide a rating";
      }
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

  const handleRatingChange = (rating) => {
    setTicket((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setTicket((prev) => ({
      ...prev,
      status: newStatus,
      updateDate: new Date().toISOString(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const now = new Date().toISOString();

    if (isEditMode) {
      setTicketsList((prev) =>
        prev.map((t) =>
          t.id === selectedTicketId
            ? {
                ...ticket,
                updateDate: now,
              }
            : t
        )
      );

      setIsEditMode(false);
    } else {
      const newTicket = {
        ...ticket,
        id: Date.now(),
        submissionDate: now,
        updateDate: now,
      };

      setTicketsList((prev) => [...prev, newTicket]);
    }

    setTicket({ ...initialTicketState });
    setSelectedTicketId(null);
  };

  const selectTicket = (id) => {
    const selected = ticketsList.find((t) => t.id === id);
    if (selected) {
      setTicket({ ...selected });
      setSelectedTicketId(id);
    }
  };

  const editTicket = (id) => {
    const selected = ticketsList.find((t) => t.id === id);
    if (
      selected &&
      (selected.status === "Closed" || selected.status === "In Progress")
    ) {
      alert('Tickets with "In Progress" or "Closed" status cannot be edited.');
      return;
    }
    selectTicket(id);
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setTicket({ ...initialTicketState });
    setSelectedTicketId(null);
    setIsEditMode(false);
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
      case "New":
        return "status-new";
      case "Open":
        return "status-open";
      case "In Progress":
        return "status-in-progress";
      case "Resolved":
        return "status-resolved";
      case "Closed":
        return "status-closed";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="tickets-container">
        <header className="tickets-header">
          <h1>Tickets Management</h1>
          <p>Create and track support tickets</p>
        </header>

        <div className="tickets-main">
          <section className="tickets-list-section">
            <div className="section-header">
              <h2>Your Tickets</h2>
              <button
                className="new-ticket-btn"
                onClick={() => {
                  setTicket({ ...initialTicketState });
                  setSelectedTicketId(null);
                  setIsEditMode(false);
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
                      <span>Created: {formatDate(t.submissionDate)}</span>
                      {t.submissionDate !== t.updateDate && (
                        <span>Updated: {formatDate(t.updateDate)}</span>
                      )}
                    </div>
                    <p className="ticket-description">
                      {t.description.substring(0, 100)}...
                    </p>
                    <div className="ticket-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editTicket(t.id);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="ticket-detail-section">
            {selectedTicketId && !isEditMode ? (
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
                    <span>{formatDate(ticket.submissionDate)}</span>
                  </div>
                  {ticket.submissionDate !== ticket.updateDate && (
                    <div className="metadata-item">
                      <span className="label">Last updated:</span>
                      <span>{formatDate(ticket.updateDate)}</span>
                    </div>
                  )}
                </div>

                <div className="detail-description">
                  <h3>Description</h3>
                  <p>{ticket.description}</p>
                </div>

                {ticket.status === "Closed" && (
                  <div className="detail-feedback">
                    <h3>Feedback</h3>
                    <p>{ticket.feedback || "No feedback provided."}</p>

                    <h3>Rating</h3>
                    <div className="static-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= ticket.rating ? "star filled" : "star"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-actions">
                  <button onClick={() => editTicket(selectedTicketId)}>
                    Edit Ticket
                  </button>
                  <button onClick={handleCancel}>Close</button>
                </div>
              </div>
            ) : (
              <form className="ticket-form" onSubmit={handleSubmit}>
                <h2>{isEditMode ? "Edit Ticket" : "Create New Ticket"}</h2>

                <div className="form-group">
                  <label htmlFor="title">Ticket Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={ticket.title}
                    onChange={handleInputChange}
                    className={errors.title ? "error" : ""}
                    required
                  />
                  {errors.title && (
                    <div className="error-message">{errors.title}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={ticket.description}
                    onChange={handleInputChange}
                    className={errors.description ? "error" : ""}
                    rows="5"
                    required
                  ></textarea>
                  {errors.description && (
                    <div className="error-message">{errors.description}</div>
                  )}
                </div>

                {isEditMode && (
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <input
                      type="text"
                      id="status"
                      name="status"
                      value={ticket.status}
                      readOnly
                      className="readonly-input"
                    />
                  </div>
                )}

                {isTicketClosed && (
                  <div className="feedback-section">
                    <h3>Feedback</h3>
                    <p>Please provide feedback before closing this ticket.</p>

                    <div className="form-group">
                      <label htmlFor="feedback">Your Feedback *</label>
                      <textarea
                        id="feedback"
                        name="feedback"
                        value={ticket.feedback}
                        onChange={handleInputChange}
                        className={errors.feedback ? "error" : ""}
                        rows="3"
                        required={isTicketClosed}
                      ></textarea>
                      {errors.feedback && (
                        <div className="error-message">{errors.feedback}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Rating *</label>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={
                              star <= ticket.rating ? "star filled" : "star"
                            }
                            onClick={() => handleRatingChange(star)}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {errors.rating && (
                        <div className="error-message">{errors.rating}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {isEditMode ? "Update Ticket" : "Submit Ticket"}
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
    </>
  );
};

export default Tickets;
