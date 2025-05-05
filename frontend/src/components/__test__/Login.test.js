import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import Login from '../Login/Login';
import { BrowserRouter } from "react-router-dom"; 

describe('Login Component', () => {

    beforeEach(() => {
        render(
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        );
      });

    test("renders login form with login button", () => {

        const loginButton = screen.getByTestId("login-button");
        expect(loginButton).toBeInTheDocument();
 })

 test("renders email input and password input", async () => {

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    // Simulate user input bcs email and pass are part of formData object in Login.jsx,
    //  so need to stimulate user input
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
  
    // Assert that the input values are updated
    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("shows validation errors when form is submitted with empty fields", () => {
    const loginButton = screen.getByTestId("login-button");
    fireEvent.click(loginButton);
  
    const emailError = screen.getByText(/email is required/i);
    const passwordError = screen.getByText(/password is required/i);
  
    expect(emailError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();
  });

  test("renders forgot password and sign up links", () => {
    const forgotPasswordLink = screen.getByText(/forgot password/i);
    const signUpLink = screen.getByText(/sign up/i);
  
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute("href", "/ForgotPassword");
  
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/signup");
  });

  test("renders and toggles remember me checkbox", () => {
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
  
    expect(rememberMeCheckbox).toBeInTheDocument();
    expect(rememberMeCheckbox.checked).toBe(false);
  
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox.checked).toBe(true);
  });

});