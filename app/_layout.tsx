/**
 * Root Layout
 * Main app entry point with theme provider and RevenueCat initialization
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Appearance } from 'react-native';
import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import 'react-native-reanimated';
import {
  hasActiveEntitlement,
  initializeRevenueCat,
  setCustomerInfoUpdateCallback,
} from '@/services/revenue-cat-service';
import { syncAllWidgetData } from '@/services/widget-data-service';
import { getThemeMode } from '@/services/storage';
import { ThemeMode } from '@/types/timeline';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import { initI18n } from '@/services/i18n-service';
import { useTranslation } from 'react-i18next';

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const router = useRouter();

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'CormorantGaramond-Light': CormorantGaramond_300Light,
    'CormorantGaramond-Regular': CormorantGaramond_400Regular,
    'CormorantGaramond-Medium': CormorantGaramond_500Medium,
    'CormorantGaramond-SemiBold': CormorantGaramond_600SemiBold,
  });

  const { t } = useTranslation();

  // State for user's theme preference
  const [userThemeMode, setUserThemeMode] = useState<ThemeMode>('dark');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [isI18nReady, setIsI18nReady] = useState(false);

  // Initialize i18n on app start
  useEffect(() => {
    initI18n()
      .then(() => setIsI18nReady(true))
      .catch((err) => {
        console.error('Failed to init i18n:', err);
        setIsI18nReady(true); // Proceed with fallback
      });
  }, []);

  // Load user's theme preference from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const themeMode = await getThemeMode();
        setUserThemeMode(themeMode);

        // Apply theme immediately
        if (themeMode === 'system') {
          Appearance.setColorScheme(null);
        } else {
          Appearance.setColorScheme(themeMode);
        }

        setIsThemeLoaded(true);
      } catch (error) {
        console.error('Failed to load theme:', error);
        setIsThemeLoaded(true);
      }
    };

    loadTheme();
  }, []);

  // Listen for appearance changes (from settings screen)
  useEffect(() => {
    const subscription = Appearance.addChangeListener(async () => {
      // Reload theme preference when appearance changes
      const themeMode = await getThemeMode();
      setUserThemeMode(themeMode);
    });

    return () => subscription.remove();
  }, []);

  // Initialize RevenueCat and widget data sync on app start
  useEffect(() => {
    const init = async () => {
      try {
        await initializeRevenueCat();

        // Set up listener to sync widget pro status on any subscription change
        setCustomerInfoUpdateCallback(async (customerInfo) => {
          try {
            const { syncProStatusToWidget } = await import('@/services/widget-data-service');
            await syncProStatusToWidget(hasActiveEntitlement(customerInfo));
          } catch (e) {
            console.warn('Widget sync after CustomerInfo update failed:', e);
          }
        });

        // Warm the cached customer state without forcing a restore flow on launch.
        const { getCustomerInfo } = await import('@/services/revenue-cat-service');
        await getCustomerInfo().catch((e) =>
          console.warn('Initial customer info refresh failed (non-fatal):', e)
        );
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      }
      // Sync after RC is ready (syncAllWidgetData uses isPro internally)
      await syncAllWidgetData().catch((error) => {
        console.error('Failed to sync widget data:', error);
      });
    };
    init();

    return () => {
      setCustomerInfoUpdateCallback(null);
    };
  }, []);

  // Handle deep linking from widgets
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url === 'stoiccalendar://home') {
        router.push('/home');
      } else if (url === 'stoiccalendar://paywall') {
        router.push('/paywall');
      }
    });

    return () => subscription.remove();
  }, [router]);

  // Determine effective color scheme
  const effectiveColorScheme = userThemeMode === 'system'
    ? systemColorScheme
    : userThemeMode;

  // Don't render until theme, fonts, and i18n are ready to prevent flash
  if (!isThemeLoaded || !fontsLoaded || !isI18nReady) {
    return null;
  }

  return (
    <ThemeProvider value={effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: t('settings.title'),
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="customer-center"
          options={{
            presentation: 'modal',
            title: t('settings.manageSubscription'),
            headerShown: true,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
