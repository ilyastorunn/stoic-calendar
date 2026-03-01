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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Timeline, TimelineType } from '@/types/timeline';
import { createTimeline } from '@/services/timeline-calculator';
import { loadTimelines } from '@/services/storage';
import {
  Colors,
  Fonts,
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
  const [scaleAnim] = useState(new Animated.Value(0.98));
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
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        // Reset scale instantly after fade completes
        scaleAnim.setValue(0.98);
      });
    }
  }, [visible, timeline, fadeAnim, scaleAnim]);

  /**
   * Handle save
   */
  const handleSave = async () => {
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
        // Duplicate check for non-custom types
        if (selectedType !== TimelineType.CUSTOM) {
          const existingTimelines = await loadTimelines();
          const duplicate = existingTimelines.find((t) => {
            if (t.type !== selectedType) return false;
            if (selectedType === TimelineType.WEEK) return true;
            // Compare year for YEAR, year+month for MONTH
            const tStart = new Date(t.startDate);
            const newStart = selectedType === TimelineType.YEAR
              ? new Date(new Date().getFullYear(), 0, 1)
              : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            return tStart.getFullYear() === newStart.getFullYear()
              && (selectedType === TimelineType.YEAR || tStart.getMonth() === newStart.getMonth());
          });
          if (duplicate) {
            Alert.alert('Duplicate Timeline', `A ${selectedType} timeline for this period already exists.`);
            return;
          }
        }

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
                    ? colors.tertiaryBackground
                    : 'transparent',
                  borderColor: colors.separator,
                },
              ]}
              onPress={() => setSelectedType(type)}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color: isSelected
                      ? colors.textPrimary
                      : colors.textSecondary,
                    fontWeight: isSelected
                      ? FontWeights.medium
                      : FontWeights.regular,
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
                borderColor: colors.separator,
              },
            ]}
            value={customTitle}
            onChangeText={setCustomTitle}
            placeholder="Enter timeline name"
            placeholderTextColor={colors.textTertiary}
            maxLength={80}
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
                borderColor: colors.separator,
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
                borderColor: colors.separator,
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
            maximumDate={customEndDate}
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
            minimumDate={customStartDate}
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

      {/* Keyboard-aware centered dialog */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.dialogContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.dialog,
              {
                backgroundColor: colors.secondaryBackground,
              },
            ]}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.separator }]}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.headerButton, styles.cancelButtonContainer, { borderColor: colors.separator }]}
                activeOpacity={0.6}
              >
                <Text style={[styles.cancelButton, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                {timeline ? 'Edit Timeline' : 'New Timeline'}
              </Text>

              <TouchableOpacity
                onPress={handleSave}
                style={[styles.headerButton, styles.saveButtonContainer, { backgroundColor: colors.accent }]}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButton}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Only show type picker in create mode */}
              {!timeline && (
                <View style={styles.section}>
                  {renderTypePicker()}
                </View>
              )}

              {renderCustomFields()}
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: '88%',
  },
  dialog: {
    borderRadius: BorderRadius.xlarge,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    minWidth: 60,
  },
  cancelButtonContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.small,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  cancelButton: {
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.regular,
  },
  headerTitle: {
    fontSize: FontSizes.title3,
    fontWeight: FontWeights.regular,
    fontFamily: Fonts.handwriting,
    letterSpacing: 0.5,
  },
  saveButtonContainer: {
    borderRadius: BorderRadius.small,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    alignItems: 'center',
  },
  saveButton: {
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.medium,
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.regular,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  typePickerContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  typeButtonText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
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
  },
  textInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
    fontSize: FontSizes.body,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dateButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dateButtonText: {
    fontSize: FontSizes.body,
  },
});
