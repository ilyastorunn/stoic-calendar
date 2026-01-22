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
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Gear, CaretDown } from 'phosphor-react-native';
import { Timeline, TimelineType } from '@/types/timeline';
import { StoicGrid } from '@/components/stoic-grid';
import { DateDisplayOverlay } from '@/components/date-display-overlay';
import { TimelineDropdown } from '@/components/timeline-dropdown';
import { TimelineManagementModal } from '@/components/timeline-management-modal';
import { getActiveTimeline, loadTimelines, saveTimeline, setActiveTimeline as setActiveTimelineInStorage } from '@/services/storage';
import {
  getTimelineProgress,
  getTimelineRemaining,
  getTimelineProgressPercentage,
  createTimeline,
  updateTimelineIfNeeded,
  sortTimelinesWithActiveFirst,
} from '@/services/timeline-calculator';
import { syncActiveTimelineToWidget } from '@/services/widget-data-service';
import { getDateFromDotIndex } from '@/utils/date-helpers';
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
  const router = useRouter();

  const [activeTimeline, setActiveTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tapPosition, setTapPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTimelineDropdown, setShowTimelineDropdown] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [titlePosition, setTitlePosition] = useState({ x: 0, y: 0 });

  // Icon rotation animation
  const iconRotation = useSharedValue(0);

  /**
   * Load all timelines for dropdown
   */
  const loadAllTimelines = useCallback(async () => {
    try {
      const allTimelines = await loadTimelines();
      const sorted = sortTimelinesWithActiveFirst(allTimelines);
      setTimelines(sorted);
    } catch (error) {
      console.error('Error loading timelines:', error);
    }
  }, []);

  /**
   * Animate icon rotation based on dropdown visibility
   */
  useEffect(() => {
    iconRotation.value = withTiming(showTimelineDropdown ? 180 : 0, { duration: 200 });
  }, [showTimelineDropdown, iconRotation]);

  /**
   * Load all timelines when screen loads
   */
  useEffect(() => {
    loadAllTimelines();
  }, [loadAllTimelines]);

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
   * Handle dot press - calculate and show date
   */
  const handleDotPress = useCallback(
    (dotIndex: number, position: { x: number; y: number }) => {
      if (!activeTimeline) return;

      const date = getDateFromDotIndex(activeTimeline.startDate, dotIndex);
      setSelectedDate(date);
      setTapPosition(position);
    },
    [activeTimeline]
  );

  /**
   * Handle date display dismiss
   */
  const handleDateDismiss = useCallback(() => {
    setSelectedDate(null);
    setTapPosition(null);
  }, []);

  /**
   * Handle timeline selection from TimelineDropdown
   */
  const handleTimelineSelect = useCallback(
    async (timeline: Timeline) => {
      try {
        // Close dropdown immediately
        setShowTimelineDropdown(false);

        // Immediate UI update
        setActiveTimeline(timeline);

        // Background persistence
        await setActiveTimelineInStorage(timeline.id);
        await syncActiveTimelineToWidget();

        // Reload to ensure consistency
        await loadActiveTimeline();
        await loadAllTimelines();
      } catch (error) {
        console.error('Error setting active timeline:', error);
      }
    },
    [loadActiveTimeline, loadAllTimelines]
  );

  // Animated style for icon rotation (must be before early returns)
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${iconRotation.value}deg` }],
    };
  });

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
          {/* Settings Icon - Top Right */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
            activeOpacity={0.6}
          >
            <Gear size={24} color={colors.textSecondary} weight="regular" />
          </TouchableOpacity>

          {/* Timeline Title with Dropdown Icon */}
          <TouchableOpacity
            style={styles.titleButton}
            onPress={() => setShowTimelineDropdown(!showTimelineDropdown)}
            onLayout={(e) => {
              e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                setTitlePosition({ x: pageX, y: pageY + height });
              });
            }}
            activeOpacity={0.6}
          >
            <Text
              style={[
                styles.title,
                {
                  fontFamily: Fonts.handwriting,
                  color: colors.textPrimary,
                },
              ]}
            >
              {activeTimeline.title}
            </Text>
            <Animated.View style={animatedIconStyle}>
              <CaretDown size={24} color={colors.textSecondary} weight="regular" />
            </Animated.View>
          </TouchableOpacity>

          {/* Progress Text */}
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
          <StoicGrid timeline={activeTimeline} animated onDotPress={handleDotPress} />
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

      {/* Date Display Overlay */}
      <DateDisplayOverlay date={selectedDate} position={tapPosition} onDismiss={handleDateDismiss} />

      {/* Timeline Dropdown */}
      <TimelineDropdown
        visible={showTimelineDropdown}
        timelines={timelines}
        activeTimelineId={activeTimeline?.id || ''}
        anchorPosition={titlePosition}
        onSelect={handleTimelineSelect}
        onManage={() => {
          setShowTimelineDropdown(false);
          setShowManagementModal(true);
        }}
        onClose={() => setShowTimelineDropdown(false)}
      />

      {/* Timeline Management Modal */}
      <TimelineManagementModal
        visible={showManagementModal}
        onClose={() => setShowManagementModal(false)}
        onRefresh={loadActiveTimeline}
      />
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
    paddingBottom: Spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: Spacing.xl,
    right: 0,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 48,
    fontWeight: FontWeights.semibold,
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
