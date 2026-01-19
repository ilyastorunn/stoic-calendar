/**
 * Plan Option Component
 * Selectable subscription plan card with checkmark indicator
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

interface PlanOptionProps {
  label: string;
  price: string;
  isSelected: boolean;
  onPress: () => void;
}

export const PlanOption: React.FC<PlanOptionProps> = ({
  label,
  price,
  isSelected,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const scale = useSharedValue(1);

  const handlePress = () => {
    // Tap feedback animation
    scale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => {
    const borderColor = withTiming(
      isSelected ? colors.accent : colors.separator,
      { duration: 150 }
    );
    const backgroundColor = withTiming(
      isSelected ? colors.secondaryBackground : 'transparent',
      { duration: 150 }
    );

    return {
      borderColor,
      backgroundColor,
    };
  });

  const checkmarkStyle = useAnimatedStyle(() => {
    const opacity = withTiming(isSelected ? 1 : 0, { duration: 150 });
    const scale = withTiming(isSelected ? 1 : 0.8, { duration: 150 });

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
        <Animated.View style={[styles.container, containerStyle]}>
          <View style={styles.content}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.textPrimary,
                  fontWeight: FontWeights.medium,
                },
              ]}
            >
              {label}
            </Text>

            <View style={styles.rightContent}>
              <Text
                style={[
                  styles.price,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                {price}
              </Text>

              <Animated.View style={[styles.checkmarkContainer, checkmarkStyle]}>
                <View style={[styles.checkmark, { backgroundColor: colors.accent }]}>
                  <Text style={styles.checkmarkIcon}>✓</Text>
                </View>
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.medium,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSizes.body,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  price: {
    fontSize: FontSizes.body,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: FontWeights.bold,
  },
});
