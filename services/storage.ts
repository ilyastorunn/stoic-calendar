/**
 * Storage Service
 * AsyncStorage wrapper for Stoic Calendar data persistence
 *
 * Firebase-ready structure: all data is stored in a format that can be
 * easily migrated to Firestore in post-MVP
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timeline, AppSettings, ThemeMode, GridColorTheme } from '@/types/timeline';
import { updateTimelineIfNeeded } from '@/services/timeline-calculator';

// Lazy import to avoid require cycle with widget-data-service
const syncWidgetData = async (type: 'timeline' | 'settings') => {
  const { syncActiveTimelineToWidget, syncSettingsToWidget } = await import('@/services/widget-data-service');
  if (type === 'timeline') {
    await syncActiveTimelineToWidget();
  } else {
    await syncSettingsToWidget();
  }
};

/**
 * Storage Keys
 */
const STORAGE_KEYS = {
  TIMELINES: '@stoic_calendar:timelines',
  SETTINGS: '@stoic_calendar:settings',
  ACTIVE_TIMELINE_ID: '@stoic_calendar:active_timeline_id',
  FIRST_LAUNCH_PAYWALL_SHOWN: '@stoic_calendar:first_launch_paywall_shown',
  FIRST_OPEN_DATE: '@stoic_calendar:first_open_date',
  AB_VARIANT: '@stoic_calendar:ab_variant',
  PAYWALL_EXPERIMENT_VERSION: '@stoic_calendar:paywall_experiment_version',
  PAYWALL_FIRST_VALUE_SEEN: '@stoic_calendar:paywall_first_value_seen',
  PAYWALL_SOFT_UPSELL_SHOWN: '@stoic_calendar:paywall_soft_upsell_shown',
} as const;

const PAYWALL_EXPERIMENT_VERSION = '2';

/**
 * Default Settings
 */
const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'dark', // Dark mode by default (dark-mode-first)
  gridColorTheme: 'classic', // Classic Blue by default
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

    let hasUpdates = false;
    const normalizedTimelines = timelines.map((timeline) => {
      const { timeline: updatedTimeline, wasUpdated } = updateTimelineIfNeeded(timeline);
      if (wasUpdated) {
        hasUpdates = true;
      }
      return updatedTimeline;
    });

    if (hasUpdates) {
      await AsyncStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(normalizedTimelines));
    }

    return normalizedTimelines;
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

    // Sync to widgets (non-fatal)
    try {
      await syncWidgetData('timeline');
    } catch (widgetError) {
      console.warn('Widget sync failed (non-fatal):', widgetError);
    }
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

    // Sync to widgets (non-fatal)
    try {
      await syncWidgetData('settings');
    } catch (widgetError) {
      console.warn('Widget sync failed (non-fatal):', widgetError);
    }
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

/**
 * Update grid color theme
 * @param theme - Grid color theme to set
 */
export async function updateGridColorTheme(theme: GridColorTheme): Promise<void> {
  try {
    const settings = await loadSettings();
    settings.gridColorTheme = theme;
    await saveSettings(settings);
  } catch (error) {
    console.error('Error updating grid color theme:', error);
    throw error;
  }
}

/**
 * Get current grid color theme
 * @returns Current grid color theme
 */
