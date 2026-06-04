import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  X,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Video,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import appointmentService from "../../../services/appointmentService";
import PatientNotesModal from "./PatientNotesModal";

interface OngoingSessionModalProps {
  appointment: any;
  onClose: () => void;
  onSessionComplete: () => void;
}

const OngoingSessionModal: React.FC<OngoingSessionModalProps> = ({
  appointment,
  onClose,
  onSessionComplete,
}) => {
  const [sessionNotes, setSessionNotes] = useState(appointment.notes || "");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showPreviousNotes, setShowPreviousNotes] = useState(false);
  const [previousNotes, setPreviousNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPatientNotesModal, setShowPatientNotesModal] = useState(false);

  useEffect(() => {
    fetchPreviousNotes();
  }, []);

  const fetchPreviousNotes = async () => {
    try {
      const notes = await appointmentService.getPreviousSessionNotes(
        appointment.id,
        appointment.patient_id,
      );
      setPreviousNotes(notes);
    } catch (error) {
      console.error("Failed to fetch previous notes:", error);
    }
  };

  const handleSaveNotes = async () => {
    if (!sessionNotes.trim()) {
      setError("Please add session notes before saving");
      return;
    }

    try {
      setSavingNotes(true);
      setError(null);
      setSuccessMessage(null);

      await appointmentService.saveClinicianNotes(appointment.id, sessionNotes);

      // If follow-up is scheduled, save it
      if (showFollowUp && followUpDate) {
        await appointmentService.scheduleFollowUp(
          appointment.id,
          followUpDate,
          followUpNotes,
        );
      }

      setSuccessMessage("Notes saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("Failed to save notes:", error);
      setError(error.response?.data?.message || "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!sessionNotes.trim()) {
      if (
        !window.confirm(
          "You haven't added any session notes. Are you sure you want to complete this session?",
        )
      ) {
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Save notes first if there are any
      if (sessionNotes.trim()) {
        await appointmentService.saveClinicianNotes(
          appointment.id,
          sessionNotes,
        );
      }

      // Save follow-up if scheduled
      if (showFollowUp && followUpDate) {
        await appointmentService.scheduleFollowUp(
          appointment.id,
          followUpDate,
          followUpNotes,
        );
      }

      // Mark session as complete
      await appointmentService.endSession(appointment.id);

      onSessionComplete();
    } catch (error: any) {
      console.error("Failed to complete session:", error);
      setError(error.response?.data?.message || "Failed to complete session");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientNotesClick = () => {
    setShowPatientNotesModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl max-w-2xl w-full shadow-2xl border border-slate-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-purple-300 font-bold text-sm">
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
                MRN: {appointment.patient_mrn}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ● Ongoing
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="p-3 border-b border-slate-700 bg-slate-800/30 flex-shrink-0">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2 text-white">
              <Clock size={14} className="text-slate-500" />
              <span>
                {format(new Date(appointment.scheduled_start_at), "hh:mm a")} -{" "}
                {format(new Date(appointment.scheduled_end_at), "hh:mm a")}
              </span>
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

        {/* Main Content - Scrollable */}
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

          {/* Action Buttons Row */}
          <div className="flex gap-2">
            <button
              onClick={handlePatientNotesClick}
              className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-blue-500/30"
            >
              <FileText size={14} />
              Patient Note
            </button>
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes || !sessionNotes.trim()}
              className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {savingNotes ? "Saving..." : "Save Notes"}
            </button>
          </div>

          {/* Session Notes */}
          <div>
            <label className="block text-white font-semibold mb-2 text-sm">
              Session Notes
            </label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Add clinical observations, treatment notes, patient progress..."
              className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-miboTeal resize-none"
            />
          </div>

          {/* Schedule Follow-Up Section */}
          <div className="border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowFollowUp(!showFollowUp)}
              className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                <Calendar size={16} />
                Schedule Follow-Up
              </span>
              {showFollowUp ? (
                <ChevronUp size={16} className="text-slate-400" />
              ) : (
                <ChevronDown size={16} className="text-slate-400" />
              )}
            </button>

            {showFollowUp && (
              <div className="p-3 space-y-3 bg-slate-800/30">
                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">
                    Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-miboTeal"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">
                    Follow-Up Note
                  </label>
                  <textarea
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="What to address in the follow-up session..."
                    className="w-full h-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-miboTeal resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Previous Session Notes Section */}
          {previousNotes.length > 0 && (
            <div className="border border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowPreviousNotes(!showPreviousNotes)}
                className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                  <FileText size={16} />
                  Previous Notes ({previousNotes.length})
                </span>
                {showPreviousNotes ? (
                  <ChevronUp size={16} className="text-slate-400" />
                ) : (
                  <ChevronDown size={16} className="text-slate-400" />
                )}
              </button>

              {showPreviousNotes && (
                <div className="p-3 space-y-2 bg-slate-800/30 max-h-60 overflow-y-auto">
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
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-4 border-t border-slate-700 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleMarkComplete}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-miboTeal hover:bg-miboTeal/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-miboTeal/20"
          >
            {loading ? "Completing..." : "Mark Complete"}
          </button>
        </div>
      </div>

      {/* Patient Notes Sub-Modal */}
      {showPatientNotesModal && (
        <PatientNotesModal
          appointment={appointment}
          onClose={() => setShowPatientNotesModal(false)}
        />
      )}
    </div>
  );
};

export default OngoingSessionModal;
