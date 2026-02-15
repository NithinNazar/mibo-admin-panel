import React, { useState, useEffect } from "react";

interface TimeSliderProps {
  value: string; // HH:MM format (24-hour)
  onChange: (time: string) => void;
  sessionLength?: number; // Minutes (default 30)
  label?: string;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  value,
  onChange,
  sessionLength = 30,
  label = "Start Time",
}) => {
  const [hour, setHour] = useState(9); // 1-12
  const [minute, setMinute] = useState(0); // 0, 15, 30, 45
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [hourStr, minuteStr] = value.split(":");
      const hour24 = parseInt(hourStr, 10);
      const min = parseInt(minuteStr, 10);

      // Convert 24-hour to 12-hour
      const { hour12, period: newPeriod } = convertTo12Hour(hour24);
      setHour(hour12);
      setMinute(min);
      setPeriod(newPeriod);
    }
  }, [value]);

  // Convert 24-hour to 12-hour format
  const convertTo12Hour = (
    hour24: number,
  ): { hour12: number; period: "AM" | "PM" } => {
    if (hour24 === 0) return { hour12: 12, period: "AM" };
    if (hour24 < 12) return { hour12: hour24, period: "AM" };
    if (hour24 === 12) return { hour12: 12, period: "PM" };
    return { hour12: hour24 - 12, period: "PM" };
  };

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (hour12: number, period: "AM" | "PM"): number => {
    if (period === "AM") {
      return hour12 === 12 ? 0 : hour12;
    } else {
      return hour12 === 12 ? 12 : hour12 + 12;
    }
  };

  // Calculate end time based on start time and session length
  const calculateEndTime = (): string => {
    const hour24 = convertTo24Hour(hour, period);
    const startMinutes = hour24 * 60 + minute;
    const endMinutes = startMinutes + sessionLength;

    const endHour24 = Math.floor(endMinutes / 60) % 24;
    const endMinute = endMinutes % 60;

    return `${String(endHour24).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
  };

  // Format time for display (12-hour format)
  const formatTimeDisplay = (): string => {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
  };

  // Handle hour change from slider
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHour = parseInt(e.target.value, 10);
    setHour(newHour);
    updateTime(newHour, minute, period);
  };

  // Handle minute change
  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute);
    updateTime(hour, newMinute, period);
  };

  // Handle period toggle
  const handlePeriodToggle = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    updateTime(hour, newPeriod === period ? minute : minute, newPeriod);
  };

  // Update time and call onChange
  const updateTime = (h: number, m: number, p: "AM" | "PM") => {
    const hour24 = convertTo24Hour(h, p);
    const timeString = `${String(hour24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    onChange(timeString);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-lg font-semibold text-gray-900">
          {formatTimeDisplay()}
        </span>
      </div>

      {/* Hour Slider */}
      <div className="space-y-2">
        <label className="text-xs text-gray-600">Hour</label>
        <input
          type="range"
          min="1"
          max="12"
          step="1"
          value={hour}
          onChange={handleHourChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1</span>
          <span>6</span>
          <span>12</span>
        </div>
      </div>

      {/* Minute Selection */}
      <div className="space-y-2">
        <label className="text-xs text-gray-600">Minutes</label>
        <div className="grid grid-cols-4 gap-2">
          {[0, 15, 30, 45].map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => handleMinuteChange(min)}
              className={`
                py-2 px-3 rounded-md text-sm font-medium transition-colors
                ${
                  minute === min
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              :{String(min).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      {/* AM/PM Toggle */}
      <div className="space-y-2">
        <label className="text-xs text-gray-600">Period</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handlePeriodToggle("AM")}
            className={`
              py-2 px-4 rounded-md text-sm font-medium transition-colors
              ${
                period === "AM"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => handlePeriodToggle("PM")}
            className={`
              py-2 px-4 rounded-md text-sm font-medium transition-colors
              ${
                period === "PM"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            PM
          </button>
        </div>
      </div>

      {/* End Time Display */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">End Time (auto-calculated):</span>
          <span className="font-medium text-gray-900">
            {(() => {
              const endTime = calculateEndTime();
              const [endHourStr, endMinuteStr] = endTime.split(":");
              const endHour24 = parseInt(endHourStr, 10);
              const { hour12: endHour12, period: endPeriod } =
                convertTo12Hour(endHour24);
              return `${String(endHour12).padStart(2, "0")}:${endMinuteStr} ${endPeriod}`;
            })()}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Session length: {sessionLength} minutes
        </div>
      </div>
    </div>
  );
};
