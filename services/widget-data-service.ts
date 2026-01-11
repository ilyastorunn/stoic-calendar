/**
 * Widget Data Service
 *
 * Exports timeline data to iOS App Groups for widget consumption.
 * Widgets read from the shared container to display timeline progress.
 *
 * Uses ExtensionStorage from @bacons/apple-targets which is already
 * properly integrated with Expo autolinking.
 */

import { Platform } from 'react-native';
import { Timeline } from '@/types/timeline';
import { calculateTimelineStats } from '@/services/timeline-calculator';
import { loadTimelines, getActiveTimelineId, loadSettings } from '@/services/storage';

/**
 * App Group identifier - must match app.json entitlements
 */
const APP_GROUP_ID = 'group.com.stoiccalendar.shared';

/**
 * Widget data keys in shared container
 */
const WIDGET_DATA_KEYS = {
  ACTIVE_TIMELINE: 'widget_active_timeline',
  SETTINGS: 'widget_settings',
  LAST_UPDATE: 'widget_last_update',
} as const;

/**
 * Widget-optimized timeline data
 * Serialized to JSON and stored in App Groups
 */
export interface WidgetTimelineData {
  id: string;
  type: string;
  title: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  daysPassed: number;
  daysRemaining: number;
  totalDays: number;
  progressPercentage: number; // 0-100
}

/**
 * Widget settings data
 * Serialized to JSON and stored in App Groups
 */
export interface WidgetSettingsData {
  gridColorTheme: string; // 'classic' | 'forest' | 'sunset' | 'monochrome'
  themeMode: string; // 'system' | 'light' | 'dark'
}

/**
 * ExtensionStorage instance - lazy loaded
 */
let extensionStorage: any = null;

/**
 * Get or create ExtensionStorage instance
 */
function getExtensionStorage() {
  if (Platform.OS !== 'ios') return null;

  if (!extensionStorage) {
    try {
      const { ExtensionStorage } = require('@bacons/apple-targets');
      extensionStorage = new ExtensionStorage(APP_GROUP_ID);
    } catch (e) {
      console.warn('ExtensionStorage not available:', e);
      return null;
    }
  }
  return extensionStorage;
}

/**
 * Check if widget sync is available (requires development build)
 */
function isWidgetSyncAvailable(): boolean {
  return getExtensionStorage() !== null;
}

/**
 * Export active timeline data to App Groups for widgets
 *
 * This function should be called:
 * - On app launch
 * - When active timeline changes
 * - When timeline is updated (e.g., week timeline refresh)
 *
 * NOTE: Widget sync requires a development build and will not work in Expo Go.
 */
export async function syncActiveTimelineToWidget(): Promise<void> {
  const storage = getExtensionStorage();
  if (!storage) {
    return;
  }

  try {
    const activeId = await getActiveTimelineId();

    if (!activeId) {
      // No active timeline - clear widget data
      await clearWidgetData();
      console.log('✅ Widget data cleared (no active timeline)');
      return;
    }

    const timelines = await loadTimelines();
    const activeTimeline = timelines.find((t) => t.id === activeId);

    if (!activeTimeline) {
      // Active timeline not found - clear widget data
      await clearWidgetData();
      console.log('⚠️ Active timeline not found, widget data cleared');
      return;
    }

    // Calculate timeline stats
    const stats = calculateTimelineStats(activeTimeline);

    // Create widget-optimized data structure
    const widgetData: WidgetTimelineData = {
      id: activeTimeline.id,
      type: activeTimeline.type,
      title: activeTimeline.title,
      startDate: activeTimeline.startDate,
      endDate: activeTimeline.endDate,
      daysPassed: stats.daysPassed,
      daysRemaining: stats.daysRemaining,
      totalDays: stats.totalDays,
      progressPercentage: stats.progressPercentage,
    };

    // Write to App Groups using ExtensionStorage
    storage.set(WIDGET_DATA_KEYS.ACTIVE_TIMELINE, JSON.stringify(widgetData));
    storage.set(WIDGET_DATA_KEYS.LAST_UPDATE, new Date().toISOString());

    // Reload widgets to show updated data
    try {
      const { ExtensionStorage } = require('@bacons/apple-targets');
      ExtensionStorage.reloadWidget();
    } catch {
      // Ignore if reload not available
    }

    console.log('✅ Widget timeline data synced:', widgetData.title);
  } catch (error) {
    console.error('❌ Error syncing timeline to widget:', error);
  }
}

/**
 * Export settings to App Groups for widgets
 *
 * This function should be called:
 * - On app launch
 * - When theme mode changes
 * - When grid color theme changes
 *
 * NOTE: Widget sync requires a development build and will not work in Expo Go.
 */
export async function syncSettingsToWidget(): Promise<void> {
  const storage = getExtensionStorage();
  if (!storage) {
    return;
  }

  try {
    const settings = await loadSettings();

    const widgetSettings: WidgetSettingsData = {
      gridColorTheme: settings.gridColorTheme,
      themeMode: settings.themeMode,
    };

    storage.set(WIDGET_DATA_KEYS.SETTINGS, JSON.stringify(widgetSettings));

    console.log('✅ Widget settings synced:', widgetSettings.gridColorTheme, widgetSettings.themeMode);
  } catch (error) {
    console.error('❌ Error syncing settings to widget:', error);
  }
}

/**
 * Clear all widget data from App Groups
 * Called when there's no active timeline
 */
async function clearWidgetData(): Promise<void> {
  const storage = getExtensionStorage();
  if (!storage) return;

  try {
    storage.remove(WIDGET_DATA_KEYS.ACTIVE_TIMELINE);
    storage.remove(WIDGET_DATA_KEYS.LAST_UPDATE);
  } catch (error) {
    console.error('❌ Error clearing widget data:', error);
  }
}

/**
 * Get widget data from App Groups (for debugging)
 */
export function getWidgetData(): { timeline: string | null; settings: string | null; lastUpdate: string | null } {
  const storage = getExtensionStorage();
  if (!storage) {
    return { timeline: null, settings: null, lastUpdate: null };
  }

  return {
    timeline: storage.get(WIDGET_DATA_KEYS.ACTIVE_TIMELINE),
    settings: storage.get(WIDGET_DATA_KEYS.SETTINGS),
    lastUpdate: storage.get(WIDGET_DATA_KEYS.LAST_UPDATE),
  };
}

/**
 * Sync all widget data (timeline + settings)
 * Convenience function for initial app setup
 */
export async function syncAllWidgetData(): Promise<void> {
  await syncActiveTimelineToWidget();
  await syncSettingsToWidget();
}
