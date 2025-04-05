import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import Layout from './components/Layout/Layout'; // your layout
import SignUp from "./components/SignUp/SignUp";
import Login from "./components/Login/Login";
import Profile from "./components/Profile/Profile";
import Tickets from "./components/Tickets/Tickets";
import TicketForm from "./components/TicketForm/TicketForm";
import Appointments from "./components/Appointments/Appointments";
import AppointmentForm from "./components/AppointmentForm/AppointmentForm";

function App() {
  return (
    <Router>
      <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
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
