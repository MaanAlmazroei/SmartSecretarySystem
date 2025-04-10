// Import necessary libraries and styles
import React, { useState, useEffect } from 'react';
import './Tickets.css';


const Tickets = () => {
  // Initial state for a new ticket
  const initialTicketState = {
    title: '',
    description: '',
    status: 'New', // Default status for new tickets
    submissionDate: '',
    updateDate: '',
    feedback: '',
    rating: 0
  };

  // State for the current ticket being viewed or edited
  const [ticket, setTicket] = useState({ ...initialTicketState });

  // State for form validation errors
  const [errors, setErrors] = useState({});

  // State to track if form is in edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  // State to track if the ticket is closed (to show feedback form)
  const [isTicketClosed, setIsTicketClosed] = useState(false);

  // Sample list of tickets , should be coming from api call here
  const [ticketsList, setTicketsList] = useState([
    {
      id: 1,
      title: 'Login Issue',
      description: 'Unable to login to the system after password reset.',
      status: 'In Progress',
      submissionDate: '2025-04-05T10:30:00',
      updateDate: '2025-04-07T15:45:00',
      feedback: '',
      rating: 0
    },
    {
      id: 2,
      title: 'Feature Request',
      description: 'Would like to request a dark mode option for the application.',
      status: 'Open',
      submissionDate: '2025-04-08T09:15:00',
      updateDate: '2025-04-08T09:15:00',
      feedback: '',
      rating: 0
    },
    {
      id: 3,
      title: 'Payment Issue',
      description: 'Payment was processed twice for my last subscription renewal.',
      status: 'Closed',
      submissionDate: '2025-03-25T14:00:00',
      updateDate: '2025-04-02T11:30:00',
      feedback: 'Issue was resolved quickly. Thank you for the refund.',
      rating: 4
    }
  ]);

  // State to track which ticket is being viewed in detail
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Effect hook to check if the ticket status is "Closed"
  useEffect(() => {
    // Update isTicketClosed state based on ticket status
    if (ticket.status === 'Closed') {
      setIsTicketClosed(true);
    } else {
      setIsTicketClosed(false);
    }
  }, [ticket.status]);

  /**
   * Validates the ticket form data
   * Returns true if valid, otherwise populates errors state
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate title (required)
    if (!ticket.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Validate description (required, minimum length)
    if (!ticket.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (ticket.description.length < 10) {
      newErrors.description = 'Description should be at least 10 characters';
    }

    // If ticket is closed, validate feedback and rating
    if (isTicketClosed) {
      if (!ticket.feedback.trim()) {
        newErrors.feedback = 'Please provide feedback before closing the ticket';
      }

      if (ticket.rating === 0) {
        newErrors.rating = 'Please provide a rating';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles input change for all form fields
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles star rating selection
   */
  const handleRatingChange = (rating) => {
    setTicket(prev => ({
      ...prev,
      rating
    }));
  };

  /**
   * Handles status change and updates the updateDate
   */
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setTicket(prev => ({
      ...prev,
      status: newStatus,
      updateDate: new Date().toISOString()
    }));
  };

  /**
   * Handles form submission for creating/updating tickets
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const now = new Date().toISOString();

    if (isEditMode) {
      // Update existing ticket
      setTicketsList(prev =>
        prev.map(t =>
          t.id === selectedTicketId
            ? {
                ...ticket,
                updateDate: now
              }
            : t
        )
      );

      setIsEditMode(false);
    } else {
      // Create new ticket
      const newTicket = {
        ...ticket,
        id: Date.now(), // Generate a unique ID
        submissionDate: now,
        updateDate: now
      };

      setTicketsList(prev => [...prev, newTicket]);
    }

    // Reset form
    setTicket({ ...initialTicketState });
    setSelectedTicketId(null);
  };

  /**
   * Selects a ticket to view or edit
   */
  const selectTicket = (id) => {
    const selected = ticketsList.find(t => t.id === id);
    if (selected) {
      setTicket({ ...selected });
      setSelectedTicketId(id);
    }
  };

  /**
   * Enables edit mode for a ticket, but prevent editing if status is "Closed" or "In Progress"
   */
  const editTicket = (id) => {
    const selected = ticketsList.find(t => t.id === id);
    if (selected && (selected.status === 'Closed' || selected.status === 'In Progress')) {
      alert('Tickets with "In Progress" or "Closed" status cannot be edited.');
      return;
    }
    selectTicket(id);
    setIsEditMode(true);
  };

  /**
   * Cancels the current edit/create operation
   */
  const handleCancel = () => {
    setTicket({ ...initialTicketState });
    setSelectedTicketId(null);
    setIsEditMode(false);
    setErrors({});
  };

  /**
   * Formats a date string for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  /**
   * Returns a CSS class based on ticket status
   */
  const getStatusClass = (status) => {
    switch (status) {
      case 'New': return 'status-new';
      case 'Open': return 'status-open';
      case 'In Progress': return 'status-in-progress';
      case 'Resolved': return 'status-resolved';
      case 'Closed': return 'status-closed';
      default: return '';
    }
  };

  return (
    <div className="tickets-container">
      {/* Header Section */}
      <header className="tickets-header">
        <h1>Ticket Management System</h1>
        <p>Create and track support tickets</p>
      </header>

      <div className="tickets-main">
        {/* Ticket List Section */}
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
                  className={`ticket-item ${selectedTicketId === t.id ? 'selected' : ''}`}
                  onClick={() => selectTicket(t.id)}
                >
                  <div className="ticket-header">
                    <h3>{t.title}</h3>
                    <span className={`ticket-status ${getStatusClass(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="ticket-dates">
                    <span>Created: {formatDate(t.submissionDate)}</span>
                    {t.submissionDate !== t.updateDate && (
                      <span>Updated: {formatDate(t.updateDate)}</span>
                    )}
                  </div>
                  <p className="ticket-description">{t.description.substring(0, 100)}...</p>
                  <div className="ticket-actions">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      editTicket(t.id);
                    }}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Ticket Detail/Form Section */}
        <section className="ticket-detail-section">
          {selectedTicketId && !isEditMode ? (
            // View Ticket Detail
            <div className="ticket-detail">
              {/* Ticket Detail Header */}
              <div className="detail-header">
                <h2>{ticket.title}</h2>
                <span className={`ticket-status ${getStatusClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              
              {/* Ticket Metadata */}
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
              
              {/* Ticket Description */}
              <div className="detail-description">
                <h3>Description</h3>
                <p>{ticket.description}</p>
              </div>
              
              {/* Feedback Section (if ticket is closed) */}
              {ticket.status === 'Closed' && (
                <div className="detail-feedback">
                  <h3>Feedback</h3>
                  <p>{ticket.feedback || 'No feedback provided.'}</p>
                  
                  <h3>Rating</h3>
                  <div className="static-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={star <= ticket.rating ? 'star filled' : 'star'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Ticket Actions */}
              <div className="detail-actions">
                <button onClick={() => editTicket(selectedTicketId)}>Edit Ticket</button>
                <button onClick={handleCancel}>Close</button>
              </div>
            </div>
          ) : (
            // Create/Edit Ticket Form
            <form className="ticket-form" onSubmit={handleSubmit}>
              {/* Form Header */}
              <h2>{isEditMode ? 'Edit Ticket' : 'Create New Ticket'}</h2>
              
              {/* Form Fields */}
              <div className="form-group">
                <label htmlFor="title">Ticket Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={ticket.title}
                  onChange={handleInputChange}
                  className={errors.title ? 'error' : ''}
                  required
                />
                {errors.title && <div className="error-message">{errors.title}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={ticket.description}
                  onChange={handleInputChange}
                  className={errors.description ? 'error' : ''}
                  rows="5"
                  required
                ></textarea>
                {errors.description && <div className="error-message">{errors.description}</div>}
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
              
              {/* Feedback Section (visible only when status is Closed) */}
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
                      className={errors.feedback ? 'error' : ''}
                      rows="3"
                      required={isTicketClosed}
                    ></textarea>
                    {errors.feedback && <div className="error-message">{errors.feedback}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label>Rating *</label>
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          className={star <= ticket.rating ? 'star filled' : 'star'}
                          onClick={() => handleRatingChange(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {errors.rating && <div className="error-message">{errors.rating}</div>}
                  </div>
                </div>
              )}
              
              {/* Form Actions */}
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {isEditMode ? 'Update Ticket' : 'Submit Ticket'}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
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

export default Tickets;
