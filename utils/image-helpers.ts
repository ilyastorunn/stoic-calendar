/**
 * Image Export Helpers
 * Utilities for generating timeline export images
 */

import { Timeline } from '@/types/timeline';
import { getDaysPassed, getDaysRemaining, getTotalDays, getProgressPercentage } from '@/utils/date-helpers';

/**
 * Export Canvas Dimensions
 * 9:16 portrait ratio optimized for social media
 */
export const EXPORT_CANVAS = {
  width: 1080,
  height: 1920,
  scale: 2, // 2x for high-resolution export
  gridHeightRatio: 0.70, // 70% of canvas for grid
  padding: 60,
  metadataSpacing: 40,
};

/**
 * Calculate grid area dimensions within export canvas
 */
export function getExportGridDimensions() {
  const gridHeight = EXPORT_CANVAS.height * EXPORT_CANVAS.gridHeightRatio;
  const gridWidth = EXPORT_CANVAS.width - EXPORT_CANVAS.padding * 2;

  return {
    width: gridWidth,
    height: gridHeight,
    x: EXPORT_CANVAS.padding,
    y: EXPORT_CANVAS.padding,
  };
}

/**
 * Calculate metadata card position (below grid)
 */
export function getExportMetadataPosition() {
  const gridDimensions = getExportGridDimensions();
  const metadataY = gridDimensions.y + gridDimensions.height + EXPORT_CANVAS.metadataSpacing;

  return {
    x: EXPORT_CANVAS.padding,
    y: metadataY,
    width: EXPORT_CANVAS.width - EXPORT_CANVAS.padding * 2,
  };
}

/**
 * Format date range for export metadata
 * Examples:
 * - "Jan 1 - Dec 31, 2026"
 * - "Jan 2026"
 * - "Jan 13 - Jan 19, 2026"
 */
export function formatDateRangeForExport(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const startYear = start.getFullYear();

  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();
  const endYear = end.getFullYear();

  // Same month and year
  if (startMonth === endMonth && startYear === endYear) {
    // Same day
    if (startDay === endDay) {
      return `${startMonth} ${startDay}, ${startYear}`;
    }
    // Different days in same month
    return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
  }

  // Different months, same year
  if (startYear === endYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }

  // Different years
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
}

/**
 * Format progress text for export metadata
 * Example: "234 of 365 days (64%)"
 */
export function formatProgressForExport(timeline: Timeline): string {
  const daysPassed = getDaysPassed(timeline.startDate, timeline.endDate);
  const totalDays = getTotalDays(timeline.startDate, timeline.endDate);
  const percentage = getProgressPercentage(timeline.startDate, timeline.endDate);

  return `${daysPassed} of ${totalDays} days (${percentage}%)`;
}

/**
 * Generate file name for exported image
 * Examples:
 * - "stoic-calendar-2026.png"
 * - "stoic-calendar-this-week.png"
 * - "stoic-calendar-project-x.png"
 */
export function generateExportFileName(timeline: Timeline): string {
  // Sanitize title: lowercase, replace spaces/special chars with hyphens
  const sanitized = timeline.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  return `stoic-calendar-${sanitized}.png`;
}

/**
 * Get background color for export canvas
 * Returns solid colors (no transparency) suitable for image export
 */
export function getExportBackgroundColor(colorScheme: 'light' | 'dark'): string {
  return colorScheme === 'dark' ? '#000000' : '#FFFFFF';
}

/**
 * Get text color for export canvas
 */
export function getExportTextColor(colorScheme: 'light' | 'dark'): string {
  return colorScheme === 'dark' ? '#FFFFFF' : '#000000';
}

/**
 * Get secondary text color for export canvas (dates, progress)
 */
export function getExportSecondaryTextColor(colorScheme: 'light' | 'dark'): string {
  return '#8E8E93'; // Same in both themes for consistency
}

/**
 * Get branding text
 */
export function getBrandingText(): string {
  return 'Made with Stoic Calendar';
}

/**
 * Calculate optimal font sizes for export based on canvas dimensions
 */
export const ExportFontSizes = {
  title: 48,
  dateRange: 32,
  progress: 28,
  branding: 24,
};
