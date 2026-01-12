/**
 * Date Helper Utilities
 * Pure functions for date calculations in Stoic Calendar
 *
 * All dates use ISO 8601 format strings for consistency and Firebase compatibility
 * Week starts on Monday (ISO 8601 standard)
 */

/**
 * Get the start of today (00:00:00)
 */
export function getStartOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Get the end of today (23:59:59.999)
 */
export function getEndOfToday(): Date {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
}

/**
 * Get the start of a specific date (00:00:00)
 */
export function getStartOfDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of a specific date (23:59:59.999)
 */
export function getEndOfDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get the start of the current year
 */
export function getStartOfCurrentYear(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
}

/**
 * Get the end of the current year
 */
export function getEndOfCurrentYear(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
}

/**
 * Get the start of a specific year
 */
export function getStartOfYear(year: number): Date {
  return new Date(year, 0, 1, 0, 0, 0, 0);
}

/**
 * Get the end of a specific year
 */
export function getEndOfYear(year: number): Date {
  return new Date(year, 11, 31, 23, 59, 59, 999);
}

/**
 * Get the start of the current month
 */
export function getStartOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Get the end of the current month
 */
export function getEndOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Get the start of a specific month
 */
export function getStartOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1, 0, 0, 0, 0);
}

/**
 * Get the end of a specific month
 */
export function getEndOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

/**
 * Get the start of the current week (Monday, ISO 8601)
 */
export function getStartOfCurrentWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // If Sunday (0), go back 6 days; else go to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get the end of the current week (Sunday, ISO 8601)
 */
export function getEndOfCurrentWeek(): Date {
  const monday = getStartOfCurrentWeek();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Calculate the number of days between two dates (inclusive)
 * Example: Jan 1 to Jan 3 = 3 days
 */
export function getDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const startDay = getStartOfDate(start);
  const endDay = getStartOfDate(end);

  const diffTime = endDay.getTime() - startDay.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1; // +1 to make it inclusive
}

/**
 * Calculate days passed in a timeline (from startDate to today)
 * Returns 0 if timeline hasn't started yet
 * Note: Today is counted as "passed" once it starts (at 00:00)
 */
export function getDaysPassed(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const today = getStartOfToday();

  // Timeline hasn't started yet
  if (today < start) {
    return 0;
  }

  // Timeline has ended, return total days
  if (today > end) {
    return getDaysBetween(start, end);
  }

  // Timeline is active, return days from start to today (inclusive)
  return getDaysBetween(start, today);
}

/**
 * Calculate days remaining in a timeline (from tomorrow to endDate)
 * Returns 0 if timeline has ended
 * Note: Today is NOT counted in "remaining" since it's already in "passed"
 */
export function getDaysRemaining(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const today = getStartOfToday();

  // Timeline hasn't started yet, return total days
  if (today < start) {
    return getDaysBetween(start, end);
  }

  // Timeline has ended
  if (today > end) {
    return 0;
  }

  // Timeline is active
  // Calculate tomorrow (to exclude today from remaining)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // If today is the last day, return 0
  if (tomorrow > end) {
    return 0;
  }

  // Return days from tomorrow to end (excluding today)
  return getDaysBetween(tomorrow, end);
}

/**
 * Calculate total days in a timeline (inclusive)
 */
export function getTotalDays(startDate: Date | string, endDate: Date | string): number {
  return getDaysBetween(startDate, endDate);
}

/**
 * Calculate progress percentage (0-100)
 */
export function getProgressPercentage(startDate: Date | string, endDate: Date | string): number {
  const total = getTotalDays(startDate, endDate);
  const passed = getDaysPassed(startDate, endDate);

  if (total === 0) return 0;

  const percentage = (passed / total) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage)));
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = getStartOfToday();
  return getStartOfDate(d).getTime() === today.getTime();
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = getStartOfToday();
  return getStartOfDate(d) < today;
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = getStartOfToday();
  return getStartOfDate(d) > today;
}

/**
 * Format a date as ISO 8601 string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Get the current date as ISO 8601 string
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Format a number with ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) return `${num}st`;
  if (j === 2 && k !== 12) return `${num}nd`;
  if (j === 3 && k !== 13) return `${num}rd`;
  return `${num}th`;
}

/**
 * Get a human-readable date string
 * Examples: "January 1, 2026", "March 15, 2025"
 */
export function formatLongDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get a short date string
 * Examples: "Jan 1, 2026", "Mar 15, 2025"
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
