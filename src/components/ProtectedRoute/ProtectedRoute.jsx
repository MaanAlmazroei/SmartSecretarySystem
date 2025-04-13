import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth(); // 👈 get role from context

  if (!user) {
    return <Navigate to="/unauthorized" />;
  }

  return allowedRoles.includes(user.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" />
  );
};

export default ProtectedRoute;
