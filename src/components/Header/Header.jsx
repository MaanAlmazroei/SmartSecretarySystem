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
    <header className="header">
      <div className="logo">
        <NavLink to="/">
          <img src={logo} alt="SSS Logo" />
        </NavLink>
      </div>

      <div
        className={`menu-btn ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={menuOpen ? "active" : ""}>
        <div className="nav-center">
          <ul>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "nav-active" : "")}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tickets"
                className={({ isActive }) => (isActive ? "nav-active" : "")}
              >
                Tickets
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/appointments"
                className={({ isActive }) => (isActive ? "nav-active" : "")}
              >
                Appointments
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/resources"
                className={({ isActive }) => (isActive ? "nav-active" : "")}
              >
                Resources
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? "nav-active" : "")}
              >
                Profile
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      <div className="signup-container">
        {user ? (
          <NavLink to="/" className="logout-btn" onClick={handleLogout}>
            Sign Out
          </NavLink>
        ) : (
          <>
            <NavLink to="/login" className="login">
              Log In
            </NavLink>
            <NavLink to="/signup" className="signup">
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
