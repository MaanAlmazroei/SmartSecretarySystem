import React, { useState } from 'react';
import logo from "../../assets/SSS_Logo.png";
import './SignUp.css';

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: [],
    confirmPassword: '',
    submitted: false
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const validatePassword = (password) => {
    const missingRequirements = [];
    
    if (!/[A-Z]/.test(password)) missingRequirements.push('uppercase letter');
    if (!/[a-z]/.test(password)) missingRequirements.push('lowercase letter');
    if (!/[0-9]/.test(password)) missingRequirements.push('number');
    if (password.length < 8) missingRequirements.push('minimum 8 characters');
    
    return missingRequirements;
  };

  const validateForm = () => {
    const newErrors = {
      firstName: formData.firstName ? '' : 'First name is required',
      lastName: formData.lastName ? '' : 'Last name is required',
      email: formData.email ? '' : 'Email is required',
      phone: formData.phone ? '' : 'Phone number is required',
      password: validatePassword(formData.password),
      confirmPassword: formData.confirmPassword === formData.password ? '' : 'Passwords must match',
      submitted: true
    };

    setErrors(newErrors);
    
    return Object.values(newErrors).every(error => 
      Array.isArray(error) ? error.length === 0 : error === ''
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form submitted:', formData);
    }
  };

  return (
    <>
    <div className="SignUp-container">
      <div className="SignUp-wrapper">
        <div className="SignUp-formContainer">
          <h1 className="SignUp-title">Create Account</h1>
          <p className="SignUp-subtitle">Join us for the best experience</p>

          <form onSubmit={handleSubmit} className="SignUp-form">
            <div className="SignUp-nameFields">
              <div className="SignUp-inputGroup SignUp-halfWidth">
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`SignUp-input ${errors.submitted && errors.firstName ? 'error' : ''}`}
                />
                <label htmlFor="firstName" className="SignUp-label">First Name</label>
                {errors.submitted && errors.firstName && (
                  <span className="SignUp-error">{errors.firstName}</span>
                )}
              </div>
              <div className="SignUp-inputGroup SignUp-halfWidth">
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`SignUp-input ${errors.submitted && errors.lastName ? 'error' : ''}`}
                />
                <label htmlFor="lastName" className="SignUp-label">Last Name</label>
                {errors.submitted && errors.lastName && (
                  <span className="SignUp-error">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="SignUp-inputGroup">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`SignUp-input ${errors.submitted && errors.email ? 'error' : ''}`}
              />
              <label htmlFor="email" className="SignUp-label">Email</label>
              {errors.submitted && errors.email && (
                <span className="SignUp-error">{errors.email}</span>
              )}
            </div>

            <div className="SignUp-inputGroup">
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`SignUp-input ${errors.submitted && errors.phone ? 'error' : ''}`}
                pattern="[0-9]{10}"
                title="Please enter a 10-digit phone number"
              />
              <label htmlFor="phone" className="SignUp-label">Phone Number</label>
              {errors.submitted && errors.phone && (
                <span className="SignUp-error">{errors.phone}</span>
              )}
            </div>

            <div className="SignUp-inputGroup">
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={`SignUp-input ${errors.submitted && errors.password.length > 0 ? 'error' : ''}`}
              />
              <label htmlFor="password" className="SignUp-label">Password</label>
              {errors.submitted && errors.password.length > 0 && (
                <div className="SignUp-passwordRequirements">
                  <p>Password must contain:</p>
                  <ul>
                    {errors.password.map((req, index) => (
                      <li key={index} className="invalid">At least one {req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="SignUp-inputGroup">
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`SignUp-input ${errors.submitted && errors.confirmPassword ? 'error' : ''}`}
              />
              <label htmlFor="confirmPassword" className="SignUp-label">Confirm Password</label>
              {errors.submitted && errors.confirmPassword && (
                <span className="SignUp-error">{errors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="SignUp-submitButton">
              Sign Up
            </button>
          </form>

          <div className="SignUp-footer">
            Already have an account? <a href="/login" className="SignUp-footerLink">Log in</a>
          </div>
        </div>
        
        <div className="SignUp-logoContainer">
          <img src={logo} alt="Company Logo" className="SignUp-logo" style={{ background: 'transparent' }} />
        </div>
      </div>
    </div>
    </>
  );
}

export default SignUp;