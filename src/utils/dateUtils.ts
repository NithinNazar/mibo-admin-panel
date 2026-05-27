/**
 * Date Utility Functions for Admin Panel
 *
 * Handles timezone conversions and date parsing for appointment times.
 *
 * IMPORTANT: The database stores timestamps in UTC, but PostgreSQL's
 * `timestamp` type (without timezone) may return dates without the 'Z' suffix.
 * JavaScript interprets dates without timezone indicators as local time,
 * which causes a 5.5-hour offset for IST.
 */

/**
 * Parse a timestamp string and ensure it's treated as UTC
 *
 * @param dateString - Timestamp string from the database
 * @returns Date object with correct UTC interpretation
 *
 * @example
 * // Database returns: "2026-05-24T06:30:00" (should be UTC)
 * // Without fix: Parsed as 06:30 IST → Wrong!
 * // With fix: Parsed as 06:30 UTC → Correct! (displays as 12:00 PM IST)
 *
 * const scheduledTime = parseUTCDate("2026-05-24T06:30:00");
 * console.log(scheduledTime.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}));
 * // Output: "24/5/2026, 12:00:00 pm"
 */
export function parseUTCDate(dateString: string): Date {
  if (!dateString) {
    throw new Error("Date string is required");
  }

  // If the date string already has a timezone indicator (Z or +/-), use it as-is
  if (
    dateString.endsWith("Z") ||
    dateString.includes("+") ||
    (dateString.includes("T") && dateString.split("T")[1].includes("-"))
  ) {
    return new Date(dateString);
  }

  // If no timezone indicator, treat as UTC by adding 'Z'
  // Replace space with 'T' if needed (PostgreSQL format: "2026-05-24 06:30:00")
  const isoString = dateString.replace(" ", "T") + "Z";
  return new Date(isoString);
}

/**
 * Check if current time has reached or passed the scheduled time
 *
 * @param scheduledTimeStr - Scheduled time string from database
 * @returns true if current time >= scheduled time, false otherwise
 *
 * @example
 * const canStart = hasScheduledTimePassed("2026-05-24T06:30:00");
 * if (canStart) {
 *   // Allow starting the session
 * }
 */
export function hasScheduledTimePassed(scheduledTimeStr: string): boolean {
  const scheduledTime = parseUTCDate(scheduledTimeStr);
  const currentTime = new Date();
  return currentTime >= scheduledTime;
}

/**
 * Get time remaining until scheduled time
 *
 * @param scheduledTimeStr - Scheduled time string from database
 * @returns Object with hours, minutes, and seconds remaining (negative if past)
 *
 * @example
 * const remaining = getTimeUntilScheduled("2026-05-24T06:30:00");
 * console.log(`${remaining.hours}h ${remaining.minutes}m remaining`);
 */
export function getTimeUntilScheduled(scheduledTimeStr: string): {
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
} {
  const scheduledTime = parseUTCDate(scheduledTimeStr);
  const currentTime = new Date();
  const diff = scheduledTime.getTime() - currentTime.getTime();

  const totalSeconds = Math.floor(Math.abs(diff) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: diff < 0 ? -hours : hours,
    minutes: diff < 0 ? -minutes : minutes,
    seconds: diff < 0 ? -seconds : seconds,
    totalMilliseconds: diff,
  };
}

/**
 * Format a UTC timestamp for display in IST
 *
 * @param dateString - Timestamp string from database
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string in IST
 *
 * @example
 * const formatted = formatInIST("2026-05-24T06:30:00");
 * // Output: "24/5/2026, 12:00:00 pm"
 *
 * const customFormat = formatInIST("2026-05-24T06:30:00", {
 *   dateStyle: 'full',
 *   timeStyle: 'short'
 * });
 * // Output: "Sunday, 24 May 2026, 12:00 pm"
 */
export function formatInIST(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  },
): string {
  const date = parseUTCDate(dateString);
  return date.toLocaleString("en-IN", {
    ...options,
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Convert IST time to UTC for API requests
 *
 * @param date - Date object in IST
 * @returns ISO string in UTC
 *
 * @example
 * // User selects 12:00 PM IST
 * const istDate = new Date(2026, 4, 24, 12, 0, 0); // May 24, 2026, 12:00 PM
 * const utcString = convertISTToUTC(istDate);
 * // Output: "2026-05-24T06:30:00.000Z" (6:30 AM UTC)
 */
export function convertISTToUTC(date: Date): string {
  return date.toISOString();
}
