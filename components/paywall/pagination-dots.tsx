/**
 * Pagination Dots Component
 * Displays dots indicating carousel position with animated active state
 */

import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Spacing } from '@/constants/theme';

interface PaginationDotsProps {
  total: number;
  activeIndex: number;
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({
  total,
  activeIndex,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;

        return (
          <Dot
            key={index}
            isActive={isActive}
            activeColor={colors.textPrimary}
            inactiveColor={colors.textTertiary}
          />
        );
      })}
    </View>
  );
};

interface DotProps {
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
}

const Dot: React.FC<DotProps> = ({ isActive, activeColor, inactiveColor }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const width = withTiming(isActive ? 16 : 8, { duration: 200 });
    const opacity = withTiming(isActive ? 1 : 0.5, { duration: 200 });

    return {
      width,
      opacity,
      backgroundColor: isActive ? activeColor : inactiveColor,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
