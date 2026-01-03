import React from "react";
import { Clock, User, Video, MapPin } from "lucide-react";
import Button from "../ui/Button";
import type { TimeSlot } from "../../types";
import { formatTimeSlot, isSlotInPast } from "../../utils/slotGenerator";

interface SlotGridProps {
  date: string;
  slots: TimeSlot[];
  onSlotClick?: (slot: TimeSlot) => void;
  selectedSlotId?: string;
}

const SlotGrid: React.FC<SlotGridProps> = ({
  slots,
  onSlotClick,
  selectedSlotId,
}) => {
  if (slots.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <Clock size={48} className="mx-auto text-slate-600 mb-3" />
        <p className="text-slate-400">No slots available for this date</p>
      </div>
    );
  }

  const getSlotStatusStyles = (slot: TimeSlot) => {
    const isPast = isSlotInPast(slot.date, slot.startTime);
    const isSelected = slot.id === selectedSlotId;

    if (isPast) {
      return "bg-slate-700/30 border-slate-600 cursor-not-allowed opacity-50";
    }

    switch (slot.status) {
      case "available":
        return isSelected
          ? "bg-miboTeal border-miboTeal text-white"
          : "bg-slate-700 border-slate-600 hover:border-miboTeal hover:bg-slate-600 cursor-pointer";
      case "booked":
        return "bg-red-500/10 border-red-500/30 cursor-not-allowed";
      case "blocked":
        return "bg-gray-500/10 border-gray-500/30 cursor-not-allowed";
      default:
        return "bg-slate-700 border-slate-600";
    }
  };

  const getSlotStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            Available
          </span>
        );
      case "booked":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            Booked
          </span>
        );
      case "blocked":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            Blocked
          </span>
        );
      default:
        return null;
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    const isPast = isSlotInPast(slot.date, slot.startTime);
    if (slot.status === "available" && !isPast && onSlotClick) {
      onSlotClick(slot);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Available Time Slots
        </h3>
        <span className="text-sm text-slate-400">
          {slots.filter((s) => s.status === "available").length} available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slots.map((slot, index) => {
          const isPast = isSlotInPast(slot.date, slot.startTime);
          const isClickable = slot.status === "available" && !isPast;

          return (
            <div
              key={slot.id || index}
              onClick={() => handleSlotClick(slot)}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${getSlotStatusStyles(slot)}
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <span className="font-medium text-white">
                    {formatTimeSlot(slot.startTime, slot.endTime)}
                  </span>
                </div>
                {getSlotStatusBadge(slot.status)}
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  {slot.mode === "ONLINE" ? (
                    <>
                      <Video size={14} />
                      <span>Online Consultation</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={14} />
                      <span>In-Person</span>
                    </>
                  )}
                </div>

                {slot.status === "booked" && slot.appointmentId && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <User size={14} />
                    <span>Patient booked</span>
                  </div>
                )}
              </div>

              {isClickable && (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlotClick(slot);
                  }}
                >
                  Select Slot
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SlotGrid;
