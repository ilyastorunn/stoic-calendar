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
  period: string;
  isSelected: boolean;
  onPress: () => void;
  discount?: string;
  showTrial?: boolean;
  showCancelAnytime?: boolean;
}

export const PlanOption: React.FC<PlanOptionProps> = ({
  label,
  price,
  period,
  isSelected,
  onPress,
  discount,
  showTrial = false,
  showCancelAnytime = false,
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
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.touchable}>
        <Animated.View style={[styles.container, containerStyle]}>
          {/* Ribbon Badge (Top of Card) */}
          {showTrial && (
            <View
              style={[
                styles.ribbonBadge,
                {
                  backgroundColor: colors.accent,
                },
              ]}
            >
              <Text
                style={[
                  styles.ribbonText,
                  {
                    color: colors.background,
                  },
                ]}
              >
                7 DAYS FREE
              </Text>
            </View>
          )}

          {/* Label */}
          <Text
            style={[
              styles.label,
              {
                color: isSelected ? colors.accent : colors.textSecondary,
                fontWeight: FontWeights.semibold,
              },
            ]}
          >
            {label}
          </Text>

          {/* Price */}
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

          {/* Period/Discount */}
          <Text
            style={[
              styles.period,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {discount || (showCancelAnytime ? `${period}, cancel anytime` : period)}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  touchable: {
    flex: 1,
  },
  container: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BorderRadius.large,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160, // Increased to accommodate trial badge
    position: 'relative',
  },
  label: {
    fontSize: FontSizes.title2, // 22px - PRIMARY hierarchy
    marginBottom: Spacing.sm, // Increased spacing
    textAlign: 'center',
  },
  price: {
    fontSize: FontSizes.body, // 17px - SECONDARY hierarchy
    fontWeight: FontWeights.regular, // Regular weight (not bold)
    marginBottom: Spacing.sm, // Increased spacing
    textAlign: 'center',
  },
  period: {
    fontSize: FontSizes.footnote, // 13px - TERTIARY hierarchy
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  ribbonBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ribbonText: {
    fontSize: FontSizes.caption1, // 12px
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
