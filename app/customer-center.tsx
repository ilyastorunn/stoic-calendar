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

import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import RevenueCatUI from 'react-native-purchases-ui';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export default function CustomerCenterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const presentCustomerCenter = useCallback(async () => {
    try {
      setIsLoading(true);
      await RevenueCatUI.presentCustomerCenter();
      router.back();
    } catch (error) {
      console.error('Error presenting customer center:', error);

      try {
        await Linking.openURL(APPLE_SUBSCRIPTIONS_URL);
        router.back();
        return;
      } catch (linkingError) {
        console.error('Error opening Apple subscriptions page:', linkingError);
      }

      Alert.alert(t('common.error'), t('customerCenter.errorMessage'), [
        {
          text: t('common.ok'),
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [router, t]);

  useEffect(() => {
    presentCustomerCenter();
  }, [presentCustomerCenter]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('customerCenter.loading')}</Text>
      </View>
    );
  }

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
