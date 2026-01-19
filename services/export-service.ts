/**
 * Export Service
 * Handles timeline image generation and sharing
 */

import { RefObject } from 'react';
import { View, Share, Alert, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { Timeline, GridColorTheme } from '@/types/timeline';
import { generateExportFileName } from '@/utils/image-helpers';

/**
 * Export options
 */
export interface ExportOptions {
  format?: 'png' | 'jpg';
  quality?: number; // 0-1 for jpg
  scale?: number; // Default 2x
}

/**
 * Export result
 */
export interface ExportResult {
  success: boolean;
  uri?: string;
  error?: string;
}

/**
 * Capture timeline view as image
 * Uses react-native-view-shot to capture the export canvas
 */
export async function captureTimelineImage(
  viewRef: RefObject<View>,
  options: ExportOptions = {}
): Promise<ExportResult> {
  try {
    if (!viewRef.current) {
      return {
        success: false,
        error: 'Export canvas not ready',
      };
    }

    const { format = 'png', quality = 1.0, scale = 2 } = options;

    // Capture the view as image
    const uri = await captureRef(viewRef, {
      format,
      quality,
      result: 'tmpfile', // Save to temporary file
    });

    return {
      success: true,
      uri,
    };
  } catch (error) {
    console.error('Failed to capture timeline image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Share timeline image using native share sheet
 */
export async function shareTimelineImage(
  imageUri: string,
  timeline: Timeline
): Promise<boolean> {
  try {
    const fileName = generateExportFileName(timeline);

    // Share using native share sheet
    const result = await Share.share(
      {
        url: imageUri, // iOS
        message: Platform.OS === 'android' ? imageUri : undefined, // Android fallback
        title: timeline.title,
      },
      {
        dialogTitle: `Share ${timeline.title}`,
        subject: timeline.title, // Email subject
      }
    );

    // Check if user completed the share
    if (result.action === Share.sharedAction) {
      return true;
    } else if (result.action === Share.dismissedAction) {
      // User cancelled - this is not an error
      return false;
    }

    return false;
  } catch (error) {
    console.error('Failed to share timeline image:', error);
    Alert.alert(
      'Share Failed',
      'Unable to share the timeline image. Please try again.',
      [{ text: 'OK' }]
    );
    return false;
  }
}

/**
 * Clean up temporary image file
 */
export async function cleanupExportFile(uri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.error('Failed to cleanup export file:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Main export function - captures and shares timeline
 * This is the primary function used by the UI
 */
export async function exportAndShareTimeline(
  viewRef: RefObject<View>,
  timeline: Timeline,
  options: ExportOptions = {}
): Promise<boolean> {
  try {
    // Step 1: Capture image
    const captureResult = await captureTimelineImage(viewRef, options);

    if (!captureResult.success || !captureResult.uri) {
      Alert.alert(
        'Export Failed',
        captureResult.error || 'Unable to generate image. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // Step 2: Share image
    const shareSuccess = await shareTimelineImage(captureResult.uri, timeline);

    // Step 3: Cleanup (always attempt, even if share was cancelled)
    await cleanupExportFile(captureResult.uri);

    return shareSuccess;
  } catch (error) {
    console.error('Export and share failed:', error);
    Alert.alert(
      'Export Failed',
      'An unexpected error occurred. Please try again.',
      [{ text: 'OK' }]
    );
    return false;
  }
}

/**
 * Check if export is supported on current platform
 */
export function isExportSupported(): boolean {
  // Export is supported on iOS and Android, but not on web
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
