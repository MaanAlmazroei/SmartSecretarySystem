import React from "react";
import Header from "../Header/Header"; // your existing header
import Footer from "../Footer/Footer"; // your existing footer
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
