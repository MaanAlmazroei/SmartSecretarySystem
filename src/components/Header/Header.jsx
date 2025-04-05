import React, { useState } from "react";
import logo from "../Assets/SSS Logo.png"; // Adjust the path if needed
import './Header.css';
const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div>
            {/* Header Section */}
            <header>
                <div className="logo">
                    <img src={logo} alt="SSS Logo" />
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
                            <li><a href="#">Dashboard</a></li>
                            <li><a href="#">Tickets</a></li>
                            <li><a href="#">Appointments</a></li>
                            <li><a href="#">Knowledge Base</a></li>
                            <li><a href="#">Profile</a></li>
                        </ul>
                    </div>

                    <div className="signup-container">
                        <a className="signup" href="#">SignUp</a>
                    </div>
                </nav>
            </header>
        </div>
    );
};

export default Header;
