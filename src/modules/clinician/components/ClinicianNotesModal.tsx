import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, FileText, ChevronDown, ChevronUp } from "lucide-react";
import appointmentService from "../../../services/appointmentService";

interface ClinicianNotesModalProps {
  appointment: any;
  onClose: () => void;
  onSave: () => void;
  isReadOnly?: boolean;
}

const ClinicianNotesModal: React.FC<ClinicianNotesModalProps> = ({
  appointment,
  onClose,
  onSave,
  isReadOnly = false,
}) => {
  const [notes, setNotes] = useState(appointment.notes || "");
  const [previousNotes, setPreviousNotes] = useState<any[]>([]);
  const [showPreviousNotes, setShowPreviousNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreviousNotes();
  }, []);

  const fetchPreviousNotes = async () => {
    try {
      const data = await appointmentService.getPreviousSessionNotes(
        appointment.id,
        appointment.patient_id,
      );
      setPreviousNotes(data);
    } catch (error) {
      console.error("Failed to fetch previous notes:", error);
    }
  };

  const handleSave = async () => {
    if (!notes.trim()) {
      setError("Please add some notes before saving");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await appointmentService.saveClinicianNotes(appointment.id, notes);
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Failed to save notes:", error);
      setError(error.response?.data?.message || "Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl max-w-2xl w-full shadow-2xl border border-slate-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Clinician Notes</h2>
              <p className="text-slate-400 text-xs">
                {appointment.patient_name} ·{" "}
                {format(
                  new Date(appointment.scheduled_start_at),
                  "MMM dd, yyyy · hh:mm a",
                )}{" "}
                - {format(new Date(appointment.scheduled_end_at), "hh:mm a")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Session Notes */}
          <div>
            <label className="block text-white font-semibold mb-2 text-sm">
              Session Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your clinical observations, treatment notes, patient progress..."
              className="w-full h-40 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              disabled={isReadOnly || appointment.status === "COMPLETED"}
            />
            <div className="text-slate-400 text-xs mt-1">
              {notes.length} characters
            </div>
          </div>

          {/* Previous Session Notes */}
          {previousNotes.length > 0 && (
            <div className="border border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowPreviousNotes(!showPreviousNotes)}
                className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                  <FileText size={16} />
                  Previous Session Notes ({previousNotes.length})
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

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-slate-700 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
          >
            {isReadOnly ? "Close" : "Cancel"}
          </button>
          {!isReadOnly && appointment.status !== "COMPLETED" && (
            <button
              onClick={handleSave}
              disabled={saving || !notes.trim()}
              className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
            >
              {saving ? "Saving..." : "Save Notes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicianNotesModal;
