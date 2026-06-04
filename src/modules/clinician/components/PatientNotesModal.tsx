import React from "react";
import { X, FileText } from "lucide-react";

interface PatientNotesModalProps {
  appointment: any;
  onClose: () => void;
}

const PatientNotesModal: React.FC<PatientNotesModalProps> = ({
  appointment,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl max-w-lg w-full shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Patient Notes</h2>
              <p className="text-slate-400 text-xs">
                {appointment.patient_name} · Notes added during booking
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

        {/* Content */}
        <div className="p-4">
          {appointment.patient_notes ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {appointment.patient_notes}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={40} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 italic text-sm">
                No patient notes provided.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientNotesModal;
