import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home.jsx";
import Layout from "./components/Layout/Layout.jsx";
import SignUp from "./components/SignUp/SignUp.jsx";
import Login from "./components/Login/Login.jsx";
import Portal from "./components/SelfServicePortal/Portal.jsx";
import Profile from "./components/Profile/Profile.jsx";
import Tickets from "./components/Tickets/Tickets.jsx";
import TicketForm from "./components/TicketForm/TicketForm.jsx";
import Appointments from "./components/Appointments/Appointments.jsx";
import AppointmentForm from "./components/AppointmentForm/AppointmentForm.jsx";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/knowledge-base" element={<Portal />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/settings" element={<Profile />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/new" element={<TicketForm />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointments/new" element={<AppointmentForm />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
