/**
 * Feature Slide Component
 * Displays a single feature with widget preview, title, and description
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { Colors, Fonts, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import {
  LockScreenPreview,
  SmallWidgetsPreview,
  HomeWidgetsPreview,
  TimelinesPreview,
} from './widget-previews';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH;

export type FeatureType = 'lockscreen' | 'small' | 'home' | 'unlimited';

interface FeatureSlideProps {
  type: FeatureType;
}

/**
 * Static preview data (current date context: Jan 31, 2026)
 */
const PREVIEW_DATA = {
  percentage: 8,
  daysPassed: 31,
  daysRemaining: 334,
  totalDays: 365,
  title: '2026',
};

/**
 * Feature content data
 */
const FEATURES = {
  lockscreen: {
    title: 'Lock Screen Widgets',
    description: 'See your timeline at a glance, right on your lock screen.',
  },
  small: {
    title: 'Small Home Widgets',
    description: 'Add beautiful widgets to your home screen.',
  },
  home: {
    title: 'Home Screen Widgets',
    description: 'Beautiful grid widgets in medium and large sizes.',
  },
  unlimited: {
    title: 'Unlimited Timelines',
    description: "Track more than 3 timelines for life's important moments.",
  },
};

/**
 * Render the appropriate preview based on feature type
 */
const FeatureVisual: React.FC<{ type: FeatureType }> = ({ type }) => {
  switch (type) {
    case 'lockscreen':
      return (
        <LockScreenPreview
          percentage={PREVIEW_DATA.percentage}
          daysRemaining={PREVIEW_DATA.daysRemaining}
          totalDays={PREVIEW_DATA.totalDays}
          title={PREVIEW_DATA.title}
        />
      );
    case 'small':
      return (
        <SmallWidgetsPreview
          percentage={PREVIEW_DATA.percentage}
          daysRemaining={PREVIEW_DATA.daysRemaining}
          totalDays={PREVIEW_DATA.totalDays}
          title={PREVIEW_DATA.title}
        />
      );
    case 'home':
      return (
        <HomeWidgetsPreview
          daysPassed={PREVIEW_DATA.daysPassed}
          totalDays={PREVIEW_DATA.totalDays}
          title={PREVIEW_DATA.title}
        />
      );
    case 'unlimited':
      return <TimelinesPreview />;
    default:
      return null;
  }
};

export const FeatureSlide: React.FC<FeatureSlideProps> = ({ type }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const feature = FEATURES[type];

  return (
    <View style={[styles.slide, { width: SLIDE_WIDTH }]}>
      <View style={styles.visualContainer}>
        <FeatureVisual type={type} />
      </View>

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
