import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import appointmentService from "../../services/appointmentService";
import NotesPanel from "./NotesPanel";

interface AppointmentRow {
  id: number;
  rowNumber: number;
  appointmentDate: string;
  appointmentTime: string;
  centreName: string;
  mode: "IN_PERSON" | "ONLINE";
  googleMeetLink?: string;
  patientName: string;
  notes: string | null;
}

const ClinicianDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentService.getAppointments();
      const formattedAppointments = response.map((apt: any, index: number) => ({
        id: apt.id,
        rowNumber: index + 1,
        appointmentDate: format(new Date(apt.scheduled_start_at), "yyyy-MM-dd"),
        appointmentTime: format(new Date(apt.scheduled_start_at), "HH:mm"),
        centreName: apt.centre_name || apt.center_name || "N/A",
        mode: (apt.appointment_type === "ONLINE" ? "ONLINE" : "IN_PERSON") as
          | "IN_PERSON"
          | "ONLINE",
        googleMeetLink: apt.google_meet_link,
        patientName:
          apt.patient_name ||
          `${apt.patient_first_name || ""} ${apt.patient_last_name || ""}`.trim() ||
          "N/A",
        notes: apt.notes,
      }));
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotesClick = (appointmentId: number) => {
    setSelectedAppointment(appointmentId);
  };

  const handleNotesSaved = () => {
    setSelectedAppointment(null);
    fetchAppointments(); // Refresh appointments after saving notes
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="clinician-dashboard p-6">
      <header className="dashboard-header mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <div className="user-info flex items-center gap-3">
            <span className="text-lg">
              {user?.full_name || user?.name || "Clinician"}
            </span>
            <span className="role-badge bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Clinician
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="empty-state text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">No upcoming appointments</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="appointments-table min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Centre
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Mode
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm">{appointment.rowNumber}</td>
                  <td className="px-4 py-3 text-sm">
                    {appointment.appointmentDate}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {appointment.appointmentTime}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {appointment.centreName}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {appointment.mode === "ONLINE" ? (
                      <div className="online-mode flex flex-col gap-1">
                        <span className="text-green-600 font-medium">
                          Online
                        </span>
                        {appointment.googleMeetLink && (
                          <a
                            href={appointment.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="meet-link text-blue-600 hover:text-blue-800 text-xs underline"
                          >
                            Join Meet
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-600">In-Person</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {appointment.patientName}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleNotesClick(appointment.id)}
                      className="notes-button bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      {appointment.notes ? "View/Edit Notes" : "Add Notes"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedAppointment && (
        <NotesPanel
          appointmentId={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onSave={handleNotesSaved}
        />
      )}
    </div>
  );
};

export default ClinicianDashboard;
