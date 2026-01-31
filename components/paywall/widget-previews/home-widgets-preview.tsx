/**
 * Home Screen Widgets Preview
 * Shows Medium and Large grid widgets stacked
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PREVIEW_COLORS, widgetCardStyle } from './shared-styles';

interface HomeWidgetsPreviewProps {
  daysPassed: number;
  totalDays: number;
  title: string;
}

/**
 * Simple grid renderer for widget previews
 */
const MiniGrid = memo(function MiniGrid({
  daysPassed,
  totalDays,
  columns,
  dotSize,
  spacing,
  maxDots,
}: {
  daysPassed: number;
  totalDays: number;
  columns: number;
  dotSize: number;
  spacing: number;
  maxDots?: number;
}) {
  const dots = useMemo(() => {
    const total = maxDots ? Math.min(totalDays, maxDots) : totalDays;
    const filled = maxDots ? Math.min(daysPassed, maxDots) : daysPassed;

    return Array.from({ length: total }, (_, i) => ({
      key: i,
      isFilled: i < filled,
    }));
  }, [daysPassed, totalDays, maxDots]);

  const gridWidth = columns * dotSize + (columns - 1) * spacing;

  return (
    <View style={[styles.gridContainer, { width: gridWidth }]}>
      {dots.map((dot) => (
        <View
          key={dot.key}
          style={[
            styles.gridDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 4,
              backgroundColor: dot.isFilled ? PREVIEW_COLORS.filled : PREVIEW_COLORS.empty,
              marginRight: (dot.key + 1) % columns === 0 ? 0 : spacing,
              marginBottom: spacing,
            },
          ]}
        />
      ))}
    </View>
  );
});

/**
 * Medium Widget (horizontal layout)
 */
const MediumWidget = memo(function MediumWidget({
  daysPassed,
  totalDays,
  title,
}: {
  daysPassed: number;
  totalDays: number;
  title: string;
}) {
  const percentage = Math.round((daysPassed / totalDays) * 100);

  return (
    <View style={styles.mediumWidget}>
      {/* Left side: Title and stats */}
      <View style={styles.mediumLeft}>
        <Text style={styles.mediumTitle}>{title}</Text>
        <Text style={styles.mediumPercentage}>{percentage}%</Text>
        <Text style={styles.mediumStats}>{daysPassed} of {totalDays}</Text>
      </View>

      {/* Right side: Grid */}
      <View style={styles.mediumRight}>
        <MiniGrid
          daysPassed={daysPassed}
          totalDays={totalDays}
          columns={12}
          dotSize={6}
          spacing={2}
          maxDots={72}
        />
      </View>
    </View>
  );
});

/**
 * Large Widget (vertical layout)
 */
const LargeWidget = memo(function LargeWidget({
  daysPassed,
  totalDays,
  title,
}: {
  daysPassed: number;
  totalDays: number;
  title: string;
}) {
  return (
    <View style={styles.largeWidget}>
      {/* Title */}
      <Text style={styles.largeTitle}>{title}</Text>

      {/* Grid */}
      <View style={styles.largeGridContainer}>
        <MiniGrid
          daysPassed={daysPassed}
          totalDays={totalDays}
          columns={20}
          dotSize={7}
          spacing={2}
          maxDots={120}
        />
      </View>

      {/* Stats */}
      <Text style={styles.largeStats}>{daysPassed} of {totalDays} days</Text>
    </View>
  );
});

export const HomeWidgetsPreview: React.FC<HomeWidgetsPreviewProps> = memo(function HomeWidgetsPreview({
  daysPassed,
  totalDays,
  title,
}) {
  return (
    <View style={styles.container}>
      <MediumWidget
        daysPassed={daysPassed}
        totalDays={totalDays}
        title={title}
      />
      <LargeWidget
        daysPassed={daysPassed}
        totalDays={totalDays}
        title={title}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },

  // Grid styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  gridDot: {
    // Dynamic styles applied inline
  },

  // Medium Widget
  mediumWidget: {
    ...widgetCardStyle,
    width: 280,
    height: 70,
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },

  mediumLeft: {
    flex: 1,
    marginRight: 12,
  },

  mediumTitle: {
    color: PREVIEW_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },

  mediumPercentage: {
    color: PREVIEW_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },

  mediumStats: {
    color: PREVIEW_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '400',
  },

  mediumRight: {
    justifyContent: 'center',
  },

  // Large Widget
  largeWidget: {
    ...widgetCardStyle,
    width: 280,
    height: 120,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  largeTitle: {
    color: PREVIEW_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },

  largeGridContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },

  largeStats: {
    color: PREVIEW_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '400',
    alignSelf: 'flex-start',
  },
});
