/**
 * Timeline Calculator Service
 * Business logic for creating and calculating timeline properties
 */

import { Timeline, TimelineType } from '@/types/timeline';
import {
  getStartOfCurrentYear,
  getEndOfCurrentYear,
  getStartOfCurrentMonth,
  getEndOfCurrentMonth,
  getStartOfCurrentWeek,
  getEndOfCurrentWeek,
  getStartOfYear,
  getEndOfYear,
  getStartOfMonth,
  getEndOfMonth,
  getDaysPassed,
  getDaysRemaining,
  getTotalDays,
  getProgressPercentage,
  toISOString,
  nowISO,
} from '@/utils/date-helpers';

/**
 * Timeline Configuration
 * Used when creating a new timeline from a type
 */
export interface TimelineConfig {
  startDate: string;
  endDate: string;
  title: string;
}

/**
 * Timeline Stats
 * Calculated properties for a timeline
 */
export interface TimelineStats {
  daysPassed: number;
  daysRemaining: number;
  totalDays: number;
  progressPercentage: number;
}

// ============================================================================
// Timeline Creation
// ============================================================================

/**
 * Generate timeline configuration from a timeline type
 *
 * @param type - Timeline type (YEAR, MONTH, WEEK, CUSTOM)
 * @param customOptions - Optional custom date range (required for CUSTOM type)
 * @returns Timeline configuration with start/end dates and title
 */
export function calculateTimelineFromType(
  type: TimelineType,
  customOptions?: {
    year?: number;
    month?: number;
    startDate?: Date;
    endDate?: Date;
    title?: string;
  }
): TimelineConfig {
  switch (type) {
    case TimelineType.YEAR: {
      // Use custom year if provided, otherwise current year
      const year = customOptions?.year ?? new Date().getFullYear();
      const startDate = getStartOfYear(year);
      const endDate = getEndOfYear(year);

      return {
        startDate: toISOString(startDate),
        endDate: toISOString(endDate),
        title: year.toString(),
      };
    }

    case TimelineType.MONTH: {
      // Use custom month/year if provided, otherwise current month
      const now = new Date();
      const year = customOptions?.year ?? now.getFullYear();
      const month = customOptions?.month ?? now.getMonth();

      const startDate = getStartOfMonth(year, month);
      const endDate = getEndOfMonth(year, month);

      const monthName = startDate.toLocaleDateString('en-US', { month: 'long' });
      const title = `${monthName} ${year}`;

      return {
        startDate: toISOString(startDate),
        endDate: toISOString(endDate),
        title,
      };
    }

    case TimelineType.WEEK: {
      // Always current week (auto-updates)
      const startDate = getStartOfCurrentWeek();
      const endDate = getEndOfCurrentWeek();

      return {
        startDate: toISOString(startDate),
        endDate: toISOString(endDate),
        title: 'This Week',
      };
    }

    case TimelineType.CUSTOM: {
      // Custom date range - requires customOptions
      if (!customOptions?.startDate || !customOptions?.endDate) {
        throw new Error('Custom timeline requires startDate and endDate');
      }

      return {
        startDate: toISOString(customOptions.startDate),
        endDate: toISOString(customOptions.endDate),
        title: customOptions.title || 'Custom Timeline',
      };
    }

    default:
      throw new Error(`Unknown timeline type: ${type}`);
  }
}

/**
 * Create a new timeline object (ready to be saved)
 *
 * @param type - Timeline type
 * @param customOptions - Optional custom configuration
 * @returns Complete Timeline object
 */
