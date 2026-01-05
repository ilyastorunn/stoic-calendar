/**
 * Paywall Screen
 * Static MVP paywall UI for App Store Connect review
 *
 * Design: Minimalist, calm, and honest - no urgency or marketing pressure
 * Purpose: Review placeholder (no functional logic)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from '@/constants/theme';

export default function PaywallScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  /**
   * Feature list items
   */
  const features = [
    {
      icon: 'calendar',
      text: 'All timeline views',
    },
    {
      icon: 'square.grid.2x2',
      text: 'Premium widgets',
    },
    {
      icon: 'infinity',
      text: 'Unlimited access',
    },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Background Blur Effect */}
      <View style={styles.backgroundContainer}>
        <BlurView
          intensity={100}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Centered Content */}
      <View style={styles.contentContainer}>
        {/* Floating Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.secondaryBackground,
            },
            Shadows.large,
          ]}
        >
          {/* Header - Serif Font */}
          <Text
            style={[
              styles.title,
              {
                fontFamily: Fonts?.serif || 'Georgia',
                color: colors.textPrimary,
              },
            ]}
          >
            Premium Monthly
          </Text>

          {/* Description - SF Pro */}
          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Access all visualization tools and widget types.
          </Text>

          {/* Feature List */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <SymbolView
                  name={feature.icon}
                  size={20}
                  tintColor={colors.accent}
                  style={styles.featureIcon}
                />
                <Text
                  style={[
                    styles.featureText,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <Text
            style={[
              styles.price,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            $3.99 / month
          </Text>

          {/* Subscribe Button */}
          <TouchableOpacity
            style={[
              styles.subscribeButton,
              {
                backgroundColor: colors.accent,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.subscribeButtonText}>Subscribe</Text>
          </TouchableOpacity>

          {/* Restore Purchases */}
          <TouchableOpacity style={styles.restoreButton} activeOpacity={0.6}>
            <Text
              style={[
                styles.restoreButtonText,
                {
                  color: colors.accent,
                },
              ]}
            >
              Restore Purchases
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 420,
    borderRadius: BorderRadius.xlarge,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureIcon: {
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
  },
  price: {
    fontSize: FontSizes.title2,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.lg,
  },
  subscribeButton: {
    width: '100%',
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  subscribeButtonText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: '#FFFFFF',
  },
  restoreButton: {
    paddingVertical: Spacing.sm,
  },
  restoreButtonText: {
    fontSize: FontSizes.subheadline,
    fontWeight: FontWeights.regular,
  },
});