export async function getGridColorTheme(): Promise<GridColorTheme> {
  try {
    const settings = await loadSettings();
    return settings.gridColorTheme;
  } catch (error) {
    console.error('Error getting grid color theme:', error);
    return 'classic'; // Default to classic
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
      STORAGE_KEYS.FIRST_LAUNCH_PAYWALL_SHOWN,
      STORAGE_KEYS.FIRST_OPEN_DATE,
      STORAGE_KEYS.AB_VARIANT,
      STORAGE_KEYS.PAYWALL_EXPERIMENT_VERSION,
      STORAGE_KEYS.PAYWALL_FIRST_VALUE_SEEN,
      STORAGE_KEYS.PAYWALL_SOFT_UPSELL_SHOWN,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

/**
 * Migrate persisted paywall experiment state when the gating model changes.
 */
export async function migratePaywallExperimentState(): Promise<void> {
  try {
    const storedVersion = await AsyncStorage.getItem(STORAGE_KEYS.PAYWALL_EXPERIMENT_VERSION);

    if (storedVersion === PAYWALL_EXPERIMENT_VERSION) {
      return;
    }

    await AsyncStorage.multiRemove([
      STORAGE_KEYS.FIRST_LAUNCH_PAYWALL_SHOWN,
      STORAGE_KEYS.FIRST_OPEN_DATE,
      STORAGE_KEYS.AB_VARIANT,
      STORAGE_KEYS.PAYWALL_FIRST_VALUE_SEEN,
      STORAGE_KEYS.PAYWALL_SOFT_UPSELL_SHOWN,
    ]);
    await AsyncStorage.setItem(
      STORAGE_KEYS.PAYWALL_EXPERIMENT_VERSION,
      PAYWALL_EXPERIMENT_VERSION
    );
  } catch (error) {
    console.error('Error migrating paywall experiment state:', error);
  }
}

/**
 * Check whether first-launch paywall has already been shown.
 */
export async function hasShownFirstLaunchPaywall(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH_PAYWALL_SHOWN);
    return value === 'true';
  } catch (error) {
    console.error('Error reading first-launch paywall state:', error);
    return false;
  }
}

/**
 * Mark first-launch paywall as shown.
 */
export async function markFirstLaunchPaywallShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH_PAYWALL_SHOWN, 'true');
  } catch (error) {
    console.error('Error marking first-launch paywall as shown:', error);
    throw error;
  }
}

/**
 * Record the first time the app was opened (idempotent — only writes once).
 */
export async function recordFirstOpenDate(): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_OPEN_DATE);
    if (!existing) {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_OPEN_DATE, new Date().toISOString());
    }
  } catch (error) {
    console.error('Error recording first open date:', error);
  }
}

/**
 * Get the stored first-open date (ISO string), or null if not set.
 */
export async function getFirstOpenDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.FIRST_OPEN_DATE);
  } catch (error) {
    console.error('Error getting first open date:', error);
    return null;
  }
}

/**
 * Cache the RevenueCat A/B variant offering identifier.
 */
export async function cacheAbVariant(offeringId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AB_VARIANT, offeringId);
  } catch (error) {
    console.error('Error caching AB variant:', error);
  }
}

/**
 * Get the cached A/B variant offering identifier, or null if not yet fetched.
 */
export async function getCachedAbVariant(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AB_VARIANT);
  } catch (error) {
    console.error('Error getting cached AB variant:', error);
    return null;
  }
}

/**
 * Record that the user has seen the first-value moment for the paywall experiment.
 */
export async function markPaywallFirstValueSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PAYWALL_FIRST_VALUE_SEEN, 'true');
  } catch (error) {
    console.error('Error marking paywall first value seen:', error);
  }
}

/**
 * Whether the user has already seen the first-value moment.
 */
export async function hasSeenPaywallFirstValue(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.PAYWALL_FIRST_VALUE_SEEN);
    return value === 'true';
  } catch (error) {
    console.error('Error reading paywall first value state:', error);
    return false;
  }
}

/**
 * Record that the one-time soft upsell has been shown.
 */
export async function markSoftUpsellShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PAYWALL_SOFT_UPSELL_SHOWN, 'true');
  } catch (error) {
    console.error('Error marking soft upsell as shown:', error);
  }
}

/**
 * Whether the one-time soft upsell has already been shown.
 */
export async function hasShownSoftUpsell(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.PAYWALL_SOFT_UPSELL_SHOWN);
    return value === 'true';
  } catch (error) {
    console.error('Error reading soft upsell state:', error);
    return false;
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
    const firstLaunchPaywallShown = await hasShownFirstLaunchPaywall();

    const data = {
      timelines,
      settings,
      activeTimelineId: activeId,
      firstLaunchPaywallShown,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}
