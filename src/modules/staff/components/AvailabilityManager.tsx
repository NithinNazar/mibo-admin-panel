import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import { Plus, Trash2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import clinicianService from "../../../services/clinicianService";
import centreService from "../../../services/centreService";
import type {
  AvailabilityRule,
  Centre,
  ConsultationMode,
} from "../../../types";

interface AvailabilityManagerProps {
  clinicianId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  clinicianId,
}) => {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [rules, setRules] = useState<
    Omit<AvailabilityRule, "id" | "clinicianId">[]
  >([
    {
      centreId: "",
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
      mode: "IN_PERSON",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    try {
      const data = await centreService.getCentres();
      setCentres(data);
      if (data.length > 0 && !rules[0].centreId) {
        setRules([{ ...rules[0], centreId: data[0].id }]);
      }
    } catch (error: any) {
      toast.error("Failed to fetch centres");
    }
  };

  const addRule = () => {
    setRules([
      ...rules,
      {
        centreId: centres[0]?.id || "",
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMinutes: 30,
        mode: "IN_PERSON",
      },
    ]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (
    index: number,
    field: keyof Omit<AvailabilityRule, "id" | "clinicianId">,
    value: any,
  ) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    for (const rule of rules) {
      if (!rule.centreId || !rule.startTime || !rule.endTime) {
        toast.error("Please fill in all fields for each availability rule");
        return;
      }
      if (rule.startTime >= rule.endTime) {
        toast.error("End time must be after start time");
        return;
      }
    }

    try {
      setLoading(true);
      await clinicianService.updateAvailability(clinicianId, rules);
      toast.success("Availability rules saved successfully");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save availability",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Availability Schedule
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Set working hours and slot durations for each centre
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={addRule}>
          <Plus size={16} />
          Add Rule
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {rules.map((rule, index) => (
          <div
            key={index}
            className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 space-y-3"
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-slate-300">
                Rule {index + 1}
              </span>
              {rules.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeRule(index)}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Centre"
                value={rule.centreId}
                onChange={(e) => updateRule(index, "centreId", e.target.value)}
                options={centres.map((centre) => ({
                  value: centre.id,
                  label: centre.name,
                }))}
                required
              />

              <Select
                label="Day of Week"
                value={rule.dayOfWeek.toString()}
                onChange={(e) =>
                  updateRule(index, "dayOfWeek", parseInt(e.target.value))
                }
                options={DAYS_OF_WEEK.map((day) => ({
                  value: day.value.toString(),
                  label: day.label,
                }))}
                required
              />

              <Input
                label="Start Time"
                type="time"
                value={rule.startTime}
                onChange={(e) => updateRule(index, "startTime", e.target.value)}
                icon={<Clock size={16} />}
                required
              />

              <Input
                label="End Time"
                type="time"
                value={rule.endTime}
                onChange={(e) => updateRule(index, "endTime", e.target.value)}
                icon={<Clock size={16} />}
                required
              />

              <Input
                label="Slot Duration (min)"
                type="number"
                value={rule.slotDurationMinutes}
                onChange={(e) =>
                  updateRule(
                    index,
                    "slotDurationMinutes",
                    parseInt(e.target.value) || 30,
                  )
                }
                min={15}
                step={15}
                required
              />

              <Select
                label="Mode"
                value={rule.mode}
                onChange={(e) =>
                  updateRule(index, "mode", e.target.value as ConsultationMode)
                }
                options={[
                  { value: "IN_PERSON", label: "In-Person" },
                  { value: "ONLINE", label: "Online" },
                ]}
                required
              />
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary" loading={loading}>
            Save Availability Rules
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AvailabilityManager;
