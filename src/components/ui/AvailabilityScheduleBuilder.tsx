import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Select from "./Select";
import Button from "./Button";

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  consultationMode: string;
}

interface AvailabilityScheduleBuilderProps {
  label: string;
  slots: AvailabilitySlot[];
  onChange: (slots: AvailabilitySlot[]) => void;
  required?: boolean;
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const CONSULTATION_MODES = [
  { value: "IN_PERSON", label: "In-Person" },
  { value: "ONLINE", label: "Online" },
  { value: "BOTH", label: "Both" },
];

const AvailabilityScheduleBuilder: React.FC<
  AvailabilityScheduleBuilderProps
> = ({ label, slots, onChange, required = false }) => {
  const [selectedDay, setSelectedDay] = useState<string>("1");
  const [startHour, setStartHour] = useState<string>("09");
  const [startMinute, setStartMinute] = useState<string>("00");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endHour, setEndHour] = useState<string>("05");
  const [endMinute, setEndMinute] = useState<string>("00");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("PM");
  const [consultationMode, setConsultationMode] = useState<string>("IN_PERSON");

  const convertTo24Hour = (
    hour: string,
    minute: string,
    period: "AM" | "PM",
  ): string => {
    let h = parseInt(hour);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  const convertTo12Hour = (
    time24: string,
  ): { hour: string; minute: string; period: "AM" | "PM" } => {
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr);
    const period: "AM" | "PM" = hour >= 12 ? "PM" : "AM";
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return {
      hour: hour.toString().padStart(2, "0"),
      minute,
      period,
    };
  };

  const handleAddSlot = () => {
    const startTime = convertTo24Hour(startHour, startMinute, startPeriod);
    const endTime = convertTo24Hour(endHour, endMinute, endPeriod);

    // Validate times
    if (startTime >= endTime) {
      alert("End time must be after start time");
      return;
    }

    const newSlot: AvailabilitySlot = {
      id: `${Date.now()}-${Math.random()}`,
      dayOfWeek: parseInt(selectedDay),
      startTime,
      endTime,
      consultationMode,
    };

    onChange([...slots, newSlot]);
  };

  const handleRemoveSlot = (id: string) => {
    onChange(slots.filter((slot) => slot.id !== id));
  };

  const getDayName = (dayOfWeek: number): string => {
    return (
      DAYS_OF_WEEK.find((d) => d.value === dayOfWeek.toString())?.label || ""
    );
  };

  const getModeName = (mode: string): string => {
    return CONSULTATION_MODES.find((m) => m.value === mode)?.label || mode;
  };

  // Group slots by day
  const slotsByDay = slots.reduce(
    (acc, slot) => {
      if (!acc[slot.dayOfWeek]) {
        acc[slot.dayOfWeek] = [];
      }
      acc[slot.dayOfWeek].push(slot);
      return acc;
    },
    {} as Record<number, AvailabilitySlot[]>,
  );

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {/* Add Slot Form */}
      <div className="bg-slate-700/50 p-4 rounded-lg space-y-4">
        <h4 className="text-sm font-medium text-miboTeal">Add Time Slot</h4>

        {/* Day Selection */}
        <Select
          label="Day"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          options={DAYS_OF_WEEK}
        />

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Start Time
          </label>
          <div className="flex gap-2">
            <select
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-miboTeal"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h.toString().padStart(2, "0")}>
                  {h.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <span className="text-slate-300 self-center">:</span>
            <select
              value={startMinute}
              onChange={(e) => setStartMinute(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-miboTeal"
            >
              {["00", "15", "30", "45"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={startPeriod}
              onChange={(e) => setStartPeriod(e.target.value as "AM" | "PM")}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-miboTeal"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            End Time
          </label>
          <div className="flex gap-2">
            <select
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-miboTeal"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h.toString().padStart(2, "0")}>
                  {h.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <span className="text-slate-300 self-center">:</span>
            <select
              value={endMinute}
              onChange={(e) => setEndMinute(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-miboTeal"
            >
              {["00", "15", "30", "45"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={endPeriod}
              onChange={(e) => setEndPeriod(e.target.value as "AM" | "PM")}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-miboTeal"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* Consultation Mode */}
        <Select
          label="Consultation Mode"
          value={consultationMode}
          onChange={(e) => setConsultationMode(e.target.value)}
          options={CONSULTATION_MODES}
        />

        {/* Add Button */}
        <Button
          type="button"
          variant="primary"
          onClick={handleAddSlot}
          className="w-full"
        >
          <Plus size={16} className="mr-2" />
          Add Slot
        </Button>
      </div>

      {/* Display Slots by Day */}
      {Object.keys(slotsByDay).length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">
            Scheduled Slots
          </h4>
          {Object.entries(slotsByDay)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([day, daySlots]) => (
              <div
                key={day}
                className="bg-slate-700/50 p-3 rounded-lg space-y-2"
              >
                <h5 className="text-sm font-medium text-miboTeal">
                  {getDayName(parseInt(day))}
                </h5>
                <div className="space-y-2">
                  {daySlots.map((slot) => {
                    const start = convertTo12Hour(slot.startTime);
                    const end = convertTo12Hour(slot.endTime);
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between bg-slate-700 p-2 rounded border border-slate-600"
                      >
                        <div className="flex-1">
                          <span className="text-white text-sm">
                            {start.hour}:{start.minute} {start.period} -{" "}
                            {end.hour}:{end.minute} {end.period}
                          </span>
                          <span className="text-slate-400 text-xs ml-2">
                            ({getModeName(slot.consultationMode)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(slot.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          No availability slots added yet. Add slots using the form above.
        </p>
      )}
    </div>
  );
};

export default AvailabilityScheduleBuilder;
