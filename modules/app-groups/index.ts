/**
 * App Groups Module
 * Provides access to iOS App Groups for widget data sharing
 *
 * This module enables the React Native app to write timeline data
 * to a shared container that can be read by widget extensions.
 *
 * NOTE: This module requires a development build and will not work in Expo Go.
 */

import { Platform } from 'react-native';

/**
 * Native module for App Groups access
 * Only available on iOS with development build
 */
let AppGroupsModule: any = null;

if (Platform.OS === 'ios') {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    AppGroupsModule = requireNativeModule('AppGroups');
  } catch (error) {
    // Module not available (likely running in Expo Go)
    console.warn('⚠️ AppGroups module not available. Widgets require a development build.');
    AppGroupsModule = null;
  }
}

/**
 * Write data to App Groups shared container
 *
 * @param appGroupId - The App Group identifier (e.g., "group.com.stoiccalendar.shared")
 * @param key - Storage key for the data
 * @param value - JSON string to store
 * @returns Promise that resolves when data is written
 */
export async function setSharedData(
  appGroupId: string,
  key: string,
  value: string
): Promise<void> {
  if (!AppGroupsModule) {
    console.warn('AppGroups module not available on this platform');
    return;
  }

  try {
    await AppGroupsModule.setSharedData(appGroupId, key, value);
  } catch (error) {
    console.error('Error writing to App Groups:', error);
    throw error;
  }
}

/**
 * Read data from App Groups shared container
 *
 * @param appGroupId - The App Group identifier
 * @param key - Storage key to read
 * @returns Promise that resolves with the JSON string, or null if not found
 */
export async function getSharedData(
  appGroupId: string,
  key: string
): Promise<string | null> {
  if (!AppGroupsModule) {
    console.warn('AppGroups module not available on this platform');
    return null;
  }

  try {
    return await AppGroupsModule.getSharedData(appGroupId, key);
  } catch (error) {
    console.error('Error reading from App Groups:', error);
    throw error;
  }
}

/**
 * Remove data from App Groups shared container
 *
 * @param appGroupId - The App Group identifier
 * @param key - Storage key to remove
 * @returns Promise that resolves when data is removed
 */
export async function removeSharedData(
  appGroupId: string,
  key: string
): Promise<void> {
  if (!AppGroupsModule) {
    console.warn('AppGroups module not available on this platform');
    return;
  }

  try {
    await AppGroupsModule.removeSharedData(appGroupId, key);
  } catch (error) {
    console.error('Error removing from App Groups:', error);
    throw error;
  }
}
