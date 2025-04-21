import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./components/Home/Home.jsx";
import Layout from "./components/Layout/Layout.jsx";
import SignUp from "./components/SignUp/SignUp.jsx";
import Login from "./components/Login/Login.jsx";
import Portal from "./components/SelfServicePortal/Portal.jsx";
import Profile from "./components/Profile/Profile.jsx";
import Tickets from "./components/Tickets/Tickets.jsx";
import Appointments from "./components/Appointments/Appointments.jsx";

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/knowledge-base" element={<Portal />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/profile/settings" element={<Profile />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/appointments" element={<Appointments />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
