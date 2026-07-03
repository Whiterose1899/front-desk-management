import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-50">

      {/* Sidebar */}

      <aside className="w-72 shadow-lg bg-slate-900">

        <Sidebar />

      </aside>

      {/* Main Content */}

      <main className="flex-1 overflow-y-auto">

        <div className="p-8">

          <Outlet />

        </div>

      </main>

    </div>
  );
}

export default DashboardLayout;