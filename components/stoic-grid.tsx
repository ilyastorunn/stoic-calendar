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
import { View, StyleSheet, useColorScheme, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
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

  /**
   * Called when a dot is pressed
   * Receives the dot index (0-based) and the tap position
   */
  onDotPress?: (dotIndex: number, position: { x: number; y: number }) => void;

  /**
   * Export mode - disables animations and interactions
   * Used when rendering for image export
   * @default false
   */
  exportMode?: boolean;

  /**
   * Grid color theme to use (only for export mode)
   * If provided, overrides loading from storage
   */
  exportColorTheme?: GridColorTheme;
}

/**
 * Animated Dot Component
 * Individual dot with wave animation (opacity + scale)
 */
interface AnimatedDotProps {
  index: number;
  totalDots: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  dotSize: number;
  isFilled: boolean;
  fillColor: string;
  emptyColor: string;
  animate: boolean;
  onPress?: (index: number, position: { x: number; y: number }) => void;
}

const AnimatedDot = React.memo(function AnimatedDot({
  index,
  totalDots,
  x,
  y,
  offsetX,
  offsetY,
  dotSize,
  isFilled,
  fillColor,
  emptyColor,
  animate,
  onPress,
}: AnimatedDotProps) {
  // Shared value for animation progress (0 to 1)
  const progress = useSharedValue(animate ? 0 : 1);

  // Shared value for tap animation
  const tapScale = useSharedValue(1);

  // Trigger animation on mount
  useEffect(() => {
    if (animate) {
      // Calculate wave delay based on dot position
      // Max 600ms total delay across all dots
      const maxDelay = Math.min(totalDots * 1.5, 600);
      const delay = (index / totalDots) * maxDelay;

      progress.value = withDelay(
        delay,
        withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        })
      );
    }
  }, [animate, index, totalDots, progress]);

  // Animated style for opacity and scale
  const animatedStyle = useAnimatedStyle(() => {
    const baseScale = 0.6 + progress.value * 0.4;
    return {
      opacity: progress.value,
      transform: [
        { scale: baseScale * tapScale.value }, // Combine mount animation with tap animation
      ],
    };
  });

  // If no onPress handler, render non-interactive dot
  if (!onPress) {
    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: offsetX + x,
            top: offsetY + y,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: isFilled ? fillColor : emptyColor,
          },
          animate && animatedStyle,
        ]}
      />
    );
  }

  return (
    <Pressable
      onPress={(event) => {
        if (onPress) {
          // Use pageX/pageY for absolute screen coordinates
          const { pageX, pageY } = event.nativeEvent;

          // Subtle tap feedback: scale down then back up
          tapScale.value = withSequence(
            withTiming(0.85, { duration: 100, easing: Easing.out(Easing.quad) }),
            withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
          );

          onPress(index, { x: pageX, y: pageY });
        }
      }}
      style={{
        position: 'absolute',
        left: offsetX + x,
        top: offsetY + y,
        width: dotSize,
        height: dotSize,
      }}
    >
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: isFilled ? fillColor : emptyColor,
          },
          animate && animatedStyle,
        ]}
      />
    </Pressable>
  );
});

/**
 * Stoic Grid Component
 */
export function StoicGrid({
  timeline,
  animated = false,
  mini = false,
  onDotPress,
  exportMode = false,
  exportColorTheme,
}: StoicGridProps) {
  const colorScheme = useColorScheme();

  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [gridColorTheme, setGridColorTheme] = useState<GridColorTheme>(exportColorTheme || 'classic');

  /**
   * Load grid color theme (skip if in export mode with provided theme)
   */
  useEffect(() => {
    // In export mode with explicit theme, skip loading from storage
    if (exportMode && exportColorTheme) {
      setGridColorTheme(exportColorTheme);
      return;
    }

    const loadColorTheme = async () => {
      try {
        const theme = await getGridColorTheme();
        setGridColorTheme(theme);
      } catch (error) {
        console.error('Error loading grid color theme:', error);
      }
    };

    loadColorTheme();
  }, [exportMode, exportColorTheme]);

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
   * Render dots with optional wave animation
   */
  const renderDots = () => {
    if (!gridLayout || dotPositions.length === 0) return null;

    return dotPositions.map((dot) => {
      const isFilled = dot.index < daysPassed;

      return (
        <AnimatedDot
          key={dot.index}
          index={dot.index}
          totalDots={totalDays}
          x={dot.x}
          y={dot.y}
          offsetX={centerOffset.offsetX}
          offsetY={centerOffset.offsetY}
          dotSize={gridLayout.dotSize}
          isFilled={isFilled}
          fillColor={gridColors.dotFilled}
          emptyColor={gridColors.dotEmpty}
          animate={animated && !exportMode} // Disable animation in export mode
          onPress={exportMode ? undefined : onDotPress} // Disable tap in export mode
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
});
