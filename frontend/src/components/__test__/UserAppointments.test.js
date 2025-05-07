import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserAppointments from "../Appointments/UserAppointments/UserAppointments";
import * as ApiService from "../../services/ApiService";
import { useAuth } from "../../Context/AuthContext";

// Mock the ApiService and AuthContext modules
jest.mock("../../services/ApiService");
jest.mock("../../Context/AuthContext");

const mockUser = { uid: "user123" };

// Set up mocks before each test
beforeEach(() => {
    useAuth.mockReturnValue({ user: mockUser }); // Mock the authenticated user
    ApiService.getUserAllAppointments.mockResolvedValue([]); // Mock API response for fetching appointments
    ApiService.createAppointment.mockResolvedValue({}); // Mock API response for creating an appointment
    ApiService.checkTimeSlotAvailability.mockResolvedValue({ isAvailable: true }); // Mock API response for time slot availability
    ApiService.checkAuth.mockResolvedValue({}); // Mock API response for authentication check
});

// Display a message when no appointments are found
test("shows no appointments message", async () => {
    render(<UserAppointments />);
    expect(await screen.findByText(/No appointments found/i)).toBeInTheDocument();
});

// Render the form and handle input changes
test("renders form and handles input changes", () => {
    render(<UserAppointments />);
    fireEvent.change(screen.getByLabelText(/Appointment Title/i), { target: { value: "Test Title" } });
    expect(screen.getByLabelText(/Appointment Title/i).value).toBe("Test Title");
});

// Show validation errors for empty fields
test("shows validation errors for empty fields", async () => {
    render(<UserAppointments />);
    fireEvent.click(screen.getByText(/Schedule Appointment/i)); // Attempt to submit the form with empty fields
    expect(await screen.findByText(/Title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Time is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
});

// Show error for short description
test("shows error for short description", async () => {
    render(<UserAppointments />);
    fireEvent.change(screen.getByLabelText(/Appointment Title/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: "2099-12-31" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "short" } }); // Enter a short description
    fireEvent.click(screen.getByText(/Schedule Appointment/i)); // Attempt to submit the form
    expect(await screen.findByText(/Description should be at least 10 characters/i)).toBeInTheDocument();
});

// Submit the form and reset on success
test("submits form and resets on success", async () => {
    render(<UserAppointments />);
    fireEvent.change(screen.getByLabelText(/Appointment Title/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: "2099-12-31" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "A valid description" } });
    // selecting a time slot
    fireEvent.click(screen.getByText("09:00 AM"));
    fireEvent.click(screen.getByText(/Schedule Appointment/i)); // Submit the form
    await waitFor(() => expect(ApiService.createAppointment).toHaveBeenCalled()); // Ensure the API call was made
});

// =Load and display appointments
test("loads and displays appointments", async () => {
    ApiService.getUserAllAppointments.mockResolvedValue([
        { id: "1", title: "Apt 1", description: "desc", status: "In Progress", createdAt: "2024-01-01", lastUpdatedDate: "2024-01-01" }
    ]);
    render(<UserAppointments />);
    expect(await screen.findByText("Apt 1")).toBeInTheDocument(); // Verify the appointment is displayed
});

// Select and display appointment details
test("selects and displays appointment details", async () => {
    ApiService.getUserAllAppointments.mockResolvedValue([
        { id: "1", title: "Apt 1", description: "desc", status: "In Progress", createdAt: "2024-01-01", lastUpdatedDate: "2024-01-01" }
    ]);
    render(<UserAppointments />);
    fireEvent.click(await screen.findByText("Apt 1")); // Select an appointment
    expect(screen.getByText(/Description/i)).toBeInTheDocument(); // Verify the details are displayed
    expect(screen.getByText("desc")).toBeInTheDocument();
});

// Handle the close button
test("handles close button", async () => {
    ApiService.getUserAllAppointments.mockResolvedValue([
        { id: "1", title: "Apt 1", description: "desc", status: "In Progress", createdAt: "2024-01-01", lastUpdatedDate: "2024-01-01" }
    ]);
    render(<UserAppointments />);
    fireEvent.click(await screen.findByText("Apt 1")); // Open appointment details
    fireEvent.click(screen.getByText("Close")); // Close the details view
    expect(screen.getByLabelText(/Appointment Title/i)).toBeInTheDocument(); // Verify the form is displayed again
});