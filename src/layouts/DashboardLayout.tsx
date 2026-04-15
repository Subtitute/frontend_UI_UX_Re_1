import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Radio, Bell, Clock, PlusSquare, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

const MENU = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/sensors", label: "Cảm biến", icon: Radio },
  { path: "/alerts", label: "Cảnh báo", icon: Bell },
  { path: "/history", label: "Lịch sử", icon: Clock },
  { path: "/onboarding", label: "Thêm thiết bị", icon: PlusSquare },
  { path: "/admin", label: "Quản trị", icon: Settings },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Overlay cho mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-4 flex justify-between items-center border-b lg:border-b-0">
          <div className="text-xl font-bold flex items-center gap-2">📡 RadarMonitor</div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {MENU.map((m) => {
            const active = location.pathname === m.path;
            return (
              <button
                key={m.path}
                onClick={() => {
                  navigate(m.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition
                  ${active ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}`}
              >
                <m.icon size={20} /> {m.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t text-xs text-gray-500">
          v1.0.0 • © 2026
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile */}
        <header className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <div className="text-lg font-bold">RadarMonitor</div>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}