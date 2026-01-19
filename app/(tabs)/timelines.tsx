/**
 * Timelines Screen
 * List of all timelines with create/delete functionality
 *
 * Layout:
 * - Header with title and + button
 * - Timeline count subtitle
 * - List of timeline cards
 * - Create modal
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Timeline, GridColorTheme } from '@/types/timeline';
import { TimelineCard } from '@/components/timeline-card';
import { TimelineFormModal } from '@/components/timeline-form-modal';
import { ExportCanvas } from '@/components/export-canvas';
import { useTimelineExport } from '@/hooks/use-timeline-export';
import {
  loadTimelines,
  saveTimeline,
  deleteTimeline,
  setActiveTimeline,
  getGridColorTheme,
} from '@/services/storage';
import { sortTimelinesWithActiveFirst } from '@/services/timeline-calculator';
import { isPro, FREE_TIER_LIMITS } from '@/services/revenue-cat-service';
import {
  syncActiveTimelineToWidget,
  syncAllTimelinesToWidget,
} from '@/services/widget-data-service';
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  Layout,
} from '@/constants/theme';

export default function TimelinesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const navigation = useNavigation();
  const router = useRouter();

  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<Timeline | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [gridColorTheme, setGridColorTheme] = useState<GridColorTheme>('classic');
  const [sharingTimeline, setSharingTimeline] = useState<Timeline | null>(null);

  // Export hook
  const { exportAndShare, isExporting, exportCanvasRef } = useTimelineExport();

  /**
   * Load timelines from storage
   */
  const loadAllTimelines = useCallback(async () => {
    try {
      setLoading(true);
      const allTimelines = await loadTimelines();
      const sorted = sortTimelinesWithActiveFirst(allTimelines);
      setTimelines(sorted);
    } catch (error) {
      console.error('Error loading timelines:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reload timelines when screen comes into focus
   */
  useFocusEffect(
    useCallback(() => {
      loadAllTimelines();
    }, [loadAllTimelines])
  );

  /**
   * Load grid color theme
   */
  useEffect(() => {
    const loadColorTheme = async () => {
      try {
        const theme = await getGridColorTheme();
        setGridColorTheme(theme);
      } catch (error) {
        console.error('Error loading grid color theme:', error);
      }
    };

    loadColorTheme();
  }, []);

  /**
   * Handle timeline press (set as active and navigate to Home)
   */
  const handleTimelinePress = async (timeline: Timeline) => {
    try {
      // Immediately update local state for instant UI feedback
      setTimelines((prev) =>
        prev.map((t) => ({
          ...t,
          isActive: t.id === timeline.id,
        }))
      );

      // Then persist to storage
      await setActiveTimeline(timeline.id);

      // Sync active timeline to widget
      await syncActiveTimelineToWidget();

      // Navigate to home tab
      navigation.navigate('home' as never);
    } catch (error) {
      console.error('Error setting active timeline:', error);
      // Reload on error to sync state
      await loadAllTimelines();
    }
  };

  /**
   * Handle timeline edit
   */
  const handleTimelineEdit = (timeline: Timeline) => {
    setEditingTimeline(timeline);
  };

  /**
   * Handle timeline share
   */
  const handleTimelineShare = useCallback(
    async (timeline: Timeline) => {
      // Set the timeline to be shared (this will render the ExportCanvas)
      setSharingTimeline(timeline);

      // Wait a bit for canvas to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Trigger export
      await exportAndShare(timeline);

      // Clear sharing timeline
      setSharingTimeline(null);
    },
    [exportAndShare]
  );

  /**
   * Handle timeline delete
   */
  const handleTimelineDelete = (timeline: Timeline) => {
    Alert.alert(
      'Delete Timeline',
      `Are you sure you want to delete "${timeline.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTimeline(timeline.id);
              await loadAllTimelines();
              // Sync updated timeline list to widget
              await syncAllTimelinesToWidget();
            } catch (error) {
              console.error('Error deleting timeline:', error);
            }
          },
        },
      ]
    );
  };

  /**
   * Handle add button press
   * Check premium limits before showing create modal
   */
  const handleAddButtonPress = async () => {
    try {
      // Check if user has pro access
      const hasPro = await isPro();

      if (!hasPro) {
        // Check if user has reached timeline limit
        if (timelines.length >= FREE_TIER_LIMITS.MAX_TIMELINES) {
          Alert.alert(
            'Timeline Limit Reached',
            `Free users can create up to ${FREE_TIER_LIMITS.MAX_TIMELINES} timelines. Upgrade to Pro for unlimited timelines.`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Upgrade to Pro',
                onPress: () => router.push('/paywall'),
              },
            ]
          );
          return;
        }
      }

      // User can create timeline
      setShowCreateModal(true);
    } catch (error) {
      console.error('Error checking timeline limits:', error);
      // On error, allow timeline creation (fail open)
      setShowCreateModal(true);
    }
  };

  /**
   * Handle timeline save (create new)
   */
  const handleTimelineSave = async (newTimeline: Timeline) => {
    try {
      await saveTimeline(newTimeline);
      await setActiveTimeline(newTimeline.id);
      await loadAllTimelines();
      // Sync new timeline to widget (both list and active)
      await syncAllTimelinesToWidget();
      await syncActiveTimelineToWidget();
    } catch (error) {
      console.error('Error saving timeline:', error);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Header - FadeIn */}
      <Animated.View style={styles.header} entering={FadeIn.duration(400)}>
        <View style={styles.headerLeft}>
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            Timelines
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {timelines.length} timeline{timelines.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: colors.accent,
            },
          ]}
          onPress={handleAddButtonPress}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Timeline List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Layout.tabBarHeight + Layout.tabBarBottomMargin + Spacing.md,
          },
        ]}
      >
        {timelines.map((timeline, index) => (
          <Animated.View
            key={timeline.id}
            entering={FadeInDown.duration(300).delay(Math.min(100 + index * 50, 500))}
          >
            <TimelineCard
              timeline={timeline}
              onPress={handleTimelinePress}
              onEdit={handleTimelineEdit}
              onShare={handleTimelineShare}
              onDelete={handleTimelineDelete}
              showDelete
            />
          </Animated.View>
        ))}

        {!loading && timelines.length === 0 && (
          <View style={styles.emptyState}>
            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              No timelines yet
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                {
                  color: colors.textTertiary,
                },
              ]}
            >
              Tap + to create your first timeline
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Modal */}
      <TimelineFormModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleTimelineSave}
      />

      {/* Edit Modal */}
      <TimelineFormModal
        visible={!!editingTimeline}
        timeline={editingTimeline}
        onClose={() => setEditingTimeline(undefined)}
        onSave={handleTimelineSave}
      />

      {/* Hidden Export Canvas - for image generation */}
      {sharingTimeline && (
        <ExportCanvas
          ref={exportCanvasRef}
          timeline={sharingTimeline}
          gridColorTheme={gridColorTheme}
          ready={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.largeTitle,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: FontWeights.medium,
    lineHeight: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: FontSizes.title2,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
    textAlign: 'center',
  },
});
