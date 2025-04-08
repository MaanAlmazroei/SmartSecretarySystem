import React from "react";
import "./Footer.css";
import {Link} from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
      <footer>
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
                <Link to="/knowledge-base" className="footer-link">
                  Knowledge Base
                </Link>
              </li>
              <li>
                <Link to="/profile" className="footer-link">
                  Profile
                </Link>
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
  );
};

export default Footer;
