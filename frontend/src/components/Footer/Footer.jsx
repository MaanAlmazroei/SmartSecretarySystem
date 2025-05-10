import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
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
              <Link to="/tickets" className="footer-link">
                Tickets
              </Link>
            </li>
            <li>
              <Link to="/appointments" className="footer-link">
                Appointments
              </Link>
            </li>
            <li>
              <Link to="/resources" className="footer-link">
                Resources
              </Link>
            </li>
            <li>
              <Link to="/profile" className="footer-link">
                Profile
              </Link>
            </li>
            <li>
              <Link to="https://docs.google.com/forms/d/e/1FAIpQLSf_BOlGVRzFOyV_Qqt3whabtvrpMQP6fW7kooHI4i11pnAV0A/viewform?usp=dialog" 
              className="footer-link"
              target="_blank"
              >
                Feedback
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-subheading">Department Contact</h4>
          <address className="footer-address">
            <p>IT Department Office</p>
            <p>FCIT Building 80A, Room #</p>
            <p>Email: fcit-it@kau.edu.sa</p>
            <p>Office Hours: 8AM - 5PM</p>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Smart Secretary System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
