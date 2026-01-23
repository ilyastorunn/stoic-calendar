/**
 * Timeline Management Modal Component
 *
 * Full-screen modal for comprehensive timeline management.
 * Opened from the "Manage Timelines..." option in TimelineDropdown.
 *
 * Features:
 * - List of all timelines with TimelineCard previews
 * - Create new timeline button
 * - Edit custom timelines
 * - Delete timelines
 * - Premium tier limit enforcement
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  SafeAreaView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { X, Plus } from 'phosphor-react-native';
import { Timeline } from '@/types/timeline';
import { TimelineCard } from './timeline-card';
import { TimelineFormDrawer } from './timeline-form-drawer';
import {
  loadTimelines,
  saveTimeline,
  deleteTimeline,
  setActiveTimeline,
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
  BorderRadius,
} from '@/constants/theme';

export interface TimelineManagementModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;

  /**
   * Called when the modal is closed
   */
  onClose: () => void;

  /**
   * Called after any timeline change to refresh the home screen (optional)
   */
  onRefresh?: () => void;
}

/**
 * Timeline Management Modal Component
 */
export function TimelineManagementModal({
  visible,
  onClose,
  onRefresh,
}: TimelineManagementModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();

  // Data state
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<Timeline | undefined>(undefined);

  /**
   * Load all timelines from storage
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
   * Load timelines when modal becomes visible
   */
  useEffect(() => {
    if (visible) {
      loadAllTimelines();
    }
  }, [visible, loadAllTimelines]);

  /**
   * Handle timeline press (set as active)
   */
  const handleTimelinePress = async (timeline: Timeline) => {
    try {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Immediately update local state for instant UI feedback
      setTimelines((prev) =>
        prev.map((t) => ({
          ...t,
          isActive: t.id === timeline.id,
        }))
      );

      // Persist to storage
      await setActiveTimeline(timeline.id);

      // Sync active timeline to widget
      await syncActiveTimelineToWidget();

      // Notify parent to refresh home screen
      onRefresh?.();

      // Close modal after selection
      onClose();
    } catch (error) {
      console.error('Error setting active timeline:', error);
      // Reload on error to sync state
      await loadAllTimelines();
    }
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
                onPress: () => {
                  onClose(); // Close modal
                  router.push('/paywall'); // Open paywall
                },
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
   * Handle timeline save (create or edit)
   */
  const handleTimelineSave = async (newTimeline: Timeline) => {
    try {
      await saveTimeline(newTimeline);
      await setActiveTimeline(newTimeline.id);
      await loadAllTimelines();

      // Sync to widget
      await syncAllTimelinesToWidget();
      await syncActiveTimelineToWidget();

      // Close create/edit modal
      setShowCreateModal(false);
      setEditingTimeline(undefined);

      // Notify parent to refresh
      onRefresh?.();
    } catch (error) {
      console.error('Error saving timeline:', error);
    }
  };

  /**
   * Handle timeline edit
   */
  const handleTimelineEdit = (timeline: Timeline) => {
    setEditingTimeline(timeline);
  };

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
              // Refresh home screen
              onRefresh?.();
            } catch (error) {
              console.error('Error deleting timeline:', error);
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={100}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>Timeline Management</Text>
                <Text style={styles.subtitle}>
                  {timelines.length} timeline{timelines.length !== 1 ? 's' : ''}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.6}
              >
                <X size={24} color={colors.textSecondary} weight="regular" />
              </TouchableOpacity>
            </View>

            {/* Timeline List */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {timelines.map((timeline) => (
                <TimelineCard
                  key={timeline.id}
                  timeline={timeline}
                  onPress={handleTimelinePress}
                  onEdit={handleTimelineEdit}
                  onDelete={handleTimelineDelete}
                  showDelete
                />
              ))}

              {!loading && timelines.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No timelines yet</Text>
                  <Text style={styles.emptySubtext}>
                    Tap + to create your first timeline
                  </Text>
                </View>
              )}

              {/* Create Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleAddButtonPress}
                activeOpacity={0.6}
              >
                <Plus size={24} color={colors.accent} weight="regular" />
                <Text style={styles.createButtonText}>Create Timeline</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </BlurView>

      {/* Create Drawer */}
      <TimelineFormDrawer
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleTimelineSave}
      />

      {/* Edit Drawer */}
      <TimelineFormDrawer
        visible={!!editingTimeline}
        timeline={editingTimeline}
        onClose={() => setEditingTimeline(undefined)}
        onSave={handleTimelineSave}
      />
    </Modal>
  );
}

function createStyles(colors: typeof Colors.dark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: FontSizes.title2,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.xs,
    },
    subtitle: {
      fontSize: FontSizes.subheadline,
      fontWeight: FontWeights.regular,
      color: colors.textSecondary,
    },
    closeButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: Spacing.sm,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.xl,
    },
    emptyState: {
      paddingVertical: Spacing.xxl,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: FontSizes.title3,
      fontWeight: FontWeights.medium,
      color: colors.textSecondary,
      marginBottom: Spacing.sm,
    },
    emptySubtext: {
      fontSize: FontSizes.subheadline,
      fontWeight: FontWeights.regular,
      color: colors.textTertiary,
      textAlign: 'center',
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.large,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.separator,
      backgroundColor: colors.cardBackground,
      marginTop: Spacing.md,
    },
    createButtonText: {
      fontSize: FontSizes.body,
      fontWeight: FontWeights.medium,
      color: colors.accent,
      marginLeft: Spacing.sm,
    },
  });
}
