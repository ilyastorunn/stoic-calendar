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
import { CaretRight } from 'phosphor-react-native';
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
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

  /**
   * Icon component (left side)
   */
  icon?: React.ReactNode;

  /**
   * Show chevron on the right (for navigable items)
   */
  showChevron?: boolean;

  /**
   * Special styling variant
   */
  variant?: 'default' | 'upgrade';
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
  const variant = item.variant ?? 'default';

  const content = (
    <View
      style={[
        styles.item,
        {
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.separator,
        },
        variant === 'upgrade' && [
          styles.itemUpgrade,
          { borderLeftWidth: 3, borderLeftColor: '#007AFF' },
        ],
      ]}
    >
      {/* Left side: Icon + Label */}
      <View style={styles.itemLeft}>
        {item.icon && <View style={styles.itemIcon}>{item.icon}</View>}
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
      </View>

      {/* Right side: Value + Checkmark + Chevron */}
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

        {item.showChevron && (
          <CaretRight size={16} color={colors.textTertiary} weight="bold" />
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
    marginBottom: Spacing.xl,
  },
  groupTitle: {
    fontSize: FontSizes.subheadline,
    fontWeight: FontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.md,
  },
  itemsContainer: {
    borderRadius: BorderRadius.large,
    overflow: 'hidden',
    ...Shadows.small,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  itemUpgrade: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: Spacing.sm + 4, // 12px gap
  },
  itemLabel: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  itemValue: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
  },
  checkmark: {
    fontSize: FontSizes.title2,
    fontWeight: FontWeights.semibold,
  },
  childrenContainer: {
    borderRadius: BorderRadius.large,
    padding: Spacing.md,
    ...Shadows.small,
  },
  groupFooter: {
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.regular,
    marginTop: Spacing.sm,
    marginLeft: Spacing.md,
    marginRight: Spacing.md,
  },
});
