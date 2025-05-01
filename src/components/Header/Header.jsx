import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import logo from "../../assets/SSS_Logo.png";
import "./Header.css";
import { useAuth } from "../../Context/AuthContext";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      toast.success("Signed out successfully!");
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      toast.error("Sign out failed!");
    }
  };

  return (
    <header className="Header-header">
      <div className="Header-logo">
        <NavLink to="/">
          <img src={logo} alt="SSS Logo" />
        </NavLink>
      </div>

      <div
        className={`Header-menu-btn ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={`Header-nav ${menuOpen ? "active" : ""}`}>
        <div className="Header-nav-center">
          <ul>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "Header-nav-active" : "")}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tickets"
                className={({ isActive }) => (isActive ? "Header-nav-active" : "")}
              >
                Tickets
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/appointments"
                className={({ isActive }) => (isActive ? "Header-nav-active" : "")}
              >
                Appointments
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/resources"
                className={({ isActive }) => (isActive ? "Header-nav-active" : "")}
              >
                Resources
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? "Header-nav-active" : "")}
              >
                Profile
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      <div className="Header-signup-container">
        {user ? (
          <NavLink to="/" className="Header-logout-btn" onClick={handleLogout}>
            Sign Out
          </NavLink>
        ) : (
          <>
            <NavLink to="/login" className="Header-login">
              Log In
            </NavLink>
            <NavLink to="/signup" className="Header-signup">
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;