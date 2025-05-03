import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SignUp from "../SignUp/SignUp";
import { createUser } from "../../services/ApiService";
import { useAuth } from "../../Context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

jest.mock("../../services/ApiService", () => ({
  createUser: jest.fn(),
}));

jest.mock("../../Context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("SignUp Component", () => {
  let firstNameInput, lastNameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput, signUpButton;
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      login: jest.fn(), // Mock the login function
    });

    useNavigate.mockReturnValue(mockNavigate); // Mock the useNavigate hook

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    
    firstNameInput = screen.getByLabelText(/first name/i);
    lastNameInput = screen.getByLabelText(/last name/i);
    emailInput = screen.getByLabelText(/email/i);
    phoneInput = screen.getByLabelText(/phone number/i);
    passwordInput = screen.getByTestId("password");
    confirmPasswordInput = screen.getByTestId("confirm-password");
    signUpButton = screen.getByTestId("sign-up-button");
  });

  test("submits the form successfully and navigates to the dashboard", async () => {
    createUser.mockResolvedValue({ success: true }); // Mock API success

    fireEvent.change(firstNameInput, { target: { value: "hatim" } });
    fireEvent.change(lastNameInput, { target: { value: "alharbi" } });
    fireEvent.change(emailInput, { target: { value: "hatimalharbi@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "0555411000" } });
    fireEvent.change(passwordInput, { target: { value: "Password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Password123" } });

    fireEvent.click(signUpButton);

    // Wait for async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 0));
    console.log(createUser.mock.calls);
    // Assert navigation
    expect(mockNavigate).toHaveBeenCalledWith("/"); // Replace "/dashboard" with the actual route
    expect(toast.success).toHaveBeenCalledWith("Account created successfully!");
  });
}); 