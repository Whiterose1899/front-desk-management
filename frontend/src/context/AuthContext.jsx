import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user's profile
  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/profile");
      setUser(response.data);
    } catch (error) {
      console.error("Profile fetch failed:", error);

      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Runs once whenever token changes
  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
      setUser(null);
    }
  }, [token]);

  // Login
  const login = async (username, password) => {
    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);

    const response = await api.post(
      "/auth/login",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;

    localStorage.setItem("token", accessToken);

    setToken(accessToken);

    // Immediately fetch logged-in user's details
    const profile = await api.get("/auth/profile");

    setUser(profile.data);

    return profile.data;
  };

  // Signup
  const signup = async (userData) => {
    const response = await api.post("/auth/signup", userData);

    return response.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}