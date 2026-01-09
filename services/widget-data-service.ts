/**
 * Widget Data Service
 *
 * Exports timeline data to iOS App Groups for widget consumption.
 * Widgets read from the shared container to display timeline progress.
 */

import { Platform } from 'react-native';
import { Timeline, AppSettings } from '@/types/timeline';
import { calculateTimelineStats } from '@/services/timeline-calculator';
import { loadTimelines, getActiveTimelineId, loadSettings } from '@/services/storage';
import { setSharedData, removeSharedData } from '@/modules/app-groups';

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
 * Check if widget sync is available (requires development build)
 */
function isWidgetSyncAvailable(): boolean {
  if (Platform.OS !== 'ios') return false;

  // Check if running in Expo Go by detecting __DEV__ and lack of native module
  try {
    const { setSharedData: testModule } = require('@/modules/app-groups');
    return testModule !== undefined;
  } catch {
    return false;
  }
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
  if (!isWidgetSyncAvailable()) {
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

    // Write to App Groups
    await setSharedData(
      APP_GROUP_ID,
      WIDGET_DATA_KEYS.ACTIVE_TIMELINE,
      JSON.stringify(widgetData)
    );

    // Update last sync timestamp
    await setSharedData(
      APP_GROUP_ID,
      WIDGET_DATA_KEYS.LAST_UPDATE,
      new Date().toISOString()
    );

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
  if (!isWidgetSyncAvailable()) {
    return;
  }

  try {
    const settings = await loadSettings();

    const widgetSettings: WidgetSettingsData = {
      gridColorTheme: settings.gridColorTheme,
      themeMode: settings.themeMode,
    };

    await setSharedData(
      APP_GROUP_ID,
      WIDGET_DATA_KEYS.SETTINGS,
      JSON.stringify(widgetSettings)
    );

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
  try {
    await removeSharedData(APP_GROUP_ID, WIDGET_DATA_KEYS.ACTIVE_TIMELINE);
    await removeSharedData(APP_GROUP_ID, WIDGET_DATA_KEYS.LAST_UPDATE);
  } catch (error) {
    console.error('❌ Error clearing widget data:', error);
  }
}

/**
 * Sync all widget data (timeline + settings)
 * Convenience function for initial app setup
 */
export async function syncAllWidgetData(): Promise<void> {
  await syncActiveTimelineToWidget();
  await syncSettingsToWidget();
}
