import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import Button from "../ui/Button";
import type { TimeSlot } from "../../types";

interface AvailabilityCalendarProps {
  clinicianId: string;
  centreId?: string;
  onSlotSelect?: (slot: TimeSlot) => void;
  slots: TimeSlot[];
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  slots,
  selectedDate,
  onDateChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(
    selectedDate || new Date().toISOString().split("T")[0]
  );

  // useEffect(() => {
  //   if (selectedDate) {
  //     setSelectedDay(selectedDate);
  //   }
  // }, [selectedDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    setSelectedDay(dateStr);
    if (onDateChange) {
      onDateChange(dateStr);
    }
  };

  const getSlotsForDate = (day: number): TimeSlot[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return slots.filter((slot) => slot.date === dateStr);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CalendarIcon size={20} />
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={previousMonth}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="secondary" size="sm" onClick={nextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateStr = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          const daySlots = getSlotsForDate(day);
          const availableSlots = daySlots.filter(
            (s) => s.status === "available"
          );
          const isSelected = dateStr === selectedDay;
          const isToday = dateStr === today;
          const isPast = dateStr < today;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isPast}
              className={`
                aspect-square rounded-lg p-2 text-sm transition-all
                ${
                  isSelected
                    ? "bg-miboTeal text-white ring-2 ring-miboTeal"
                    : ""
                }
                ${
                  isToday && !isSelected
                    ? "bg-slate-700 text-white ring-1 ring-slate-600"
                    : ""
                }
                ${
                  !isSelected && !isToday
                    ? "bg-slate-700/50 text-slate-300"
                    : ""
                }
                ${
                  isPast
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-slate-600"
                }
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="font-medium">{day}</span>
                {daySlots.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {availableSlots.length > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    )}
                    {daySlots.some((s) => s.status === "booked") && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span>Blocked</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
