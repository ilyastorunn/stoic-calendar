/**
 * Stoic Grid Component
 * The core visualization: 1 dot = 1 day
 *
 * Principles:
 * - Grid must ALWAYS fit its container without scrolling
 * - Dot count never changes (no grouping, no abstraction)
 * - Filled dots = past, Empty dots = future
 * - Minimal, calm, no excessive animation
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Timeline, GridColorTheme } from '@/types/timeline';
import { calculateGridLayout, generateDotPositions, calculateGridCenterOffset } from '@/utils/grid-layout';
import { getTimelineDaysPassed, getTimelineTotalDays } from '@/services/timeline-calculator';
import { GridColorPalettes } from '@/constants/theme';
import { getGridColorTheme } from '@/services/storage';

export interface StoicGridProps {
  /**
   * Timeline to visualize
   */
  timeline: Timeline;

  /**
   * Show subtle fill animation on mount
   * @default false
   */
  animated?: boolean;

  /**
   * Mini grid mode (for timeline cards)
   * Uses smaller maximum dot size
   * @default false
   */
  mini?: boolean;
}

/**
 * Stoic Grid Component
 */
export function StoicGrid({ timeline, animated = false, mini = false }: StoicGridProps) {
  const colorScheme = useColorScheme();

  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [gridColorTheme, setGridColorTheme] = useState<GridColorTheme>('classic');

  /**
   * Load grid color theme
   */
  useEffect(() => {
    const loadColorTheme = async () => {
      try {
        const theme = await getGridColorTheme();
        setGridColorTheme(theme);
      } catch (error) {
        console.error('Error loading grid color theme:', error);
      }
    };

    loadColorTheme();
  }, []);

  /**
   * Calculate timeline stats
   */
  const daysPassed = useMemo(() => getTimelineDaysPassed(timeline), [timeline]);
  const totalDays = useMemo(() => getTimelineTotalDays(timeline), [timeline]);

  /**
   * Handle container layout measurement
   */
  const handleLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setContainerDimensions({ width, height });
    }
  }, []);

  /**
   * Calculate grid layout
   */
  const gridLayout = useMemo(() => {
    if (containerDimensions.width === 0 || containerDimensions.height === 0) {
      return null;
    }

    return calculateGridLayout(
      totalDays,
      containerDimensions.width,
      containerDimensions.height
    );
  }, [totalDays, containerDimensions]);

  /**
   * Generate dot positions
   */
  const dotPositions = useMemo(() => {
    if (!gridLayout) return [];
    return generateDotPositions(totalDays, gridLayout);
  }, [totalDays, gridLayout]);

  /**
   * Calculate grid centering offset
   */
  const centerOffset = useMemo(() => {
    if (!gridLayout) return { offsetX: 0, offsetY: 0 };

    return calculateGridCenterOffset(
      gridLayout.gridWidth,
      gridLayout.gridHeight,
      containerDimensions.width,
      containerDimensions.height
    );
  }, [gridLayout, containerDimensions]);

  /**
   * Get grid colors based on selected theme
   */
  const gridColors = useMemo(() => {
    const palette = GridColorPalettes[gridColorTheme];
    const mode = colorScheme ?? 'dark';
    return palette[mode];
  }, [gridColorTheme, colorScheme]);

  /**
   * Render dots
   */
  const renderDots = () => {
    if (!gridLayout || dotPositions.length === 0) return null;

    return dotPositions.map((dot) => {
      const isFilled = dot.index < daysPassed;

      return (
        <View
          key={dot.index}
          style={[
            styles.dot,
            {
              position: 'absolute',
              left: centerOffset.offsetX + dot.x,
              top: centerOffset.offsetY + dot.y,
              width: gridLayout.dotSize,
              height: gridLayout.dotSize,
              borderRadius: gridLayout.dotSize / 2,
              backgroundColor: isFilled ? gridColors.dotFilled : gridColors.dotEmpty,
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {renderDots()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  dot: {
    // Dot styles are applied inline for dynamic sizing
  },
});
