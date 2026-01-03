/**
 * Settings Group Component
 * iOS-style grouped settings list
 *
 * Used in Settings screen for:
 * - Appearance options
 * - About information
 * - Philosophy text
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
} from '@/constants/theme';

export interface SettingsGroupItem {
  /**
   * Item label (left side)
   */
  label: string;

  /**
   * Item value (right side)
   * Can be text or a checkmark for selected items
   */
  value?: string;

  /**
   * Whether this item is selected (shows checkmark)
   */
  selected?: boolean;

  /**
   * Called when item is pressed
   */
  onPress?: () => void;

  /**
   * Whether this item is pressable
   * @default true if onPress is provided
   */
  pressable?: boolean;
}

export interface SettingsGroupProps {
  /**
   * Group header title (shown above group in uppercase)
   */
  title?: string;

  /**
   * Group items
   */
  items: SettingsGroupItem[];

  /**
   * Group footer text (shown below group)
   */
  footer?: string;

  /**
   * Custom content (for Philosophy section)
   */
  children?: React.ReactNode;
}

/**
 * Settings Group Component
 */
export function SettingsGroup({ title, items, footer, children }: SettingsGroupProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={styles.groupContainer}>
      {/* Group Title */}
      {title && (
        <Text
          style={[
            styles.groupTitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {title.toUpperCase()}
        </Text>
      )}

      {/* Group Items */}
      {items.length > 0 && (
        <View
          style={[
            styles.itemsContainer,
            {
              backgroundColor: colors.cardBackground,
            },
          ]}
        >
          {items.map((item, index) => (
            <SettingsGroupItemView
              key={index}
              item={item}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              colors={colors}
            />
          ))}
        </View>
      )}

      {/* Custom Children (for Philosophy) */}
      {children && (
        <View
          style={[
            styles.childrenContainer,
            {
              backgroundColor: colors.cardBackground,
            },
          ]}
        >
          {children}
        </View>
      )}

      {/* Group Footer */}
      {footer && (
        <Text
          style={[
            styles.groupFooter,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {footer}
        </Text>
      )}
    </View>
  );
}

/**
 * Settings Group Item View
 */
function SettingsGroupItemView({
  item,
  isFirst,
  isLast,
  colors,
}: {
  item: SettingsGroupItem;
  isFirst: boolean;
  isLast: boolean;
  colors: any;
}) {
  const isPressable = item.pressable ?? !!item.onPress;

  const content = (
    <View
      style={[
        styles.item,
        {
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.separator,
        },
      ]}
    >
      <Text
        style={[
          styles.itemLabel,
          {
            color: colors.textPrimary,
          },
        ]}
      >
        {item.label}
      </Text>

      <View style={styles.itemRight}>
        {item.value && (
          <Text
            style={[
              styles.itemValue,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {item.value}
          </Text>
        )}

        {item.selected && (
          <Text
            style={[
              styles.checkmark,
              {
                color: colors.accent,
              },
            ]}
          >
            ✓
          </Text>
        )}
      </View>
    </View>
  );

  if (isPressable) {
    return (
      <TouchableOpacity onPress={item.onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: Spacing.lg,
  },
  groupTitle: {
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.regular,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.md,
  },
  itemsContainer: {
    borderRadius: BorderRadius.large,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  itemLabel: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
    marginRight: Spacing.sm,
  },
  checkmark: {
    fontSize: FontSizes.title2,
    fontWeight: FontWeights.semibold,
  },
  childrenContainer: {
    borderRadius: BorderRadius.large,
    padding: Spacing.md,
  },
  groupFooter: {
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.regular,
    marginTop: Spacing.sm,
    marginLeft: Spacing.md,
    marginRight: Spacing.md,
  },
});
