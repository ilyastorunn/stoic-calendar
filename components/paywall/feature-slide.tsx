/**
 * Feature Slide Component
 * Displays a single feature with abstract visual, title, and description
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { Colors, Fonts, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH;

export type FeatureType = 'widgets' | 'customization' | 'unlimited';

interface FeatureSlideProps {
  type: FeatureType;
}

/**
 * Abstract visual for Lock Screen Widgets
 * Shows a device frame with mini grid
 */
const WidgetsVisual = ({ colors }: { colors: typeof Colors.dark }) => {
  return (
    <View style={styles.visualContainer}>
      <View style={[styles.deviceFrame, { borderColor: colors.secondaryBackground }]}>
        {/* Mini grid inside */}
        <View style={styles.miniGrid}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <View
              key={index}
              style={[
                styles.miniDot,
                {
                  backgroundColor: index < 5 ? colors.accent : colors.secondaryBackground,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

/**
 * Abstract visual for Customizable Widgets
 * Shows a 2x2 grid of color swatches
 */
const CustomizationVisual = ({ colors }: { colors: typeof Colors.dark }) => {
  const colorSwatches = [
    '#007AFF', // Classic Blue
    '#30D158', // Forest Green
    '#FF9F0A', // Sunset Orange
    colors.textPrimary, // Monochrome
  ];

  return (
    <View style={styles.visualContainer}>
      <View style={styles.colorGrid}>
        {colorSwatches.map((color, index) => (
          <View key={index} style={styles.colorSwatchContainer}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.secondaryBackground }]}>
              {/* Mini dots in each swatch */}
              <View style={styles.swatchDots}>
                {[0, 1, 2].map((dotIndex) => (
                  <View
                    key={dotIndex}
                    style={[styles.swatchDot, { backgroundColor: color }]}
                  />
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * Abstract visual for Unlimited Timelines
 * Shows layered cards with dot patterns
 */
const UnlimitedVisual = ({ colors }: { colors: typeof Colors.dark }) => {
  return (
    <View style={styles.visualContainer}>
      <View style={styles.layeredCards}>
        {/* Back card */}
        <View
          style={[
            styles.card,
            styles.cardBack,
            { backgroundColor: colors.secondaryBackground, opacity: 0.4 },
          ]}
        >
          <View style={styles.cardDots}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View
                key={index}
                style={[styles.cardDot, { backgroundColor: colors.textTertiary }]}
              />
            ))}
          </View>
        </View>

        {/* Middle card */}
        <View
          style={[
            styles.card,
            styles.cardMiddle,
            { backgroundColor: colors.secondaryBackground, opacity: 0.7 },
          ]}
        >
          <View style={styles.cardDots}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View
                key={index}
                style={[styles.cardDot, { backgroundColor: colors.textSecondary }]}
              />
            ))}
          </View>
        </View>

        {/* Front card */}
        <View
          style={[
            styles.card,
            styles.cardFront,
            { backgroundColor: colors.secondaryBackground },
          ]}
        >
          <View style={styles.cardDots}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View
                key={index}
                style={[styles.cardDot, { backgroundColor: colors.accent }]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

/**
 * Feature content data
 */
const FEATURES = {
  widgets: {
    title: 'Lock Screen Widgets',
    description: 'See your timeline at a glance, right on your lock screen.',
    Visual: WidgetsVisual,
  },
  customization: {
    title: 'Customizable Widgets',
    description: 'Choose colors and styles that match your home screen.',
    Visual: CustomizationVisual,
  },
  unlimited: {
    title: 'Unlimited Timelines',
    description: "Track more than 3 timelines for life's important moments.",
    Visual: UnlimitedVisual,
  },
};

export const FeatureSlide: React.FC<FeatureSlideProps> = ({ type }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const feature = FEATURES[type];
  const Visual = feature.Visual;

  return (
    <View style={[styles.slide, { width: SLIDE_WIDTH }]}>
      <Visual colors={colors} />

      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            fontFamily: Fonts.handwriting,
          },
        ]}
      >
        {feature.title}
      </Text>

      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {feature.description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  // Visual container
  visualContainer: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  // Widgets visual
  deviceFrame: {
    width: 180,
    height: 200,
    borderRadius: BorderRadius.xlarge,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 72,
    justifyContent: 'center',
    gap: 8,
  },
  miniDot: {
    width: 16,
    height: 16,
    borderRadius: BorderRadius.small,
  },

  // Customization visual
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 200,
    gap: Spacing.md,
  },
  colorSwatchContainer: {
    width: 92,
    height: 92,
  },
  colorSwatch: {
    flex: 1,
    borderRadius: BorderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  swatchDots: {
    flexDirection: 'row',
    gap: 6,
  },
  swatchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Unlimited visual
  layeredCards: {
    width: 180,
    height: 200,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: 160,
    height: 100,
    borderRadius: BorderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    top: 0,
    left: 20,
  },
  cardMiddle: {
    top: 40,
    left: 10,
  },
  cardFront: {
    top: 80,
    left: 0,
  },
  cardDots: {
    flexDirection: 'row',
    gap: 8,
  },
  cardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Text
  title: {
    fontSize: 32,
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
});
