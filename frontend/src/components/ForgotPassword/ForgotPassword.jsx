import React, { useState } from "react";
import logo from "../../assets/SSS_Logo.png";
import "./ForgotPassword.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/FirebaseConfig";

function ForgotPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({ email: "", submitted: false });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateEmail = () => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
    setErrors({
      email: emailValid ? "" : "Email is required",
      submitted: true,
    });
    return emailValid;
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();

    if (validateEmail()) {
      try {
        await sendPasswordResetEmail(auth, formData.email);
        toast.success("Password reset link sent to your email.");
        setTimeout(() => {
          console.log("Navigating to /login");
          navigate("/login");
        }, 500);
      } catch (error) {
        toast.error("Failed to send reset link.");
      }
    }
  };

  return (
    <div className="ForgotPassword-container">
      <div className="ForgotPassword-wrapper">
        <div className="ForgotPassword-formContainer">
          <h1 className="ForgotPassword-title">Forgot Password</h1>
          <p className="ForgotPassword-subtitle">
            Enter your email to receive a password reset link
          </p>

          <form onSubmit={handleRequestCode} className="ForgotPassword-form">
            <div className="ForgotPassword-inputGroup">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`ForgotPassword-input ${
                  errors.submitted && errors.email ? "error" : ""
                }`}
              />
              <label htmlFor="email" className="ForgotPassword-label">
                Email
              </label>
              {errors.submitted && errors.email && (
                <span className="ForgotPassword-error">{errors.email}</span>
              )}
            </div>

            <button type="submit" className="ForgotPassword-submitButton">
              Send Reset Link
            </button>

            <div className="ForgotPassword-footer">
              Remember your password?{" "}
              <Link to="/login" className="ForgotPassword-footerLink">
                Back to Login
              </Link>
            </div>
          </form>
        </div>

        <div className="ForgotPassword-logoContainer">
          <img src={logo} alt="Company Logo" className="ForgotPassword-logo" />
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
