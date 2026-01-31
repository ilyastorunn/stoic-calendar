/**
 * Lock Screen Widget Preview
 * Shows a device frame with lock screen widgets
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { PREVIEW_COLORS } from './shared-styles';

interface LockScreenPreviewProps {
  percentage: number;
  daysRemaining: number;
  totalDays: number;
  title: string;
}

/**
 * Circular progress widget for lock screen
 */
const CircularWidget = memo(function CircularWidget({ percentage }: { percentage: number }) {
  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <View style={styles.circularWidget}>
      <Svg width={size} height={size} style={styles.circularSvg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={PREVIEW_COLORS.empty}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={PREVIEW_COLORS.filled}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.circularPercentage}>{percentage}%</Text>
    </View>
  );
});

/**
 * Rectangular progress widget for lock screen
 */
const RectangularWidget = memo(function RectangularWidget({
  percentage,
  daysRemaining,
  title,
}: {
  percentage: number;
  daysRemaining: number;
  title: string;
}) {
  return (
    <View style={styles.rectangularWidget}>
      <Text style={styles.rectangularTitle}>{title}</Text>
      <View style={styles.rectangularStats}>
        <Text style={styles.rectangularPercentage}>{percentage}%</Text>
        <Text style={styles.rectangularDays}>{daysRemaining}d left</Text>
      </View>
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
});

export const LockScreenPreview: React.FC<LockScreenPreviewProps> = memo(function LockScreenPreview({
  percentage,
  daysRemaining,
  title,
}) {
  return (
    <View style={styles.container}>
      {/* Device frame (top portion only) */}
      <View style={styles.deviceFrame}>
        {/* Dynamic Island */}
        <View style={styles.dynamicIsland} />

        {/* Time and Date */}
        <View style={styles.lockScreenHeader}>
          <Text style={styles.timeText}>9:41</Text>
          <Text style={styles.dateText}>Friday, January 31</Text>
        </View>

        {/* Widget row */}
        <View style={styles.widgetRow}>
          <CircularWidget percentage={percentage} />
          <RectangularWidget
            percentage={percentage}
            daysRemaining={daysRemaining}
            title={title}
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Device frame
  deviceFrame: {
    width: 280,
    height: 220,
    backgroundColor: PREVIEW_COLORS.surface,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: PREVIEW_COLORS.background,
    paddingTop: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },

  // Dynamic Island
  dynamicIsland: {
    width: 100,
    height: 28,
    backgroundColor: '#000000',
    borderRadius: 20,
    marginBottom: 16,
  },

  // Lock screen header
  lockScreenHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },

  timeText: {
    color: PREVIEW_COLORS.text,
    fontSize: 48,
    fontWeight: '200',
    letterSpacing: -1,
    lineHeight: 52,
  },

  dateText: {
    color: PREVIEW_COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
    marginTop: 2,
  },

  // Widget row
  widgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },

  // Circular widget
  circularWidget: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },

  circularSvg: {
    position: 'absolute',
  },

  circularPercentage: {
    color: PREVIEW_COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },

  // Rectangular widget
  rectangularWidget: {
    width: 140,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
  },

  rectangularTitle: {
    color: PREVIEW_COLORS.text,
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.9,
  },

  rectangularStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },

  rectangularPercentage: {
    color: PREVIEW_COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  rectangularDays: {
    color: PREVIEW_COLORS.text,
    fontSize: 10,
    fontWeight: '400',
    opacity: 0.7,
  },

  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: PREVIEW_COLORS.filled,
    borderRadius: 2,
  },
});
