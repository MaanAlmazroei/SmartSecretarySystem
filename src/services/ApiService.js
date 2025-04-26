import { getAuth } from "firebase/auth";

const API_BASE_URL = "http://localhost:5000"; // Update this with your actual backend URL

const getAuthHeader = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;

  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// User related API calls
export const createUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/create_user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const getUser = async (userId) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/get_user?userId=${userId}`, {
    headers,
  });
  return response.json();
};

export const getAllUsers = async () => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/get_all_users`, {
    headers,
  });
  return response.json();
};

export const updateUser = async (userId, userData) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/update_user`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ userId, ...userData }),
  });
  return response.json();
};

// Ticket related API calls
export const createTicket = async (ticketData) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/create_ticket`, {
    method: "POST",
    headers,
    body: JSON.stringify(ticketData),
  });
  return response.json();
};

export const getTicket = async (ticketId) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/get_ticket?ticketId=${ticketId}`,
    {
      headers,
    }
  );
  return response.json();
};

export const getAllTickets = async () => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/get_all_tickets`, {
    headers,
  });
  return response.json();
};

export const getUserAllTickets = async (userId) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/get_user_tickets?userId=${userId}`,
    {
      headers,
    }
  );
  return response.json();
};

export const updateTicket = async (ticketId, ticketData) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/update_ticket`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ ticketId, ...ticketData }),
  });
  return response.json();
};

export const deleteTicket = async (ticketId) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/delete_ticket?ticketId=${ticketId}`,
    {
      method: "DELETE",
      headers,
    }
  );
  return response.json();
};

// Appointment related API calls
export const createAppointment = async (appointmentData) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/create_appointment`, {
    method: "POST",
    headers,
    body: JSON.stringify(appointmentData),
  });
  return response.json();
};

export const getAppointment = async (appointmentId) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/get_appointment?appointmentId=${appointmentId}`,
    {
      headers,
    }
  );
  return response.json();
};

export const getAllAppointments = async () => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/get_all_appointments`, {
    headers,
  });
  return response.json();
};

export const getUserAllAppointments = async (userId) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/get_user_appointments?userId=${userId}`,
    {
      headers,
    }
  );
  return response.json();
};

export const updateAppointment = async (appointmentId, appointmentData) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/update_appointment`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ appointmentId, ...appointmentData }),
  });
  return response.json();
};

export const deleteAppointment = async (appointmentId) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/delete_appointment?appointmentId=${appointmentId}`,
    {
      method: "DELETE",
      headers,
    }
  );
  return response.json();
};

// Resource related API calls
export const createResource = async (resourceData) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/create_resource`, {
    method: "POST",
    headers,
    body: JSON.stringify(resourceData),
  });
  return response.json();
};

export const getResource = async (resourceId) => {
  const response = await fetch(
    `${API_BASE_URL}/get_resource?resourceId=${resourceId}`
  );
  return response.json();
};

export const getAllResources = async () => {
  const response = await fetch(`${API_BASE_URL}/get_all_resources`);
  return response.json();
};

export const updateResource = async (resourceId, resourceData) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/update_resource`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ resourceId, ...resourceData }),
  });
  return response.json();
};

export const deleteResource = async (resourceId) => {
  const headers = await getAuthHeader();
  if (!headers) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/delete_resource?resourceId=${resourceId}`,
    {
      method: "DELETE",
      headers,
    }
  );
  return response.json();
};
