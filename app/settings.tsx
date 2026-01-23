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
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { List, Moon, Sun, Monitor, Info, Crown, Bug } from 'phosphor-react-native';
import { SettingsGroup } from '@/components/settings-group';
import { TimelineManagementModal } from '@/components/timeline-management-modal';
import { updateThemeMode, getThemeMode, updateGridColorTheme, getGridColorTheme } from '@/services/storage';
import { ThemeMode, GridColorTheme } from '@/types/timeline';
import { isPro } from '@/services/revenue-cat-service';
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  Layout,
  GridColorPalettes,
} from '@/constants/theme';
import { debugWidgetSync } from '@/scripts/debug-widget-sync';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();

  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('dark');
  const [currentGridColorTheme, setCurrentGridColorTheme] = useState<GridColorTheme>('classic');
  const [hasPro, setHasPro] = useState<boolean>(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState<boolean>(true);
  const [showTimelineManagement, setShowTimelineManagement] = useState<boolean>(false);

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
   * Load current grid color theme
   */
  const loadGridColorTheme = useCallback(async () => {
    try {
      const theme = await getGridColorTheme();
      setCurrentGridColorTheme(theme);
    } catch (error) {
      console.error('Error loading grid color theme:', error);
    }
  }, []);

  /**
   * Load subscription status
   */
  const loadSubscriptionStatus = useCallback(async () => {
    try {
      setIsLoadingSubscription(true);
      const proStatus = await isPro();
      setHasPro(proStatus);
    } catch (error) {
      console.error('Error loading subscription status:', error);
      setHasPro(false);
    } finally {
      setIsLoadingSubscription(false);
    }
  }, []);

  /**
   * Load settings when screen comes into focus
   */
  useFocusEffect(
    useCallback(() => {
      loadThemeSetting();
      loadGridColorTheme();
      loadSubscriptionStatus();
    }, [loadThemeSetting, loadGridColorTheme, loadSubscriptionStatus])
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
   * Handle grid color theme change
   */
  const handleGridColorThemeChange = async (theme: GridColorTheme) => {
    try {
      await updateGridColorTheme(theme);
      setCurrentGridColorTheme(theme);
    } catch (error) {
      console.error('Error updating grid color theme:', error);
    }
  };

  /**
   * Debug widget sync
   */
  const handleDebugWidgetSync = async () => {
    try {
      console.log('\n🔍 Running widget sync debug...\n');
      await debugWidgetSync();
      Alert.alert(
        'Widget Debug Complete',
        'Check the console logs for detailed information about widget sync status.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Debug error:', error);
      Alert.alert(
        'Debug Error',
        error instanceof Error ? error.message : 'Unknown error occurred',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Timeline management settings
   */
  const timelineItems = [
    {
      label: 'Manage Timelines',
      onPress: () => setShowTimelineManagement(true),
      icon: <List size={20} color={colors.accent} weight="regular" />,
      showChevron: true,
    },
  ];

  /**
   * Appearance settings
   */
  const appearanceItems = [
    {
      label: 'System',
      selected: currentTheme === 'system',
      onPress: () => handleThemeChange('system'),
      icon: <Monitor size={20} color={colors.accent} weight="regular" />,
    },
    {
      label: 'Light',
      selected: currentTheme === 'light',
      onPress: () => handleThemeChange('light'),
      icon: <Sun size={20} color={colors.accent} weight="regular" />,
    },
    {
      label: 'Dark',
      selected: currentTheme === 'dark',
      onPress: () => handleThemeChange('dark'),
      icon: <Moon size={20} color={colors.accent} weight="regular" />,
    },
  ];

  /**
   * Premium settings
   */
  const premiumItems = isLoadingSubscription
    ? []
    : hasPro
    ? [
        {
          label: 'Subscription Status',
          value: 'Pro',
          pressable: false,
          icon: <Info size={20} color={colors.accent} weight="regular" />,
        },
        {
          label: 'Manage Subscription',
          onPress: () => router.push('/customer-center'),
          icon: <Crown size={20} color="#FFD700" weight="fill" />,
          showChevron: true,
        },
      ]
    : [
        {
          label: 'Subscription Status',
          value: 'Free',
          pressable: false,
          icon: <Info size={20} color={colors.accent} weight="regular" />,
        },
        {
          label: 'Upgrade to Pro',
          onPress: () => router.push('/paywall'),
          icon: <Crown size={20} color="#FFD700" weight="fill" />,
          showChevron: true,
          variant: 'upgrade' as const,
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
      icon: <Info size={20} color={colors.accent} weight="regular" />,
    },
    {
      label: 'Build',
      value: 'MVP',
      pressable: false,
      icon: <Info size={20} color={colors.accent} weight="regular" />,
    },
  ];

  /**
   * Debug settings (only in __DEV__ mode)
   */
  const debugItems = __DEV__
    ? [
        {
          label: 'Debug Widget Sync',
          onPress: handleDebugWidgetSync,
          icon: <Bug size={20} color={colors.accent} weight="regular" />,
        },
      ]
    : [];

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Header - FadeIn */}
      <Animated.View style={styles.header} entering={FadeIn.duration(400)}>
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
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Spacing.md,
          },
        ]}
      >
        {/* Timelines - 100ms delay */}
        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <SettingsGroup title="Timelines" items={timelineItems} />
        </Animated.View>

        {/* Appearance - 200ms delay */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <SettingsGroup title="Appearance" items={appearanceItems} />
        </Animated.View>

        {/* Grid Colors - 300ms delay */}
        <Animated.View entering={FadeInDown.duration(300).delay(300)}>
          <SettingsGroup title="Grid Colors" items={[]}>
            <View style={styles.colorPaletteContainer}>
              {/* Classic Blue */}
              <TouchableOpacity
                style={styles.colorPaletteItem}
                onPress={() => handleGridColorThemeChange('classic')}
                activeOpacity={0.6}
              >
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor: colorScheme === 'dark'
                        ? GridColorPalettes.classic.dark.dotFilled
                        : GridColorPalettes.classic.light.dotFilled,
                    },
                    currentGridColorTheme === 'classic' && {
                      borderColor: colors.accent,
                      borderWidth: 3,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.colorPaletteLabel,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {GridColorPalettes.classic.name}
                </Text>
              </TouchableOpacity>

              {/* Forest Green */}
              <TouchableOpacity
                style={styles.colorPaletteItem}
                onPress={() => handleGridColorThemeChange('forest')}
                activeOpacity={0.6}
              >
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor: colorScheme === 'dark'
                        ? GridColorPalettes.forest.dark.dotFilled
                        : GridColorPalettes.forest.light.dotFilled,
                    },
                    currentGridColorTheme === 'forest' && {
                      borderColor: colors.accent,
                      borderWidth: 3,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.colorPaletteLabel,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {GridColorPalettes.forest.name}
                </Text>
              </TouchableOpacity>

              {/* Sunset Orange */}
              <TouchableOpacity
                style={styles.colorPaletteItem}
                onPress={() => handleGridColorThemeChange('sunset')}
                activeOpacity={0.6}
              >
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor: colorScheme === 'dark'
                        ? GridColorPalettes.sunset.dark.dotFilled
                        : GridColorPalettes.sunset.light.dotFilled,
                    },
                    currentGridColorTheme === 'sunset' && {
                      borderColor: colors.accent,
                      borderWidth: 3,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.colorPaletteLabel,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {GridColorPalettes.sunset.name}
                </Text>
              </TouchableOpacity>

              {/* Monochrome */}
              <TouchableOpacity
                style={styles.colorPaletteItem}
                onPress={() => handleGridColorThemeChange('monochrome')}
                activeOpacity={0.6}
              >
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor: colorScheme === 'dark'
                        ? GridColorPalettes.monochrome.dark.dotFilled
                        : GridColorPalettes.monochrome.light.dotFilled,
                    },
                    currentGridColorTheme === 'monochrome' && {
                      borderColor: colors.accent,
                      borderWidth: 3,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.colorPaletteLabel,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {GridColorPalettes.monochrome.name}
                </Text>
              </TouchableOpacity>
            </View>
          </SettingsGroup>
        </Animated.View>

        {/* Premium - 400ms delay */}
        <Animated.View entering={FadeInDown.duration(300).delay(400)}>
          {isLoadingSubscription ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          ) : (
            <SettingsGroup title="Subscription" items={premiumItems} />
          )}
        </Animated.View>

        {/* About - 500ms delay */}
        <Animated.View entering={FadeInDown.duration(300).delay(500)}>
          <SettingsGroup title="About" items={aboutItems} />
        </Animated.View>

        {/* Debug (development only) - 600ms delay */}
        {__DEV__ && (
          <Animated.View entering={FadeInDown.duration(300).delay(600)}>
            <SettingsGroup title="Debug" items={debugItems} />
          </Animated.View>
        )}

        {/* Philosophy - 700ms delay */}
        <Animated.View entering={FadeInDown.duration(300).delay(700)}>
          <SettingsGroup title="Philosophy" items={[]}>
            <View style={styles.philosophyContainer}>
              <Text
                style={[
                  styles.philosophyQuote,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                &ldquo;Time is presented neutrally, calmly, and honestly.&rdquo;
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
        </Animated.View>
      </ScrollView>

      {/* Timeline Management Modal */}
      <TimelineManagementModal
        visible={showTimelineManagement}
        onClose={() => setShowTimelineManagement(false)}
      />
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
  loadingContainer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  colorPaletteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  colorPaletteItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: Spacing.xs,
  },
  colorPaletteLabel: {
    fontSize: FontSizes.caption1,
    textAlign: 'center',
  },
  philosophyContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  philosophyQuote: {
    fontSize: FontSizes.body,
    fontStyle: 'italic',
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
