/**
 * Timeline Form Modal Component
 * Modal for creating and editing timelines
 *
 * Features:
 * - Timeline type picker (Year, Month, Week, Custom)
 * - Date pickers for Custom timelines
 * - Title input (auto-generated or custom)
 * - Save/Cancel actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useColorScheme,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
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

export interface TimelineFormModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;

  /**
   * Timeline to edit (undefined for create mode)
   */
  timeline?: Timeline;

  /**
   * Called when the modal is closed
   */
  onClose: () => void;

  /**
   * Called when a timeline is saved
   */
  onSave: (timeline: Timeline) => void;
}

/**
 * Timeline Form Modal Component
 */
export function TimelineFormModal({
  visible,
  timeline,
  onClose,
  onSave,
}: TimelineFormModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  // Animation state
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [fadeAnim] = useState(new Animated.Value(0));

  // Form state
  const [selectedType, setSelectedType] = useState<TimelineType>(TimelineType.YEAR);
  const [customTitle, setCustomTitle] = useState('');
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Reset form and animate when modal opens
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

      // Animate in - subtle, linear animation (Stoic principle: no spring/bounce)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animation values
      scaleAnim.setValue(0.9);
      fadeAnim.setValue(0);
    }
  }, [visible, timeline, fadeAnim, scaleAnim]);

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
                    ? colors.accent
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
      <View style={styles.modalOverlay}>
        {/* Blurred Background - subtle blur for minimal distraction */}
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

        {/* Animated Card Container */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: colorScheme === 'dark' ? colors.secondaryBackground : colors.background,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose}>
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

              <TouchableOpacity onPress={handleSave}>
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
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cardContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 500,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  card: {
    borderRadius: BorderRadius.large,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
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
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.regular,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  typePickerContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.small,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeButtonText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.medium,
  },
  customFieldsContainer: {
    marginTop: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.regular,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  textInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
    fontSize: FontSizes.body,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  dateButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  dateButtonText: {
    fontSize: FontSizes.body,
  },
});
