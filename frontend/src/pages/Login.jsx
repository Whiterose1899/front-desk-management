import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Hotel, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      await login(username, password);

      navigate(redirectTo, { replace: true });

    } catch (err) {

      const message =
        err?.response?.data?.detail ||
        "Invalid username or password.";

      setError(message);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}

      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white items-center justify-center">

        <div className="max-w-md">

          <div className="flex items-center gap-4 mb-8">

            <Hotel size={45} />

            <div>

              <h1 className="text-5xl font-bold">
                FDMS
              </h1>

              <p className="text-slate-400 mt-2">
                Front Desk Management System
              </p>

            </div>

          </div>

          <h2 className="text-4xl font-bold leading-tight">

            Welcome Back 👋

          </h2>

          <p className="mt-5 text-slate-300 leading-7">

            Manage rooms, guests, reservations and hotel analytics
            from one beautiful dashboard.

          </p>

        </div>

      </div>

      {/* Right Panel */}

      <div className="flex-1 flex justify-center items-center bg-slate-100">

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-10 w-[430px]"
        >

          <h2 className="text-3xl font-bold mb-2">

            Sign In

          </h2>

          <p className="text-gray-500 mb-8">

            Login to continue.

          </p>

          {error && (

            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">

              {error}

            </div>

          )}

          <div className="mb-5">

            <label className="block mb-2 font-medium">

              Username

            </label>

            <input
              type="text"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

          </div>

          <div className="mb-7">

            <label className="block mb-2 font-medium">

              Password

            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="absolute right-4 top-3.5"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >

                {showPassword ? (

                  <EyeOff size={20} />

                ) : (

                  <Eye size={20} />

                )}

              </button>

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition"
          >

            {loading ? "Signing In..." : "Login"}

          </button>

          <p className="text-center mt-7 text-gray-600">

            Don't have an account?

            <Link
              to="/signup"
              className="text-blue-600 font-semibold ml-2"
            >

              Signup

            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default Login;