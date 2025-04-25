import React, { useState, useEffect } from "react";
import "./SecretaryTickets.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../services/FirebaseConfig";
import {
  getAllTickets,
  updateTicket,
  getTicket,
} from "../../../services/ApiService";
import { getCurrentUser } from "../../../services/FirebaseAuth";

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
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Fetch all tickets
  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      const response = await getAllTickets();
      if (response.error) {
        throw new Error(response.error);
      }
      setTicketsList(response);
      applyFilters(response, statusFilter, searchTerm);
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
        setCurrentUser(user);
      } else {
        setSecretaryId(null);
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Apply filters to tickets
  const applyFilters = (tickets, status, term) => {
    let filtered = [...tickets];

    // Apply status filter
    if (status !== "All") {
      filtered = filtered.filter((ticket) => ticket.status === status);
    }

    // Apply search filter
    if (term) {
      const searchLower = term.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
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

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await updateTicket(ticketId, { status: newStatus });
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchAllTickets();
    } catch (error) {
      console.error("Error updating ticket status:", error.message);
    }
  };

  const handleCommentSubmit = async (ticketId) => {
    if (!newComment.trim()) return;

    try {
      const ticket = ticketsList.find((t) => t.id === ticketId);
      const updatedComments = [
        ...(ticket.comments || []),
        {
          text: newComment,
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
        },
      ];

      const response = await updateTicket(ticketId, {
        comments: updatedComments,
        lastUpdatedDate: new Date().toISOString(),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setNewComment("");
      await fetchAllTickets();
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
        return "SecretaryTicket-status-in-progress";
      case "Closed":
        return "SecretaryTicket-status-closed";
      case "Resolved":
        return "SecretaryTicket-status-resolved";
      case "Open":
        return "SecretaryTicket-status-open";
      case "New":
        return "SecretaryTicket-status-new";
      default:
        return "";
    }
  };

  const getPriorityClass = (priority) => {
    if (!priority) return "";

    switch (priority.toLowerCase()) {
      case "high":
        return "SecretaryTicket-priority-high";
      case "medium":
        return "SecretaryTicket-priority-medium";
      case "low":
        return "SecretaryTicket-priority-low";
      default:
        return "";
    }
  };

  return (
    <div className="SecretaryTicket-container">
      <header className="SecretaryTicket-header">
        <h1>Secretary Tickets Dashboard</h1>
        <p>Manage and respond to all user support tickets</p>
      </header>

      <div className="SecretaryTicket-filters">
        <div className="SecretaryTicket-filter-group">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="SecretaryTicket-filter-select"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="SecretaryTicket-filter-group SecretaryTicket-search-group">
          <label htmlFor="ticketSearch">Search Tickets:</label>
          <input
            type="text"
            id="ticketSearch"
            placeholder="Search by title, description or user ID"
            value={searchTerm}
            onChange={handleSearchChange}
            className="SecretaryTicket-search-input"
          />
        </div>
      </div>

      <div className="SecretaryTicket-main">
        {/* Left Panel: Tickets List */}
        <section className="SecretaryTicket-list-section">
          <div className="SecretaryTicket-section-header">
            <h2>All Tickets</h2>
            <span className="SecretaryTicket-ticket-count">
              {filteredTickets.length} tickets
            </span>
          </div>

          {loading ? (
            <div className="SecretaryTicket-loading-indicator">
              <p>Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="SecretaryTicket-no-tickets">
              <p>No tickets found matching your criteria.</p>
            </div>
          ) : (
            <div className="SecretaryTicket-tickets-list">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`SecretaryTicket-ticket-item ${
                    selectedTicketId === ticket.id
                      ? "SecretaryTicket-selected"
                      : ""
                  }`}
                  onClick={() => selectTicket(ticket.id)}
                >
                  <div className="SecretaryTicket-ticket-header">
                    <h3>{ticket.title}</h3>
                    <span
                      className={`SecretaryTicket-ticket-status ${getStatusClass(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  {ticket.priority && (
                    <div className="SecretaryTicket-ticket-priority">
                      <span
                        className={`SecretaryTicket-priority-indicator ${getPriorityClass(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  )}
                  <div className="SecretaryTicket-ticket-dates">
                    <span>Created: {formatDate(ticket.createdAt)}</span>
                    {ticket.createdAt !== ticket.lastUpdatedDate && (
                      <span>Updated: {formatDate(ticket.lastUpdatedDate)}</span>
                    )}
                  </div>
                  <p className="SecretaryTicket-ticket-description">
                    {ticket.description.substring(0, 80)}...
                  </p>
                  <div className="SecretaryTicket-ticket-user-info">
                    <span>
                      User ID:{" "}
                      {ticket.userId
                        ? ticket.userId.substring(0, 8) + "..."
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Panel: Ticket Detail View */}
        <section className="SecretaryTicket-detail-section">
          {selectedTicketId && selectedTicket ? (
            <div className="SecretaryTicket-detail">
              <div className="SecretaryTicket-detail-header">
                <h2>{selectedTicket.title}</h2>
                <div className="SecretaryTicket-status-actions">
                  <span
                    className={`SecretaryTicket-ticket-status ${getStatusClass(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status}
                  </span>
                  <button
                    className="SecretaryTicket-close-detail-btn"
                    onClick={closeTicketDetails}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="SecretaryTicket-detail-metadata">
                <div className="SecretaryTicket-metadata-item">
                  <span className="SecretaryTicket-label">Submitted by:</span>
                  <span>{selectedTicket.userId || "Unknown"}</span>
                </div>
                <div className="SecretaryTicket-metadata-item">
                  <span className="SecretaryTicket-label">Submitted on:</span>
                  <span>{formatDate(selectedTicket.createdAt)}</span>
                </div>
                {selectedTicket.createdAt !==
                  selectedTicket.lastUpdatedDate && (
                  <div className="SecretaryTicket-metadata-item">
                    <span className="SecretaryTicket-label">Last updated:</span>
                    <span>{formatDate(selectedTicket.lastUpdatedDate)}</span>
                  </div>
                )}
                {selectedTicket.priority && (
                  <div className="SecretaryTicket-metadata-item">
                    <span className="SecretaryTicket-label">Priority:</span>
                    <span
                      className={`SecretaryTicket-priority-value ${getPriorityClass(
                        selectedTicket.priority
                      )}`}
                    >
                      {selectedTicket.priority}
                    </span>
                  </div>
                )}
              </div>

              <div className="SecretaryTicket-detail-description">
                <h3>Description</h3>
                <p>{selectedTicket.description}</p>
              </div>

              <div className="SecretaryTicket-status-management">
                <h3>Update Status</h3>
                <div className="SecretaryTicket-status-buttons">
                  <button
                    className={`SecretaryTicket-status-btn ${
                      selectedTicket.status === "New"
                        ? "SecretaryTicket-active"
                        : ""
                    }`}
                    onClick={() => handleStatusChange(selectedTicket.id, "New")}
                  >
                    New
                  </button>
                  <button
                    className={`SecretaryTicket-status-btn ${
                      selectedTicket.status === "Open"
                        ? "SecretaryTicket-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleStatusChange(selectedTicket.id, "Open")
                    }
                  >
                    Open
                  </button>
                  <button
                    className={`SecretaryTicket-status-btn ${
                      selectedTicket.status === "In Progress"
                        ? "SecretaryTicket-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleStatusChange(selectedTicket.id, "In Progress")
                    }
                  >
                    In Progress
                  </button>
                  <button
                    className={`SecretaryTicket-status-btn ${
                      selectedTicket.status === "Resolved"
                        ? "SecretaryTicket-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleStatusChange(selectedTicket.id, "Resolved")
                    }
                  >
                    Resolved
                  </button>
                  <button
                    className={`SecretaryTicket-status-btn ${
                      selectedTicket.status === "Closed"
                        ? "SecretaryTicket-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleStatusChange(selectedTicket.id, "Closed")
                    }
                  >
                    Closed
                  </button>
                </div>
              </div>

              {selectedTicket.comments &&
                selectedTicket.comments.length > 0 && (
                  <div className="SecretaryTicket-comments">
                    <h3>Comments</h3>
                    <div className="SecretaryTicket-comments-list">
                      {selectedTicket.comments.map((comment, index) => (
                        <div
                          key={index}
                          className={`SecretaryTicket-comment-item ${
                            comment.isSecretaryComment
                              ? "SecretaryTicket-secretary-comment"
                              : "SecretaryTicket-user-comment"
                          }`}
                        >
                          <div className="SecretaryTicket-comment-header">
                            <span className="SecretaryTicket-comment-author">
                              {comment.isSecretaryComment
                                ? "Secretary"
                                : "User"}
                            </span>
                            <span className="SecretaryTicket-comment-date">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="SecretaryTicket-comment-text">
                            {comment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="SecretaryTicket-add-comment-section">
                <h3>Add Comment</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCommentSubmit(selectedTicket.id);
                  }}
                  className="SecretaryTicket-comment-form"
                >
                  <textarea
                    placeholder="Type your comment here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="SecretaryTicket-comment-input"
                  />
                  <button
                    type="submit"
                    className="SecretaryTicket-submit-comment-btn"
                  >
                    Add Comment
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="SecretaryTicket-no-ticket-selected">
              <div className="SecretaryTicket-no-selection-content">
                <div className="SecretaryTicket-selection-icon">📋</div>
                <h3>No Ticket Selected</h3>
                <p>
                  Select a ticket from the list to view details and manage it.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SecretaryTickets;
