import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Save,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import appointmentService from "../../services/appointmentService";
import { format } from "date-fns";

interface ClinicianNotesModalProps {
  appointment: {
    id: number;
    patient_name: string;
    notes: string | null;
    scheduled_start_at: string;
  };
  patientId: number;
  onClose: () => void;
  onSave: () => void;
}

interface PreviousNote {
  id: number;
  notes: string;
  scheduled_start_at: string;
  status: string;
}

const ClinicianNotesModal: React.FC<ClinicianNotesModalProps> = ({
  appointment,
  patientId,
  onClose,
  onSave,
}) => {
  const [notes, setNotes] = useState<string>(appointment.notes || "");
  const [previousNotes, setPreviousNotes] = useState<PreviousNote[]>([]);
  const [showPreviousNotes, setShowPreviousNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showPreviousNotes && previousNotes.length === 0) {
      fetchPreviousNotes();
    }
  }, [showPreviousNotes]);

  const fetchPreviousNotes = async () => {
    try {
      setLoadingPrevious(true);
      // Fetch all appointments for this patient
      const allAppointments = await appointmentService.getAppointments({
        patientId: patientId.toString(),
      });

      // Filter out current appointment and only include appointments with notes
      const notesHistory = allAppointments
        .filter(
          (apt: any) =>
            apt.id !== appointment.id &&
            apt.notes &&
            apt.notes.trim() !== "" &&
            new Date(apt.scheduled_start_at) <
              new Date(appointment.scheduled_start_at),
        )
        .map((apt: any) => ({
          id: apt.id,
          notes: apt.notes,
          scheduled_start_at: apt.scheduled_start_at,
          status: apt.status,
        }))
        .sort(
          (a: PreviousNote, b: PreviousNote) =>
            new Date(b.scheduled_start_at).getTime() -
            new Date(a.scheduled_start_at).getTime(),
        );

      setPreviousNotes(notesHistory);
    } catch (error: any) {
      console.error("Failed to fetch previous notes:", error);
    } finally {
      setLoadingPrevious(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      await appointmentService.updateAppointment(appointment.id.toString(), {
        notes: notes.trim(),
      });

      onSave();
    } catch (error: any) {
      console.error("Failed to save notes:", error);
      setError(error.response?.data?.message || "Failed to save notes");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
              <FileText size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Clinician Notes
              </h2>
              <p className="text-sm text-slate-400">
                {appointment.patient_name} •{" "}
                {format(
                  new Date(appointment.scheduled_start_at),
                  "MMM dd, yyyy",
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Current Session Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Session Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your clinical notes here..."
              rows={8}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              {notes.length} characters
            </p>
          </div>

          {/* Previous Notes Section */}
          <div className="border-t border-slate-700 pt-6">
            <button
              onClick={() => setShowPreviousNotes(!showPreviousNotes)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <div className="flex items-center gap-2">
                <History size={20} className="text-slate-400" />
                <span className="text-lg font-semibold text-white">
                  Previous Session Notes
                </span>
                {previousNotes.length > 0 && (
                  <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                    {previousNotes.length}
                  </span>
                )}
              </div>
              {showPreviousNotes ? (
                <ChevronUp size={20} className="text-slate-400" />
              ) : (
                <ChevronDown size={20} className="text-slate-400" />
              )}
            </button>

            {showPreviousNotes && (
              <div className="space-y-3">
                {loadingPrevious ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                    <p className="text-slate-400 text-sm mt-2">
                      Loading previous notes...
                    </p>
                  </div>
                ) : previousNotes.length === 0 ? (
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <p className="text-slate-400 text-sm">
                      No previous notes found for this patient
                    </p>
                  </div>
                ) : (
                  previousNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-300">
                          {format(
                            new Date(note.scheduled_start_at),
                            "MMM dd, yyyy 'at' hh:mm a",
                          )}
                        </span>
                        <span className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded-full">
                          {note.status}
                        </span>
                      </div>
                      <p className="text-slate-200 text-sm whitespace-pre-wrap">
                        {note.notes}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Notes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicianNotesModal;
