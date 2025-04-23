import React, { useState, useEffect } from "react";
import "./SecretaryTickets.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../services/FirebaseConfig";
import { 
  getAllTickets, 
  updateTicketStatus, 
  addTicketComment 
} from "../../../services/FirebaseDB";

const SecretaryTickets = () => {
  const [ticketsList, setTicketsList] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [secretaryId, setSecretaryId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all tickets
  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      const tickets = await getAllTickets();
      setTicketsList(tickets);
      applyFilters(tickets, statusFilter, searchTerm);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tickets:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSecretaryId(user.uid);
      } else {
        setSecretaryId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Apply filters to tickets
  const applyFilters = (tickets, status, term) => {
    let filtered = [...tickets];
    
    // Apply status filter
    if (status !== "All") {
      filtered = filtered.filter(ticket => ticket.status === status);
    }
    
    // Apply search filter
    if (term) {
      const searchLower = term.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(searchLower) || 
        ticket.description.toLowerCase().includes(searchLower) ||
        (ticket.userId && ticket.userId.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredTickets(filtered);
  };

  useEffect(() => {
    applyFilters(ticketsList, statusFilter, searchTerm);
  }, [statusFilter, searchTerm, ticketsList]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const selectTicket = (id) => {
    const selected = ticketsList.find((t) => t.id === id);
    if (selected) {
      setSelectedTicket(selected);
      setSelectedTicketId(id);
      setNewComment("");
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicketId) return;
    
    try {
      const now = new Date().toISOString();
      await updateTicketStatus(
        selectedTicketId, 
        newStatus, 
        now,
        secretaryId
      );
      
      // Update local state
      setSelectedTicket(prev => ({...prev, status: newStatus, updateDate: now}));
      
      // Update in the tickets list
      const updatedList = ticketsList.map(ticket => 
        ticket.id === selectedTicketId 
          ? {...ticket, status: newStatus, updateDate: now}
          : ticket
      );
      
      setTicketsList(updatedList);
    } catch (error) {
      console.error("Error updating ticket status:", error.message);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !selectedTicketId) return;
    
    try {
      const now = new Date().toISOString();
      const commentObj = {
        text: newComment,
        createdAt: now,
        createdBy: secretaryId,
        isSecretaryComment: true
      };
      
      await addTicketComment(selectedTicketId, commentObj);
      
      // Update local state
      setSelectedTicket(prev => ({
        ...prev, 
        comments: [...(prev.comments || []), commentObj],
        updateDate: now
      }));
      
      // Clear comment field
      setNewComment("");
      
      // Refresh tickets to get latest data
      fetchAllTickets();
    } catch (error) {
      console.error("Error adding comment:", error.message);
    }
  };

  const closeTicketDetails = () => {
    setSelectedTicketId(null);
    setSelectedTicket(null);
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
        return "status-in-progress";
      case "Closed":
        return "status-closed";
      case "Resolved":
        return "status-resolved";
      case "Open":
        return "status-open";
      case "New":
        return "status-new";
      default:
        return "";
    }
  };

  const getPriorityClass = (priority) => {
    if (!priority) return "";
    
    switch (priority.toLowerCase()) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "";
    }
  };

  return (
    <div className="secretary-tickets-container">
      <header className="secretary-tickets-header">
        <h1>Secretary Tickets Dashboard</h1>
        <p>Manage and respond to all user support tickets</p>
      </header>

      <div className="tickets-filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select 
            id="statusFilter" 
            value={statusFilter} 
            onChange={handleStatusFilterChange}
            className="filter-select"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        
        <div className="filter-group search-group">
          <label htmlFor="ticketSearch">Search Tickets:</label>
          <input
            type="text"
            id="ticketSearch"
            placeholder="Search by title, description or user ID"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      <div className="secretary-tickets-main">
        {/* Left Panel: Tickets List */}
        <section className="secretary-tickets-list-section">
          <div className="section-header">
            <h2>All Tickets</h2>
            <span className="ticket-count">{filteredTickets.length} tickets</span>
          </div>

          {loading ? (
            <div className="loading-indicator">
              <p>Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="no-tickets">
              <p>No tickets found matching your criteria.</p>
            </div>
          ) : (
            <div className="tickets-list">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`ticket-item ${
                    selectedTicketId === ticket.id ? "selected" : ""
                  }`}
                  onClick={() => selectTicket(ticket.id)}
                >
                  <div className="ticket-header">
                    <h3>{ticket.title}</h3>
                    <span
                      className={`ticket-status ${getStatusClass(ticket.status)}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  {ticket.priority && (
                    <div className="ticket-priority">
                      <span className={`priority-indicator ${getPriorityClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  )}
                  <div className="ticket-dates">
                    <span>Created: {formatDate(ticket.submissionDate)}</span>
                    {ticket.submissionDate !== ticket.updateDate && (
                      <span>Updated: {formatDate(ticket.updateDate)}</span>
                    )}
                  </div>
                  <p className="ticket-description">
                    {ticket.description.substring(0, 80)}...
                  </p>
                  <div className="ticket-user-info">
                    <span>User ID: {ticket.userId ? ticket.userId.substring(0, 8) + '...' : 'Unknown'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Panel: Ticket Detail View */}
        <section className="secretary-ticket-detail-section">
          {selectedTicketId && selectedTicket ? (
            <div className="ticket-detail">
              <div className="detail-header">
                <h2>{selectedTicket.title}</h2>
                <div className="status-actions">
                  <span className={`ticket-status ${getStatusClass(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                  <button className="close-detail-btn" onClick={closeTicketDetails}>×</button>
                </div>
              </div>

              <div className="detail-metadata">
                <div className="metadata-item">
                  <span className="label">Submitted by:</span>
                  <span>{selectedTicket.userId || 'Unknown'}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Submitted on:</span>
                  <span>{formatDate(selectedTicket.submissionDate)}</span>
                </div>
                {selectedTicket.submissionDate !== selectedTicket.updateDate && (
                  <div className="metadata-item">
                    <span className="label">Last updated:</span>
                    <span>{formatDate(selectedTicket.updateDate)}</span>
                  </div>
                )}
                {selectedTicket.priority && (
                  <div className="metadata-item">
                    <span className="label">Priority:</span>
                    <span className={`priority-value ${getPriorityClass(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                )}
              </div>

              <div className="detail-description">
                <h3>Description</h3>
                <p>{selectedTicket.description}</p>
              </div>

              <div className="ticket-status-management">
                <h3>Update Status</h3>
                <div className="status-buttons">
                  <button 
                    className={`status-btn ${selectedTicket.status === 'New' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('New')}
                  >
                    New
                  </button>
                  <button 
                    className={`status-btn ${selectedTicket.status === 'Open' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('Open')}
                  >
                    Open
                  </button>
                  <button 
                    className={`status-btn ${selectedTicket.status === 'In Progress' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('In Progress')}
                  >
                    In Progress
                  </button>
                  <button 
                    className={`status-btn ${selectedTicket.status === 'Resolved' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('Resolved')}
                  >
                    Resolved
                  </button>
                  <button 
                    className={`status-btn ${selectedTicket.status === 'Closed' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('Closed')}
                  >
                    Closed
                  </button>
                </div>
              </div>

              {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                <div className="ticket-comments">
                  <h3>Comments</h3>
                  <div className="comments-list">
                    {selectedTicket.comments.map((comment, index) => (
                      <div 
                        key={index} 
                        className={`comment-item ${comment.isSecretaryComment ? 'secretary-comment' : 'user-comment'}`}
                      >
                        <div className="comment-header">
                          <span className="comment-author">
                            {comment.isSecretaryComment ? 'Secretary' : 'User'}
                          </span>
                          <span className="comment-date">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="add-comment-section">
                <h3>Add Comment</h3>
                <form onSubmit={handleCommentSubmit} className="comment-form">
                  <textarea
                    placeholder="Type your comment here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="comment-input"
                  />
                  <button type="submit" className="submit-comment-btn">
                    Add Comment
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="no-ticket-selected">
              <div className="no-selection-content">
                <div className="selection-icon">📋</div>
                <h3>No Ticket Selected</h3>
                <p>Select a ticket from the list to view details and manage it.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SecretaryTickets;