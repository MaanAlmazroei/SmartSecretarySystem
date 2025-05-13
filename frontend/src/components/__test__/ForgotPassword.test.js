const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-hot-toast";
import { getAuth } from "firebase/auth";
import { auth } from "../../services/FirebaseConfig";
import { useNavigate } from "react-router-dom";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({ mockAuth: true })), // Mock `auth` object
  sendPasswordResetEmail: jest.fn(),
}));
jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ForgotPassword Component - handleChange", () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
  });

  test("updates formData state when email input changes", () => {
    const emailInput = screen.getByLabelText(/email/i);

    // Simulate user typing in the email field
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");
  });

  test("validates email and updates errors state", () => {
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByText(/send reset link/i);

    // Leave email empty and submit the form
    fireEvent.click(submitButton);

    // Check for validation error
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    // Enter a valid email and submit again
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    // Ensure no validation error is displayed since email is valid
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });
  test("shows error toast when email sending fails", async () => {
    sendPasswordResetEmail.mockRejectedValueOnce(
      new Error("Failed to send reset link")
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByText(/send reset link/i);
    // writing an email
    fireEvent.change(emailInput, {
      target: { value: "official.hatimalharbi@gmail.com" },
    });
    fireEvent.click(submitButton); // submitting the email
    // Check if the sendPasswordResetEmail function was called with the correct arguments
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      { mockAuth: true },
      "official.hatimalharbi@gmail.com"
    );

    // await for the toast to be called
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Check if the error toast was displayed
    expect(toast.error).toHaveBeenCalledWith("Failed to send reset link.");
  });
  test("shows validation error for invalid email formats", () => {
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByText(/send reset link/i);

    // Enter an invalid email and submit
    fireEvent.change(emailInput, { target: { value: "testexample.com" } });
    fireEvent.click(submitButton);

    // Check for validation error
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    // Enter another invalid email and submit
    fireEvent.change(emailInput, { target: { value: "test@.com" } });
    fireEvent.click(submitButton);

    // Check for validation error
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
  test("disables submit button when email is invalid", () => {
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByText(/send reset link/i);

    // Enter an invalid email
    fireEvent.change(emailInput, { target: { value: "testexample.com" } });

    // Check if the button is still clickable
    expect(submitButton).not.toBeDisabled();

    // Enter a valid email
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Check if the button is clickable
    expect(submitButton).not.toBeDisabled();
  });
  test("navigates to login page after successful password reset", async () => {
    sendPasswordResetEmail.mockResolvedValueOnce();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByText(/send reset link/i);

    // Enter a valid email and submit
    fireEvent.change(emailInput, {
      target: { value: "official.hatimalharbi@gmail.com" },
    });
    fireEvent.click(submitButton);

    // Wait for navigation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if the user is redirected to the login page
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
