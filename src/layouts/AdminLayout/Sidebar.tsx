import SidebarSection from "./SidebarSection";
import type { NavSection } from "./types";

const sections: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Patients", path: "/patients" },
      { label: "Book Appointment", path: "/book-appointment" },
      { label: "Centres", path: "/centres" },
    ],
  },
  {
    title: "Staff",
    items: [
      { label: "Managers", path: "/staff/managers" },
      { label: "Centre Managers", path: "/staff/centre-managers" },
      { label: "Clinicians", path: "/staff/clinicians" },
      { label: "Care Coordinators", path: "/staff/care-coordinators" },
      { label: "Front Desk", path: "/staff/front-desk" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Settings", path: "/settings" },
      { label: "Support", path: "/support" },
    ],
  },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-[#1d2635] border-r border-white/5 text-slate-100">
      <div className="h-16 flex items-center px-4 border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide">
            Mibo Admin
          </span>
          <span className="text-xs text-slate-400">Mental health centres</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section) => (
          <SidebarSection key={section.title} section={section} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
