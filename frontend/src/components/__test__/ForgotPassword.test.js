import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ForgotPassword from "../ForgotPassword/ForgotPassword";


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


  });