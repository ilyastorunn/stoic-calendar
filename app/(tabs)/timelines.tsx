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

import React, { useState, useCallback } from 'react';
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
import { Timeline } from '@/types/timeline';
import { TimelineCard } from '@/components/timeline-card';
import { TimelineFormModal } from '@/components/timeline-form-modal';
import {
  loadTimelines,
  saveTimeline,
  deleteTimeline,
  setActiveTimeline,
} from '@/services/storage';
import { sortTimelinesWithActiveFirst } from '@/services/timeline-calculator';
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

  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
   * Handle timeline press (set as active and navigate to Home)
   */
  const handleTimelinePress = async (timeline: Timeline) => {
    try {
      await setActiveTimeline(timeline.id);
      await loadAllTimelines(); // Reload to update active states
      // Navigate to home tab
      navigation.navigate('home' as never);
    } catch (error) {
      console.error('Error setting active timeline:', error);
    }
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
            } catch (error) {
              console.error('Error deleting timeline:', error);
            }
          },
        },
      ]
    );
  };

  /**
   * Handle timeline save (create new)
   */
  const handleTimelineSave = async (newTimeline: Timeline) => {
    try {
      await saveTimeline(newTimeline);
      await setActiveTimeline(newTimeline.id);
      await loadAllTimelines();
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
          style={[
            styles.addButton,
            {
              backgroundColor: colors.accent,
            },
          ]}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

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
        {timelines.map((timeline) => (
          <TimelineCard
            key={timeline.id}
            timeline={timeline}
            onPress={handleTimelinePress}
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
      </ScrollView>

      {/* Create Modal */}
      <TimelineFormModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleTimelineSave}
      />
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
