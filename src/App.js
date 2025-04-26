import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./components/Home/Home";
import Layout from "./components/Layout/Layout";
import SignUp from "./components/SignUp/SignUp";
import Login from "./components/Login/Login";
import Resources from "./components/SelfServicePortal/Resources";
import Profile from "./components/Profile/Profile";
import UserTickets from "./components/Tickets/UserTickets/UserTickets.jsx";
import SecretaryTickets from "./components/Tickets/SecretaryTickets/SecretaryTickets.jsx";
import UserAppointments from "./components/Appointments/UserAppointments/UserAppointments.jsx";
import SecretaryAppointments from "./components/Appointments/SecretaryAppointments/SecretaryAppointments.jsx";
import Chatbot from "./components/Chatbot/Chatbot.jsx";
import { useUser } from "./Context/UserContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userRole, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

const RoleBasedRoute = ({ children, roles }) => {
  const { userRole } = useUser();

  if (!roles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return userRole === "secretary" ? children.secretary : children.user;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/Chatbot" element={<Chatbot />} />

      {/* Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/settings"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Role-based Routes */}
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <RoleBasedRoute roles={["user", "secretary"]}>
              {{
                user: <UserTickets />,
                secretary: <SecretaryTickets />,
              }}
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <RoleBasedRoute roles={["user", "secretary"]}>
              {{
                user: <UserAppointments />,
                secretary: <SecretaryAppointments />,
              }}
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  );
}

export default App;
