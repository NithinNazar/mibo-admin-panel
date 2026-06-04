import React, { useState } from "react";
import { format } from "date-fns";
import {
  X,
  Play,
  Clock,
  MapPin,
  Video,
  FileText,
  AlertCircle,
} from "lucide-react";
import appointmentService from "../../../services/appointmentService";

interface StartSessionModalProps {
  appointment: any;
  onClose: () => void;
  onStartSession: () => void;
}

const StartSessionModal: React.FC<StartSessionModalProps> = ({
  appointment,
  onClose,
  onStartSession,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSession = async () => {
    try {
      setLoading(true);
      setError(null);

      await appointmentService.startSession(appointment.id);
      onStartSession();
    } catch (error: any) {
      console.error("Failed to start session:", error);
      setError(
        error.response?.data?.message ||
          "Failed to start session. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl max-w-md w-full shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-miboTeal/20 rounded-full flex items-center justify-center">
              <span className="text-miboTeal font-bold text-sm">
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
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Appointment Details */}
        <div className="p-4 space-y-3">
          {/* Time and Mode */}
          <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-white">
              <Clock size={16} className="text-slate-500" />
              <span className="text-sm font-medium">
                {format(new Date(appointment.scheduled_start_at), "hh:mm a")} -{" "}
                {format(new Date(appointment.scheduled_end_at), "hh:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white">
              {appointment.appointment_type === "ONLINE" ? (
                <>
                  <Video size={16} className="text-green-500" />
                  <span className="text-sm">Online</span>
                </>
              ) : (
                <>
                  <MapPin size={16} className="text-blue-500" />
                  <span className="text-sm">In-Person</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-white">
              <MapPin size={16} className="text-slate-500" />
              <span className="text-sm">{appointment.centre_name}</span>
            </div>
          </div>

          {/* Patient Notes */}
          {appointment.patient_notes && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <h3 className="text-blue-300 font-semibold text-sm mb-1 flex items-center gap-2">
                <FileText size={14} />
                Patient Notes
              </h3>
              <p className="text-slate-300 text-xs">
                {appointment.patient_notes}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-2 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle
              size={16}
              className="text-teal-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-teal-200 text-xs">
              Starting this session will mark the appointment as{" "}
              <strong>Ongoing</strong>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-4 border-t border-slate-700 sticky bottom-0 bg-slate-900">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleStartSession}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
          >
            <Play size={16} />
            {loading ? "Starting..." : "Begin Session"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartSessionModal;
