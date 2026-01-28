/**
 * Timeline Dropdown Component
 *
 * Pure timeline switcher with lightweight creation.
 * Appears directly below the title on the home screen.
 *
 * Design:
 * - Simple list of timeline names (no previews or cards)
 * - Active timeline indicated by medium font weight + subtle checkmark
 * - "+ Add Timeline" button at bottom for direct creation
 * - Fade + subtle scale animation (0.98 → 1.0)
 * - No blur, no shadows - flat design
 */

import React, { useEffect, useRef, useState } from 'react';
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
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Pencil, Trash, X, Faders } from 'phosphor-react-native';
import { Timeline, TimelineType } from '@/types/timeline';
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
  onAddTimeline: () => void;
  onManage: () => void;
  onEdit: (timeline: Timeline) => void;
  onDelete: (timeline: Timeline) => void;
  onClose: () => void;
}

export function TimelineDropdown({
  visible,
  timelines,
  activeTimelineId,
  anchorPosition,
  onSelect,
  onAddTimeline,
  onManage,
  onEdit,
  onDelete,
  onClose,
}: TimelineDropdownProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    timeline: Timeline | null;
    position: { x: number; y: number };
  }>({
    visible: false,
    timeline: null,
    position: { x: 0, y: 0 },
  });

  // Long press timer
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Context menu animations
  const contextMenuScale = useRef(new Animated.Value(0.95)).current;
  const contextMenuOpacity = useRef(new Animated.Value(0)).current;

  // Fade + scale animation
  useEffect(() => {
    if (visible) {
      // Parallel fade + scale on open
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: Animations.fast,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: Animations.fast,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade out only (faster)
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: Animations.fast * 0.75,
        useNativeDriver: true,
      }).start();
      // Reset scale for next open
      scaleAnim.setValue(0.98);
      // Close context menu when dropdown closes
      setContextMenu({ visible: false, timeline: null, position: { x: 0, y: 0 } });
    }
  }, [visible, fadeAnim, scaleAnim]);

  // Context menu animation
  useEffect(() => {
    if (contextMenu.visible) {
      Animated.parallel([
        Animated.timing(contextMenuOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contextMenuScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations for next open
      contextMenuOpacity.setValue(0);
      contextMenuScale.setValue(0.95);
    }
  }, [contextMenu.visible, contextMenuOpacity, contextMenuScale]);

  const styles = createStyles(colors);

  // Calculate dropdown position
  const dropdownStyle = {
    position: 'absolute' as const,
    top: anchorPosition.y + 8, // 8px below title
    left: (SCREEN_WIDTH - DROPDOWN_WIDTH) / 2, // Centered
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
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
                    onPressIn={(e) => {
                      const timer = setTimeout(() => {
                        // Trigger haptic feedback
                        if (Platform.OS === 'ios') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }

                        // Show context menu
                        setContextMenu({
                          visible: true,
                          timeline: timeline,
                          position: { x: 0, y: 0 },
                        });
                      }, 500); // 500ms long press

                      setPressTimer(timer);
                    }}
                    onPressOut={() => {
                      if (pressTimer) {
                        clearTimeout(pressTimer);
                        setPressTimer(null);
                      }
                    }}
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
                style={styles.addButton}
                onPress={onAddTimeline}
                activeOpacity={0.6}
              >
                <Text style={styles.addText}>+ Add Timeline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageButton}
                onPress={onManage}
                activeOpacity={0.6}
              >
                <Faders size={20} color={colors.textSecondary} weight="regular" />
                <Text style={styles.manageText}>Manage Timelines...</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>

          {/* Context Menu */}
          {contextMenu.visible && contextMenu.timeline && (
            <View style={styles.contextMenuContainer}>
              {/* Dismiss backdrop */}
              <TouchableOpacity
                style={styles.contextBackdrop}
                activeOpacity={1}
                onPress={() => setContextMenu({ visible: false, timeline: null, position: { x: 0, y: 0 } })}
              />

              {/* Context menu */}
              <Animated.View
                style={[
                  styles.contextMenu,
                  {
                    opacity: contextMenuOpacity,
                    transform: [{ scale: contextMenuScale }],
                  },
                ]}
              >
                {/* Edit - only for custom timelines */}
                {contextMenu.timeline.type === TimelineType.CUSTOM && (
                  <TouchableOpacity
                    style={styles.contextItem}
                    onPress={() => {
                      onEdit(contextMenu.timeline!);
                      setContextMenu({ visible: false, timeline: null, position: { x: 0, y: 0 } });
                    }}
                    activeOpacity={0.6}
                  >
                    <Pencil size={18} color={colors.textPrimary} weight="regular" />
                    <Text style={styles.contextItemText}>Edit</Text>
                  </TouchableOpacity>
                )}

                {/* Delete - only if more than 1 timeline exists */}
                {timelines.length > 1 && (
                  <TouchableOpacity
                    style={styles.contextItem}
                    onPress={() => {
                      onDelete(contextMenu.timeline!);
                      setContextMenu({ visible: false, timeline: null, position: { x: 0, y: 0 } });
                    }}
                    activeOpacity={0.6}
                  >
                    <Trash size={18} color={colors.destructive} weight="regular" />
                    <Text style={[styles.contextItemText, styles.contextItemTextDestructive]}>Delete</Text>
                  </TouchableOpacity>
                )}

                {/* Cancel */}
                <TouchableOpacity
                  style={[styles.contextItem, styles.contextItemLast]}
                  onPress={() => setContextMenu({ visible: false, timeline: null, position: { x: 0, y: 0 } })}
                  activeOpacity={0.6}
                >
                  <X size={18} color={colors.textPrimary} weight="regular" />
                  <Text style={styles.contextItemText}>Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
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
      color: colors.textSecondary,
      marginLeft: Spacing.sm,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      marginHorizontal: 20,
      marginVertical: Spacing.xs,
    },
    addButton: {
      paddingVertical: Spacing.md,
      paddingHorizontal: 20,
      minHeight: 44,
    },
    addText: {
      fontSize: FontSizes.callout,
      fontWeight: FontWeights.regular,
      color: colors.textSecondary,
    },
    manageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      paddingHorizontal: 20,
      paddingBottom: Spacing.sm,
      minHeight: 44,
    },
    manageText: {
      fontSize: FontSizes.callout,
      color: colors.textSecondary,
      fontWeight: FontWeights.regular,
    },
    contextMenuContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contextBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    contextMenu: {
      position: 'absolute',
      backgroundColor: colors.tertiaryBackground,
      borderRadius: BorderRadius.medium,
      width: 220,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
      overflow: 'hidden',
    },
    contextItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm + 2,
      paddingVertical: Spacing.sm + 2,
      paddingHorizontal: Spacing.lg,
      height: 44,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
    },
    contextItemLast: {
      borderBottomWidth: 0,
    },
    contextItemText: {
      fontSize: FontSizes.body,
      fontWeight: FontWeights.regular,
      color: colors.textPrimary,
    },
    contextItemTextDestructive: {
      color: colors.destructive,
    },
  });
}
