// Admin Panel - Slot Blocking Panel Component
import React, { useState } from "react";
import { slotBlockingService } from "../../services/slotBlockingService";
import type { BlockSlotRequest, AffectedPatient } from "../../services/slotBlockingService";
import type { Centre, Clinician } from "../../types";
import Button from "../ui/Button";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

interface SlotBlockingPanelProps {
  clinicianId: number;
  centreId: number;
  clinicianName: string;
  defaultDate?: string;
  clinicians?: Clinician[];
  centres?: Centre[];
  onSuccess?: () => void;
}

export const SlotBlockingPanel: React.FC<SlotBlockingPanelProps> = ({
  clinicianId: defaultClinicianId,
  centreId: defaultCentreId,
  clinicianName: defaultClinicianName,
  defaultDate = "",
  clinicians = [],
  centres = [],
  onSuccess,
}) => {
  const [selectedClinicianId, setSelectedClinicianId] = useState(
    defaultClinicianId ? String(defaultClinicianId) : clinicians[0]?.id ?? "",
  );
  const [selectedCentreId, setSelectedCentreId] = useState(
    defaultCentreId ? String(defaultCentreId) : centres[0]?.id ?? "",
  );
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [affectedPatients, setAffectedPatients] = useState<AffectedPatient[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const clinicianId = Number(selectedClinicianId);
  const centreId = Number(selectedCentreId);
  const clinicianName =
    clinicians.find((c) => c.id === selectedClinicianId)?.fullName ||
    clinicians.find((c) => c.id === selectedClinicianId)?.name ||
    defaultClinicianName;

  const handlePreview = async () => {
    if (!date || !startTime || !endTime) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }
    setLoading(true);
    try {
      const slots: BlockSlotRequest[] = [
        { clinician_id: clinicianId, centre_id: centreId, date, start_time: startTime, end_time: endTime },
      ];
      const response = await slotBlockingService.getAffectedPatients(slots);
      setAffectedPatients(response.data.affected_patients);
      setShowPreview(true);
      setMessage(null);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.error?.message || "Failed to preview affected patients",
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
      setDate(defaultDate);
      setStartTime("");
      setEndTime("");
      setReason("");
      setShowPreview(false);
      setAffectedPatients([]);
      onSuccess?.();
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
    if (!window.confirm(`Block all slots for ${clinicianName} on ${date}?`)) return;
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
      setDate(defaultDate);
      setReason("");
      onSuccess?.();
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
    <div className="p-6 space-y-4">
      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Clinician & Centre selectors (only shown when lists are provided) */}
      {clinicians.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Clinician *</label>
            <Select
              value={selectedClinicianId}
              onChange={(e) => setSelectedClinicianId(e.target.value)}
              options={clinicians.map((c) => ({
                value: c.id,
                label: c.fullName || c.name,
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Centre *</label>
            <Select
              value={selectedCentreId}
              onChange={(e) => setSelectedCentreId(e.target.value)}
              options={centres.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Start Time *</label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">End Time *</label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Reason</label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Clinician unavailable"
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-2 border-t border-white/10">
        <Button variant="secondary" size="sm" onClick={handlePreview} disabled={loading}>
          {loading ? "Loading..." : "Preview Affected Patients"}
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleBlockSlot}
          disabled={loading || !date || !startTime || !endTime}
        >
          {loading ? "Blocking..." : "Block Slot"}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleBlockDay} disabled={loading || !date}>
          {loading ? "Blocking..." : "Block Entire Day"}
        </Button>
      </div>

      {showPreview && (
        <div className="mt-2 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Affected Patients ({affectedPatients.length})
          </h3>
          {affectedPatients.length === 0 ? (
            <p className="text-slate-400 text-sm">No patients will be affected</p>
          ) : (
            <div className="space-y-2">
              {affectedPatients.map((patient) => (
                <div key={patient.appointment_id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="font-medium text-white">{patient.patient_name}</div>
                  <div className="text-sm text-slate-400">Phone: {patient.patient_phone}</div>
                  <div className="text-sm text-slate-400">
                    Appointment: {new Date(patient.appointment_time).toLocaleString()}
                  </div>
                  {patient.refund_eligible && (
                    <div className="text-sm text-green-400 font-medium mt-1">✓ Refund Eligible</div>
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
