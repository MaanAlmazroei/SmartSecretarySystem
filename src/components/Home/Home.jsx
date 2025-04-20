import "./Home.css";
import FCIT from "../../assets/kau_fcit_building.jpg";
import { FaRobot, FaCalendarCheck, FaTicketAlt, FaBook } from "react-icons/fa";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <div className="main-header">
        <div className="image-header">
          <img className="fcit-image" src={FCIT} alt="FCIT Building" />
          <div id="cover"></div>
          <div className="image-text">
            <h1>Welcome to Smart Secretary System</h1>
            <p>
              Your digital assistant for managing campus services with ease!
              Whether you need to book an appointment, submit a request, or get
              quick answers, our system is here to help.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Section */}
      <section className="features">
        <h2>Feature Highlights</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaRobot className="feature-icon" />
            <h3>AI Chatbot</h3>
            <p>Get instant answers to common questions.</p>
          </div>

          <div className="feature-card">
            <Link to="/appointments" className="card-link">
              <FaCalendarCheck className="feature-icon" />
              <h3>Appointments</h3>
              <p>Schedule a meeting with the secretary in a few clicks.</p>
            </Link>
          </div>

          <div className="feature-card">
            <FaTicketAlt className="feature-icon" />
            <h3>Ticketing System</h3>
            <p>Submit and track your requests easily.</p>
          </div>

          <div className="feature-card">
            <FaBook className="feature-icon" />
            <h3>Self-Service Portal</h3>
            <p>Learn about university services and processes.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
