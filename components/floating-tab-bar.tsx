/**
 * Floating Tab Bar Component
 * Custom tab bar with floating design (iOS 26 aesthetic)
 *
 * Design Specs:
 * - Detached from screen edges (16px bottom margin)
 * - Width: screen width - 32px (16px side margins)
 * - Height: 64px
 * - Background: rgba with blur
 * - Border radius: 20px (continuous corners)
 * - Subtle shadow
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
} from '@/constants/theme';

/**
 * Tab Icon Component
 * Simple icon using Unicode symbols for now (can be replaced with custom icons)
 */
function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = {
    home: '▦', // Grid symbol
    timelines: '☰', // Horizontal lines
    settings: '⚙', // Gear
  };

  return (
    <View style={styles.iconContainer}>
      <View
        style={[
          styles.icon,
          {
            opacity: focused ? 1 : 0.6,
          },
        ]}
      >
        <View style={styles.iconText}>
          <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
            {name === 'home' && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 16, height: 16 }}>
                {[...Array(4)].map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      backgroundColor: color,
                      margin: 1,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </View>
            )}
            {name === 'timelines' && (
              <View style={{ gap: 2 }}>
                {[...Array(3)].map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 18,
                      height: 2,
                      backgroundColor: color,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </View>
            )}
            {name === 'settings' && (
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: color,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: color,
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Floating Tab Bar Component
 */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={styles.container}>
      <BlurView
        intensity={80}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={[
          styles.tabBar,
          {
            backgroundColor:
              colorScheme === 'dark'
                ? 'rgba(28, 28, 30, 0.8)'
                : 'rgba(242, 242, 247, 0.8)',
          },
          Shadows.medium,
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            // Haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconColor = isFocused ? colors.tabIconActive : colors.tabIconInactive;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.6}
            >
              <TabIcon name={route.name} focused={isFocused} color={iconColor} />
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Layout.tabBarBottomMargin,
    left: Layout.tabBarSideMargin,
    right: Layout.tabBarSideMargin,
  },
  tabBar: {
    flexDirection: 'row',
    height: Layout.tabBarHeight,
    borderRadius: BorderRadius.xlarge,
    overflow: 'hidden',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
