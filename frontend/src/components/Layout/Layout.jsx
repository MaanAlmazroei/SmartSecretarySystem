import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Layout.css";
import Chatbot from "../Chatbot/Chatbot";

const Layout = ({ children }) => {
  const location = useLocation();
  const noChatbotPaths = ["/login", "/signup"];
  const showChatbot = !noChatbotPaths.includes(location.pathname);

  return (
    <div className="Layout-layout">
      <header className="Layout-header">
        <Header />
      </header>
      <main className="Layout-main">{children}</main>
      {showChatbot && <Chatbot />}
      <footer className="Layout-footer">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;