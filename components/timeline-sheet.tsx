/**
 * Timeline Sheet Component
 * Bottom sheet modal for timeline selection and management
 *
 * Features:
 * - Lists all timelines sorted by active first
 * - Timeline selection (set active)
 * - Timeline creation (opens TimelineFormModal)
 * - Timeline editing and deletion
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
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { X, Plus } from 'phosphor-react-native';
import { Timeline } from '@/types/timeline';
import { TimelineCard } from './timeline-card';
import { TimelineFormModal } from './timeline-form-modal';
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

export interface TimelineSheetProps {
  /**
   * Whether the sheet is visible
   */
  visible: boolean;

  /**
   * Called when the sheet is closed
   */
  onClose: () => void;

  /**
   * Called when a timeline is selected
   */
  onTimelineSelect: (timeline: Timeline) => void;

  /**
   * Currently active timeline ID
   */
  activeTimelineId?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.5; // 50% of screen height

/**
 * Timeline Sheet Component
 */
export function TimelineSheet({
  visible,
  onClose,
  onTimelineSelect,
  activeTimelineId,
}: TimelineSheetProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();

  // Animation state
  const [slideAnim] = useState(new Animated.Value(SHEET_HEIGHT));
  const [fadeAnim] = useState(new Animated.Value(0));

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
   * Load timelines when sheet becomes visible
   */
  useEffect(() => {
    if (visible) {
      loadAllTimelines();
    }
  }, [visible, loadAllTimelines]);

  /**
   * Animate sheet open/close
   */
  useEffect(() => {
    if (visible) {
      // Slide up from bottom
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down to bottom
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

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

      // Notify parent (home screen will update and close the sheet)
      onTimelineSelect(timeline);
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
                  onClose(); // Close sheet
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

      // Notify parent with new timeline
      onTimelineSelect(newTimeline);
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
            } catch (error) {
              console.error('Error deleting timeline:', error);
            }
          },
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Blurred Background */}
        <BlurView
          intensity={30}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </BlurView>

        {/* Animated Sheet Container */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
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

              {/* Create Button */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.separator,
                  },
                ]}
                onPress={handleAddButtonPress}
                activeOpacity={0.6}
              >
                <Plus size={24} color={colors.accent} weight="regular" />
                <Text
                  style={[
                    styles.createButtonText,
                    {
                      color: colors.accent,
                    },
                  ]}
                >
                  Create Timeline
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Animated.View>
      </View>

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
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: SHEET_HEIGHT,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: BorderRadius.xlarge,
    borderTopRightRadius: BorderRadius.xlarge,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(142, 142, 147, 0.2)',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.title2,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.subheadline,
    fontWeight: FontWeights.regular,
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
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: FontSizes.subheadline,
    fontWeight: FontWeights.regular,
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
    marginTop: Spacing.md,
  },
  createButtonText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.medium,
    marginLeft: Spacing.sm,
  },
});
