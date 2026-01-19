/**
 * Date Display Overlay Component
 * Shows the tapped date as a small tooltip near the tapped dot
 *
 * Design:
 * - Small tooltip-style badge
 * - Positioned near the tapped dot
 * - Fade in + scale animation
 * - Auto-dismiss after 1.5 seconds
 * - Minimal, calm design
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { formatShortDate, isToday } from '@/utils/date-helpers';
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
} from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface DateDisplayOverlayProps {
  /**
   * Date to display
   */
  date: Date | null;

  /**
   * Position where the dot was tapped
   */
  position: { x: number; y: number } | null;

  /**
   * Called when overlay should dismiss
   */
  onDismiss: () => void;
}

export function DateDisplayOverlay({ date, position, onDismiss }: DateDisplayOverlayProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    if (date && position) {
      // Animate in
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });

      // Auto-dismiss after 1.5 seconds
      const timer = setTimeout(() => {
        // Animate out
        opacity.value = withTiming(0, {
          duration: 150,
          easing: Easing.in(Easing.cubic),
        });
        scale.value = withTiming(0.8, {
          duration: 150,
          easing: Easing.in(Easing.cubic),
        });

        // Call onDismiss after animation
        setTimeout(onDismiss, 150);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      // Reset values when no date
      opacity.value = 0;
      scale.value = 0.7;
    }
  }, [date, position, onDismiss, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  if (!date || !position) return null;

  // Get date status
  const isCurrentDate = isToday(date);
  const dateString = formatShortDate(date);

  // Calculate tooltip position
  // Tooltip dimensions (approximate)
  const tooltipWidth = 160;
  const tooltipHeight = 50;
  const offset = 15; // Distance from tap point

  // Center tooltip horizontally around tap point
  let tooltipX = position.x - tooltipWidth / 2;

  // Position tooltip above the tap point by default
  let tooltipY = position.y - tooltipHeight - offset;

  // Keep tooltip within screen bounds horizontally
  const horizontalPadding = 16;
  if (tooltipX < horizontalPadding) tooltipX = horizontalPadding;
  if (tooltipX + tooltipWidth > SCREEN_WIDTH - horizontalPadding) {
    tooltipX = SCREEN_WIDTH - tooltipWidth - horizontalPadding;
  }

  // If tooltip goes above safe area (status bar + header), show it below the tap point
  const topSafeArea = 200; // Approximate: status bar + header
  if (tooltipY < topSafeArea) {
    tooltipY = position.y + offset;
  }

  // If tooltip goes below screen, clamp it
  const bottomSafeArea = 150; // Tab bar + padding
  if (tooltipY + tooltipHeight > SCREEN_HEIGHT - bottomSafeArea) {
    tooltipY = SCREEN_HEIGHT - tooltipHeight - bottomSafeArea;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.tooltip,
          {
            backgroundColor: colors.cardBackground,
            borderColor: isCurrentDate ? colors.accent : colors.separator,
            left: tooltipX,
            top: tooltipY,
          },
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.dateText,
            {
              color: colors.textPrimary,
            },
          ]}
        >
          {dateString}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tooltip: {
    position: 'absolute',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: FontSizes.subheadline,
    fontWeight: FontWeights.medium,
    textAlign: 'center',
  },
});
