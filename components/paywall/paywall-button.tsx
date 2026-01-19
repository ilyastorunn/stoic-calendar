/**
 * Paywall Button Component
 * Primary CTA button with press animation and loading state
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

interface PaywallButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const PaywallButton: React.FC<PaywallButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (disabled || isLoading) return;

    // Tap feedback animation
    scale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );

    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        disabled={disabled || isLoading}
      >
        <Animated.View
          style={[
            styles.button,
            {
              backgroundColor: colors.accent,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.text}>{title}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: BorderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  text: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: '#FFFFFF',
  },
});
