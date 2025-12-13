import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import type { TimeSlot } from "../../types";
import { formatTimeSlot } from "../../utils/slotGenerator";

interface WeekViewProps {
  clinicianId: string;
  centreId?: string;
  startDate?: Date;
  slots: TimeSlot[];
  onSlotClick?: (slot: TimeSlot) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  clinicianId,
  centreId,
  startDate = new Date(),
  slots,
  onSlotClick,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = new Date(startDate);
    const day = date.getDay();
    const diff = date.getDate() - day; // Get Sunday of current week
    return new Date(date.setDate(diff));
  });

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const getSlotsForDate = (date: Date): TimeSlot[] => {
    const dateStr = date.toISOString().split("T")[0];
    return slots.filter((slot) => slot.date === dateStr);
  };

  const weekDates = getWeekDates();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Week of{" "}
          {weekDates[0].toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}{" "}
          -{" "}
          {weekDates[6].toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={previousWeek}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="secondary" size="sm" onClick={nextWeek}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, index) => {
          const dateStr = date.toISOString().split("T")[0];
          const daySlots = getSlotsForDate(date);
          const availableSlots = daySlots.filter(
            (s) => s.status === "available"
          );
          const isToday = dateStr === today;
          const isPast = dateStr < today;

          return (
            <div
              key={dateStr}
              className={`
                rounded-lg p-3 min-h-[120px]
                ${
                  isToday
                    ? "bg-miboTeal/20 border-2 border-miboTeal"
                    : "bg-slate-700/50"
                }
                ${isPast ? "opacity-50" : ""}
              `}
            >
              {/* Day Header */}
              <div className="text-center mb-2">
                <div className="text-xs font-medium text-slate-400">
                  {dayNames[index]}
                </div>
                <div
                  className={`text-lg font-bold ${
                    isToday ? "text-miboTeal" : "text-white"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>

              {/* Slots Summary */}
              {daySlots.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-xs text-center">
                    <span className="text-green-400 font-medium">
                      {availableSlots.length}
                    </span>
                    <span className="text-slate-400"> available</span>
                  </div>
                  <div className="space-y-1 max-h-[60px] overflow-y-auto">
                    {daySlots.slice(0, 3).map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSlotClick && onSlotClick(slot)}
                        disabled={slot.status !== "available" || isPast}
                        className={`
                          w-full text-xs px-2 py-1 rounded text-left transition-colors
                          ${
                            slot.status === "available" && !isPast
                              ? "bg-slate-600 hover:bg-slate-500 text-white cursor-pointer"
                              : "bg-slate-700 text-slate-500 cursor-not-allowed"
                          }
                        `}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                    {daySlots.length > 3 && (
                      <div className="text-xs text-center text-slate-400">
                        +{daySlots.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-center text-slate-500 mt-2">
                  No slots
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
