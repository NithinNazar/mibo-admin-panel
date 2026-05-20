import React, { useState, useEffect } from "react";
import {
  format,
  addDays,
  subDays,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import appointmentService from "../../services/appointmentService";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Play,
  Square,
  Video,
  MapPin,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import PatientNotesModal from "./PatientNotesModal";
import ClinicianNotesModal from "./ClinicianNotesModal";
import SessionControlModal from "./SessionControlModal";

interface AppointmentRow {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  appointment_type: "ONLINE" | "IN_PERSON";
  status: string;
  centre_name: string;
  google_meet_link?: string;
  notes: string | null; // Clinician notes
  patient_notes: string | null; // Patient notes
  session_started_at?: string;
  session_ended_at?: string;
}

type ViewMode = "upcoming" | "past";
type DateRange = "next30" | "past20" | "custom";

const ClinicianDashboardEnhanced: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    AppointmentRow[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Modal states
  const [
    selectedAppointmentForPatientNotes,
    setSelectedAppointmentForPatientNotes,
  ] = useState<string | null>(null);
  const [
    selectedAppointmentForClinicianNotes,
    setSelectedAppointmentForClinicianNotes,
  ] = useState<AppointmentRow | null>(null);
  const [selectedAppointmentForSession, setSelectedAppointmentForSession] =
    useState<AppointmentRow | null>(null);

  // Filter states
  const [viewMode, setViewMode] = useState<ViewMode>("upcoming");
  const [dateRange, setDateRange] = useState<DateRange>("next30");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, viewMode, dateRange, customStartDate, customEndDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentService.getMyAppointments();

      // Combine current and upcoming for "upcoming" view
      const allAppointments = [
        ...(response.current || []),
        ...(response.upcoming || []),
        ...(response.past || []),
      ].map((apt) => ({
        ...apt,
        // Convert Date objects to ISO strings for consistency
        scheduled_start_at:
          apt.scheduled_start_at instanceof Date
            ? apt.scheduled_start_at.toISOString()
            : apt.scheduled_start_at,
        scheduled_end_at:
          apt.scheduled_end_at instanceof Date
            ? apt.scheduled_end_at.toISOString()
            : apt.scheduled_end_at,
      }));

      setAppointments(allAppointments as AppointmentRow[]);
    } catch (error: any) {
      console.error("Failed to fetch appointments:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load appointments. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const now = new Date();
    let filtered = [...appointments];

    // Filter by view mode (upcoming vs past)
    if (viewMode === "upcoming") {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduled_start_at);
        return (
          isAfter(aptDate, now) ||
          format(aptDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
        );
      });
    } else {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduled_start_at);
        return isBefore(aptDate, startOfDay(now));
      });
    }

    // Filter by date range
    if (dateRange === "next30" && viewMode === "upcoming") {
      const next30Days = addDays(now, 30);
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduled_start_at);
        return isBefore(aptDate, next30Days);
      });
    } else if (dateRange === "past20" && viewMode === "past") {
      const past20Days = subDays(now, 20);
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduled_start_at);
        return isAfter(aptDate, past20Days);
      });
    } else if (dateRange === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduled_start_at);
        return isAfter(aptDate, start) && isBefore(aptDate, end);
      });
    }

    // Sort: nearest upcoming first for upcoming, most recent first for past
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduled_start_at).getTime();
      const dateB = new Date(b.scheduled_start_at).getTime();
      return viewMode === "upcoming" ? dateA - dateB : dateB - dateA;
    });

    setFilteredAppointments(filtered);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Auto-adjust date range when switching modes
    if (mode === "upcoming") {
      setDateRange("next30");
    } else {
      setDateRange("past20");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-miboBg">
        <div className="text-lg text-white">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="clinician-dashboard min-h-screen bg-miboBg p-6">
      {/* Header */}
      <header className="dashboard-header mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">My Appointments</h1>
            <p className="text-slate-400 mt-1">
              Welcome back, Dr. {user?.full_name || user?.name || "Clinician"}
            </p>
          </div>
          <div className="user-info flex items-center gap-3">
            <span className="role-badge bg-miboTeal text-white px-4 py-2 rounded-full text-sm font-medium">
              Clinician
            </span>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-section bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Filter size={20} />
            Filters
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {showFilters && (
          <div className="space-y-4">
            {/* View Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                View Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewModeChange("upcoming")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "upcoming"
                      ? "bg-miboTeal text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => handleViewModeChange("past")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "past"
                      ? "bg-miboTeal text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Past
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date Range
              </label>
              <div className="flex gap-2 flex-wrap">
                {viewMode === "upcoming" ? (
                  <button
                    onClick={() => setDateRange("next30")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      dateRange === "next30"
                        ? "bg-miboTeal text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    Next 30 Days
                  </button>
                ) : (
                  <button
                    onClick={() => setDateRange("past20")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      dateRange === "past20"
                        ? "bg-miboTeal text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    Past 20 Days
                  </button>
                )}
                <button
                  onClick={() => setDateRange("custom")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dateRange === "custom"
                      ? "bg-miboTeal text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Custom Range
                </button>
              </div>

              {/* Custom Date Range Inputs */}
              {dateRange === "custom" && (
                <div className="mt-3 flex gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-miboTeal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-miboTeal"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Appointments Count */}
      <div className="mb-4">
        <p className="text-slate-300">
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredAppointments.length}
          </span>{" "}
          {viewMode} appointment{filteredAppointments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="empty-state text-center py-12 bg-slate-800 rounded-lg">
          <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-xl text-slate-400">
            No {viewMode} appointments found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="appointment-card bg-slate-800 rounded-lg p-5 hover:bg-slate-750 transition-colors border border-slate-700"
            >
              {/* Appointment Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-miboTeal/20 rounded-full flex items-center justify-center">
                    <User size={24} className="text-miboTeal" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {appointment.patient_name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {appointment.patient_phone}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                    appointment.status,
                  )}`}
                >
                  {appointment.status}
                </span>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar size={16} className="text-slate-500" />
                  <span className="text-sm">
                    {format(
                      new Date(appointment.scheduled_start_at),
                      "MMM dd, yyyy",
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock size={16} className="text-slate-500" />
                  <span className="text-sm">
                    {format(
                      new Date(appointment.scheduled_start_at),
                      "hh:mm a",
                    )}{" "}
                    -{" "}
                    {format(new Date(appointment.scheduled_end_at), "hh:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  {appointment.appointment_type === "ONLINE" ? (
                    <>
                      <Video size={16} className="text-green-500" />
                      <span className="text-sm">Online</span>
                      {appointment.google_meet_link && (
                        <a
                          href={appointment.google_meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 underline ml-2"
                        >
                          Join Meet
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <MapPin size={16} className="text-blue-500" />
                      <span className="text-sm">In-Person</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                <MapPin size={14} />
                <span>{appointment.centre_name}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {/* Patient Notes Button */}
                <button
                  onClick={() =>
                    setSelectedAppointmentForPatientNotes(appointment.id)
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <FileText size={16} />
                  Patient Note
                  {appointment.patient_notes && (
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  )}
                </button>

                {/* Clinician Notes Button */}
                <button
                  onClick={() =>
                    setSelectedAppointmentForClinicianNotes(appointment)
                  }
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <FileText size={16} />
                  Clinician Note
                  {appointment.notes && (
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  )}
                </button>

                {/* Session Control Buttons (only for upcoming/today appointments) */}
                {viewMode === "upcoming" && (
                  <button
                    onClick={() =>
                      setSelectedAppointmentForSession(appointment)
                    }
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {appointment.session_started_at &&
                    !appointment.session_ended_at ? (
                      <>
                        <Square size={16} />
                        End Session
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Start Session
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedAppointmentForPatientNotes && (
        <PatientNotesModal
          appointmentId={selectedAppointmentForPatientNotes}
          onClose={() => setSelectedAppointmentForPatientNotes(null)}
        />
      )}

      {selectedAppointmentForClinicianNotes && (
        <ClinicianNotesModal
          appointment={selectedAppointmentForClinicianNotes}
          patientId={selectedAppointmentForClinicianNotes.patient_id}
          onClose={() => setSelectedAppointmentForClinicianNotes(null)}
          onSave={() => {
            setSelectedAppointmentForClinicianNotes(null);
            fetchAppointments();
          }}
        />
      )}

      {selectedAppointmentForSession && (
        <SessionControlModal
          appointment={selectedAppointmentForSession}
          onClose={() => setSelectedAppointmentForSession(null)}
          onUpdate={() => {
            setSelectedAppointmentForSession(null);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
};

export default ClinicianDashboardEnhanced;
