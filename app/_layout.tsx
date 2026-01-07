/**
 * Root Layout
 * Main app entry point with theme provider and RevenueCat initialization
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { initializeRevenueCat } from '@/services/revenue-cat-service';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize RevenueCat on app start
  useEffect(() => {
    initializeRevenueCat().catch((error) => {
      console.error('Failed to initialize RevenueCat:', error);
    });
  }, []);

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
