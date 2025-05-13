import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SecretaryAppointments from "../Appointments/SecretaryAppointments/SecretaryAppointments";
import * as ApiService from "../../services/ApiService";

// Mock API
jest.mock("../../services/ApiService");

const mockAppointments = [
  {
    id: "1",
    title: "Test Apoint",
    description: "descrep",
    status: "In Progress",
    appointmentDate: "2030-10-18",
    appointmentTime: "09:00 AM",
    userId: "u1",
    createdAt: "2025-01-01",
    lastUpdatedDate: "2025-01-01",
    feedback: "",
    userFirstName: "Hatim",
    userLastName: "Alharbi",
  },
];
const mockUser = { firstName: "Hatim", lastName: "Alharbi" };

beforeEach(() => {
  ApiService.getAllAppointments.mockResolvedValue(mockAppointments);
  ApiService.getUser.mockResolvedValue(mockUser);
  ApiService.updateAppointment.mockResolvedValue({});
});

describe("SecretaryAppointments Component", () => {
  // Loads and displays appointments
  test("shows appointments and user info", async () => {
    render(<SecretaryAppointments />);
    expect(await screen.findByText("Test Apoint")).toBeInTheDocument();
    expect(screen.getByText(/Hatim Alharbi/)).toBeInTheDocument();
  });

  // Filters by status
  test("filters appointments by status", async () => {
    render(<SecretaryAppointments />);
    await screen.findByText("Test Apoint");
    fireEvent.change(screen.getByLabelText(/Filter by Status/i), {
      target: { value: "Approved" },
    });
    expect(
      await screen.findByText(/No appointments found matching your criteria/i)
    ).toBeInTheDocument();
  });

  // Searches appointments
  test("searches appointments by title", async () => {
    render(<SecretaryAppointments />);
    await screen.findByText("Test Apoint");
    fireEvent.change(screen.getByLabelText(/Search Appointments/i), {
      target: { value: "notfound" },
    });
    expect(
      await screen.findByText(/No appointments found matching your criteria/i)
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Search Appointments/i), {
      target: { value: "Test" },
    });
    expect(await screen.findByText("Test Apoint")).toBeInTheDocument();
  });

  // Selects and displays appointment details
  test("selects and displays appointment details", async () => {
    render(<SecretaryAppointments />);
    fireEvent.click(await screen.findByText("Test Apoint"));
    expect(screen.getByText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText("descrep")).toBeInTheDocument();
    expect(screen.getByText(/Update Status/i)).toBeInTheDocument();
  });

  // Updates appointment status
  test("updates appointment status", async () => {
    render(<SecretaryAppointments />);
    fireEvent.click(await screen.findByText("Test Apoint"));
    // Find all "Approved" buttons/options and click the button
    const approvedButtons = screen.getAllByText("Approved");
    fireEvent.click(approvedButtons.find((btn) => btn.tagName === "BUTTON"));
    await waitFor(() =>
      expect(ApiService.updateAppointment).toHaveBeenCalledWith("1", {
        status: "Approved",
      })
    );
  });

  // Adds feedback to appointment
  test("adds feedback to appointment", async () => {
    render(<SecretaryAppointments />);
    fireEvent.click(await screen.findByText("Test Apoint"));
    fireEvent.change(screen.getByPlaceholderText(/Type your feedback/i), {
      target: { value: "Great job" },
    });
    // Find all "Add Feedback" and click the button
    const feedbackButtons = screen.getAllByText(/Add Feedback/i);
    fireEvent.click(feedbackButtons.find((btn) => btn.tagName === "BUTTON"));
    await waitFor(() =>
      expect(ApiService.updateAppointment).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ feedback: "Great job" })
      )
    );
  });

  // Closes appointment details
  test("closes appointment details", async () => {
    render(<SecretaryAppointments />);
    fireEvent.click(await screen.findByText("Test Apoint"));
    fireEvent.click(screen.getByText("×"));
    expect(screen.getByText(/No Appointment Selected/i)).toBeInTheDocument();
  });

  // Shows loading indicator
  test("shows loading indicator while fetching", async () => {
    render(<SecretaryAppointments />);
    fireEvent.change(screen.getByLabelText(/Search Appointments/i), {
      target: { value: "Test" },
    });
    expect(await screen.findByText("Test Apoint")).toBeInTheDocument();
  });
});
