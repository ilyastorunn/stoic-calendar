/**
 * Debug Widget Sync Script
 *
 * This script helps diagnose widget data synchronization issues.
 * Run this from your app to verify that widget data is being written correctly.
 */

import { syncAllWidgetData, getWidgetData } from '@/services/widget-data-service';
import { loadTimelines, getActiveTimelineId, loadSettings } from '@/services/storage';

export async function debugWidgetSync() {
  console.log('\n=== 🔍 WIDGET SYNC DEBUG ===\n');

  // 1. Check storage data
  console.log('1️⃣ Checking AsyncStorage data:');
  const timelines = await loadTimelines();
  const activeId = await getActiveTimelineId();
  const settings = await loadSettings();

  console.log(`   ✓ Total timelines: ${timelines.length}`);
  console.log(`   ✓ Active timeline ID: ${activeId || 'NONE'}`);
  console.log(`   ✓ Settings: theme=${settings.themeMode}, color=${settings.gridColorTheme}`);

  if (activeId) {
    const activeTimeline = timelines.find(t => t.id === activeId);
    if (activeTimeline) {
      console.log(`   ✓ Active timeline: "${activeTimeline.title}" (${activeTimeline.type})`);
    } else {
      console.log(`   ⚠️ Active timeline not found in timelines array!`);
    }
  } else {
    console.log(`   ⚠️ No active timeline set!`);
  }

  // 2. Try to sync
  console.log('\n2️⃣ Attempting widget data sync:');
  try {
    await syncAllWidgetData();
    console.log('   ✓ Sync completed successfully');
  } catch (error) {
    console.log('   ❌ Sync failed:', error);
    return;
  }

  // 3. Verify widget data
  console.log('\n3️⃣ Verifying widget data in App Groups:');
  try {
    const widgetData = getWidgetData();

    if (widgetData.timeline) {
      console.log('   ✓ Timeline data found:');
      const parsed = JSON.parse(widgetData.timeline);
      console.log(`      - Title: ${parsed.title}`);
      console.log(`      - Type: ${parsed.type}`);
      console.log(`      - Progress: ${parsed.daysPassed}/${parsed.totalDays} (${parsed.progressPercentage}%)`);
    } else {
      console.log('   ❌ Timeline data NOT FOUND in App Groups!');
    }

    if (widgetData.settings) {
      console.log('   ✓ Settings data found:');
      const parsed = JSON.parse(widgetData.settings);
      console.log(`      - Theme: ${parsed.themeMode}`);
      console.log(`      - Color: ${parsed.gridColorTheme}`);
    } else {
      console.log('   ❌ Settings data NOT FOUND in App Groups!');
    }

    if (widgetData.lastUpdate) {
      console.log(`   ✓ Last update: ${widgetData.lastUpdate}`);
    } else {
      console.log('   ⚠️ Last update timestamp not found');
    }

  } catch (error) {
    console.log('   ❌ Error reading from App Groups:', error);
    console.log('   ℹ️  This is expected if running in Expo Go (requires development build)');
  }

  console.log('\n=== 🏁 DEBUG COMPLETE ===\n');

  // Return diagnostic summary
  return {
    hasTimelines: timelines.length > 0,
    hasActiveTimeline: !!activeId,
    syncAvailable: true, // If we got this far, module is available
  };
}
