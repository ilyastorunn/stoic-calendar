/**
 * Customer Center Screen
 * Presents RevenueCat Customer Center UI for subscription management
 *
 * Features:
 * - View subscription status
 * - Manage subscription
 * - Cancel or change plans
 * - Contact support
 */

import { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { RevenueCatUI, CUSTOMER_CENTER_RESULT } from 'react-native-purchases-ui';
import { getCustomerInfo } from '@/services/revenue-cat-service';

export default function CustomerCenterScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [customerCenterPresented, setCustomerCenterPresented] = useState(false);

  useEffect(() => {
    presentCustomerCenter();
  }, []);

  const presentCustomerCenter = async () => {
    try {
      setIsLoading(true);

      // Check if user has active subscription before showing customer center
      const customerInfo = await getCustomerInfo();
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;

      if (!hasActiveSubscription) {
        // If no active subscription, show alert and go back
        Alert.alert(
          'No Active Subscription',
          'You don\'t have an active subscription. Would you like to subscribe?',
          [
            {
              text: 'Subscribe',
              onPress: () => {
                router.back();
                router.push('/paywall');
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => router.back(),
            },
          ]
        );
        setIsLoading(false);
        return;
      }

      // Present the customer center using RevenueCat UI
      // This will show a pre-built screen for managing subscriptions
      const customerCenterResult = await RevenueCatUI.presentCustomerCenter();

      setCustomerCenterPresented(true);

      // Handle customer center result
      switch (customerCenterResult) {
        case CUSTOMER_CENTER_RESULT.RESTORED:
          // Purchases were restored
          Alert.alert(
            'Purchases Restored',
            'Your purchases have been restored successfully.',
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );
          break;

        case CUSTOMER_CENTER_RESULT.CLOSED:
          // User closed the customer center
          console.log('User closed customer center');
          router.back();
          break;

        case CUSTOMER_CENTER_RESULT.ERROR:
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
      }
    } catch (error) {
      console.error('Error presenting customer center:', error);
      Alert.alert(
        'Error',
        'Failed to load subscription management. Please try again.',
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

  // Show loading state while customer center is being presented
  if (isLoading || !customerCenterPresented) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading subscription management...</Text>
      </View>
    );
  }

  // Return null once customer center is presented (it will be shown as a native modal)
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
