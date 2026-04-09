// Admin Panel - Slot Blocking Panel Component
import React, { useState } from "react";
import { slotBlockingService } from "../../services/slotBlockingService";
import type {
  BlockSlotRequest,
  AffectedPatient,
} from "../../services/slotBlockingService";

interface SlotBlockingPanelProps {
  clinicianId: number;
  centreId: number;
  clinicianName: string;
}

export const SlotBlockingPanel: React.FC<SlotBlockingPanelProps> = ({
  clinicianId,
  centreId,
  clinicianName,
}) => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [affectedPatients, setAffectedPatients] = useState<AffectedPatient[]>(
    [],
  );
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePreview = async () => {
    if (!date || !startTime || !endTime) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    setLoading(true);
    try {
      const slots: BlockSlotRequest[] = [
        {
          clinician_id: clinicianId,
          centre_id: centreId,
          date,
          start_time: startTime,
          end_time: endTime,
        },
      ];

      const response = await slotBlockingService.getAffectedPatients(slots);
      setAffectedPatients(response.data.affected_patients);
      setShowPreview(true);
      setMessage(null);
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.error?.message ||
          "Failed to preview affected patients",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockSlot = async () => {
    setLoading(true);
    try {
      const response = await slotBlockingService.blockSlot({
        clinician_id: clinicianId,
        centre_id: centreId,
        date,
        start_time: startTime,
        end_time: endTime,
        reason: reason || "Clinician unavailable",
      });

      setMessage({
        type: "success",
        text: `Slot blocked successfully. ${response.data.affected_patients.length} patient(s) notified.`,
      });

      // Reset form
      setDate("");
      setStartTime("");
      setEndTime("");
      setReason("");
      setShowPreview(false);
      setAffectedPatients([]);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.error?.message || "Failed to block slot",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDay = async () => {
    if (!date) {
      setMessage({ type: "error", text: "Please select a date" });
      return;
    }

    if (!window.confirm(`Block all slots for ${clinicianName} on ${date}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await slotBlockingService.blockClinicianDay(
        clinicianId,
        centreId,
        date,
        reason || "Clinician unavailable",
      );

      setMessage({
        type: "success",
        text: `Blocked ${response.data.blocked_count} slots. ${response.data.affected_patients.length} patient(s) notified.`,
      });

      setDate("");
      setReason("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.error?.message || "Failed to block day",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slot-blocking-panel p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Block Slots - {clinicianName}</h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Start Time *
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time *</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Clinician unavailable"
            rows={3}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Preview Affected Patients"}
          </button>

          <button
            onClick={handleBlockSlot}
            disabled={loading || !date || !startTime || !endTime}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
          >
            {loading ? "Blocking..." : "Block Slot"}
          </button>

          <button
            onClick={handleBlockDay}
            disabled={loading || !date}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400"
          >
            {loading ? "Blocking..." : "Block Entire Day"}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-3">
            Affected Patients ({affectedPatients.length})
          </h3>
          {affectedPatients.length === 0 ? (
            <p className="text-gray-600">No patients will be affected</p>
          ) : (
            <div className="space-y-2">
              {affectedPatients.map((patient) => (
                <div
                  key={patient.appointment_id}
                  className="p-3 bg-white rounded border"
                >
                  <div className="font-medium">{patient.patient_name}</div>
                  <div className="text-sm text-gray-600">
                    Phone: {patient.patient_phone}
                  </div>
                  <div className="text-sm text-gray-600">
                    Appointment:{" "}
                    {new Date(patient.appointment_time).toLocaleString()}
                  </div>
                  {patient.refund_eligible && (
                    <div className="text-sm text-green-600 font-medium">
                      ✓ Refund Eligible
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
