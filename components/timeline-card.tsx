/**
 * Timeline Card Component
 * Displays a timeline in the list with mini grid preview
 *
 * Design from screenshots:
 * - Serif title
 * - Type · percentage
 * - X of Y days
 * - Mini grid on the right
 * - Active timeline has blue left border
 * - Swipeable to delete
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Pressable,
} from 'react-native';
import { Timeline } from '@/types/timeline';
import { StoicGrid } from './stoic-grid';
import {
  getTimelineDescription,
  getTimelineProgress,
} from '@/services/timeline-calculator';
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from '@/constants/theme';

export interface TimelineCardProps {
  /**
   * Timeline to display
   */
  timeline: Timeline;

  /**
   * Called when card is pressed (to set active timeline)
   */
  onPress?: (timeline: Timeline) => void;

  /**
   * Called when edit button is pressed
   */
  onEdit?: (timeline: Timeline) => void;

  /**
   * Called when delete button is pressed
   */
  onDelete?: (timeline: Timeline) => void;

  /**
   * Show delete button on the right
   * @default false
   */
  showDelete?: boolean;
}

/**
 * Timeline Card Component
 */
export function TimelineCard({
  timeline,
  onPress,
  onEdit,
  onDelete,
  showDelete = false,
}: TimelineCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const description = getTimelineDescription(timeline);
  const progress = getTimelineProgress(timeline);
  const isCustomTimeline = timeline.type === 'custom';

  return (
    <View style={styles.cardWrapper}>
      <Pressable
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderLeftWidth: timeline.isActive ? 3 : 0,
            borderLeftColor: timeline.isActive ? colors.accent : 'transparent',
            paddingLeft: timeline.isActive ? Spacing.md - 3 : Spacing.md,
          },
        ]}
        onPress={() => onPress?.(timeline)}
      >
        {/* Left Content */}
        <View style={styles.leftContent}>
          <Text
            style={[
              styles.title,
              {
                fontFamily: Fonts.serif,
                color: colors.textPrimary,
              },
            ]}
          >
            {timeline.title}
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {description}
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

          {/* Edit Button - Only for Custom Timelines */}
          {isCustomTimeline && onEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={(e) => {
                e.stopPropagation();
                onEdit(timeline);
              }}
              activeOpacity={0.5}
            >
              <Text
                style={[
                  styles.editButtonText,
                  {
                    color: colors.accent,
                  },
                ]}
              >
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Right Content - Mini Grid */}
        <View style={styles.miniGridContainer}>
          <StoicGrid timeline={timeline} mini />
        </View>

        {/* Delete Button - Positioned at top-right corner */}
        {showDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              onDelete?.(timeline);
            }}
            activeOpacity={0.5}
          >
            <Text
              style={[
                styles.deleteText,
                {
                  color: colors.textTertiary,
                },
              ]}
            >
              ×
            </Text>
          </TouchableOpacity>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    borderRadius: BorderRadius.large,
    ...Shadows.small,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.large,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  leftContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.title1,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSizes.subheadline,
    fontWeight: FontWeights.regular,
    marginBottom: 2,
  },
  progress: {
    fontSize: FontSizes.subheadline,
    fontWeight: FontWeights.regular,
  },
  miniGridContainer: {
    width: 60,
    height: 60,
    marginLeft: Spacing.md,
    marginRight: Spacing.xl + Spacing.xs, // Space for delete button (28px + padding)
    overflow: 'hidden',
    borderRadius: BorderRadius.small,
  },
  deleteButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
  },
  deleteText: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: FontWeights.regular,
  },
  editButton: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: FontSizes.subheadline,
    fontWeight: FontWeights.medium,
  },
});
