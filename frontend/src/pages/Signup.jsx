import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hotel, Eye, EyeOff } from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Signup() {
  const navigate = useNavigate();

  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    role: "staff",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.username ||
      !formData.password
    ) {
      setError("Please fill all the required fields.");
      return;
    }

    try {
      setLoading(true);

      await signup(formData);

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {

      const message =
        err?.response?.data?.detail ||
        "Unable to create account.";

      setError(message);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left Section */}

      <div className="hidden lg:flex w-1/2 bg-blue-700 text-white justify-center items-center">

        <div className="max-w-md">

          <div className="flex items-center gap-4 mb-8">

            <Hotel size={45} />

            <div>

              <h1 className="text-5xl font-bold">
                FDMS
              </h1>

              <p className="text-blue-100 mt-2">
                Front Desk Management System
              </p>

            </div>

          </div>

          <h2 className="text-4xl font-bold leading-tight">

            Create a New Account

          </h2>

          <p className="mt-5 text-blue-100 leading-7">

            Register yourself to access the Hotel Front Desk
            Management System.

          </p>

        </div>

      </div>

      {/* Right Section */}

      <div className="flex-1 flex justify-center items-center bg-slate-100">

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-10 w-[450px]"
        >

          <h2 className="text-3xl font-bold">

            Sign Up

          </h2>

          <p className="text-gray-500 mt-2 mb-8">

            Create your account.

          </p>

          {error && (

            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">

              {error}

            </div>

          )}

          {success && (

            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-5">

              {success}

            </div>

          )}

          {/* First Name */}

          <div className="mb-5">

            <label className="block mb-2 font-medium">

              First Name

            </label>

            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter first name"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* Last Name */}

          <div className="mb-5">

            <label className="block mb-2 font-medium">

              Last Name

            </label>

            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Enter last name"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* Username */}

          <div className="mb-5">

            <label className="block mb-2 font-medium">

              Username

            </label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>
          {/* Role */}

          <div className="mb-5">

            <label className="block mb-2 font-medium">

              Role

            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option value="Staff">
                Staff
              </option>

              <option value="Manager">
                Manager
              </option>

              <option value="Admin">
                Admin
              </option>

            </select>

          </div>

          {/* Password */}

          <div className="mb-8">

            <label className="block mb-2 font-medium">

              Password

            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full border rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-500 hover:text-blue-600"
              >

                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}

              </button>

            </div>

          </div>

          {/* Submit Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 transition duration-200 disabled:bg-blue-400"
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>

          {/* Login Link */}

          <p className="text-center mt-7 text-gray-600">

            Already have an account?

            <Link
              to="/login"
              className="text-blue-600 font-semibold ml-2 hover:underline"
            >

              Login

            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default Signup;