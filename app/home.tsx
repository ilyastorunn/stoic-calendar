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
  Alert,
  AppState,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Gear, CaretDown } from 'phosphor-react-native';
import { Timeline, TimelineType } from '@/types/timeline';
import { StoicGrid } from '@/components/stoic-grid';
import { DateDisplayOverlay } from '@/components/date-display-overlay';
import { TimelineDropdown } from '@/components/timeline-dropdown';
import { TimelineFormDrawer } from '@/components/timeline-form-drawer';
import { TimelineManagementModal } from '@/components/timeline-management-modal';
import {
  getActiveTimeline,
  loadTimelines,
  saveTimeline,
  setActiveTimeline as setActiveTimelineInStorage,
  deleteTimeline,
  hasShownFirstLaunchPaywall,
  markFirstLaunchPaywallShown,
} from '@/services/storage';
import {
  getTimelineProgress,
  getTimelineRemaining,
  getTimelineProgressPercentage,
  getTimelineDisplayTitle,
  createTimeline,
  updateTimelineIfNeeded,
  sortTimelinesWithActiveFirst,
} from '@/services/timeline-calculator';
import { syncActiveTimelineToWidget, syncAllTimelinesToWidget } from '@/services/widget-data-service';
import { isPro, FREE_TIER_LIMITS } from '@/services/revenue-cat-service';
import { getDateFromDotIndex } from '@/utils/date-helpers';
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
  Layout,
} from '@/constants/theme';

