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
import { initializeRevenueCat } from '@/services/revenue-cat-service';
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

  // State for user's theme preference
  const [userThemeMode, setUserThemeMode] = useState<ThemeMode>('dark');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

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
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      }
      // Sync after RC is ready (syncAllWidgetData uses isPro internally)
      await syncAllWidgetData().catch((error) => {
        console.error('Failed to sync widget data:', error);
      });
    };
    init();
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

  // Don't render until theme and fonts are loaded to prevent flash
  if (!isThemeLoaded || !fontsLoaded) {
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
            title: 'Settings',
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
            title: 'Manage Subscription',
            headerShown: true,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
