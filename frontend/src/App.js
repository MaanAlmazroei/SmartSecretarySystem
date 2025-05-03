import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./components/Home/Home.jsx";
import Layout from "./components/Layout/Layout.jsx";
import SignUp from "./components/SignUp/SignUp.jsx";
import Login from "./components/Login/Login.jsx";
import NoSecResources from "./components/Resources/NoSecResources/NoSecResources.jsx";
import SecResources from "./components/Resources/SecResources/SecResources.jsx";
import Profile from "./components/Profile/Profile.jsx";
import UserTickets from "./components/Tickets/UserTickets/UserTickets.jsx";
import SecretaryTickets from "./components/Tickets/SecretaryTickets/SecretaryTickets.jsx";
import UserAppointments from "./components/Appointments/UserAppointments/UserAppointments.jsx";
import SecretaryAppointments from "./components/Appointments/SecretaryAppointments/SecretaryAppointments.jsx";
import { useAuth } from "./Context/AuthContext.jsx";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

const RoleBasedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return user.role === "secretary" ? children.secretary : children.user;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/resources"
        element={
          user?.role === "secretary" ? <SecResources /> : <NoSecResources />
        }
      />

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
