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
  CalendarX,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import SidebarSection from "./SidebarSection";
import type { NavSection } from "./types";
import logo from "../../assets/logo1.png";

const Sidebar: React.FC = () => {
  const { user, isClinician, isAdmin } = useAuth();

  // Define all sections
  const allSections: NavSection[] = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Patients", path: "/patients", icon: Users },
        { label: "Appointments", path: "/appointments", icon: Calendar },
        {
          label: "Book Appointment",
          path: "/book-appointment",
          icon: CalendarPlus,
        },
        {
          label: "Slot Management",
          path: "/slot-blocking",
          icon: CalendarX,
        },
        { label: "Centres", path: "/centres", icon: Building2 },
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
    if (!user) {
      return [];
    }

    // Clinician sees limited items - ONLY My Appointments and Profile
    if (isClinician) {
      return [
        {
          title: "Appointments",
          items: [
            {
              label: "My Appointments",
              path: "/appointments",
              icon: Calendar,
            },
          ],
        },
        {
          title: "Account",
          items: [{ label: "Profile", path: "/profile", icon: UserCircle }],
        },
      ];
    }

    // Admin/Manager sees everything
    if (isAdmin) {
      return [
        ...allSections,
        {
          title: "Account",
          items: [{ label: "Profile", path: "/profile", icon: UserCircle }],
        },
      ];
    }

    // Front Desk sees appointments for booking
    if (user.role === "FRONT_DESK") {
      return [
        {
          title: "Main",
          items: [
            { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            { label: "Patients", path: "/patients", icon: Users },
            { label: "Appointments", path: "/appointments", icon: Calendar },
            {
              label: "Book Appointment",
              path: "/book-appointment",
              icon: CalendarPlus,
            },
            {
              label: "Slot Management",
              path: "/slot-blocking",
              icon: CalendarX,
            },
            { label: "Centres", path: "/centres", icon: Building2 },
          ],
        },
        {
          title: "Account",
          items: [
            { label: "Profile", path: "/profile", icon: UserCircle },
            { label: "Support", path: "/support", icon: HeadphonesIcon },
          ],
        },
      ];
    }

    // Centre Manager sees centre-specific items
    if (user.role === "CENTRE_MANAGER") {
      return [
        {
          title: "Main",
          items: [
            { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            { label: "Patients", path: "/patients", icon: Users },
            { label: "Appointments", path: "/appointments", icon: Calendar },
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
          title: "Account",
          items: [
            { label: "Profile", path: "/profile", icon: UserCircle },
            { label: "Support", path: "/support", icon: HeadphonesIcon },
          ],
        },
      ];
    }

    // Care Coordinator
    if (user.role === "CARE_COORDINATOR") {
      return [
        {
          title: "Main",
          items: [
            { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            { label: "Patients", path: "/patients", icon: Users },
            { label: "Appointments", path: "/appointments", icon: Calendar },
            {
              label: "Book Appointment",
              path: "/book-appointment",
              icon: CalendarPlus,
            },
          ],
        },
        {
          title: "Account",
          items: [
            { label: "Profile", path: "/profile", icon: UserCircle },
            { label: "Support", path: "/support", icon: HeadphonesIcon },
          ],
        },
      ];
    }

    return [];
  };

  const sections = getFilteredSections();

  // Get role badge styling
  const getRoleBadgeClass = () => {
    if (isClinician) return "bg-blue-500/20 text-blue-300";
    if (isAdmin) return "bg-purple-500/20 text-purple-300";
    return "bg-gray-500/20 text-gray-300";
  };
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-miboSidebarBg border-r border-white/5 text-slate-100">
      <div className="h-16 flex items-center px-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center">
            <img
              src={logo}
              alt="Mibo Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide">
              Mibo Care
            </span>
            <span className="text-xs text-slate-400">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* User Info Header with Name and Role Badge */}
      {user && (
        <div className="px-4 py-3 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-slate-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">
                {user.full_name || user.name}
              </p>
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeClass()}`}
              >
                {user.role.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section) => (
          <SidebarSection key={section.title} section={section} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
