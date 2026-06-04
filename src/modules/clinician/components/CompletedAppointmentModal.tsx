import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  X,
  FileText,
  Clock,
  MapPin,
  Video,
  Stethoscope,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import appointmentService from "../../../services/appointmentService";
import PatientNotesModal from "./PatientNotesModal";

interface CompletedAppointmentModalProps {
  appointment: any;
  onClose: () => void;
}

const CompletedAppointmentModal: React.FC<CompletedAppointmentModalProps> = ({
  appointment,
  onClose,
}) => {
  const [showPatientNotesModal, setShowPatientNotesModal] = useState(false);
  const [showClinicianSection, setShowClinicianSection] = useState(false);
  const [showPreviousNotes, setShowPreviousNotes] = useState(true);
  const [showFollowUpSection, setShowFollowUpSection] = useState(true);
  const [previousNotes, setPreviousNotes] = useState<any[]>([]);
  const [followUpData, setFollowUpData] = useState<any>(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [schedulingFollowUp, setSchedulingFollowUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdditionalData();
  }, []);

  const fetchAdditionalData = async () => {
    try {
      // Fetch previous notes
      const notes = await appointmentService.getPreviousSessionNotes(
        appointment.id,
        appointment.patient_id,
      );
      setPreviousNotes(notes);

      // TODO: Fetch follow-up data if API exists
      // const followUp = await appointmentService.getFollowUpForAppointment(appointment.id);
      // setFollowUpData(followUp);
    } catch (error) {
      console.error("Failed to fetch additional data:", error);
    }
  };

  const handleScheduleFollowUp = async () => {
    if (!followUpDate) {
      setError("Please select a follow-up date");
      return;
    }

    try {
      setSchedulingFollowUp(true);
      setError(null);

      await appointmentService.scheduleFollowUp(
        appointment.id,
        followUpDate,
        followUpNotes,
      );

      setFollowUpData({
        follow_up_date: followUpDate,
        follow_up_notes: followUpNotes,
      });
      setSuccessMessage("Follow-up scheduled successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Clear form
      setFollowUpDate("");
      setFollowUpNotes("");
    } catch (error: any) {
      console.error("Failed to schedule follow-up:", error);
      setError(error.response?.data?.message || "Failed to schedule follow-up");
    } finally {
      setSchedulingFollowUp(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-xl max-w-2xl w-full shadow-2xl border border-slate-700 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                <span className="text-teal-300 font-bold text-sm">
                  {appointment.patient_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {appointment.patient_name}
                </h2>
                <p className="text-slate-400 text-xs">
                  MRN {appointment.patient_mrn} · ☎ {appointment.patient_phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                ● Completed
              </span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="p-4 space-y-3 border-b border-slate-700 bg-slate-800/30 flex-shrink-0">
            {/* Time & Mode */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-400 text-xs uppercase mb-1">
                  Time
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Clock size={14} className="text-slate-500" />
                  <span>
                    {format(
                      new Date(appointment.scheduled_start_at),
                      "hh:mm a",
                    )}{" "}
                    -{" "}
                    {format(new Date(appointment.scheduled_end_at), "hh:mm a")}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase mb-1">
                  Mode
                </div>
                <div className="flex items-center gap-2 text-white">
                  {appointment.appointment_type === "ONLINE" ? (
                    <>
                      <Video size={14} className="text-green-500" />
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={14} className="text-blue-500" />
                      <span>In-Person</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="text-slate-400 text-xs uppercase mb-1">
                Location
              </div>
              <div className="text-white text-sm">
                {appointment.centre_name}
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500 text-green-200 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPatientNotesModal(true)}
                className="flex-1 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-blue-500/30"
              >
                <FileText size={16} />
                Patient Note
                {appointment.patient_notes && (
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setShowClinicianSection(!showClinicianSection)}
                className="flex-1 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-purple-500/30"
              >
                <Stethoscope size={16} />
                Clinician Note
                {appointment.notes && (
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Clinician Section (toggled) */}
            {showClinicianSection && (
              <div className="space-y-4">
                {/* Session Notes */}
                {appointment.notes && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h3 className="text-purple-300 font-semibold text-sm mb-2 flex items-center gap-2">
                      <Stethoscope size={16} />
                      Session Notes
                    </h3>
                    <p className="text-slate-300 text-xs whitespace-pre-wrap">
                      {appointment.notes}
                    </p>
                  </div>
                )}

                {/* Follow-Up Section */}
                <div className="border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowFollowUpSection(!showFollowUpSection)}
                    className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                      <Calendar size={16} />
                      {followUpData
                        ? "Follow-Up Scheduled"
                        : "Schedule Follow-Up"}
                    </span>
                    {showFollowUpSection ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </button>

                  {showFollowUpSection && (
                    <div className="p-3 bg-slate-800/30">
                      {followUpData ? (
                        // Show scheduled follow-up
                        <div className="space-y-2">
                          <div>
                            <div className="text-slate-400 text-xs mb-1">
                              Date
                            </div>
                            <div className="text-white text-sm">
                              {format(
                                new Date(followUpData.follow_up_date),
                                "MMMM dd, yyyy",
                              )}
                            </div>
                          </div>
                          {followUpData.follow_up_notes && (
                            <div>
                              <div className="text-slate-400 text-xs mb-1">
                                Notes
                              </div>
                              <div className="text-slate-300 text-xs">
                                {followUpData.follow_up_notes}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Show date picker to schedule
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-300 text-xs font-medium mb-1">
                              Follow-Up Date
                            </label>
                            <input
                              type="date"
                              value={followUpDate}
                              onChange={(e) => setFollowUpDate(e.target.value)}
                              min={format(new Date(), "yyyy-MM-dd")}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-300 text-xs font-medium mb-1">
                              Notes (Optional)
                            </label>
                            <textarea
                              value={followUpNotes}
                              onChange={(e) => setFollowUpNotes(e.target.value)}
                              placeholder="What to address in the follow-up session..."
                              className="w-full h-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            />
                          </div>
                          <button
                            onClick={handleScheduleFollowUp}
                            disabled={schedulingFollowUp || !followUpDate}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {schedulingFollowUp
                              ? "Scheduling..."
                              : "Confirm Follow-Up"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Previous Session Notes Section */}
                <div className="border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowPreviousNotes(!showPreviousNotes)}
                    className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                      <FileText size={16} />
                      Previous Session Notes{" "}
                      {previousNotes.length > 0 && `(${previousNotes.length})`}
                    </span>
                    {showPreviousNotes ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </button>

                  {showPreviousNotes && (
                    <div className="p-3 bg-slate-800/30">
                      {previousNotes.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {previousNotes.map((note) => (
                            <div
                              key={note.id}
                              className="bg-slate-800 border border-slate-700 rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-slate-400 text-xs">
                                  {format(
                                    new Date(note.scheduled_start_at),
                                    "MMM dd, yyyy • hh:mm a",
                                  )}
                                </span>
                              </div>
                              <p className="text-white text-xs whitespace-pre-wrap">
                                {note.session_notes}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-xs italic">
                          No previous session notes found.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Patient Notes Sub-Modal */}
      {showPatientNotesModal && (
        <PatientNotesModal
          appointment={appointment}
          onClose={() => setShowPatientNotesModal(false)}
        />
      )}
    </>
  );
};

export default CompletedAppointmentModal;
