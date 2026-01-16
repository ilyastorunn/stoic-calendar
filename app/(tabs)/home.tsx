/**
 * Home Screen
 * Displays the active timeline with full-screen grid visualization
 *
 * Layout:
 * - Timeline title (serif, centered)
 * - Progress text (X of Y days)
 * - Stoic grid (fills available space)
 * - Days remaining text (bottom)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Timeline, TimelineType } from '@/types/timeline';
import { StoicGrid } from '@/components/stoic-grid';
import { getActiveTimeline, loadTimelines, saveTimeline, setActiveTimeline as setActiveTimelineInStorage } from '@/services/storage';
import {
  getTimelineProgress,
  getTimelineRemaining,
  getTimelineProgressPercentage,
  createTimeline,
  updateTimelineIfNeeded,
} from '@/services/timeline-calculator';
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
  Layout,
} from '@/constants/theme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [activeTimeline, setActiveTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load active timeline
   * Auto-creates a default "Current Year" timeline if none exist
   * Auto-updates Week/Month/Year timelines if they're outdated
   */
  const loadActiveTimeline = useCallback(async () => {
    try {
      setLoading(true);

      // Check if there are any timelines
      const allTimelines = await loadTimelines();

      // If no timelines exist, create a default "Current Year" timeline
      if (allTimelines.length === 0) {
        const currentYear = new Date().getFullYear();
        const defaultTimeline = createTimeline(TimelineType.YEAR, {
          year: currentYear,
          isActive: true,
        });

        await saveTimeline(defaultTimeline);
        await setActiveTimelineInStorage(defaultTimeline.id);
        setActiveTimeline(defaultTimeline);
      } else {
        // Load the active timeline
        let timeline = await getActiveTimeline();

        if (timeline) {
          // Check if timeline needs auto-update (Week/Month/Year)
          const { timeline: updatedTimeline, wasUpdated } = updateTimelineIfNeeded(timeline);

          if (wasUpdated) {
            // Save the updated timeline
            await saveTimeline(updatedTimeline);
            console.log(`Auto-updated ${updatedTimeline.type} timeline: ${updatedTimeline.title}`);
            timeline = updatedTimeline;
          }
        }

        setActiveTimeline(timeline);
      }
    } catch (error) {
      console.error('Error loading active timeline:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reload timeline when screen comes into focus
   */
  useFocusEffect(
    useCallback(() => {
      loadActiveTimeline();
    }, [loadActiveTimeline])
  );

  /**
   * Render onboarding message when no active timeline
   */
  if (!loading && !activeTimeline) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.onboardingContainer}>
          <Text
            style={[
              styles.onboardingText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            No active timeline
          </Text>
          <Text
            style={[
              styles.onboardingSubtext,
              {
                color: colors.textTertiary,
              },
            ]}
          >
            Create a timeline to get started
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading || !activeTimeline) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      />
    );
  }

  const progress = getTimelineProgress(activeTimeline);
  const remaining = getTimelineRemaining(activeTimeline);
  const percentage = getTimelineProgressPercentage(activeTimeline);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.contentContainer}>
        {/* Header - FadeIn first */}
        <Animated.View style={styles.header} entering={FadeIn.duration(400)}>
          <Text
            style={[
              styles.title,
              {
                fontFamily: Fonts?.serif || 'Georgia',
                color: colors.textPrimary,
              },
            ]}
          >
            {activeTimeline.title}
          </Text>
          <Text
            style={[
              styles.progress,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {progress}
          </Text>
        </Animated.View>

        {/* Grid Container - FadeIn with 200ms delay */}
        <Animated.View style={styles.gridContainer} entering={FadeIn.duration(600).delay(200)}>
          <StoicGrid timeline={activeTimeline} animated />
        </Animated.View>

        {/* Footer - FadeIn with 400ms delay */}
        <Animated.View style={styles.footer} entering={FadeIn.duration(400).delay(400)}>
          <Text
            style={[
              styles.remaining,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {remaining}
          </Text>
          <Text
            style={[
              styles.percentage,
              {
                color: colors.textTertiary,
              },
            ]}
          >
            {percentage}% passed
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.tabBarHeight + Layout.tabBarBottomMargin + Spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 48,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  progress: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
  },
  gridContainer: {
    flex: 1,
    marginVertical: Spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  remaining: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
    marginBottom: Spacing.xs,
  },
  percentage: {
    fontSize: FontSizes.caption1,
    fontWeight: FontWeights.regular,
  },
  onboardingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  onboardingText: {
    fontSize: FontSizes.title2,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.sm,
  },
  onboardingSubtext: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
    textAlign: 'center',
  },
});
