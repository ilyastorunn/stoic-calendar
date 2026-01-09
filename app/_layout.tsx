/**
 * Root Layout
 * Main app entry point with theme provider and RevenueCat initialization
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import 'react-native-reanimated';
import { initializeRevenueCat } from '@/services/revenue-cat-service';
import { syncAllWidgetData } from '@/services/widget-data-service';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Initialize RevenueCat and widget data sync on app start
  useEffect(() => {
    initializeRevenueCat().catch((error) => {
      console.error('Failed to initialize RevenueCat:', error);
    });

    // Sync timeline and settings data to widgets
    syncAllWidgetData().catch((error) => {
      console.error('Failed to sync widget data:', error);
    });
  }, []);

  // Handle deep linking from widgets
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url === 'stoiccalendar://home') {
        router.push('/(tabs)/home');
      }
    });

    return () => subscription.remove();
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'modal',
            title: 'Upgrade to Pro',
            headerShown: true,
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
