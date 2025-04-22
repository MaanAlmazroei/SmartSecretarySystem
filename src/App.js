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
import Tickets from "./components/Tickets/Tickets";
import Appointments from "./components/Appointments/Appointments";
import { getCurrentUser } from "./services/FirebaseAuth";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

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
          <Route path="/resources" element={<Resources />} />

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
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
