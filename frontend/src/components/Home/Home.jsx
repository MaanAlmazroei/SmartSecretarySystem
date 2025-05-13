import "./Home.css";
import FCIT from "../../assets/kau_fcit_building.jpg";
import { FaRobot, FaCalendarCheck, FaTicketAlt, FaBook } from "react-icons/fa";

const Home = () => {
  return (
    <>
      <div className="Home-main-header">
        <div className="Home-image-header">
          <img className="Home-fcit-image" src={FCIT} alt="FCIT Building" />
          <div className="Home-cover"></div>
          <div className="Home-image-text">
            <h1 className="Home-image-text-heading">
              Welcome to Smart Secretary System
            </h1>
            <p className="Home-image-text-paragraph">
              Your digital assistant for managing FCIT services with ease!
              Whether you need to book an appointment, submit a request, or get
              quick answers, our system is here to help.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Section */}
      <section className="Home-features">
        <h2 className="Home-features-heading">Feature Highlights</h2>
        <div className="Home-features-grid">
          <div className="Home-feature-card">
            <FaRobot className="Home-feature-icon" />
            <h3 className="Home-feature-card-heading">AI Chatbot</h3>
            <p className="Home-feature-card-paragraph">
              Get instant answers to common questions.
            </p>
          </div>

          <div className="Home-feature-card">
            <FaCalendarCheck className="Home-feature-icon" />
            <h3 className="Home-feature-card-heading">Appointments</h3>
            <p className="Home-feature-card-paragraph">
              Schedule a meeting with the secretary in a few clicks.
            </p>
          </div>

          <div className="Home-feature-card">
            <FaTicketAlt className="Home-feature-icon" />
            <h3 className="Home-feature-card-heading">Ticketing System</h3>
            <p className="Home-feature-card-paragraph">
              Submit and track your requests easily.
            </p>
          </div>

          <div className="Home-feature-card">
            <FaBook className="Home-feature-icon" />
            <h3 className="Home-feature-card-heading">Resources</h3>
            <p className="Home-feature-card-paragraph">
              Learn about university services and processes.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
