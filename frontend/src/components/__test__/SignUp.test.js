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

describe("SignUp Component", () => {
  let firstNameInput,
    lastNameInput,
    emailInput,
    phoneInput,
    passwordInput,
    confirmPasswordInput,
    signUpButton;

  beforeEach(() => {
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

  test("submits the form successfully", async () => {
    fireEvent.change(firstNameInput, { target: { value: "hatim" } });
    fireEvent.change(lastNameInput, { target: { value: "alharbi" } });
    fireEvent.change(emailInput, { target: { value: "hatinsta1@gmail.com" } });
    fireEvent.change(phoneInput, { target: { value: "0555411384" } });
    fireEvent.change(passwordInput, { target: { value: "Password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123" },
    });

    fireEvent.click(signUpButton);

    expect(createUser).toHaveBeenCalledWith({
      firstName: "hatim",
      lastName: "alharbi",
      email: "hatinsta1@gmail.com",
      phone: "0555411384",
      password: "Password123",
    });
  });
  test("validates the form and updates errors state", () => {
    // Leave fields empty and submit the form
    fireEvent.click(signUpButton);

    // Check for validation errors
    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /uppercase letterlowercase letternumberat least 8 characters/i
      )
    ).toBeInTheDocument();
  });
});
