import axios from "axios";

// Backend URL
// Development: VITE_API_URL=http://localhost:8000
// Production : VITE_API_URL=https://your-render-app.onrender.com

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      // Redirect user to login page
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;