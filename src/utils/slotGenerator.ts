import type { AvailabilityRule, TimeSlot } from "../types";

/**
 * Generate time slots from availability rules
 * @param rule - Availability rule containing day, time range, and duration
 * @param date - Date for which to generate slots (YYYY-MM-DD format)
 * @returns Array of time slots
 */
export function generateSlotsFromRule(
  rule: AvailabilityRule,
  date: string
): Omit<TimeSlot, "id" | "status" | "appointmentId">[] {
  const slots: Omit<TimeSlot, "id" | "status" | "appointmentId">[] = [];

  // Parse start and end times
  const [startHour, startMinute] = rule.startTime.split(":").map(Number);
  const [endHour, endMinute] = rule.endTime.split(":").map(Number);

  // Convert to minutes since midnight
  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // Generate slots
  while (currentMinutes + rule.slotDurationMinutes <= endMinutes) {
    const slotStartHour = Math.floor(currentMinutes / 60);
    const slotStartMinute = currentMinutes % 60;
    const slotEndMinutes = currentMinutes + rule.slotDurationMinutes;
    const slotEndHour = Math.floor(slotEndMinutes / 60);
    const slotEndMinute = slotEndMinutes % 60;

    const startTime = `${String(slotStartHour).padStart(2, "0")}:${String(
      slotStartMinute
    ).padStart(2, "0")}`;
    const endTime = `${String(slotEndHour).padStart(2, "0")}:${String(
      slotEndMinute
    ).padStart(2, "0")}`;

    slots.push({
      clinicianId: rule.clinicianId,
      centreId: rule.centreId,
      date,
      startTime,
      endTime,
      mode: rule.mode,
    });

    currentMinutes += rule.slotDurationMinutes;
  }

  return slots;
}

/**
 * Calculate the number of slots that will be generated from a rule
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @param slotDurationMinutes - Duration of each slot in minutes
 * @returns Number of slots
 */
export function calculateSlotCount(
  startTime: string,
  endTime: string,
  slotDurationMinutes: number
): number {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const totalMinutes = endMinutes - startMinutes;

  return Math.floor(totalMinutes / slotDurationMinutes);
}

/**
 * Format time slot for display
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Formatted time range string
 */
export function formatTimeSlot(startTime: string, endTime: string): string {
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
  };

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Check if a time slot is in the past
 * @param date - Date in YYYY-MM-DD format
 * @param startTime - Start time in HH:mm format
 * @returns True if the slot is in the past
 */
export function isSlotInPast(date: string, startTime: string): boolean {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = startTime.split(":").map(Number);

  const slotDate = new Date(year, month - 1, day, hour, minute);
  const now = new Date();

  return slotDate < now;
}

/**
 * Group slots by date
 * @param slots - Array of time slots
 * @returns Object with dates as keys and slots as values
 */
export function groupSlotsByDate(
  slots: TimeSlot[]
): Record<string, TimeSlot[]> {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);
}

/**
 * Filter available slots
 * @param slots - Array of time slots
 * @returns Array of available slots
 */
export function getAvailableSlots(slots: TimeSlot[]): TimeSlot[] {
  return slots.filter((slot) => slot.status === "available");
}

/**
 * Get day of week from date string
 * @param date - Date in YYYY-MM-DD format
 * @returns Day of week (0-6, Sunday-Saturday)
 */
export function getDayOfWeek(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getDay();
}
