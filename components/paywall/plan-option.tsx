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
  price: {
    fontSize: FontSizes.body,
  },
});
