import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "../../../contexts/AuthContext";
import appointmentService from "../../../services/appointmentService";
import { AlertCircle, Calendar } from "lucide-react";
import DateRangeCalendar from "../components/DateRangeCalendar";
import StartSessionModal from "../components/StartSessionModal";
import OngoingSessionModal from "../components/OngoingSessionModal";
import PatientNotesModal from "../components/PatientNotesModal";
import ClinicianNotesModal from "../components/ClinicianNotesModal";
import CompletedAppointmentModal from "../components/CompletedAppointmentModal";
import AppointmentsTable from "../components/AppointmentsTable";

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

interface DashboardStats {
  total: number;
  waiting: number;
  ongoing: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

const ClinicianDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    AppointmentRow[]
  >([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    waiting: 0,
    ongoing: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal states
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentRow | null>(null);
  const [showStartSession, setShowStartSession] = useState(false);
  const [showOngoingSession, setShowOngoingSession] = useState(false);
  const [showPatientNotes, setShowPatientNotes] = useState(false);
  const [showClinicianNotes, setShowClinicianNotes] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedStartDate, selectedEndDate]);

  useEffect(() => {
    applyStatusFilter();
  }, [appointments, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const startDate = format(selectedStartDate, "yyyy-MM-dd");
      const endDate = format(selectedEndDate, "yyyy-MM-dd");
      const [statsResponse, appointmentsResponse] = await Promise.all([
        appointmentService.getClinicianDashboardStats(startDate, endDate),
        appointmentService.getClinicianDashboardAppointments(
          startDate,
          endDate,
        ),
      ]);
      setStats(statsResponse);
      setAppointments(appointmentsResponse);
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const applyStatusFilter = () => {
    if (statusFilter === "ALL") {
      setFilteredAppointments(appointments);
    } else {
      // Map filter values to actual appointment statuses
      const statusMap: Record<string, string[]> = {
        WAITING: ["BOOKED", "CONFIRMED"],
        ONGOING: ["IN_PROGRESS"],
        CONFIRMED: ["CONFIRMED"],
        COMPLETED: ["COMPLETED"],
        CANCELLED: ["CANCELLED"],
      };

      const statusesToFilter = statusMap[statusFilter] || [statusFilter];
      const filtered = appointments.filter((apt) =>
        statusesToFilter.includes(apt.status),
      );
      setFilteredAppointments(filtered);
    }
  };

  const handleStatusBoxClick = (status: string) => {
    // Toggle filter: if clicking the same status, clear filter
    if (statusFilter === status) {
      setStatusFilter("ALL");
    } else {
      setStatusFilter(status);
    }
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setSelectedStartDate(start);
    setSelectedEndDate(end);
  };

  const handleAppointmentClick = (appointment: AppointmentRow) => {
    setSelectedAppointment(appointment);
    if (appointment.status === "IN_PROGRESS") {
      setShowOngoingSession(true);
    } else if (
      appointment.status === "CONFIRMED" ||
      appointment.status === "BOOKED"
    ) {
      setShowStartSession(true);
    } else if (appointment.status === "COMPLETED") {
      setShowCompletedModal(true);
    } else {
      setShowClinicianNotes(true);
    }
  };

  const handleSessionStart = async () => {
    setShowStartSession(false);
    if (selectedAppointment) setShowOngoingSession(true);
    await fetchDashboardData();
  };

  const handleSessionComplete = async () => {
    setShowOngoingSession(false);
    setSelectedAppointment(null);
    await fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-lg text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="clinician-dashboard min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5">
      {/* Header */}
      <div className="mb-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Appointments</h1>
            <p className="text-slate-400 text-sm">
              Dr. {user?.full_name || user?.name || "Clinician"} ·{" "}
              {appointments.length} appointments
            </p>
          </div>
          <DateRangeCalendar
            startDate={selectedStartDate}
            endDate={selectedEndDate}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {/* Stats Grid - Now Clickable Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {/* Total */}
        <button
          onClick={() => handleStatusBoxClick("ALL")}
          className={`bg-slate-800/60 border rounded-lg p-3 transition-all text-left ${
            statusFilter === "ALL"
              ? "border-slate-400 ring-2 ring-slate-400/50 shadow-lg scale-105"
              : "border-slate-700/60 hover:border-slate-600 hover:scale-102"
          }`}
        >
          <div className="text-slate-400 text-[10px] uppercase mb-1 font-semibold tracking-wider">
            Total
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          {statusFilter === "ALL" && (
            <div className="text-[9px] text-slate-400 mt-1">
              ● Active Filter
            </div>
          )}
        </button>

        {/* Waiting */}
        <button
          onClick={() => handleStatusBoxClick("WAITING")}
          className={`bg-slate-800/60 border rounded-lg p-3 transition-all text-left ${
            statusFilter === "WAITING"
              ? "border-amber-500 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20 scale-105"
              : "border-amber-600/40 hover:border-amber-500/60 hover:scale-102"
          }`}
        >
          <div className="text-amber-400 text-[10px] uppercase mb-1 font-semibold tracking-wider">
            Waiting
          </div>
          <div className="text-2xl font-bold text-amber-300">
            {stats.waiting}
          </div>
          {statusFilter === "WAITING" && (
            <div className="text-[9px] text-amber-400 mt-1">
              ● Active Filter
            </div>
          )}
        </button>

        {/* Ongoing */}
        <button
          onClick={() => handleStatusBoxClick("ONGOING")}
          className={`bg-slate-800/60 border rounded-lg p-3 transition-all text-left ${
            statusFilter === "ONGOING"
              ? "border-violet-500 ring-2 ring-violet-400/50 shadow-lg shadow-violet-500/20 scale-105"
              : "border-violet-600/40 hover:border-violet-500/60 hover:scale-102"
          }`}
        >
          <div className="text-violet-400 text-[10px] uppercase mb-1 font-semibold tracking-wider">
            Ongoing
          </div>
          <div className="text-2xl font-bold text-violet-300">
            {stats.ongoing}
          </div>
          {statusFilter === "ONGOING" && (
            <div className="text-[9px] text-violet-400 mt-1">
              ● Active Filter
            </div>
          )}
        </button>

        {/* Confirmed */}
        <button
          onClick={() => handleStatusBoxClick("CONFIRMED")}
          className={`bg-slate-800/60 border rounded-lg p-3 transition-all text-left ${
            statusFilter === "CONFIRMED"
              ? "border-sky-500 ring-2 ring-sky-400/50 shadow-lg shadow-sky-500/20 scale-105"
              : "border-sky-600/40 hover:border-sky-500/60 hover:scale-102"
          }`}
        >
          <div className="text-sky-400 text-[10px] uppercase mb-1 font-semibold tracking-wider">
            Confirmed
          </div>
          <div className="text-2xl font-bold text-sky-300">
            {stats.confirmed}
          </div>
          {statusFilter === "CONFIRMED" && (
            <div className="text-[9px] text-sky-400 mt-1">● Active Filter</div>
          )}
        </button>

        {/* Completed */}
        <button
          onClick={() => handleStatusBoxClick("COMPLETED")}
          className={`bg-slate-800/60 border rounded-lg p-3 transition-all text-left ${
            statusFilter === "COMPLETED"
              ? "border-emerald-500 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/20 scale-105"
              : "border-emerald-600/40 hover:border-emerald-500/60 hover:scale-102"
          }`}
        >
          <div className="text-emerald-400 text-[10px] uppercase mb-1 font-semibold tracking-wider">
            Completed
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {stats.completed}
          </div>
          {statusFilter === "COMPLETED" && (
            <div className="text-[9px] text-emerald-400 mt-1">
              ● Active Filter
            </div>
          )}
        </button>

        {/* Cancelled */}
        <button
          onClick={() => handleStatusBoxClick("CANCELLED")}
          className={`bg-slate-800/60 border rounded-lg p-3 transition-all text-left ${
            statusFilter === "CANCELLED"
              ? "border-rose-500 ring-2 ring-rose-400/50 shadow-lg shadow-rose-500/20 scale-105"
              : "border-rose-600/40 hover:border-rose-500/60 hover:scale-102"
          }`}
        >
          <div className="text-rose-400 text-[10px] uppercase mb-1 font-semibold tracking-wider">
            Cancelled
          </div>
          <div className="text-2xl font-bold text-rose-300">
            {stats.cancelled}
          </div>
          {statusFilter === "CANCELLED" && (
            <div className="text-[9px] text-rose-400 mt-1">● Active Filter</div>
          )}
        </button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-700/50">
          <Calendar size={48} className="mx-auto text-slate-600 mb-3" />
          <p className="text-lg text-slate-300 font-semibold mb-1">
            No appointments found
          </p>
          <p className="text-xs text-slate-500">
            {statusFilter !== "ALL"
              ? `No ${statusFilter.toLowerCase()} appointments for this date range`
              : "Try selecting a different date range"}
          </p>
        </div>
      ) : (
        <AppointmentsTable
          appointments={filteredAppointments}
          onAppointmentClick={handleAppointmentClick}
        />
      )}

      {/* Modals */}
      {selectedAppointment && showStartSession && (
        <StartSessionModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowStartSession(false);
            setSelectedAppointment(null);
          }}
          onStartSession={handleSessionStart}
        />
      )}
      {selectedAppointment && showOngoingSession && (
        <OngoingSessionModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowOngoingSession(false);
            setSelectedAppointment(null);
          }}
          onSessionComplete={handleSessionComplete}
        />
      )}
      {selectedAppointment && showCompletedModal && (
        <CompletedAppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowCompletedModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
      {selectedAppointment && showPatientNotes && (
        <PatientNotesModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowPatientNotes(false);
            setSelectedAppointment(null);
          }}
        />
      )}
      {selectedAppointment && showClinicianNotes && (
        <ClinicianNotesModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowClinicianNotes(false);
            setSelectedAppointment(null);
          }}
          onSave={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default ClinicianDashboardPage;
