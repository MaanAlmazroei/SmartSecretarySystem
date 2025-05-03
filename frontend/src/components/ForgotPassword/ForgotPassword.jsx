import React, { useState } from "react";
import logo from "../../assets/SSS_Logo.png";
import "./ForgotPassword.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function ForgotPassword() {
  const navigate = useNavigate();
  
  // Steps: 1 = email entry, 2 = verification code, 3 = new password
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
    submitted: false
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateEmail = () => {
    const newErrors = {
      ...errors,
      email: formData.email ? "" : "Email is required",
      submitted: true,
    };

    setErrors(newErrors);
    return !newErrors.email;
  };

  const validateCode = () => {
    const newErrors = {
      ...errors,
      verificationCode: formData.verificationCode ? "" : "Verification code is required",
      submitted: true,
    };

    setErrors(newErrors);
    return !newErrors.verificationCode;
  };

  const validatePassword = () => {
    const newErrors = {
      ...errors,
      newPassword: formData.newPassword ? "" : "New password is required",
      confirmPassword: formData.confirmPassword ? "" : "Please confirm your password",
      submitted: true,
    };

    if (formData.newPassword && formData.confirmPassword && 
        formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    
    if (validateEmail()) {
      try {
        // Call your API to request verification code here
        // For demo purposes, we're just moving to next step
        toast.success("Verification code sent to your email!");
        setStep(2);
      } catch (error) {
        toast.error(error.message || "Failed to send verification code");
      }
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (validateCode()) {
      try {
        // Call your API to verify the code here
        // For demo purposes, we're just moving to next step
        toast.success("Code verified successfully!");
        setStep(3);
      } catch (error) {
        toast.error(error.message || "Invalid verification code");
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (validatePassword()) {
      try {
        // Call your API to reset the password here
        toast.success("Password reset successfully!");
        navigate("/login");
      } catch (error) {
        toast.error(error.message || "Failed to reset password");
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className="ForgotPassword-title">Forgot Password</h1>
            <p className="ForgotPassword-subtitle">Enter your email to receive a verification code</p>
            
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
                Send Verification Code
              </button>

              <div className="ForgotPassword-footer">
                Remember your password?{" "}
                <Link to="/login" className="ForgotPassword-footerLink">
                  Back to Login
                </Link>
              </div>
            </form>
          </>
        );
      
      case 2:
        return (
          <>
            <h1 className="ForgotPassword-title">Enter Code</h1>
            <p className="ForgotPassword-subtitle">Enter the verification code sent to your email</p>
            
            <form onSubmit={handleVerifyCode} className="ForgotPassword-form">
              <div className="ForgotPassword-inputGroup">
                <input
                  type="text"
                  id="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  className={`ForgotPassword-input ${
                    errors.submitted && errors.verificationCode ? "error" : ""
                  }`}
                />
                <label htmlFor="verificationCode" className="ForgotPassword-label">
                  Verification Code
                </label>
                {errors.submitted && errors.verificationCode && (
                  <span className="ForgotPassword-error">{errors.verificationCode}</span>
                )}
              </div>

              <div className="ForgotPassword-actions">
                <button 
                  type="button" 
                  className="ForgotPassword-backButton"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button type="submit" className="ForgotPassword-submitButton">
                  Verify Code
                </button>
              </div>

              <div className="ForgotPassword-resend">
                Didn't receive the code?{" "}
                <button 
                  type="button" 
                  className="ForgotPassword-resendLink"
                  onClick={() => {
                    toast.success("New verification code sent!");
                  }}
                >
                  Resend
                </button>
              </div>
            </form>
          </>
        );
      
      case 3:
        return (
          <>
            <h1 className="ForgotPassword-title">Reset Password</h1>
            <p className="ForgotPassword-subtitle">Create a new password for your account</p>
            
            <form onSubmit={handleResetPassword} className="ForgotPassword-form">
              <div className="ForgotPassword-inputGroup">
                <input
                  type="password"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`ForgotPassword-input ${
                    errors.submitted && errors.newPassword ? "error" : ""
                  }`}
                />
                <label htmlFor="newPassword" className="ForgotPassword-label">
                  New Password
                </label>
                {errors.submitted && errors.newPassword && (
                  <span className="ForgotPassword-error">{errors.newPassword}</span>
                )}
              </div>

              <div className="ForgotPassword-inputGroup">
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`ForgotPassword-input ${
                    errors.submitted && errors.confirmPassword ? "error" : ""
                  }`}
                />
                <label htmlFor="confirmPassword" className="ForgotPassword-label">
                  Confirm Password
                </label>
                {errors.submitted && errors.confirmPassword && (
                  <span className="ForgotPassword-error">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="ForgotPassword-actions">
                <button 
                  type="button" 
                  className="ForgotPassword-backButton"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button type="submit" className="ForgotPassword-submitButton">
                  Reset Password
                </button>
              </div>
            </form>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="ForgotPassword-container">
      <div className="ForgotPassword-wrapper">
        <div className="ForgotPassword-formContainer">
          {renderStep()}
        </div>

        <div className="ForgotPassword-logoContainer">
          <img src={logo} alt="Company Logo" className="ForgotPassword-logo" />
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;