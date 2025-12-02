import { useLocation } from "react-router-dom";

const Topbar: React.FC = () => {
  const location = useLocation();

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

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-miboBg/90 backdrop-blur">
      <div className="flex items-baseline gap-2">
        <h1 className="text-lg md:text-xl font-semibold text-white">
          {pageTitle}
        </h1>
        <span className="hidden md:inline text-xs text-slate-400">
          Mibo Admin Panel
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden md:inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:bg-white/10 transition">
          Settings
        </button>
        <div className="flex items-center gap-2">
          <div className="text-right text-xs">
            <div className="font-medium text-slate-100">Admin User</div>
            <div className="text-[10px] text-miboTeal">Super Admin</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-miboTeal to-miboDeepBlue flex items-center justify-center text-xs font-semibold">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
