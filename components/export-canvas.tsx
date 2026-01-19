/**
 * Export Canvas Component
 * Renders timeline grid + metadata at high resolution for image export
 *
 * This component is hidden from view (opacity: 0, positioned off-screen)
 * and only used for capturing images via react-native-view-shot
 */

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Timeline, GridColorTheme } from '@/types/timeline';
import { StoicGrid } from '@/components/stoic-grid';
import {
  EXPORT_CANVAS,
  getExportGridDimensions,
  getExportMetadataPosition,
  formatDateRangeForExport,
  formatProgressForExport,
  getBrandingText,
  getExportBackgroundColor,
  getExportTextColor,
  getExportSecondaryTextColor,
  ExportFontSizes,
} from '@/utils/image-helpers';
import { Fonts } from '@/constants/theme';

export interface ExportCanvasProps {
  /**
   * Timeline to export
   */
  timeline: Timeline;

  /**
   * Grid color theme
   */
  gridColorTheme: GridColorTheme;

  /**
   * Whether the canvas is ready for capture
   * @default false
   */
  ready?: boolean;
}

/**
 * ExportCanvas Component
 * MUST be used with forwardRef to allow react-native-view-shot to capture it
 */
export const ExportCanvas = forwardRef<View, ExportCanvasProps>(
  ({ timeline, gridColorTheme, ready = false }, ref) => {
    const colorScheme = useColorScheme() ?? 'dark';

    // Get dimensions
    const gridDimensions = getExportGridDimensions();
    const metadataPosition = getExportMetadataPosition();

    // Get colors
    const backgroundColor = getExportBackgroundColor(colorScheme);
    const textColor = getExportTextColor(colorScheme);
    const secondaryTextColor = getExportSecondaryTextColor(colorScheme);

    // Format metadata
    const dateRange = formatDateRangeForExport(timeline.startDate, timeline.endDate);
    const progress = formatProgressForExport(timeline);
    const branding = getBrandingText();

    return (
      <View
        ref={ref}
        style={[
          styles.canvas,
          {
            width: EXPORT_CANVAS.width,
            height: EXPORT_CANVAS.height,
            backgroundColor,
            // Hide until ready to prevent flash
            opacity: ready ? 1 : 0,
          },
        ]}
        collapsable={false} // Required for react-native-view-shot
      >
        {/* Grid Area */}
        <View
          style={[
            styles.gridContainer,
            {
              left: gridDimensions.x,
              top: gridDimensions.y,
              width: gridDimensions.width,
              height: gridDimensions.height,
            },
          ]}
        >
          <StoicGrid
            timeline={timeline}
            animated={false}
            mini={false}
            exportMode={true}
            exportColorTheme={gridColorTheme}
          />
        </View>

        {/* Metadata Card */}
        <View
          style={[
            styles.metadataCard,
            {
              left: metadataPosition.x,
              top: metadataPosition.y,
              width: metadataPosition.width,
            },
          ]}
        >
          {/* Timeline Title */}
          <Text
            style={[
              styles.title,
              {
                color: textColor,
                fontSize: ExportFontSizes.title,
                fontFamily: Fonts.handwriting,
              },
            ]}
            numberOfLines={2}
          >
            {timeline.title}
          </Text>

          {/* Date Range */}
          <Text
            style={[
              styles.dateRange,
              {
                color: secondaryTextColor,
                fontSize: ExportFontSizes.dateRange,
                fontFamily: Fonts.sans,
              },
            ]}
          >
            {dateRange}
          </Text>

          {/* Progress */}
          <Text
            style={[
              styles.progress,
              {
                color: secondaryTextColor,
                fontSize: ExportFontSizes.progress,
                fontFamily: Fonts.sans,
              },
            ]}
          >
            {progress}
          </Text>

          {/* Branding */}
          <Text
            style={[
              styles.branding,
              {
                color: secondaryTextColor,
                fontSize: ExportFontSizes.branding,
                fontFamily: Fonts.sans,
              },
            ]}
          >
            {branding}
          </Text>
        </View>
      </View>
    );
  }
);

ExportCanvas.displayName = 'ExportCanvas';

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    // Position off-screen to the right (hidden from user)
    left: 10000,
    top: 0,
  },
  gridContainer: {
    position: 'absolute',
  },
  metadataCard: {
    position: 'absolute',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 56,
  },
  dateRange: {
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 40,
    marginTop: 8,
  },
  progress: {
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 36,
    marginTop: 4,
  },
  branding: {
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 32,
    marginTop: 24,
    opacity: 0.6,
  },
});
