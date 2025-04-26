import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Layout.css";
import Chatbot from "../Chatbot/Chatbot";
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main">{children}</main>
      <Chatbot />
      <Footer />
    </div>
  );
};

export default Layout;
