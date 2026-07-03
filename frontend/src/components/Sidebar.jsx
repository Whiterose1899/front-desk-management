import {
  LayoutDashboard,
  BedDouble,
  Users,
  CalendarDays,
  ChartColumn,
  LogOut,
  Hotel,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const menuItems = [
    ...(isAdmin
      ? [
          {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
          },
        ]
      : []),

    {
      name: "Rooms",
      path: "/rooms",
      icon: BedDouble,
    },

    {
      name: "Guests",
      path: "/guests",
      icon: Users,
    },

    {
      name: "Reservations",
      path: "/reservations",
      icon: CalendarDays,
    },

    ...(isAdmin
      ? [
          {
            name: "Analytics",
            path: "/analytics",
            icon: ChartColumn,
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">

      {/* Logo */}

      <div className="border-b border-slate-700 p-6">

        <div className="flex items-center gap-3">

          <div className="bg-blue-600 p-3 rounded-xl">

            <Hotel size={24} />

          </div>

          <div>

            <h1 className="text-2xl font-bold">
              FDMS
            </h1>

            <p className="text-xs text-slate-400">
              Front Desk Management
            </p>

          </div>

        </div>

      </div>

      {/* Navigation */}

      <nav className="flex-1 px-4 py-6 space-y-2">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-600"
                    : "hover:bg-slate-800"
                }`
              }
            >

              <Icon size={20} />

              <span>{item.name}</span>

            </NavLink>
          );

        })}

      </nav>

      {/* Logged-in User */}

      <div className="border-t border-slate-700 p-4">

        <div className="mb-4">

          <p className="text-sm font-semibold">
            {user?.username || "Guest"}
          </p>

          <p className="text-xs text-slate-400">
            {user?.role || ""}
          </p>

        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl bg-red-600 px-4 py-3 hover:bg-red-700 transition"
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </div>
  );
}

export default Sidebar;