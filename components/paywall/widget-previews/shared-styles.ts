/**
 * Shared styles and constants for widget previews
 */

import { StyleSheet } from 'react-native';
import { BorderRadius } from '@/constants/theme';

/**
 * Preview color scheme (dark mode only for paywall)
 */
export const PREVIEW_COLORS = {
  filled: '#007AFF',        // Classic blue
  empty: '#333333',         // Dark gray for empty dots
  background: '#1C1C1E',    // Widget background
  surface: '#000000',       // Device frame background
  text: '#FFFFFF',          // Primary text
  textSecondary: '#8E8E93', // Secondary text
  textTertiary: '#48484A',  // Tertiary text
};

/**
 * Widget card styling (iOS widget appearance)
 */
export const widgetCardStyle = {
  backgroundColor: PREVIEW_COLORS.background,
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 8,
};

/**
 * Common preview styles
 */
export const sharedStyles = StyleSheet.create({
  // Widget containers
  widgetCard: {
    ...widgetCardStyle,
    padding: 14,
  },

  widgetCardSmall: {
    ...widgetCardStyle,
    width: 155,
    height: 155,
    padding: 12,
  },

  widgetCardMedium: {
    ...widgetCardStyle,
    padding: 14,
  },

  widgetCardLarge: {
    ...widgetCardStyle,
    padding: 16,
  },

  // Grid rendering
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  gridDot: {
    borderRadius: BorderRadius.small / 2,
  },

  // Text styles
  titleText: {
    color: PREVIEW_COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },

  percentageText: {
    color: PREVIEW_COLORS.text,
    fontSize: 28,
    fontWeight: '700',
  },

  percentageTextSmall: {
    color: PREVIEW_COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },

  daysText: {
    color: PREVIEW_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '400',
  },

  subtitleText: {
    color: PREVIEW_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '400',
  },
});

/**
 * Calculate grid dimensions for preview
 *
 * Note: Spacing should match home page ratio (0.25) for consistency
 * Example: For 8px dots, use 2px spacing (8 × 0.25 = 2)
 */
export function calculatePreviewGrid(
  totalDays: number,
  containerWidth: number,
  dotSize: number,
  spacing: number
): { columns: number; rows: number } {
  const columns = Math.floor((containerWidth + spacing) / (dotSize + spacing));
  const rows = Math.ceil(totalDays / columns);
  return { columns, rows };
}
