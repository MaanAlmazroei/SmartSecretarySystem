import React, { useState } from "react";
import logo from "../../assets/SSS_Logo.png";
import "./SignUp.css";
import { createUser } from "../../services/ApiService";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: [],
    confirmPassword: "",
    submitted: false,
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validatePassword = (password) => {
    const missingRequirements = [];

    if (!/[A-Z]/.test(password)) {
      missingRequirements.push("uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      missingRequirements.push("lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      missingRequirements.push("number");
    }
    if (password.length < 8) {
      missingRequirements.push("at least 8 characters");
    }

    return missingRequirements;
  };

  const validateForm = () => {
    const passwordErrors = validatePassword(formData.password);
    const newErrors = {
      firstName: formData.firstName ? "" : "First name is required",
      lastName: formData.lastName ? "" : "Last name is required",
      email: formData.email ? "" : "Email is required",
      phone: formData.phone ? "" : "Phone number is required",
      password: passwordErrors,
      confirmPassword:
        formData.password === formData.confirmPassword
          ? ""
          : "Passwords do not match",
      submitted: true,
    };

    setErrors(newErrors);

    return Object.values(newErrors).every(
      (error) =>
        (Array.isArray(error) && error.length === 0) ||
        error === "" ||
        error === true
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const { confirmPassword, ...signupData } = formData;
        const response = await createUser(signupData);

        if (response.error) {
          throw new Error(response.error);
        }

        toast.success(
          "Account created successfully! Please check your email to verify your account before logging in."
        );
        setTimeout(() => {
          navigate("/login");
        }, 500);
      } catch (error) {
        toast.error(error.message || "Failed to create account");
      }
    }
  };

  return (
    <>
      <div className="signUp-container">
        <div className="signUp-wrapper">
          <div className="signUp-formContainer">
            <h1 className="signUp-title">Create Account</h1>
            <p className="signUp-subtitle">Join us for the best experience</p>

            <form onSubmit={handleSubmit} className="signUp-form">
              <div className="signUp-nameFields">
                <div className="signUp-inputGroup signUp-halfWidth">
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`signUp-input ${
                      errors.submitted && errors.firstName ? "error" : ""
                    }`}
                  />
                  <label htmlFor="firstName" className="signUp-label">
                    First Name
                  </label>
                  {errors.submitted && errors.firstName && (
                    <span className="signUp-error">{errors.firstName}</span>
                  )}
                </div>
                <div className="signUp-inputGroup signUp-halfWidth">
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`signUp-input ${
                      errors.submitted && errors.lastName ? "error" : ""
                    }`}
                  />
                  <label htmlFor="lastName" className="signUp-label">
                    Last Name
                  </label>
                  {errors.submitted && errors.lastName && (
                    <span className="signUp-error">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="signUp-inputGroup">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`signUp-input ${
                    errors.submitted && errors.email ? "error" : ""
                  }`}
                />
                <label htmlFor="email" className="signUp-label">
                  Email
                </label>
                {errors.submitted && errors.email && (
                  <span className="signUp-error">{errors.email}</span>
                )}
              </div>

              <div className="signUp-inputGroup">
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`signUp-input ${
                    errors.submitted && errors.phone ? "error" : ""
                  }`}
                  pattern="[0-9]{10}"
                  title="Please enter a 10-digit phone number"
                />
                <label htmlFor="phone" className="signUp-label">
                  Phone Number
                </label>
                {errors.submitted && errors.phone && (
                  <span className="signUp-error">{errors.phone}</span>
                )}
              </div>

              <div className="signUp-inputGroup">
                <input
                  type="password"
                  id="password"
                  data-testid="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`signUp-input ${
                    errors.submitted && errors.password.length > 0
                      ? "error"
                      : ""
                  }`}
                />
                <label htmlFor="password" className="signUp-label">
                  Password
                </label>
                {errors.submitted && errors.password && (
                  <span className="signUp-error">{errors.password}</span>
                )}

                {errors.submitted &&
                  errors.passwordDetails &&
                  errors.passwordDetails.length > 0 && (
                    <div className="signUp-passwordRequirements">
                      <p>Password must contain:</p>
                      <ul>
                        {errors.passwordDetails.map((req, index) => (
                          <li key={index} className="invalid">
                            At least one {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              <div className="signUp-inputGroup">
                <input
                  type="password"
                  id="confirmPassword"
                  data-testid="confirm-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`signUp-input ${
                    errors.submitted && errors.confirmPassword ? "error" : ""
                  }`}
                />
                <label htmlFor="confirmPassword" className="signUp-label">
                  Confirm Password
                </label>
                {errors.submitted && errors.confirmPassword && (
                  <span className="signUp-error">{errors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                className="signUp-submitButton"
                data-testid="sign-up-button"
              >
                Sign Up
              </button>
            </form>

            <div className="signUp-footer">
              Already have an account?{" "}
              <Link to="/login" className="signUp-footerLink">
                Log in
              </Link>
            </div>
          </div>

          <div className="signUp-logoContainer">
            <img
              src={logo}
              alt="Company Logo"
              className="signUp-logo"
              style={{ background: "transparent" }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