export function createTimeline(
  type: TimelineType,
  customOptions?: {
    year?: number;
    month?: number;
    startDate?: Date;
    endDate?: Date;
    title?: string;
    isActive?: boolean;
  }
): Timeline {
  const config = calculateTimelineFromType(type, customOptions);

  // Generate a simple unique ID (timestamp + random)
  const id = `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    type,
    title: config.title,
    startDate: config.startDate,
    endDate: config.endDate,
    createdAt: nowISO(),
    isActive: customOptions?.isActive ?? false,
  };
}

// ============================================================================
// Timeline Calculations
// ============================================================================

/**
 * Calculate statistics for a timeline
 *
 * @param timeline - Timeline to calculate stats for
 * @returns Timeline statistics
 */
export function calculateTimelineStats(timeline: Timeline): TimelineStats {
  const daysPassed = getDaysPassed(timeline.startDate, timeline.endDate);
  const daysRemaining = getDaysRemaining(timeline.startDate, timeline.endDate);
  const totalDays = getTotalDays(timeline.startDate, timeline.endDate);
  const progressPercentage = getProgressPercentage(timeline.startDate, timeline.endDate);

  return {
    daysPassed,
    daysRemaining,
    totalDays,
    progressPercentage,
  };
}

/**
 * Get days passed for a timeline
 */
export function getTimelineDaysPassed(timeline: Timeline): number {
  return getDaysPassed(timeline.startDate, timeline.endDate);
}

/**
 * Get days remaining for a timeline
 */
export function getTimelineDaysRemaining(timeline: Timeline): number {
  return getDaysRemaining(timeline.startDate, timeline.endDate);
}

/**
 * Get total days for a timeline
 */
export function getTimelineTotalDays(timeline: Timeline): number {
  return getTotalDays(timeline.startDate, timeline.endDate);
}

/**
 * Get progress percentage for a timeline (0-100)
 */
export function getTimelineProgressPercentage(timeline: Timeline): number {
  return getProgressPercentage(timeline.startDate, timeline.endDate);
}

// ============================================================================
// Timeline Updates
// ============================================================================

/**
 * Update a "This Week" timeline to the current week
 * Should be called when the app detects a week change
 *
 * @param timeline - Week timeline to update
 * @returns Updated timeline with new dates
 */
export function updateWeekTimeline(timeline: Timeline): Timeline {
  if (timeline.type !== TimelineType.WEEK) {
    throw new Error('Can only update WEEK timelines');
  }

  const config = calculateTimelineFromType(TimelineType.WEEK);

  return {
    ...timeline,
    startDate: config.startDate,
    endDate: config.endDate,
    title: 'This Week',
  };
}

/**
 * Check if a week timeline needs to be updated
 * Returns true if the timeline's week is not the current week
 *
 * @param timeline - Week timeline to check
 * @returns True if update is needed
 */
export function weekTimelineNeedsUpdate(timeline: Timeline): boolean {
  if (timeline.type !== TimelineType.WEEK) {
    return false;
  }

  const currentWeekStart = getStartOfCurrentWeek();
  const timelineWeekStart = new Date(timeline.startDate);

  // Compare week start dates
  return currentWeekStart.getTime() !== timelineWeekStart.getTime();
}

// ============================================================================
// Timeline Validation
// ============================================================================

/**
 * Validate a timeline object
 * Checks for required fields and valid dates
 *
 * @param timeline - Timeline to validate
 * @returns True if valid, throws error if invalid
 */
export function validateTimeline(timeline: Partial<Timeline>): boolean {
  if (!timeline.id) {
    throw new Error('Timeline must have an ID');
  }

  if (!timeline.type || !Object.values(TimelineType).includes(timeline.type)) {
    throw new Error('Timeline must have a valid type');
  }

  if (!timeline.title) {
    throw new Error('Timeline must have a title');
  }

  if (!timeline.startDate || !timeline.endDate) {
    throw new Error('Timeline must have start and end dates');
  }

  const startDate = new Date(timeline.startDate);
  const endDate = new Date(timeline.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Timeline dates must be valid');
  }

  if (startDate > endDate) {
    throw new Error('Timeline start date must be before end date');
  }

  if (!timeline.createdAt) {
    throw new Error('Timeline must have a creation date');
  }

  return true;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a human-readable description of a timeline
 * Examples: "Year · 1%", "Week · 100%", "Custom · 50%"
 *
 * @param timeline - Timeline to describe
 * @returns Description string
 */
export function getTimelineDescription(timeline: Timeline): string {
  const stats = calculateTimelineStats(timeline);

  const typeLabel =
    timeline.type === TimelineType.YEAR
      ? 'Year'
      : timeline.type === TimelineType.MONTH
        ? 'Month'
        : timeline.type === TimelineType.WEEK
          ? 'Week'
          : 'Custom';

  return `${typeLabel} · ${stats.progressPercentage}%`;
}

/**
 * Get a human-readable progress string
 * Examples: "3 of 365 days", "7 of 7 days"
 *
 * @param timeline - Timeline to describe
 * @returns Progress string
 */
export function getTimelineProgress(timeline: Timeline): string {
  const stats = calculateTimelineStats(timeline);
  return `${stats.daysPassed} of ${stats.totalDays} days`;
}

/**
 * Get a human-readable remaining string
 * Examples: "362 days remaining", "0 days remaining"
 *
 * @param timeline - Timeline to describe
 * @returns Remaining string
 */
export function getTimelineRemaining(timeline: Timeline): string {
  const stats = calculateTimelineStats(timeline);
  const days = stats.daysRemaining;
  return `${days} day${days === 1 ? '' : 's'} remaining`;
}

/**
 * Sort timelines by creation date (newest first)
 */
export function sortTimelinesByDate(timelines: Timeline[]): Timeline[] {
  return [...timelines].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Sort timelines with active timeline first
 */
export function sortTimelinesWithActiveFirst(timelines: Timeline[]): Timeline[] {
  return [...timelines].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
