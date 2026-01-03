/**
 * Timeline Type Enum
 * Defines the four timeline categories available in Stoic Calendar
 */
export enum TimelineType {
  YEAR = 'year',
  MONTH = 'month',
  WEEK = 'week',
  CUSTOM = 'custom',
}

/**
 * Widget Size Options
 * For future widget configuration (iOS WidgetKit integration)
 */
export type WidgetSize = 'small' | 'medium' | 'large';

/**
 * Widget Preferences
 * Reserved for future widget customization
 */
export interface WidgetPreferences {
  size?: WidgetSize;
  // Future: accentColor override, grid style options
}

/**
 * Timeline Interface
 * Core data model for all timeline types
 * Firebase-ready structure, stored locally in AsyncStorage for MVP
 */
export interface Timeline {
  /**
   * Unique identifier (UUID v4)
   */
  id: string;

  /**
   * Timeline type: year, month, week, or custom
   */
  type: TimelineType;

  /**
   * Display title
   * Examples: "2026", "This Week", "Project X"
   */
  title: string;

  /**
   * Start date (ISO 8601 format)
   * Examples: "2026-01-01T00:00:00.000Z"
   */
  startDate: string;

  /**
   * End date (ISO 8601 format)
   * Examples: "2026-12-31T23:59:59.999Z"
   */
  endDate: string;

  /**
   * Creation timestamp (ISO 8601 format)
   */
  createdAt: string;

  /**
   * Whether this timeline is currently displayed on the Home screen
   * Only one timeline should have isActive = true at a time
   */
  isActive: boolean;

  /**
   * Widget configuration (reserved for future iOS widget integration)
   */
  widgetPreferences?: WidgetPreferences;
}

/**
 * Theme Mode Options
 */
export type ThemeMode = 'system' | 'light' | 'dark';

/**
 * App Settings Interface
 * For storing user preferences in AsyncStorage
 */
export interface AppSettings {
  themeMode: ThemeMode;
  // Future: notification preferences, widget settings, etc.
}
