import React from "react";
import "./Home.css";
import logo from './SSS Logo.png';

const Home = () => {
    return (
        <div>
            <header>
                <div className="logo"> <img src={logo} alt="SSS Logo" />
                </div>
                <nav>
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
            
            <main>
            
            </main>
        </div>
    );
};

export default Home;
