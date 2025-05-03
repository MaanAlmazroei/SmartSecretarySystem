const API_BASE_URL = "http://localhost:5000";

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "An error occurred");
  }
  return response.json();
};

// Authentication related API calls
export const createUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/create_user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

export const checkAuth = async () => {
  const response = await fetch(`${API_BASE_URL}/check_auth`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// User related API calls
export const getUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/get_user?userId=${userId}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

export const getAllUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/get_all_users`, {
    credentials: "include",
  });
  return handleResponse(response);
};

export const updateUser = async (userId, userData) => {
  const response = await fetch(`${API_BASE_URL}/update_user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ userId, ...userData }),
  });
  return handleResponse(response);
};

// Ticket related API calls
export const createTicket = async (ticketData) => {
  const response = await fetch(`${API_BASE_URL}/create_ticket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(ticketData),
  });
  return handleResponse(response);
};

export const getTicket = async (ticketId) => {
  const response = await fetch(
    `${API_BASE_URL}/get_ticket?ticketId=${ticketId}`,
    {
      credentials: "include",
    }
  );
  return handleResponse(response);
};

export const getAllTickets = async () => {
  const response = await fetch(`${API_BASE_URL}/get_all_tickets`, {
    credentials: "include",
  });
  return handleResponse(response);
};

export const getUserAllTickets = async (userId) => {
  const response = await fetch(
    `${API_BASE_URL}/get_user_tickets?userId=${userId}`,
    {
      credentials: "include",
    }
  );
  return handleResponse(response);
};

export const updateTicket = async (ticketId, ticketData) => {
  const response = await fetch(`${API_BASE_URL}/update_ticket`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ ticketId, ...ticketData }),
  });
  return response.json();
};

export const deleteTicket = async (ticketId) => {
  const response = await fetch(
    `${API_BASE_URL}/delete_ticket?ticketId=${ticketId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  return response.json();
};

// Appointment related API calls
export const createAppointment = async (appointmentData) => {
  const response = await fetch(`${API_BASE_URL}/create_appointment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(appointmentData),
  });
  return response.json();
};

export const getAppointment = async (appointmentId) => {
  const response = await fetch(
    `${API_BASE_URL}/get_appointment?appointmentId=${appointmentId}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

export const getAllAppointments = async () => {
  const response = await fetch(`${API_BASE_URL}/get_all_appointments`, {
    credentials: "include",
  });
  return response.json();
};

export const getUserAllAppointments = async (userId) => {
  const response = await fetch(
    `${API_BASE_URL}/get_user_appointments?userId=${userId}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

export const updateAppointment = async (appointmentId, appointmentData) => {
  const response = await fetch(`${API_BASE_URL}/update_appointment`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ appointmentId, ...appointmentData }),
  });
  return response.json();
};

export const deleteAppointment = async (appointmentId) => {
  const response = await fetch(
    `${API_BASE_URL}/delete_appointment?appointmentId=${appointmentId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  return response.json();
};

export const checkTimeSlotAvailability = async (date, time) => {
  const response = await fetch(
    `${API_BASE_URL}/check_time_slot_availability?date=${date}&time=${time}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

// Resource related API calls
export const createResource = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/create_resource`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  return response.json();
};

export const getResource = async (resourceId) => {
  const response = await fetch(
    `${API_BASE_URL}/get_resource?resourceId=${resourceId}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

export const getAllResources = async () => {
  const response = await fetch(`${API_BASE_URL}/get_all_resources`, {
    credentials: "include",
  });
  return response.json();
};

export const updateResource = async (resourceId, resourceData) => {
  const formData = new FormData();

  Object.keys(resourceData).forEach((key) => {
    if (key === "file") {
      formData.append("file", resourceData[key]);
    } else {
      formData.append(key, resourceData[key]);
    }
  });

  // Add resourceId to formData
  formData.append("resourceId", resourceId);

  const response = await fetch(`${API_BASE_URL}/update_resource`, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  return response.json();
};

export const deleteResource = async (resourceId) => {
  const response = await fetch(
    `${API_BASE_URL}/delete_resource?resourceId=${resourceId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  return response.json();
};
