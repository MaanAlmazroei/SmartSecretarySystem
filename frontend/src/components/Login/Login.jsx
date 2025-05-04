import React, { useState } from "react";
import logo from "../../assets/SSS_Logo.png";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    submitted: false,
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {
      email: formData.email ? "" : "Email is required",
      password: formData.password ? "" : "Password is required",
      submitted: true,
    };

    setErrors(newErrors);

    return Object.values(newErrors).every(
      (error) => error === "" || error === true
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await authLogin(formData.email, formData.password);
        if (response && response.userId) {
          toast.success("Logged in successfully!");
          setTimeout(() => {
            navigate("/");
          }, 500);
        } else {
          throw new Error("Login failed");
        }
      } catch (error) {
        toast.error("Failed to login");
      }
    }
  };

  return (
    <>
      <div className="Login-container">
        <div className="Login-wrapper">
          <div className="Login-formContainer">
            <h1 className="Login-title">Welcome</h1>
            <p className="Login-subtitle">Login to continue</p>

            <form onSubmit={handleSubmit} className="Login-form">
              <div className="Login-inputGroup">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`Login-input ${
                    errors.submitted && errors.email ? "error" : ""
                  }`}
                />
                <label htmlFor="email" className="Login-label">
                  Email
                </label>
                {errors.submitted && errors.email && (
                  <span className="Login-error">{errors.email}</span>
                )}
              </div>

              <div className="Login-inputGroup">
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`Login-input ${
                    errors.submitted && errors.password ? "error" : ""
                  }`}
                />
                <label htmlFor="password" className="Login-label">
                  Password
                </label>
                {errors.submitted && errors.password && (
                  <span className="Login-error">{errors.password}</span>
                )}
              </div>

              <div className="Login-options">
                <div className="Login-remember">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link to="/ForgotPassword" className="Login-forgot">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="Login-submitButton"
                data-testid="login-button"
              >
                Log In
              </button>

              <div className="Login-footer">
                Don't have an account?{" "}
                <Link to="/signup" className="Login-footerLink">
                  Sign up
                </Link>
              </div>
            </form>
          </div>

          <div className="Login-logoContainer">
            <img src={logo} alt="Company Logo" className="Login-logo" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
