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
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { List, Moon, Sun, Monitor, Info, Sparkle, Bug, Check } from 'phosphor-react-native';
import { setDebugLanguage, SUPPORTED_LOCALES, SupportedLocale } from '@/services/i18n-service';
import { SettingsGroup } from '@/components/settings-group';
import { TimelineManagementModal } from '@/components/timeline-management-modal';
import { updateThemeMode, getThemeMode, updateGridColorTheme, getGridColorTheme } from '@/services/storage';
import { ThemeMode, GridColorTheme } from '@/types/timeline';
import { isPro } from '@/services/revenue-cat-service';
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
  Layout,
  BorderRadius,
  GridColorPalettes,
} from '@/constants/theme';
import { debugWidgetSync } from '@/scripts/debug-widget-sync';

/**
 * Mini 4x4 dot grid preview for color palette selection
 */
function MiniColorPreview({ filledColor, emptyColor }: { filledColor: string; emptyColor: string }) {
  const DOT_SIZE = 8;
  const GAP = 3;
  const FILLED_COUNT = 6; // First 6 of 16 dots filled

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: DOT_SIZE * 4 + GAP * 3, gap: GAP, marginBottom: Spacing.xs }}>
      {Array.from({ length: 16 }, (_, i) => (
        <View
          key={i}
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_SIZE / 2,
            backgroundColor: i < FILLED_COUNT ? filledColor : emptyColor,
          }}
        />
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const appVersion = Constants.expoConfig?.version ?? '1.0.6';

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
        t('settings.debugComplete'),
        t('settings.debugCompleteMessage'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Debug error:', error);
      Alert.alert(
        t('settings.debugError'),
        error instanceof Error ? error.message : 'Unknown error occurred',
        [{ text: t('common.ok') }]
      );
    }
  };

  // MARK: Debug Language Selector (geçici — build öncesi kaldırılacak)
  const languageOptions: { label: string; code: SupportedLocale | 'auto' }[] = [
    { label: t('settings.auto'), code: 'auto' },
    { label: 'English', code: 'en' },
    { label: 'Türkçe', code: 'tr' },
    { label: 'Français', code: 'fr' },
    { label: '中文', code: 'zh' },
    { label: 'Español', code: 'es' },
    { label: 'العربية', code: 'ar' },
    { label: 'Dansk', code: 'da' },
    { label: 'Ελληνικά', code: 'el' },
    { label: 'Русский', code: 'ru' },
  ];

  const handleLanguageChange = async (code: SupportedLocale | 'auto') => {
    await setDebugLanguage(code);
  };

  /**
   * Timeline management settings
   */
  const timelineItems = [
    {
      label: t('settings.manageTimelines'),
      onPress: () => setShowTimelineManagement(true),
      icon: <List size={20} color={colors.accent} weight="regular" />,
      showChevron: true,
    },
  ];

  /**
   * Appearance settings (rendered as horizontal buttons)
   */
  const appearanceThemes = [
    {
      mode: 'system' as ThemeMode,
      label: t('settings.system'),
      icon: <Monitor size={20} color={colors.accent} weight="regular" />,
    },
    {
      mode: 'light' as ThemeMode,
      label: t('settings.light'),
      icon: <Sun size={20} color={colors.accent} weight="regular" />,
    },
    {
      mode: 'dark' as ThemeMode,
      label: t('settings.dark'),
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
          label: t('settings.subscriptionStatus'),
          value: t('settings.pro'),
          pressable: false,
          icon: <Info size={20} color={colors.accent} weight="regular" />,
        },
        {
          label: t('settings.manageSubscription'),
          onPress: () => router.push('/customer-center'),
          icon: <Sparkle size={20} color="#FFD700" weight="fill" />,
          showChevron: true,
        },
      ]
    : [
        {
          label: t('settings.subscriptionStatus'),
          value: t('settings.free'),
          pressable: false,
          icon: <Info size={20} color={colors.accent} weight="regular" />,
        },
        {
          label: t('settings.upgradeToPro'),
          onPress: () => router.push('/paywall'),
          icon: <Sparkle size={20} color="#FFD700" weight="fill" />,
          showChevron: true,
          variant: 'upgrade' as const,
        },
      ];

  /**
   * About settings
   */
  const aboutItems = [
    {
      label: t('settings.version'),
      value: appVersion,
      pressable: false,
      icon: <Info size={20} color={colors.accent} weight="regular" />,
    },
    {
      label: t('settings.privacyPolicy'),
      onPress: () => Linking.openURL('https://memento-calendar.pages.dev/privacy-policy'),
      icon: <Info size={20} color={colors.accent} weight="regular" />,
      showChevron: true,
    },
    {
      label: t('settings.termsOfUse'),
      onPress: () => Linking.openURL('https://memento-calendar.pages.dev/terms-of-use'),
      icon: <Info size={20} color={colors.accent} weight="regular" />,
      showChevron: true,
    },
    {
      label: t('settings.website'),
      onPress: () => Linking.openURL('https://memento-calendar.pages.dev/'),
      icon: <Info size={20} color={colors.accent} weight="regular" />,
      showChevron: true,
    },
    {
      label: t('settings.contact'),
      onPress: () => Linking.openURL('mailto:stoic-calendar@forvibe.app'),
      icon: <Info size={20} color={colors.accent} weight="regular" />,
      showChevron: true,
    },
  ];

  /**
   * Debug settings (only in __DEV__ mode)
   */
  const debugItems = __DEV__
    ? [
        {
          label: t('settings.debugWidgetSync'),
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
      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Spacing.lg,
            paddingBottom: Spacing.xxl,
          },
        ]}
      >
        {/* Timelines - 100ms delay */}
        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <SettingsGroup title={t('settings.timelines')} items={timelineItems} />
        </Animated.View>

        {/* Appearance - 200ms delay */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <SettingsGroup title={t('settings.appearance')} items={[]}>
            <View style={styles.appearanceContainer}>
              {appearanceThemes.map((theme) => {
                const isSelected = currentTheme === theme.mode;
                return (
                  <TouchableOpacity
                    key={theme.mode}
                    style={[
                      styles.appearanceItem,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: isSelected ? colors.accent : 'transparent',
                      },
                      isSelected && {
                        shadowColor: colors.accent,
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 4,
                      },
                    ]}
                    onPress={() => handleThemeChange(theme.mode)}
                    activeOpacity={0.6}
                  >
                    {theme.icon}
                    <Text
                      style={[
                        styles.appearanceLabel,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {theme.label}
                    </Text>
                    {isSelected && (
                      <Check size={20} color={colors.accent} weight="bold" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </SettingsGroup>
        </Animated.View>

        {/* Grid Colors - 300ms delay */}
        <Animated.View entering={FadeInDown.duration(300).delay(300)}>
          <SettingsGroup title={t('settings.gridColors')} items={[]}>
            <View style={styles.colorPaletteContainer}>
              {(['classic', 'forest', 'sunset', 'monochrome'] as const).map((key) => {
                const palette = GridColorPalettes[key];
                const isSelected = currentGridColorTheme === key;
                const filledColor = colorScheme === 'dark'
                  ? palette.dark.dotFilled
                  : palette.light.dotFilled;
                const emptyColor = colorScheme === 'dark'
                  ? palette.dark.dotEmpty
                  : palette.light.dotEmpty;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.colorPaletteItem,
                      {
                        borderColor: isSelected ? colors.accent : 'transparent',
                      },
                      isSelected && {
                        shadowColor: colors.accent,
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 4,
                      },
                    ]}
                    onPress={() => handleGridColorThemeChange(key)}
                    activeOpacity={0.6}
                  >
                    <MiniColorPreview filledColor={filledColor} emptyColor={emptyColor} />
                    <Text
                      style={[
                        styles.colorPaletteLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {palette.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
            <SettingsGroup title={t('settings.subscription')} items={premiumItems} />
          )}
        </Animated.View>

        {/* Debug (development only) - 500ms delay */}
        {__DEV__ && (
          <Animated.View entering={FadeInDown.duration(300).delay(500)}>
            <SettingsGroup title={t('settings.debug')} items={debugItems} />
          </Animated.View>
        )}

        {/* MARK: Debug Language Selector — remove before release build */}
        {__DEV__ && (
          <Animated.View entering={FadeInDown.duration(300).delay(550)}>
            <SettingsGroup title={t('settings.language')} items={[]}>
              <View style={styles.appearanceContainer}>
                {languageOptions.map((opt) => {
                  const isSelected =
                    opt.code === 'auto'
                      ? !SUPPORTED_LOCALES.includes(i18n.language as SupportedLocale)
                      : i18n.language === opt.code;
                  return (
                    <TouchableOpacity
                      key={opt.code}
                      style={[
                        styles.appearanceItem,
                        {
                          backgroundColor: colors.cardBackground,
                          borderColor: isSelected ? colors.accent : 'transparent',
                        },
                        isSelected && {
                          shadowColor: colors.accent,
                          shadowOpacity: 0.25,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 4,
                        },
                      ]}
                      onPress={() => handleLanguageChange(opt.code)}
                      activeOpacity={0.6}
                    >
                      <Text style={[styles.appearanceLabel, { color: colors.textPrimary }]}>
                        {opt.label}
                      </Text>
                      {isSelected && <Check size={16} color={colors.accent} weight="bold" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </SettingsGroup>
          </Animated.View>
        )}

        {/* Philosophy - 600ms delay */}
        <Animated.View entering={FadeInDown.duration(300).delay(600)}>
          <SettingsGroup title={t('settings.philosophy')} items={[]}>
            <View style={styles.philosophyContainer}>
              <Text
                style={[
                  styles.philosophyQuote,
                  {
                    fontFamily: Fonts.serif,
                    color: colors.textSecondary,
                  },
                ]}
              >
                {t('settings.philosophyQuote')}
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
                {t('settings.philosophyBody')}
              </Text>
            </View>
          </SettingsGroup>
        </Animated.View>

        {/* About - 700ms delay */}
        <Animated.View entering={FadeInDown.duration(300).delay(700)}>
          <SettingsGroup title={t('settings.about')} items={aboutItems} />
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
  appearanceContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  appearanceItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.medium,
    borderWidth: 1.5,
    gap: 4,
  },
  appearanceLabel: {
    fontSize: FontSizes.caption1,
    fontWeight: FontWeights.medium,
  },
  colorPaletteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  colorPaletteItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.medium,
    borderWidth: 1.5,
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
    fontSize: FontSizes.title3,
    fontStyle: 'italic',
    lineHeight: 28,
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
