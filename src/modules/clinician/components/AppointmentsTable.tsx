import React from "react";
import { format } from "date-fns";
import { Video, MapPin } from "lucide-react";

interface AppointmentRow {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_phone: string;
  patient_mrn: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  appointment_type: "ONLINE" | "IN_PERSON" | "INPATIENT_ASSESSMENT";
  status: "BOOKED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  centre_name: string;
  notes: string | null;
  patient_notes: string | null;
  session_started_at?: string | null;
  session_ended_at?: string | null;
}

interface AppointmentsTableProps {
  appointments: AppointmentRow[];
  onAppointmentClick: (appointment: AppointmentRow) => void;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  onAppointmentClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "BOOKED":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "CONFIRMED":
        return "bg-sky-500/20 text-sky-400 border-sky-500/40";
      case "IN_PROGRESS":
        return "bg-violet-500/20 text-violet-400 border-violet-500/40";
      case "COMPLETED":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "CANCELLED":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/40";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "BOOKED":
        return "Waiting";
      case "CONFIRMED":
        return "Confirmed";
      case "IN_PROGRESS":
        return "Ongoing";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Group appointments by date
  const groupedAppointments = appointments.reduce(
    (groups, apt) => {
      const date = format(new Date(apt.scheduled_start_at), "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(apt);
      return groups;
    },
    {} as Record<string, AppointmentRow[]>,
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="bg-slate-800/40 border-l-4 border-miboTeal px-4 py-2.5 mb-2">
            <h2 className="text-sm font-semibold text-slate-200">
              {format(new Date(date), "EEEE, MMMM dd, yyyy")}
            </h2>
          </div>

          {/* Table */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-700">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    MRN
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {dateAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    onClick={() => onAppointmentClick(appointment)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    {/* Time */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">
                          {format(
                            new Date(appointment.scheduled_start_at),
                            "hh:mm a",
                          )}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(
                            new Date(appointment.scheduled_end_at),
                            "hh:mm a",
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-200">
                        {appointment.patient_name}
                      </span>
                    </td>

                    {/* MRN */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400 font-mono">
                        {appointment.patient_mrn}
                      </span>
                    </td>

                    {/* Mode */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {appointment.appointment_type === "ONLINE" ? (
                          <>
                            <Video size={14} className="text-emerald-400" />
                            <span className="text-sm text-slate-300">
                              Online
                            </span>
                          </>
                        ) : appointment.appointment_type === "IN_PERSON" ? (
                          <>
                            <MapPin size={14} className="text-sky-400" />
                            <span className="text-sm text-slate-300">
                              In-Person
                            </span>
                          </>
                        ) : (
                          <>
                            <MapPin size={14} className="text-violet-400" />
                            <span className="text-sm text-slate-300">
                              Inpatient
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                          appointment.status,
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentsTable;
