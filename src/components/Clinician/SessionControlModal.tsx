import React, { useState } from "react";
import { X, Play, Square, Clock, AlertCircle } from "lucide-react";
import appointmentService from "../../services/appointmentService";
import { format } from "date-fns";

interface SessionControlModalProps {
  appointment: {
    id: number;
    patient_name: string;
    scheduled_start_at: string;
    session_started_at?: string;
    session_ended_at?: string;
    status: string;
  };
  onClose: () => void;
  onUpdate: () => void;
}

const SessionControlModal: React.FC<SessionControlModalProps> = ({
  appointment,
  onClose,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSessionActive =
    appointment.session_started_at && !appointment.session_ended_at;
  const isSessionCompleted = appointment.session_ended_at;

  const handleStartSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update appointment status to IN_PROGRESS
      await appointmentService.updateAppointment(appointment.id.toString(), {
        status: "IN_PROGRESS",
      });

      // Note: session_started_at will be set by backend automatically
      onUpdate();
    } catch (error: any) {
      console.error("Failed to start session:", error);
      setError(error.response?.data?.message || "Failed to start session");
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update appointment status to COMPLETED
      await appointmentService.updateAppointment(appointment.id.toString(), {
        status: "COMPLETED",
      });

      // Note: session_ended_at will be set by backend automatically
      onUpdate();
    } catch (error: any) {
      console.error("Failed to end session:", error);
      setError(error.response?.data?.message || "Failed to end session");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isSessionActive ? "bg-red-600/20" : "bg-green-600/20"
              }`}
            >
              {isSessionActive ? (
                <Square size={20} className="text-red-400" />
              ) : (
                <Play size={20} className="text-green-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {isSessionActive ? "End Session" : "Start Session"}
              </h2>
              <p className="text-sm text-slate-400">
                {appointment.patient_name}
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
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Session Info */}
          <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Scheduled Time</span>
              <span className="text-sm text-white font-medium">
                {format(new Date(appointment.scheduled_start_at), "hh:mm a")}
              </span>
            </div>

            {appointment.session_started_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Session Started</span>
                <span className="text-sm text-white font-medium">
                  {format(new Date(appointment.session_started_at), "hh:mm a")}
                </span>
              </div>
            )}

            {appointment.session_ended_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Session Ended</span>
                <span className="text-sm text-white font-medium">
                  {format(new Date(appointment.session_ended_at), "hh:mm a")}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-600">
              <span className="text-sm text-slate-400">Status</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  isSessionActive
                    ? "bg-purple-100 text-purple-800"
                    : isSessionCompleted
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                {appointment.status}
              </span>
            </div>
          </div>

          {/* Information */}
          {!isSessionCompleted && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Clock
                  size={16}
                  className="text-blue-400 flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-blue-200">
                  {isSessionActive
                    ? "Ending the session will mark this appointment as completed and record the end time."
                    : "Starting the session will mark this appointment as in-progress and record the start time."}
                </p>
              </div>
            </div>
          )}

          {isSessionCompleted && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <p className="text-sm text-green-200">
                This session has been completed.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          {!isSessionCompleted && (
            <button
              onClick={isSessionActive ? handleEndSession : handleStartSession}
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSessionActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isSessionActive ? "Ending..." : "Starting..."}
                </>
              ) : (
                <>
                  {isSessionActive ? (
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
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionControlModal;
