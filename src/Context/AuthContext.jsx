import React, { createContext, useState, useContext, useEffect } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  checkAuth,
} from "../services/ApiService";

// Create the context with default values
const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await checkAuth();
        if (response.isAuthenticated) {
          setUser({
            uid: response.userId,
            email: response.email,
            role: response.role,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();

    // Set up an interval to check authentication status periodically
    const interval = setInterval(checkAuthentication, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiLogin({ email, password });
      if (response.error) {
        throw new Error(response.error);
      }
      setUser({
        uid: response.userId,
        email: response.email,
        role: response.role,
      });
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
