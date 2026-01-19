/**
 * Paywall Screen
 * Custom paywall UI for Stoic Calendar Pro subscription
 *
 * Features:
 * - Lock Screen Widgets
 * - Customizable Widgets
 * - Unlimited Timelines
 *
 * Products: monthly, yearly
 * Entitlement: Memento Calendar Pro
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  useColorScheme,
  Linking,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { PurchasesPackage } from 'react-native-purchases';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '@/services/revenue-cat-service';
import { FeatureCarousel } from '@/components/paywall/feature-carousel';
import { FeatureType } from '@/components/paywall/feature-slide';
import { PlanOption } from '@/components/paywall/plan-option';
import { PaywallButton } from '@/components/paywall/paywall-button';
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
  Layout,
} from '@/constants/theme';

type PlanType = 'yearly' | 'monthly';

const FEATURES: FeatureType[] = ['widgets', 'customization', 'unlimited'];

export default function PaywallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(null);
  const [yearlyPackage, setYearlyPackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    loadOfferings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOfferings = async () => {
    try {
      setIsLoading(true);
      const offering = await getOfferings();

      if (!offering) {
        Alert.alert(
          'Not Available',
          'Subscription options are not available at the moment.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      // Find monthly and yearly packages
      const monthly = offering.availablePackages.find(
        (pkg) => pkg.identifier === '$rc_monthly' || pkg.product.identifier.includes('monthly')
      );
      const yearly = offering.availablePackages.find(
        (pkg) => pkg.identifier === '$rc_annual' || pkg.product.identifier.includes('yearly')
      );

      setMonthlyPackage(monthly || null);
      setYearlyPackage(yearly || null);
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert('Error', 'Failed to load subscription options. Please try again.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    const packageToPurchase = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;

    if (!packageToPurchase) {
      Alert.alert('Error', 'Selected plan is not available.');
      return;
    }

    try {
      setIsPurchasing(true);
      const { customerInfo, userCancelled } = await purchasePackage(packageToPurchase);

      if (userCancelled) {
        // User cancelled, do nothing
        return;
      }

      // Check if user has pro access
      const hasProAccess = customerInfo.entitlements.active['Memento Calendar Pro'] !== undefined;

      if (hasProAccess) {
        Alert.alert('Welcome to Pro!', 'You now have access to all premium features.', [
          {
            text: 'Get Started',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Error purchasing:', error);
      Alert.alert('Purchase Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsPurchasing(true);
      const customerInfo = await restorePurchases();

      const hasProAccess = customerInfo.entitlements.active['Memento Calendar Pro'] !== undefined;

      if (hasProAccess) {
        Alert.alert('Purchases Restored', 'Your premium access has been restored.', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'We could not find any previous purchases to restore.');
      }
    } catch (error: any) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Restore Failed', error.message || 'Failed to restore purchases.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const openTerms = () => {
    Linking.openURL('https://stoiccalendar.com/terms');
  };

  const openPrivacy = () => {
    Linking.openURL('https://stoiccalendar.com/privacy');
  };

  const getPricePerPeriod = (pkg: PurchasesPackage | null, period: string) => {
    if (!pkg) return '...';
    return `${pkg.product.priceString}/${period}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Title and Close Button */}
        <View style={styles.header}>
          <Animated.View style={styles.headerTitle} entering={FadeIn.duration(300).delay(100)}>
            <Text
              style={[
                styles.premiumTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: Fonts.handwriting,
                },
              ]}
            >
              Stoic Calendar Pro
            </Text>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(300).delay(100)} style={styles.closeButtonWrapper}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Feature Carousel (~50% of screen) */}
        <Animated.View style={styles.carouselSection} entering={FadeInDown.duration(300).delay(200)}>
          <FeatureCarousel features={FEATURES} />
        </Animated.View>

        {/* Subscription Section */}
        <View style={styles.subscriptionSection}>
          {/* Value Prop */}
          <Animated.View style={styles.valuePropContainer} entering={FadeInDown.duration(300).delay(400)}>
            <Text
              style={[
                styles.valueProp,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Visualize time, your way
            </Text>
          </Animated.View>

          {/* Plan Options */}
          <Animated.View style={styles.plansContainer} entering={FadeInDown.duration(300).delay(500)}>
            <PlanOption
              label="Yearly"
              price={getPricePerPeriod(yearlyPackage, 'year')}
              isSelected={selectedPlan === 'yearly'}
              onPress={() => setSelectedPlan('yearly')}
            />

            <View style={styles.planSpacer} />

            <PlanOption
              label="Monthly"
              price={getPricePerPeriod(monthlyPackage, 'month')}
              isSelected={selectedPlan === 'monthly'}
              onPress={() => setSelectedPlan('monthly')}
            />
          </Animated.View>

          {/* CTA Button */}
          <Animated.View style={styles.ctaContainer} entering={FadeInDown.duration(300).delay(600)}>
            <PaywallButton
              title="Continue"
              onPress={handlePurchase}
              isLoading={isPurchasing || isLoading}
              disabled={isPurchasing || isLoading || (!monthlyPackage && !yearlyPackage)}
            />
          </Animated.View>

          {/* Secondary Actions */}
          <Animated.View style={styles.secondaryActions} entering={FadeInDown.duration(300).delay(700)}>
            <TouchableOpacity onPress={handleRestore} disabled={isPurchasing}>
              <Text style={[styles.restoreLink, { color: colors.textSecondary }]}>
                Restore Purchases
              </Text>
            </TouchableOpacity>

            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={openTerms}>
                <Text style={[styles.footerLink, { color: colors.textTertiary }]}>
                  Terms of Service
                </Text>
              </TouchableOpacity>

              <Text style={[styles.footerSeparator, { color: colors.textTertiary }]}> · </Text>

              <TouchableOpacity onPress={openPrivacy}>
                <Text style={[styles.footerLink, { color: colors.textTertiary }]}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
    position: 'relative',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  closeButtonWrapper: {
    position: 'absolute',
    right: Layout.screenPadding,
    top: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: FontWeights.regular,
  },

  // Title
  premiumTitle: {
    fontSize: 32,
    fontWeight: FontWeights.semibold,
  },

  // Carousel Section
  carouselSection: {
    marginTop: Spacing.md,
    minHeight: 340,
  },

  // Subscription Section
  subscriptionSection: {
    paddingHorizontal: Layout.screenPadding,
    marginTop: Spacing.lg,
  },

  // Value Prop
  valuePropContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  valueProp: {
    fontSize: FontSizes.subheadline,
    fontWeight: FontWeights.regular,
  },

  // Plans
  plansContainer: {
    marginBottom: Spacing.lg,
  },
  planSpacer: {
    height: Spacing.sm,
  },

  // CTA
  ctaContainer: {
    marginBottom: Spacing.md,
  },

  // Secondary Actions
  secondaryActions: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  restoreLink: {
    fontSize: FontSizes.subheadline,
    fontWeight: FontWeights.regular,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: FontSizes.caption1,
    fontWeight: FontWeights.regular,
  },
  footerSeparator: {
    fontSize: FontSizes.caption1,
  },
});
