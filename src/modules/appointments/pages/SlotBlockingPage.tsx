import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, UserRound, CalendarDays } from "lucide-react";

const options = [
  {
    icon: Building2,
    title: "Block by Centre",
    description: "Block slots for all clinicians at a specific centre",
    path: "/slot-blocking/by-centre",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50",
  },
  {
    icon: UserRound,
    title: "Block by Clinician",
    description: "Block slots for a specific clinician across centres",
    path: "/slot-blocking/by-clinician",
    color: "text-miboTeal",
    bg: "bg-miboTeal/10 border-miboTeal/20 hover:border-miboTeal/50",
  },
  {
    icon: CalendarDays,
    title: "Block by Date",
    description: "Block all slots on a specific date",
    path: "/slot-blocking/by-date",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50",
  },
];

const SlotBlockingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Slot Management</h1>
        <p className="text-slate-400 mt-1">
          Choose how you want to block slots
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map(({ icon: Icon, title, description, path, color, bg }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center text-center p-8 rounded-xl border transition-all cursor-pointer ${bg}`}
          >
            <Icon size={48} className={`mb-4 ${color}`} />
            <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
            <p className="text-sm text-slate-400">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SlotBlockingPage;
