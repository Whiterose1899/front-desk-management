import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Guests from "./pages/Guests";
import Reservations from "./pages/Reservations";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* Public Routes */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* Protected Routes */}

        <Route element={<ProtectedRoute />}>

          <Route element={<DashboardLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/rooms"
              element={<Rooms />}
            />

            <Route
              path="/guests"
              element={<Guests />}
            />

            <Route
              path="/reservations"
              element={<Reservations />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

          </Route>

        </Route>

        {/* 404 */}

        <Route
          path="/404"
          element={<NotFound />}
        />

        <Route
          path="*"
          element={<Navigate to="/404" replace />}
        />

      </Routes>
    </AuthProvider>
  );
}

export default App;