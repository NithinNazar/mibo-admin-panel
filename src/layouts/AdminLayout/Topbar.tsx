import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Settings, LogOut } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext"; // Uncomment when auth is enabled

const Topbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // const { logout } = useAuth(); // Uncomment when auth is enabled

  const pageTitle = (() => {
    if (location.pathname.startsWith("/patients")) return "Patients";
    if (location.pathname.startsWith("/book-appointment"))
      return "Book Appointment";
    if (location.pathname.startsWith("/centres")) return "Centres";
    if (location.pathname.startsWith("/staff/managers")) return "Managers";
    if (location.pathname.startsWith("/staff/centre-managers"))
      return "Centre Managers";
    if (location.pathname.startsWith("/staff/clinicians")) return "Clinicians";
    if (location.pathname.startsWith("/staff/care-coordinators"))
      return "Care Coordinators";
    if (location.pathname.startsWith("/staff/front-desk")) return "Front Desk";
    if (location.pathname.startsWith("/settings")) return "Settings";
    if (location.pathname.startsWith("/support")) return "Support";
    return "Dashboard";
  })();

  const handleLogout = async () => {
    // When auth is enabled, uncomment this:
    // await logout();
    navigate("/login");
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-miboBg/90 backdrop-blur sticky top-0 z-10">
      <div className="flex items-baseline gap-2">
        <h1 className="text-lg md:text-xl font-semibold text-white">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate("/settings")}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
        >
          <Settings size={20} />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-white/10">
          <div className="text-right text-xs hidden md:block">
            <div className="font-medium text-slate-100">Super Admin</div>
            <div className="text-[10px] text-slate-400">Admin</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-miboTeal to-miboDeepBlue flex items-center justify-center text-sm font-semibold cursor-pointer hover:ring-2 ring-miboTeal transition-all">
            SA
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
