import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import clinicianService from "../../../services/clinicianService";
import { slotBlockingService } from "../../../services/slotBlockingService";
import type { Clinician } from "../../../types";

const today = new Date().toISOString().split("T")[0];

const SlotBlockingByDatePage: React.FC = () => {
  const navigate = useNavigate();
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [blocking, setBlocking] = useState(false);
  const [selectedClinician, setSelectedClinician] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    clinicianService
      .getClinicians()
      .then(setClinicians)
      .catch(() => toast.error("Failed to fetch clinicians"));
  }, []);

  const handleBlockEntireDay = async () => {
    const clinician = clinicians.find((c) => c.id === selectedClinician);
    if (!clinician) return;
    if (!window.confirm(`Block all slots for ${clinician.fullName || clinician.name} on ${selectedDate}?`)) return;
    try {
      setBlocking(true);
      const response = await slotBlockingService.blockClinicianDay(
        Number(clinician.id),
        Number(clinician.primaryCentreId),
        selectedDate,
        reason || "",
      );
      toast.success(
        `Blocked ${response.data.blocked_count} slots. ${response.data.affected_patients.length} patient(s) notified.`,
      );
    } catch (error) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast.error(err.response?.data?.error?.message || "Failed to block day");
    } finally {
      setBlocking(false);
    }
  };

  const canBlock = selectedClinician !== "ALL" && !!selectedDate;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => navigate("/slot-blocking")}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Block by Date</h1>
          <p className="text-slate-400 mt-1">
            Block all slots for a clinician on a specific date
          </p>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Clinician
              </label>
              <Select
                value={selectedClinician}
                onChange={(e) => setSelectedClinician(e.target.value)}
                options={[
                  { value: "ALL", label: "Select Clinician" },
                  ...clinicians.map((c) => ({
                    value: c.id,
                    label: c.fullName || c.name,
                  })),
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Reason
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Clinician unavailable"
              rows={2}
            />
          </div>
          <Button
            variant="danger"
            onClick={handleBlockEntireDay}
            disabled={!canBlock || blocking}
          >
            {blocking ? "Blocking..." : "Block Entire Day"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SlotBlockingByDatePage;