const FIRST_LAUNCH_PAYWALL_DELAY_MS = 4000;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const { t } = useTranslation();

  const [activeTimeline, setActiveTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tapPosition, setTapPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTimelineDropdown, setShowTimelineDropdown] = useState(false);
  const [showTimelineFormModal, setShowTimelineFormModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<Timeline | undefined>(undefined);
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
   * Show paywall once for first-time users after a short delay.
   */
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const maybeShowFirstLaunchPaywall = async () => {
      try {
        const alreadyShown = await hasShownFirstLaunchPaywall();
        if (alreadyShown) return;

        const hasProAccess = await isPro();
        if (hasProAccess) {
          await markFirstLaunchPaywallShown();
          return;
        }

        timer = setTimeout(async () => {
          if (cancelled) return;
          await markFirstLaunchPaywallShown();
          router.push('/paywall');
        }, FIRST_LAUNCH_PAYWALL_DELAY_MS);
      } catch (error) {
        console.error('Error handling first-launch paywall:', error);
      }
    };

    maybeShowFirstLaunchPaywall();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [router]);

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

        // If no active timeline but timelines exist, set the first one as active
        if (!timeline && allTimelines.length > 0) {
          await setActiveTimelineInStorage(allTimelines[0].id);
          timeline = allTimelines[0];
        }

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
      loadAllTimelines();
    }, [loadActiveTimeline, loadAllTimelines])
  );

  /**
   * Reload timeline when app returns to foreground (catches midnight transitions)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        loadActiveTimeline();
        loadAllTimelines();
      }
    });
    return () => subscription.remove();
  }, [loadActiveTimeline, loadAllTimelines, t]);

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
        await syncAllTimelinesToWidget();
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

  /**
   * Handle adding a new timeline with premium checks
   */
  const handleAddTimeline = useCallback(async () => {
    try {
      // Check premium status
      const hasPro = await isPro();

      if (!hasPro && timelines.length >= FREE_TIER_LIMITS.MAX_TIMELINES) {
        // Show paywall alert
        Alert.alert(
          t('alerts.timelineLimitReached'),
          t('alerts.timelineLimitMessage', { max: FREE_TIER_LIMITS.MAX_TIMELINES }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('alerts.upgradeToPro'),
              onPress: () => {
                setShowTimelineDropdown(false);
                router.push('/paywall');
              }
            }
          ]
        );
        return;
      }

      // Close dropdown and show form
      setShowTimelineDropdown(false);
      setShowTimelineFormModal(true);
    } catch (error) {
      console.error('Error checking timeline limits:', error);
      // Fail closed - do not allow bypassing limits on error
      setShowTimelineDropdown(false);
      Alert.alert(t('common.error'), t('alerts.couldNotVerifySubscription'));
    }
  }, [timelines.length, router, t]);

  /**
   * Handle timeline save with widget sync
   */
  const handleTimelineSave = useCallback(async (newTimeline: Timeline) => {
    try {
      // Save to storage
      await saveTimeline(newTimeline);

      // Set as active (only if creating new timeline, not editing)
      if (!editingTimeline) {
        await setActiveTimelineInStorage(newTimeline.id);
      }

      // Sync to widgets
      await syncAllTimelinesToWidget();
      await syncActiveTimelineToWidget();

      // Close form
      setShowTimelineFormModal(false);
      setEditingTimeline(undefined);

      // Reload data
      await loadActiveTimeline();
      await loadAllTimelines();
    } catch (error) {
      console.error('Error saving timeline:', error);
      Alert.alert(
        t('common.error'),
        t('alerts.couldNotSave'),
        [{ text: t('common.ok') }]
      );
      // Keep modal open for retry
    }
  }, [loadActiveTimeline, loadAllTimelines, editingTimeline, t]);

  /**
   * Handle opening timeline management modal
   */
  const handleManageTimelines = useCallback(() => {
    setShowTimelineDropdown(false);
    setShowManagementModal(true);
  }, []);

  /**
   * Handle timeline edit from context menu
   */
  const handleTimelineEdit = useCallback((timeline: Timeline) => {
    setShowTimelineDropdown(false);
    setEditingTimeline(timeline);
    setShowTimelineFormModal(true);
  }, []);

  /**
   * Handle timeline delete from context menu
   */
  const handleTimelineDelete = useCallback(async (timeline: Timeline) => {
    Alert.alert(
      t('alerts.deleteTimeline'),
      t('alerts.deleteConfirm', { title: timeline.title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Close dropdown
              setShowTimelineDropdown(false);

              // Delete timeline
              await deleteTimeline(timeline.id);

              // Reload data - loadActiveTimeline will handle setting a new active timeline
              // or creating a default 2026 timeline if none exist
              await loadActiveTimeline();
              await loadAllTimelines();

              // Sync widgets
              await syncAllTimelinesToWidget();
              await syncActiveTimelineToWidget();
            } catch (error) {
              console.error('Error deleting timeline:', error);
              Alert.alert(t('common.error'), t('alerts.couldNotDelete'));
            }
          },
        },
      ]
    );
  }, [loadActiveTimeline, loadAllTimelines, t]);

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
            {t('home.noActiveTimeline')}
          </Text>
          <Text
            style={[
              styles.onboardingSubtext,
              {
                color: colors.textTertiary,
              },
            ]}
          >
            {t('home.createToGetStarted')}
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
              {getTimelineDisplayTitle(activeTimeline)}
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
            {t('home.percentPassed', { percent: percentage })}
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
        onAddTimeline={handleAddTimeline}
        onManage={handleManageTimelines}
        onEdit={handleTimelineEdit}
        onDelete={handleTimelineDelete}
        onClose={() => setShowTimelineDropdown(false)}
      />

      {/* Timeline Form Drawer */}
      <TimelineFormDrawer
        visible={showTimelineFormModal}
        timeline={editingTimeline}
        onClose={() => {
          setShowTimelineFormModal(false);
          setEditingTimeline(undefined);
        }}
        onSave={handleTimelineSave}
      />

      {/* Timeline Management Modal */}
      <TimelineManagementModal
        visible={showManagementModal}
        onClose={async () => {
          setShowManagementModal(false);
          await loadActiveTimeline();
          await loadAllTimelines();
        }}
        onRefresh={async () => {
          await loadActiveTimeline();
          await loadAllTimelines();
        }}
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
    top: Spacing.sm,
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
    marginVertical: Spacing.md,
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
