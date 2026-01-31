/**
 * Small Home Screen Widgets Preview
 * Shows PercentageFill and Circular widgets side by side
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { PREVIEW_COLORS, widgetCardStyle } from './shared-styles';

interface SmallWidgetsPreviewProps {
  percentage: number;
  daysRemaining: number;
  totalDays: number;
  title: string;
}

/**
 * Percentage Fill Widget (background fills from bottom)
 */
const PercentageFillWidget = memo(function PercentageFillWidget({
  percentage,
  daysRemaining,
}: {
  percentage: number;
  daysRemaining: number;
}) {
  return (
    <View style={styles.fillWidget}>
      {/* Fill from bottom */}
      <View style={[styles.fillBackground, { height: `${percentage}%` }]} />

      {/* Content overlay */}
      <View style={styles.fillContent}>
        <Text style={styles.fillPercentage}>{percentage}%</Text>
        <Text style={styles.fillDays}>{daysRemaining}d left</Text>
      </View>
    </View>
  );
});

/**
 * Circular Progress Widget
 */
const CircularProgressWidget = memo(function CircularProgressWidget({
  percentage,
  daysPassed,
  totalDays,
  title,
}: {
  percentage: number;
  daysPassed: number;
  totalDays: number;
  title: string;
}) {
  const size = 70;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <View style={styles.circularWidget}>
      {/* Progress ring */}
      <View style={styles.circularRingContainer}>
        <Svg width={size} height={size}>
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

      {/* Title and stats */}
      <Text style={styles.circularTitle}>{title}</Text>
      <Text style={styles.circularStats}>{daysPassed} of {totalDays}</Text>
    </View>
  );
});

export const SmallWidgetsPreview: React.FC<SmallWidgetsPreviewProps> = memo(function SmallWidgetsPreview({
  percentage,
  daysRemaining,
  totalDays,
  title,
}) {
  const daysPassed = totalDays - daysRemaining;

  return (
    <View style={styles.container}>
      <PercentageFillWidget
        percentage={percentage}
        daysRemaining={daysRemaining}
      />
      <CircularProgressWidget
        percentage={percentage}
        daysPassed={daysPassed}
        totalDays={totalDays}
        title={title}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  // Percentage Fill Widget
  fillWidget: {
    ...widgetCardStyle,
    width: 130,
    height: 130,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },

  fillBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: PREVIEW_COLORS.filled,
    opacity: 0.85,
  },

  fillContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },

  fillPercentage: {
    color: PREVIEW_COLORS.text,
    fontSize: 32,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  fillDays: {
    color: PREVIEW_COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
    marginTop: 2,
  },

  // Circular Widget
  circularWidget: {
    ...widgetCardStyle,
    width: 130,
    height: 130,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circularRingContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },

  circularPercentage: {
    position: 'absolute',
    color: PREVIEW_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },

  circularTitle: {
    color: PREVIEW_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },

  circularStats: {
    color: PREVIEW_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
});
