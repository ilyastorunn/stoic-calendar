/**
 * Timeline Dropdown Component
 *
 * Lightweight inline dropdown for quick timeline switching.
 * Appears directly below the title on the home screen.
 *
 * Design:
 * - Simple list of timeline names (no previews or cards)
 * - Active timeline indicated by bold font + checkmark
 * - "Manage Timelines..." button at bottom
 * - Fade in/out animation (no slide, no scale)
 * - No blur, no shadows - flat design
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Timeline } from '@/types/timeline';
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Animations,
} from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DROPDOWN_WIDTH = 280;

interface TimelineDropdownProps {
  visible: boolean;
  timelines: Timeline[];
  activeTimelineId: string;
  anchorPosition: { x: number; y: number };
  onSelect: (timeline: Timeline) => void;
  onManage: () => void;
  onClose: () => void;
}

export function TimelineDropdown({
  visible,
  timelines,
  activeTimelineId,
  anchorPosition,
  onSelect,
  onManage,
  onClose,
}: TimelineDropdownProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in/out animation
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animations.fast,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: Animations.fast,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const styles = createStyles(colors);

  // Calculate dropdown position
  const dropdownStyle = {
    position: 'absolute' as const,
    top: anchorPosition.y + 8, // 8px below title
    left: (SCREEN_WIDTH - DROPDOWN_WIDTH) / 2, // Centered
    opacity: fadeAnim,
  };

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View style={[styles.dropdown, dropdownStyle]}>
          <TouchableOpacity activeOpacity={1}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {timelines.map((timeline, index) => {
                const isActive = timeline.id === activeTimelineId;
                return (
                  <TouchableOpacity
                    key={timeline.id}
                    style={[
                      styles.item,
                      index === 0 && styles.itemFirst,
                    ]}
                    onPress={() => onSelect(timeline)}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        isActive && styles.itemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {timeline.title}
                    </Text>
                    {isActive && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}

              <View style={styles.separator} />

              <TouchableOpacity
                style={styles.manageButton}
                onPress={onManage}
                activeOpacity={0.6}
              >
                <Text style={styles.manageText}>Manage Timelines...</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

function createStyles(colors: typeof Colors.dark) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    dropdown: {
      width: DROPDOWN_WIDTH,
      maxHeight: 300,
      backgroundColor: colors.secondaryBackground,
      borderRadius: BorderRadius.medium,
      overflow: 'hidden',
    },
    scrollView: {
      maxHeight: 300,
    },
    scrollContent: {
      paddingVertical: Spacing.xs,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
      paddingHorizontal: 20,
      minHeight: 44, // iOS touch target
    },
    itemFirst: {
      paddingTop: Spacing.sm,
    },
    itemText: {
      fontSize: FontSizes.body,
      fontWeight: FontWeights.regular,
      color: colors.textPrimary,
      flex: 1,
    },
    itemTextActive: {
      fontWeight: FontWeights.medium,
    },
    checkmark: {
      fontSize: FontSizes.body,
      color: colors.textPrimary,
      marginLeft: Spacing.sm,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      marginHorizontal: 20,
      marginVertical: Spacing.xs,
    },
    manageButton: {
      paddingVertical: Spacing.md,
      paddingHorizontal: 20,
      minHeight: 44,
      paddingBottom: Spacing.sm,
    },
    manageText: {
      fontSize: FontSizes.body,
      fontWeight: FontWeights.regular,
      color: colors.textSecondary,
    },
  });
}
