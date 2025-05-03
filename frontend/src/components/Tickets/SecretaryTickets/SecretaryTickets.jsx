import React, { useState, useEffect, useCallback } from "react";
import "./SecretaryTickets.css";
import {
  getAllTickets,
  updateTicket,
  getUser,
} from "../../../services/ApiService";

const SecretaryTickets = () => {
  const [ticketsList, setTicketsList] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [newFeedback, setNewFeedback] = useState("");
  const [loading, setLoading] = useState(true);

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

  const fetchAllTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllTickets();
      if (response.error) {
        throw new Error(response.error);
      }

      const ticketsWithUserDetails = await Promise.all(
        response.map(async (ticket) => {
          const userInfo = await fetchUserDetails(ticket.userId);
          return {
            ...ticket,
            userFirstName: userInfo?.firstName || "Unknown",
            userLastName: userInfo?.lastName || "User",
          };
        })
      );

      setTicketsList(ticketsWithUserDetails);
      applyFilters(ticketsWithUserDetails, statusFilter, searchTerm);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tickets:", error.message);
      setLoading(false);
    }
  }, [statusFilter, searchTerm, fetchUserDetails]);

  useEffect(() => {
    fetchAllTickets();
  }, [fetchAllTickets]);

  const applyFilters = (tickets, status, term) => {
    let filtered = [...tickets];

    if (status !== "All") {
      filtered = filtered.filter((ticket) => ticket.status === status);
    }

    if (term) {
      const searchLower = term.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          `${ticket.userFirstName} ${ticket.userLastName}`
            .toLowerCase()
            .includes(searchLower)
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
      setNewFeedback(selected.feedback || "");
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await updateTicket(ticketId, { status: newStatus });
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          status: newStatus,
          lastUpdatedDate: new Date().toISOString()
        });
      }
      
      await fetchAllTickets();
    } catch (error) {
      console.error("Error updating ticket status:", error.message);
    }
  };

  const handleFeedbackSubmit = async (ticketId) => {
    if (!newFeedback.trim()) return;

    try {
      const response = await updateTicket(ticketId, {
        feedback: newFeedback,
        lastUpdatedDate: new Date().toISOString(),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setNewFeedback("");
      await fetchAllTickets();
    } catch (error) {
      console.error("Error adding feedback:", error.message);
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
        return "ticket-status-in-progress";
      case "Resolved":
        return "ticket-status-resolved";
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
        <div className="SecretaryTicket-filter-left">
          <div className="SecretaryTicket-filter-group">
            <label htmlFor="statusFilter">Filter by Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="SecretaryTicket-filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="SecretaryTicket-filter-right">
          <div className="SecretaryTicket-filter-group SecretaryTicket-search-group">
            <label htmlFor="ticketSearch">Search Tickets:</label>
            <input
              type="text"
              id="ticketSearch"
              placeholder="Search by title, description or name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="SecretaryTicket-search-input"
            />
          </div>
        </div>
      </div>

      <div className="SecretaryTicket-main">
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
                      User: {ticket.userFirstName} {ticket.userLastName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

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
                  <span>
                    {selectedTicket.userFirstName} {selectedTicket.userLastName}
                  </span>
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
                </div>
              </div>

              <div className="SecretaryTicket-add-comment-section">
                <h3>Add Feedback</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleFeedbackSubmit(selectedTicket.id);
                  }}
                  className="SecretaryTicket-comment-form"
                >
                  <textarea
                    placeholder="Type your feedback here..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    className="SecretaryTicket-comment-input"
                  />
                  <button
                    type="submit"
                    className="SecretaryTicket-submit-comment-btn"
                  >
                    Add Feedback
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