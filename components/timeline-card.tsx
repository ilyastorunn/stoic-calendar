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
  onDelete,
  showDelete = false,
}: TimelineCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const description = getTimelineDescription(timeline);
  const progress = getTimelineProgress(timeline);

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
                fontFamily: Fonts?.serif || 'Georgia',
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
        </View>

        {/* Right Content - Mini Grid */}
        <View style={styles.miniGridContainer}>
          <StoicGrid timeline={timeline} mini />
        </View>

        {/* Delete Button */}
        {showDelete && (
          <TouchableOpacity
            style={[
              styles.deleteButton,
              {
                backgroundColor: colors.destructive,
              },
            ]}
            onPress={() => onDelete?.(timeline)}
          >
            <Text
              style={[
                styles.deleteText,
                {
                  color: '#FFFFFF',
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
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.large,
    marginBottom: Spacing.md,
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
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  deleteText: {
    fontSize: 24,
    fontWeight: FontWeights.bold,
    lineHeight: 24,
  },
});
