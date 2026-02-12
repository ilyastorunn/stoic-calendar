/**
 * Unlimited Timelines Preview
 * Shows 3 stacked timeline cards with different timelines
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PREVIEW_COLORS, widgetCardStyle } from './shared-styles';

/**
 * Static timeline data for preview
 */
const PREVIEW_TIMELINES = [
  {
    title: 'This Week',
    daysPassed: 5,
    totalDays: 7,
  },
  {
    title: 'Q1 2026',
    daysPassed: 31,
    totalDays: 90,
  },
  {
    title: '2026',
    daysPassed: 31,
    totalDays: 365,
  },
];

/**
 * Mini grid for timeline card
 */
const MiniGrid = memo(function MiniGrid({
  daysPassed,
  totalDays,
}: {
  daysPassed: number;
  totalDays: number;
}) {
  const dots = useMemo(() => {
    // Show a subset of dots for compact display
    const maxDots = 21;
    const displayTotal = Math.min(totalDays, maxDots);
    const filledRatio = daysPassed / totalDays;
    const displayFilled = Math.round(displayTotal * filledRatio);

    return Array.from({ length: displayTotal }, (_, i) => ({
      key: i,
      isFilled: i < displayFilled,
    }));
  }, [daysPassed, totalDays]);

  return (
    <View style={styles.miniGridContainer}>
      {dots.map((dot) => (
        <View
          key={dot.key}
          style={[
            styles.miniGridDot,
            {
              backgroundColor: dot.isFilled ? PREVIEW_COLORS.filled : PREVIEW_COLORS.empty,
            },
          ]}
        />
      ))}
    </View>
  );
});

/**
 * Single timeline card
 */
const TimelineCard = memo(function TimelineCard({
  title,
  daysPassed,
  totalDays,
  style,
}: {
  title: string;
  daysPassed: number;
  totalDays: number;
  style?: object;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardStats}>{daysPassed} of {totalDays}</Text>
      </View>
      <MiniGrid daysPassed={daysPassed} totalDays={totalDays} />
    </View>
  );
});

export const TimelinesPreview: React.FC = memo(function TimelinesPreview() {
  return (
    <View style={styles.container}>
      <View style={styles.stackContainer}>
        {/* Back card (least visible) */}
        <TimelineCard
          title={PREVIEW_TIMELINES[0].title}
          daysPassed={PREVIEW_TIMELINES[0].daysPassed}
          totalDays={PREVIEW_TIMELINES[0].totalDays}
          style={styles.cardBack}
        />

        {/* Middle card */}
        <TimelineCard
          title={PREVIEW_TIMELINES[1].title}
          daysPassed={PREVIEW_TIMELINES[1].daysPassed}
          totalDays={PREVIEW_TIMELINES[1].totalDays}
          style={styles.cardMiddle}
        />

        {/* Front card (most visible) */}
        <TimelineCard
          title={PREVIEW_TIMELINES[2].title}
          daysPassed={PREVIEW_TIMELINES[2].daysPassed}
          totalDays={PREVIEW_TIMELINES[2].totalDays}
          style={styles.cardFront}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  stackContainer: {
    width: 260,
    height: 200,
    position: 'relative',
  },

  // Card base style
  card: {
    ...widgetCardStyle,
    position: 'absolute',
    width: 220,
    height: 80,
    padding: 14,
  },

  // Stacked positions
  cardBack: {
    top: 0,
    left: 40,
    opacity: 0.4,
    transform: [{ scale: 0.92 }],
  },

  cardMiddle: {
    top: 50,
    left: 20,
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  cardFront: {
    top: 100,
    left: 0,
    opacity: 1,
  },

  // Card content
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  cardTitle: {
    color: PREVIEW_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },

  cardStats: {
    color: PREVIEW_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '400',
  },

  // Mini grid (matches home page spacing ratio: 8px dot × 0.25 = 2px gap)
  miniGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },

  miniGridDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
