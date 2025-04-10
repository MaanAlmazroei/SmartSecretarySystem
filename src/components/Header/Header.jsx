import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaMoon } from "react-icons/fa";
import logo from "../../assets/SSS_Logo.png";
import "./Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo">
        <NavLink to="/">
          <img src={logo} alt="SSS Logo" />
        </NavLink>
      </div>

      {/* Mobile menu button */}
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
                Dashboard
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
                to="/knowledge-base"
                className={({ isActive }) => (isActive ? "nav-active" : "")}
              >
                Knowledge Base
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
        <div className="header-dark-container">
          <button className="header-dark-btn">
            <FaMoon className="header-dark-icon" />
          </button>
        </div>
        <div className="signup-container">
          <NavLink to="/signup" className="signup">
            Sign Up
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Header;
