/**
 * Timeline Form Drawer Component
 * Bottom-anchored drawer for creating and editing timelines
 *
 * Features:
 * - Timeline type picker (Year, Month, Week, Custom)
 * - Progressive disclosure of date inputs
 * - Bottom-anchored with fixed height
 * - Dimmed background with tap-to-dismiss
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Platform,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Timeline, TimelineType } from '@/types/timeline';
import { createTimeline } from '@/services/timeline-calculator';
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
} from '@/constants/theme';

export interface TimelineFormDrawerProps {
  /**
   * Whether the drawer is visible
   */
  visible: boolean;

  /**
   * Timeline to edit (undefined for create mode)
   */
  timeline?: Timeline;

  /**
   * Called when the drawer is closed
   */
  onClose: () => void;

  /**
   * Called when a timeline is saved
   */
  onSave: (timeline: Timeline) => void;
}

/**
 * Timeline Form Drawer Component
 */
export function TimelineFormDrawer({
  visible,
  timeline,
  onClose,
  onSave,
}: TimelineFormDrawerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  // Animation state
  const [slideAnim] = useState(new Animated.Value(500));
  const [fadeAnim] = useState(new Animated.Value(0));

  // Form state
  const [selectedType, setSelectedType] = useState<TimelineType>(TimelineType.YEAR);
  const [customTitle, setCustomTitle] = useState('');
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Reset form and animate when drawer opens
  useEffect(() => {
    if (visible) {
      // Reset form
      if (timeline) {
        // Edit mode
        setSelectedType(timeline.type);
        setCustomTitle(timeline.title);
        setCustomStartDate(new Date(timeline.startDate));
        setCustomEndDate(new Date(timeline.endDate));
      } else {
        // Create mode - reset to defaults
        setSelectedType(TimelineType.YEAR);
        setCustomTitle('');
        setCustomStartDate(new Date());
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 3);
        setCustomEndDate(futureDate);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 500,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, timeline, fadeAnim, slideAnim]);

  /**
   * Handle save
   */
  const handleSave = () => {
    try {
      let newTimeline: Timeline;

      if (timeline) {
        // Edit mode - preserve timeline ID and isActive status
        newTimeline = {
          ...timeline,
          title: customTitle || timeline.title,
          startDate: customStartDate.toISOString(),
          endDate: customEndDate.toISOString(),
        };
      } else {
        // Create mode
        if (selectedType === TimelineType.CUSTOM) {
          // Custom timeline with custom dates
          newTimeline = createTimeline(TimelineType.CUSTOM, {
            startDate: customStartDate,
            endDate: customEndDate,
            title: customTitle || 'Custom Timeline',
            isActive: true,
          });
        } else if (selectedType === TimelineType.YEAR) {
          // Year timeline
          newTimeline = createTimeline(TimelineType.YEAR, {
            isActive: true,
          });
        } else if (selectedType === TimelineType.MONTH) {
          // Month timeline
          newTimeline = createTimeline(TimelineType.MONTH, {
            isActive: true,
          });
        } else {
          // Week timeline
          newTimeline = createTimeline(TimelineType.WEEK, {
            isActive: true,
          });
        }
      }

      onSave(newTimeline);
      onClose();
    } catch (error) {
      console.error('Error saving timeline:', error);
    }
  };

  /**
   * Render type picker buttons
   */
  const renderTypePicker = () => {
    const types: TimelineType[] = [
      TimelineType.YEAR,
      TimelineType.MONTH,
      TimelineType.WEEK,
      TimelineType.CUSTOM,
    ];

    return (
      <View style={styles.typePickerContainer}>
        {types.map((type) => {
          const isSelected = selectedType === type;
          const label =
            type === TimelineType.YEAR
              ? 'Year'
              : type === TimelineType.MONTH
                ? 'Month'
                : type === TimelineType.WEEK
                  ? 'Week'
                  : 'Custom';

          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                {
                  backgroundColor: isSelected
                    ? colors.accent
                    : 'transparent',
                  borderColor: isSelected
                    ? 'transparent'
                    : colors.separator,
                },
              ]}
              onPress={() => setSelectedType(type)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.textPrimary,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  /**
   * Render custom timeline fields
   */
  const renderCustomFields = () => {
    // Show custom fields for custom type or in edit mode
    if (!timeline && selectedType !== TimelineType.CUSTOM) return null;

    return (
      <View style={styles.customFieldsContainer}>
        {/* Title Input */}
        <View style={styles.fieldContainer}>
          <Text
            style={[
              styles.fieldLabel,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            TITLE
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.secondaryBackground,
                color: colors.textPrimary,
              },
            ]}
            value={customTitle}
            onChangeText={setCustomTitle}
            placeholder="Enter timeline name"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Start Date */}
        <View style={styles.fieldContainer}>
          <Text
            style={[
              styles.fieldLabel,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            START DATE
          </Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.secondaryBackground,
              },
            ]}
            onPress={() => setShowStartPicker(true)}
          >
            <Text
              style={[
                styles.dateButtonText,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              {customStartDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* End Date */}
        <View style={styles.fieldContainer}>
          <Text
            style={[
              styles.fieldLabel,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            END DATE
          </Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.secondaryBackground,
              },
            ]}
            onPress={() => setShowEndPicker(true)}
          >
            <Text
              style={[
                styles.dateButtonText,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              {customEndDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={customStartDate}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (date) setCustomStartDate(date);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={customEndDate}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (date) setCustomEndDate(date);
            }}
          />
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      {/* Dimmed Background */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer Container */}
      <Animated.View
        style={[
          styles.drawerContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.drawer,
            {
              backgroundColor: colors.secondaryBackground,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text
                style={[
                  styles.cancelButton,
                  {
                    color: colors.accent,
                  },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              {timeline ? 'Edit Timeline' : 'New Timeline'}
            </Text>

            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Text
                style={[
                  styles.saveButton,
                  {
                    color: colors.accent,
                  },
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Only show type picker in create mode */}
            {!timeline && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  TYPE
                </Text>
                {renderTypePicker()}
              </View>
            )}

            {renderCustomFields()}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  drawerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawer: {
    borderTopLeftRadius: BorderRadius.xlarge,
    borderTopRightRadius: BorderRadius.xlarge,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    minWidth: 60,
  },
  cancelButton: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
  },
  headerTitle: {
    fontSize: FontSizes.headline,
    fontWeight: FontWeights.semibold,
  },
  saveButton: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    textAlign: 'right',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.regular,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    letterSpacing: 0.5,
  },
  typePickerContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.medium,
  },
  customFieldsContainer: {
    marginTop: Spacing.md,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.regular,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    letterSpacing: 0.5,
  },
  textInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
    fontSize: FontSizes.body,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  dateButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  dateButtonText: {
    fontSize: FontSizes.body,
  },
});
