import React from "react";
import "./Home.css";
import logo from "./SSS Logo.png";

const Home = () => {
  const currentYear = new Date().getFullYear();
  return (
    <>
      <header>
        <div className="logo">
          {" "}
          <img src={logo} alt="SSS Logo" />
        </div>
        <nav>
          <div className="nav-center">
            <ul>
              <li>
                <a href="#">Dashboard</a>
              </li>
              <li>
                <a href="#">Tickets</a>
              </li>
              <li>
                <a href="#">Appointments</a>
              </li>
              <li>
                <a href="#">Knowledge Base</a>
              </li>
              <li>
                <a href="#">Profile</a>
              </li>
            </ul>
          </div>

          <div className="signup-container">
            <a className="signup" href="#">
              SignUp
            </a>
          </div>
        </nav>
      </header>

      <main>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
        <p>dadaads</p>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h3 className="footer-heading">Smart Secretary System</h3>
            <p className="footer-text">
              Streamlining academic administration for IT department secretaries
              and students.
            </p>
          </div>

          <div className="footer-column">
            <h4 className="footer-subheading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="#" className="footer-link">
                  Tickets
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Appointments
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Knowledge Base
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Profile
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-subheading">Department Contact</h4>
            <address className="footer-address">
              <p>IT Department Office</p>
              <p>University Building, Room 205</p>
              <p>Email: it.secretary@university.edu</p>
              <p>Office Hours: 8AM - 3PM</p>
            </address>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {currentYear} Smart Secretary System - IT Department. All
            rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Home;
