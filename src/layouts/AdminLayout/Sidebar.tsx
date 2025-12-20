import {
  LayoutDashboard,
  Users,
  CalendarPlus,
  Building2,
  UserCog,
  Settings as SettingsIcon,
  HeadphonesIcon,
  Stethoscope,
  ClipboardList,
  UserCheck,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import SidebarSection from "./SidebarSection";
import type { NavSection } from "./types";

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  // Define all sections
  const allSections: NavSection[] = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Patients", path: "/patients", icon: Users },
        {
          label: "Book Appointment",
          path: "/book-appointment",
          icon: CalendarPlus,
        },
        { label: "Centres", path: "/centres", icon: Building2 },
      ],
    },
    {
      title: "Appointments",
      items: [
        {
          label: "My Appointments",
          path: user?.id ? `/clinicians/${user.id}/appointments` : "/dashboard",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Staff",
      items: [
        { label: "Managers", path: "/staff/managers", icon: UserCog },
        {
          label: "Centre Managers",
          path: "/staff/centre-managers",
          icon: UserCog,
        },
        { label: "Clinicians", path: "/staff/clinicians", icon: Stethoscope },
        {
          label: "Care Coordinators",
          path: "/staff/care-coordinators",
          icon: ClipboardList,
        },
        { label: "Front Desk", path: "/staff/front-desk", icon: UserCheck },
      ],
    },
    {
      title: "Settings",
      items: [
        { label: "Settings", path: "/settings", icon: SettingsIcon },
        { label: "Support", path: "/support", icon: HeadphonesIcon },
      ],
    },
  ];

  // Filter sections based on user role
  const getFilteredSections = (): NavSection[] => {
    if (!user) return [];

    const role = user.role;

    // Admin sees everything
    if (role === "ADMIN" || role === "MANAGER") {
      return allSections;
    }

    // Clinician sees limited items
    if (role === "CLINICIAN") {
      return [
        {
          title: "Main",
          items: [
            { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            { label: "Patients", path: "/patients", icon: Users },
          ],
        },
        {
          title: "Appointments",
          items: [
            {
              label: "My Appointments",
              path: `/clinicians/${user.id}/appointments`,
              icon: Calendar,
            },
          ],
        },
        {
          title: "Settings",
          items: [
            { label: "Settings", path: "/settings", icon: SettingsIcon },
            { label: "Support", path: "/support", icon: HeadphonesIcon },
          ],
        },
      ];
    }

    // Front Desk sees booking and appointments
    if (role === "FRONT_DESK") {
      return [
        {
          title: "Main",
          items: [
            { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            { label: "Patients", path: "/patients", icon: Users },
            {
              label: "Book Appointment",
              path: "/book-appointment",
              icon: CalendarPlus,
            },
          ],
        },
        {
          title: "Settings",
          items: [
            { label: "Settings", path: "/settings", icon: SettingsIcon },
            { label: "Support", path: "/support", icon: HeadphonesIcon },
          ],
        },
      ];
    }

    // Centre Manager sees centre-specific items
    if (role === "CENTRE_MANAGER") {
      return [
        {
          title: "Main",
          items: [
            { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            { label: "Patients", path: "/patients", icon: Users },
            {
              label: "Book Appointment",
              path: "/book-appointment",
              icon: CalendarPlus,
            },
          ],
        },
        {
          title: "Staff",
          items: [
            {
              label: "Clinicians",
              path: "/staff/clinicians",
              icon: Stethoscope,
            },
            {
              label: "Front Desk",
              path: "/staff/front-desk",
              icon: UserCheck,
            },
          ],
        },
        {
          title: "Settings",
          items: [
            { label: "Settings", path: "/settings", icon: SettingsIcon },
            { label: "Support", path: "/support", icon: HeadphonesIcon },
          ],
        },
      ];
    }

    // Care Coordinator
    if (role === "CARE_COORDINATOR") {
      return [
        {
          title: "Main",
          items: [
            { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            { label: "Patients", path: "/patients", icon: Users },
            {
              label: "Book Appointment",
              path: "/book-appointment",
              icon: CalendarPlus,
            },
          ],
        },
        {
          title: "Settings",
          items: [
            { label: "Settings", path: "/settings", icon: SettingsIcon },
            { label: "Support", path: "/support", icon: HeadphonesIcon },
          ],
        },
      ];
    }

    return [];
  };

  const sections = getFilteredSections();
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-miboSidebarBg border-r border-white/5 text-slate-100">
      <div className="h-16 flex items-center px-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-miboTeal to-miboDeepBlue flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide">
              Mibo Care
            </span>
            <span className="text-xs text-slate-400">Admin Panel</span>
          </div>
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
