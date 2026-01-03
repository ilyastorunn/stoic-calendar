/**
 * Settings Screen
 * App settings and information
 *
 * Sections:
 * - Appearance (theme selection)
 * - About (version, build)
 * - Philosophy (app description)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  Appearance,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SettingsGroup } from '@/components/settings-group';
import { updateThemeMode, getThemeMode } from '@/services/storage';
import { ThemeMode } from '@/types/timeline';
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  Layout,
} from '@/constants/theme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('dark');

  /**
   * Load current theme setting
   */
  const loadThemeSetting = useCallback(async () => {
    try {
      const theme = await getThemeMode();
      setCurrentTheme(theme);
    } catch (error) {
      console.error('Error loading theme setting:', error);
    }
  }, []);

  /**
   * Load settings when screen comes into focus
   */
  useFocusEffect(
    useCallback(() => {
      loadThemeSetting();
    }, [loadThemeSetting])
  );

  /**
   * Handle theme change
   */
  const handleThemeChange = async (mode: ThemeMode) => {
    try {
      await updateThemeMode(mode);
      setCurrentTheme(mode);

      // Apply theme
      if (mode === 'system') {
        Appearance.setColorScheme(null); // Use system default
      } else {
        Appearance.setColorScheme(mode);
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  /**
   * Appearance settings
   */
  const appearanceItems = [
    {
      label: 'System',
      selected: currentTheme === 'system',
      onPress: () => handleThemeChange('system'),
    },
    {
      label: 'Light',
      selected: currentTheme === 'light',
      onPress: () => handleThemeChange('light'),
    },
    {
      label: 'Dark',
      selected: currentTheme === 'dark',
      onPress: () => handleThemeChange('dark'),
    },
  ];

  /**
   * About settings
   */
  const aboutItems = [
    {
      label: 'Version',
      value: '1.0.0',
      pressable: false,
    },
    {
      label: 'Build',
      value: 'MVP',
      pressable: false,
    },
  ];

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
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
            },
          ]}
        >
          Settings
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Layout.tabBarHeight + Layout.tabBarBottomMargin + Spacing.md,
          },
        ]}
      >
        {/* Appearance */}
        <SettingsGroup title="Appearance" items={appearanceItems} />

        {/* About */}
        <SettingsGroup title="About" items={aboutItems} />

        {/* Philosophy */}
        <SettingsGroup title="Philosophy" items={[]}>
          <View style={styles.philosophyContainer}>
            <Text
              style={[
                styles.philosophyQuote,
                {
                  color: colors.textSecondary,
                  fontStyle: 'italic',
                },
              ]}
            >
              "Time is presented neutrally, calmly, and honestly."
            </Text>

            <View style={styles.philosophyDivider} />

            <Text
              style={[
                styles.philosophyBody,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Stoic Calendar exists to make time visible, not actionable. No urgency, no
              productivity pressure, no gamification.
            </Text>
          </View>
        </SettingsGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.largeTitle,
    fontWeight: FontWeights.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
  },
  philosophyContainer: {
    paddingVertical: Spacing.sm,
  },
  philosophyQuote: {
    fontSize: FontSizes.body,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  philosophyDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(142, 142, 147, 0.3)',
    marginVertical: Spacing.md,
  },
  philosophyBody: {
    fontSize: FontSizes.subheadline,
    lineHeight: 22,
    textAlign: 'center',
  },
});
