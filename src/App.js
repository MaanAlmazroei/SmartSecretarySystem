import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home.jsx";
import Layout from "./components/Layout/Layout.jsx";
import SignUp from "./components/SignUp/SignUp.jsx";
import Login from "./components/Login/Login.jsx";
import Portal from "./components/SelfServicePortal/Portal.jsx";
import Profile from "./components/Profile/Profile.jsx";
import Tickets from "./components/Tickets/Tickets.jsx";
import Appointments from "./components/Appointments/Appointments.jsx";
import Unauthorized from "./components/Unauthorized/Unauthorized.jsx";

// Dashboards or pages specific to roles
import AdminDashboard from "./components/AdminDashboard/AdminDashboard.jsx";
import SecretaryDashboard from "./components/SecretaryDashboard/SecretaryDashboard.jsx";
import UserDashboard from "./components/UserDashboard/UserDashboard.jsx";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/knowledge-base" element={<Portal />} />

          {/* Protected Routes for User (students) */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile/settings" element={<Profile />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/appointments" element={<Appointments />} />
          </Route>

          {/* Protected Route for Secretary */}
          <Route element={<ProtectedRoute allowedRoles={["secretary"]} />}>
            <Route path="/secretary" element={<SecretaryDashboard />} />
          </Route>

          {/* Protected Route for Admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
