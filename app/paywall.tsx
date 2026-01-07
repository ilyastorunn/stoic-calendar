/**
 * Paywall Screen
 * Presents RevenueCat Paywall UI for subscription purchases
 *
 * Products: monthly, yearly
 * Entitlement: Memento Calendar Pro
 */

import { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { RevenueCatUI, PAYWALL_RESULT } from 'react-native-purchases-ui';
import { getCustomerInfo } from '@/services/revenue-cat-service';

export default function PaywallScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [paywallPresented, setPaywallPresented] = useState(false);

  useEffect(() => {
    presentPaywall();
  }, []);

  const presentPaywall = async () => {
    try {
      setIsLoading(true);

      // Present the paywall using RevenueCat UI
      // This will show a pre-built paywall screen with your configured offerings
      const paywallResult = await RevenueCatUI.presentPaywall();

      setPaywallPresented(true);

      // Handle paywall result
      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          // Purchase or restore successful
          const customerInfo = await getCustomerInfo();
          const hasProAccess =
            customerInfo.entitlements.active['Memento Calendar Pro'] !== undefined;

          if (hasProAccess) {
            Alert.alert(
              'Welcome to Pro!',
              'You now have access to all premium features.',
              [
                {
                  text: 'Get Started',
                  onPress: () => router.back(),
                },
              ]
            );
          }
          break;

        case PAYWALL_RESULT.CANCELLED:
          // User cancelled
          console.log('User cancelled paywall');
          router.back();
          break;

        case PAYWALL_RESULT.ERROR:
          // Error occurred
          Alert.alert(
            'Error',
            'Something went wrong. Please try again.',
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );
          break;

        case PAYWALL_RESULT.NOT_PRESENTED:
          // Paywall not presented (no offering configured in RevenueCat dashboard)
          Alert.alert(
            'Not Available',
            'Subscription options are not available at the moment. Please configure offerings in RevenueCat dashboard.',
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );
          break;
      }
    } catch (error) {
      console.error('Error presenting paywall:', error);
      Alert.alert(
        'Error',
        'Failed to load subscription options. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while paywall is being presented
  if (isLoading || !paywallPresented) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </View>
    );
  }

  // Return null once paywall is presented (it will be shown as a native modal)
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
});
