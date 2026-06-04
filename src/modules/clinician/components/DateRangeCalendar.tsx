import React, { useState, useRef, useEffect } from "react";
import {
  format,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DateRangeCalendarProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

const DateRangeCalendar: React.FC<DateRangeCalendarProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date>(endDate);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [quickFilter, setQuickFilter] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickFilter = (filter: string) => {
    const today = new Date();
    setQuickFilter(filter);
    let newStartDate = today;
    let newEndDate = today;

    switch (filter) {
      case "today":
        newStartDate = today;
        newEndDate = today;
        break;
      case "yesterday":
        newStartDate = subDays(today, 1);
        newEndDate = subDays(today, 1);
        break;
      case "thisWeek":
        newStartDate = startOfWeek(today);
        newEndDate = today;
        break;
      case "last7":
        newStartDate = subDays(today, 6);
        newEndDate = today;
        break;
      case "lastWeek":
        const lastWeekStart = startOfWeek(subDays(today, 7));
        const lastWeekEnd = endOfWeek(subDays(today, 7));
        newStartDate = lastWeekStart;
        newEndDate = lastWeekEnd;
        break;
      case "last14":
        newStartDate = subDays(today, 13);
        newEndDate = today;
        break;
      case "thisMonth":
        newStartDate = startOfMonth(today);
        newEndDate = today;
        break;
      case "last30":
        newStartDate = subDays(today, 29);
        newEndDate = today;
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        newStartDate = startOfMonth(lastMonth);
        newEndDate = endOfMonth(lastMonth);
        break;
      case "allTime":
        newStartDate = subDays(today, 365);
        newEndDate = addDays(today, 365);
        break;
    }

    setTempStartDate(newStartDate);
    setTempEndDate(newEndDate);
    onDateRangeChange(newStartDate, newEndDate);
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = [];
    const startWeek = startOfWeek(start);
    let day = startWeek;
    while (day <= end || days.length < 42) {
      days.push(day);
      day = addDays(day, 1);
      if (days.length >= 42) break;
    }
    return days;
  };

  const handleDateClick = (date: Date) => {
    if (
      !tempStartDate ||
      (tempStartDate && tempEndDate && isSameDay(tempStartDate, tempEndDate))
    ) {
      setTempStartDate(date);
      setTempEndDate(date);
      setQuickFilter("");
    } else {
      if (date >= tempStartDate) {
        setTempEndDate(date);
      } else {
        setTempEndDate(tempStartDate);
        setTempStartDate(date);
      }
      setQuickFilter("");
    }
  };

  const isDateInRange = (date: Date) => {
    if (!tempStartDate || !tempEndDate) return false;
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isDateRangeStart = (date: Date) =>
    tempStartDate && isSameDay(date, tempStartDate);
  const isDateRangeEnd = (date: Date) =>
    tempEndDate && isSameDay(date, tempEndDate);

  const getDateRangeLabel = () => {
    if (!tempStartDate || !tempEndDate) return "Select Date Range";
    if (isSameDay(tempStartDate, tempEndDate)) {
      if (isToday(tempStartDate)) return "Today";
      return format(tempStartDate, "MMM d, yyyy");
    }
    return `${format(tempStartDate, "MMM d")} - ${format(tempEndDate, "MMM d, yyyy")}`;
  };

  const handleApply = () => {
    onDateRangeChange(tempStartDate, tempEndDate);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-xl border border-slate-600 hover:border-miboTeal transition-all shadow-lg hover:shadow-miboTeal/20"
      >
        <CalendarIcon size={20} className="text-miboTeal" />
        <span className="font-medium">{getDateRangeLabel()}</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${showDropdown ? "rotate-180" : ""}`}
        />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-[420px] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 z-50 overflow-hidden">
          <div className="grid grid-cols-3">
            {/* Quick Filters Sidebar */}
            <div className="col-span-1 bg-slate-800/50 border-r border-slate-700 p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">
                Quick Select
              </h3>
              <div className="space-y-1">
                {[
                  { label: "Today", value: "today" },
                  { label: "Yesterday", value: "yesterday" },
                  { label: "This week (Sun - Today)", value: "thisWeek" },
                  { label: "Last 7 days", value: "last7" },
                  { label: "Last week (Sun - Sat)", value: "lastWeek" },
                  { label: "Last 14 days", value: "last14" },
                  { label: "This month", value: "thisMonth" },
                  { label: "Last 30 days", value: "last30" },
                  { label: "Last month", value: "lastMonth" },
                  { label: "All time", value: "allTime" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => handleQuickFilter(filter.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      quickFilter === filter.value
                        ? "bg-miboTeal text-white font-semibold"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="col-span-2 p-4">
              {/* Date Range Display */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                <div className="text-sm">
                  <span className="text-slate-400">Start: </span>
                  <span className="text-white font-semibold">
                    {format(tempStartDate, "MMM d, yyyy")}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-400">End: </span>
                  <span className="text-white font-semibold">
                    {format(tempEndDate, "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-slate-400" />
                </button>
                <h3 className="text-white font-semibold">
                  {format(calendarMonth, "MMMM yyyy")}
                </h3>
                <button
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs font-semibold text-slate-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(calendarMonth).map((date, i) => {
                  const isCurrentMonth = isSameMonth(date, calendarMonth);
                  const isTodayDate = isToday(date);
                  const inRange = isDateInRange(date);
                  const isStart = isDateRangeStart(date);
                  const isEnd = isDateRangeEnd(date);

                  return (
                    <button
                      key={i}
                      onClick={() => handleDateClick(date)}
                      className={`
                        aspect-square text-sm rounded-lg transition-all relative
                        ${!isCurrentMonth ? "text-slate-600" : "text-slate-300"}
                        ${isTodayDate ? "font-bold" : ""}
                        ${inRange ? "bg-miboTeal/20" : "hover:bg-slate-800"}
                        ${isStart || isEnd ? "bg-miboTeal text-white font-semibold" : ""}
                        ${isTodayDate && !inRange ? "border border-miboTeal" : ""}
                      `}
                    >
                      {format(date, "d")}
                    </button>
                  );
                })}
              </div>

              {/* Close Button */}
              <div className="mt-4 pt-3 border-t border-slate-700">
                <button
                  onClick={handleApply}
                  className="w-full py-2 bg-miboTeal hover:bg-miboTeal/90 text-white rounded-lg font-medium transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeCalendar;
