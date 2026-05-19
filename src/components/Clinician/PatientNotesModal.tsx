import React, { useState, useEffect } from "react";
import { X, FileText } from "lucide-react";
import appointmentService from "../../services/appointmentService";

interface PatientNotesModalProps {
  appointmentId: number;
  onClose: () => void;
}

const PatientNotesModal: React.FC<PatientNotesModalProps> = ({
  appointmentId,
  onClose,
}) => {
  const [patientNotes, setPatientNotes] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatientNotes();
  }, [appointmentId]);

  const fetchPatientNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const appointment = await appointmentService.getAppointmentById(
        appointmentId.toString(),
      );
      setPatientNotes(
        appointment.patient_notes || "No notes provided by patient",
      );
    } catch (error: any) {
      console.error("Failed to fetch patient notes:", error);
      setError("Failed to load patient notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
              <FileText size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Patient Notes
              </h2>
              <p className="text-sm text-slate-400">
                Notes provided by patient during booking
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
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-miboTeal"></div>
              <p className="text-slate-400 mt-2">Loading notes...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="bg-slate-700/50 rounded-lg p-4 min-h-[200px]">
              <p className="text-slate-200 whitespace-pre-wrap">
                {patientNotes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientNotesModal;
