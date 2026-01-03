/**
 * Storage Service
 * AsyncStorage wrapper for Stoic Calendar data persistence
 *
 * Firebase-ready structure: all data is stored in a format that can be
 * easily migrated to Firestore in post-MVP
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timeline, AppSettings, ThemeMode } from '@/types/timeline';

/**
 * Storage Keys
 */
const STORAGE_KEYS = {
  TIMELINES: '@stoic_calendar:timelines',
  SETTINGS: '@stoic_calendar:settings',
  ACTIVE_TIMELINE_ID: '@stoic_calendar:active_timeline_id',
} as const;

/**
 * Default Settings
 */
const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'dark', // Dark mode by default (dark-mode-first)
};

// ============================================================================
// Timeline Operations
// ============================================================================

/**
 * Load all timelines from storage
 * @returns Array of timelines (empty array if none exist)
 */
export async function loadTimelines(): Promise<Timeline[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TIMELINES);
    if (!data) return [];

    const timelines: Timeline[] = JSON.parse(data);
    return timelines;
  } catch (error) {
    console.error('Error loading timelines:', error);
    return [];
  }
}

/**
 * Save a new timeline or update an existing one
 * @param timeline - Timeline to save
 */
export async function saveTimeline(timeline: Timeline): Promise<void> {
  try {
    const timelines = await loadTimelines();

    // Check if timeline already exists
    const existingIndex = timelines.findIndex((t) => t.id === timeline.id);

    if (existingIndex >= 0) {
      // Update existing timeline
      timelines[existingIndex] = timeline;
    } else {
      // Add new timeline
      timelines.push(timeline);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(timelines));
  } catch (error) {
    console.error('Error saving timeline:', error);
    throw error;
  }
}

/**
 * Delete a timeline by ID
 * @param id - Timeline ID to delete
 */
export async function deleteTimeline(id: string): Promise<void> {
  try {
    const timelines = await loadTimelines();
    const filtered = timelines.filter((t) => t.id !== id);

    await AsyncStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(filtered));

    // If the deleted timeline was active, clear active timeline
    const activeId = await getActiveTimelineId();
    if (activeId === id) {
      await clearActiveTimeline();
    }
  } catch (error) {
    console.error('Error deleting timeline:', error);
    throw error;
  }
}

/**
 * Get a timeline by ID
 * @param id - Timeline ID
 * @returns Timeline or null if not found
 */
export async function getTimelineById(id: string): Promise<Timeline | null> {
  try {
    const timelines = await loadTimelines();
    return timelines.find((t) => t.id === id) || null;
  } catch (error) {
    console.error('Error getting timeline by ID:', error);
    return null;
  }
}

/**
 * Clear all timelines (dangerous - use with caution)
 */
export async function clearAllTimelines(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TIMELINES);
    await clearActiveTimeline();
  } catch (error) {
    console.error('Error clearing all timelines:', error);
    throw error;
  }
}

// ============================================================================
// Active Timeline Operations
// ============================================================================

/**
 * Set a timeline as active (displayed on Home screen)
 * Also updates the isActive flag on all timelines
 *
 * @param id - Timeline ID to set as active
 */
export async function setActiveTimeline(id: string): Promise<void> {
  try {
    // Update active timeline ID
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TIMELINE_ID, id);

    // Update isActive flags on all timelines
    const timelines = await loadTimelines();
    const updated = timelines.map((t) => ({
      ...t,
      isActive: t.id === id,
    }));

    await AsyncStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(updated));
  } catch (error) {
    console.error('Error setting active timeline:', error);
    throw error;
  }
}

/**
 * Get the currently active timeline
 * @returns Active timeline or null if none is set
 */
export async function getActiveTimeline(): Promise<Timeline | null> {
  try {
    const activeId = await getActiveTimelineId();
    if (!activeId) return null;

    return await getTimelineById(activeId);
  } catch (error) {
    console.error('Error getting active timeline:', error);
    return null;
  }
}

/**
 * Get the active timeline ID
 * @returns Active timeline ID or null
 */
export async function getActiveTimelineId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_TIMELINE_ID);
  } catch (error) {
    console.error('Error getting active timeline ID:', error);
    return null;
  }
}

/**
 * Clear the active timeline
 */
export async function clearActiveTimeline(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMELINE_ID);

    // Update isActive flags on all timelines
    const timelines = await loadTimelines();
    const updated = timelines.map((t) => ({
      ...t,
      isActive: false,
    }));

    await AsyncStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(updated));
  } catch (error) {
    console.error('Error clearing active timeline:', error);
    throw error;
  }
}

// ============================================================================
// Settings Operations
// ============================================================================

/**
 * Load app settings
 * @returns App settings (defaults if none exist)
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;

    const settings: AppSettings = JSON.parse(data);
    return { ...DEFAULT_SETTINGS, ...settings }; // Merge with defaults
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save app settings
 * @param settings - Settings to save
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Update theme mode
 * @param mode - Theme mode to set
 */
export async function updateThemeMode(mode: ThemeMode): Promise<void> {
  try {
    const settings = await loadSettings();
    settings.themeMode = mode;
    await saveSettings(settings);
  } catch (error) {
    console.error('Error updating theme mode:', error);
    throw error;
  }
}

/**
 * Get current theme mode
 * @returns Current theme mode
 */
export async function getThemeMode(): Promise<ThemeMode> {
  try {
    const settings = await loadSettings();
    return settings.themeMode;
  } catch (error) {
    console.error('Error getting theme mode:', error);
    return 'dark'; // Default to dark
  }
}

// ============================================================================
// Utility Operations
// ============================================================================

/**
 * Clear all app data (dangerous - use with caution)
 * For testing/development purposes
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TIMELINES,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.ACTIVE_TIMELINE_ID,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

/**
 * Get all storage keys used by the app
 * For debugging purposes
 */
export async function getAllKeys(): Promise<string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter((key) => key.startsWith('@stoic_calendar:'));
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
}

/**
 * Export all data as JSON (for debugging or backup)
 */
export async function exportData(): Promise<string> {
  try {
    const timelines = await loadTimelines();
    const settings = await loadSettings();
    const activeId = await getActiveTimelineId();

    const data = {
      timelines,
      settings,
      activeTimelineId: activeId,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}
