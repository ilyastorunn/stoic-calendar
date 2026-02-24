/**
 * Paywall Screen — Box Box Club style (v2)
 *
 * Layout: phone-image carousel with bottom SVG fade, pricing cards
 * overlap the fade via negative marginTop (ZStack pattern).
 *
 * Products: monthly, yearly
 * Entitlement: Memento Calendar Pro
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
  Linking,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { PurchasesPackage, PurchasesStoreProduct } from 'react-native-purchases';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { X, CheckCircle } from 'phosphor-react-native';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '@/services/revenue-cat-service';
import { PaginationDots } from '@/components/paywall/pagination-dots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type IntroPrice = NonNullable<PurchasesStoreProduct['introPrice']>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const { height: screenH, width: screenW } = Dimensions.get('window');
const PHONE_WIDTH = screenW - 48;
const PHONE_HEIGHT = screenH * 0.42;
const PRICING_OVERLAP = 15;
const AUTO_PLAY_MS = 3000;

const SLIDES = [
  {
    key: 'lock',
    source: require('../assets/new-paywall/cropped/lock-screen 2.png'),
    line1: 'lock screen',
    line2: 'widgets',
    subtitle: 'Your time, always in view.',
  },
  {
    key: 'small',
    source: require('../assets/new-paywall/cropped/small-circular-percentage 2.png'),
    line1: 'small',
    line2: 'widgets',
    subtitle: 'A quiet glance at your day, anytime.',
  },
  {
    key: 'medium',
    source: require('../assets/new-paywall/cropped/medium-text-circular 2.png'),
    line1: 'medium',
    line2: 'widgets',
    subtitle: 'A clearer window into your day.',
  },
  {
    key: 'big',
    source: require('../assets/new-paywall/cropped/big-grid 2.png'),
    line1: 'year',
    line2: 'grid',
    subtitle: 'See your entire year laid out in a grid.',
  },
];

type PlanType = 'yearly' | 'monthly';

// ---------------------------------------------------------------------------
// PaywallScreen
// ---------------------------------------------------------------------------

export default function PaywallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const styles = getStyles(colors);

  // --- offerings state ---
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(null);
  const [yearlyPackage, setYearlyPackage] = useState<PurchasesPackage | null>(null);

  // --- carousel state ---
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIndexRef = useRef(0); // keep ref in sync for timer closure

  // --- header text crossfade ---
  const [visibleIndex, setVisibleIndex] = useState(0);
  const textOpacity = useSharedValue(1);

  // fade out → swap text (JS thread) → fade in (separate effect)
  useEffect(() => {
    if (activeIndex === visibleIndex) return;
    textOpacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(setVisibleIndex)(activeIndex);
    });
  }, [activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    textOpacity.value = withTiming(1, { duration: 150 });
  }, [visibleIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  // ---------------------------------------------------------------------------
  // Offerings
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Purchase / Restore
  // ---------------------------------------------------------------------------

  const handlePurchase = async () => {
    const packageToPurchase = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;

    if (!packageToPurchase) {
      Alert.alert('Error', 'Selected plan is not available.');
      return;
    }

    try {
      setIsPurchasing(true);
      const { customerInfo, userCancelled } = await purchasePackage(packageToPurchase);

      if (userCancelled) return;

      const hasProAccess = customerInfo.entitlements.active['Memento Calendar Pro'] !== undefined;

      if (hasProAccess) {
        Alert.alert('Welcome to Pro!', 'You now have access to all premium features.', [
          { text: 'Get Started', onPress: () => router.back() },
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
          { text: 'OK', onPress: () => router.back() },
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

  const openTerms = () => Linking.openURL('https://stoic-calendar.forvibe.app/terms-of-use');
  const openPrivacy = () => Linking.openURL('https://stoic-calendar.forvibe.app/privacy-policy');

  // ---------------------------------------------------------------------------
  // Auto-play carousel
  // ---------------------------------------------------------------------------

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = (activeIndexRef.current + 1) % SLIDES.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      activeIndexRef.current = next;
      setActiveIndex(next);
    }, AUTO_PLAY_MS);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIndex, resetTimer]);

  const handleMomentumScrollEnd = useCallback((e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / screenW);
    if (index !== activeIndexRef.current) {
      activeIndexRef.current = index;
      setActiveIndex(index);
    }
  }, []);


  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderSlide = ({ item }: { item: (typeof SLIDES)[0] }) => (
    <View style={styles.slideContainer}>
      <Image
        source={item.source}
        style={styles.slideImage}
        contentFit="contain"
      />
      {/* Bottom gradient fade */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="40%" stopColor={colors.background} stopOpacity={0} />
            <Stop offset="75%" stopColor={colors.background} stopOpacity={0.6} />
            <Stop offset="100%" stopColor={colors.background} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bottomFade)" />
      </Svg>
    </View>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      {/* Header row */}
      <View style={styles.header}>
        <Animated.View style={[styles.headerTextBlock, textAnimatedStyle]}>
          <Text style={styles.headerLine1}>{SLIDES[visibleIndex].line1}</Text>
          <Text style={styles.headerLine2}>{SLIDES[visibleIndex].line2}</Text>
          <Text style={styles.subtitle}>{SLIDES[visibleIndex].subtitle}</Text>
        </Animated.View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={22} color={colors.textSecondary} weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Phone carousel area */}
      <View style={styles.carouselWrapper}>

        {/* FlatList horizontal carousel */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollBeginDrag={resetTimer}
          getItemLayout={(_, index) => ({
            length: screenW,
            offset: screenW * index,
            index,
          })}
          style={styles.flatList}
        />

        {/* Pagination dots — absolute at bottom of carousel */}
        <View style={styles.dotsWrapper}>
          <PaginationDots total={SLIDES.length} activeIndex={activeIndex} />
        </View>
      </View>

      {/* Pricing block — negative margin pulls up into faded area */}
      <View style={styles.pricingBlock}>
        <View style={styles.plansRow}>
          <PricingCard
            label="Monthly"
            price={monthlyPackage?.product.priceString || '...'}
            period="/ month"
            isSelected={selectedPlan === 'monthly'}
            onPress={() => setSelectedPlan('monthly')}
            colors={colors}
          />
          <PricingCard
            label="Yearly"
            price={yearlyPackage?.product.priceString || '...'}
            period="/ year"
            isSelected={selectedPlan === 'yearly'}
            showBestValue
            introPrice={yearlyPackage?.product.introPrice ?? null}
            onPress={() => setSelectedPlan('yearly')}
            colors={colors}
          />
        </View>
      </View>

      {/* CTA + footer */}
      <View style={styles.ctaBlock}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handlePurchase}
          disabled={isPurchasing || isLoading || (!monthlyPackage && !yearlyPackage)}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {isPurchasing ? 'Processing...' : 'Subscribe'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.billingNote}>
          {selectedPlan === 'yearly'
            ? `Billed ${yearlyPackage?.product.priceString || '...'}/year. Renews annually. Cancel anytime.`
            : `Billed ${monthlyPackage?.product.priceString || '...'}/month. Renews monthly. Cancel anytime.`}
        </Text>

        <View style={styles.footerDivider} />

        <TouchableOpacity onPress={handleRestore} disabled={isPurchasing}>
          <Text style={styles.restoreLink}>Restore Purchases</Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={openTerms}>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.footerSep}> · </Text>
          <TouchableOpacity onPress={openPrivacy}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// PricingCard
// ---------------------------------------------------------------------------

interface PricingCardProps {
  label: string;
  price: string;
  period: string;
  isSelected: boolean;
  showBestValue?: boolean;
  introPrice?: IntroPrice | null;
  onPress: () => void;
  colors: typeof Colors.dark;
}

function formatTrialLabel(introPrice: IntroPrice): string {
  const n = introPrice.periodNumberOfUnits;
  const unit = introPrice.periodUnit.toLowerCase();
  const unitLabel = n === 1 ? unit : `${unit}s`;
  return `Try free for ${n} ${unitLabel}`;
}

function PricingCard({ label, price, period, isSelected, showBestValue, introPrice, onPress, colors }: PricingCardProps) {
  const styles = getStyles(colors);
  const hasFreeTrial = introPrice != null && introPrice.price === 0;
  return (
    <TouchableOpacity
      style={[styles.pricingCard, { borderColor: isSelected ? '#007AFF' : colors.separator }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {hasFreeTrial && (
        <View style={styles.freeTrialPill}>
          <Text style={styles.freeTrialText}>{formatTrialLabel(introPrice!)}</Text>
        </View>
      )}
      {showBestValue && !hasFreeTrial && (
        <View style={styles.bestValuePill}>
          <Text style={styles.bestValueText}>Best Value</Text>
        </View>
      )}
      <View style={styles.pricingCardRow}>
        <View>
          <Text style={styles.pricingLabel}>{label}</Text>
          <Text style={styles.pricingPrice}>
            {price} <Text style={styles.pricingPeriod}>{period}</Text>
          </Text>
          <Text style={styles.pricingRenewNote}>
            {label === 'Yearly' ? 'Auto-renews annually' : 'Auto-renews monthly'}
          </Text>
        </View>
        <CheckCircle
          size={24}
          color={isSelected ? '#007AFF' : colors.separator}
          weight={isSelected ? 'fill' : 'regular'}
          style={styles.checkCircle}
        />
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function getStyles(colors: typeof Colors.dark) {
  const isDark = colors.background === '#000000';
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // --- Header ---
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerTextBlock: {
      flex: 1,
    },
    headerLine1: {
      color: colors.textPrimary,
      fontSize: 36,
      fontWeight: '400',
      lineHeight: 40,
    },
    headerLine2: {
      color: colors.accent,
      fontSize: 50,
      fontWeight: '800',
      lineHeight: 54,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '400',
      marginTop: 6,
      lineHeight: 20,
    },
    closeButton: {
      paddingTop: 4,
    },

    // --- Carousel ---
    carouselWrapper: {
      height: PHONE_HEIGHT,
      position: 'relative',
      alignItems: 'center',
    },
    flatList: {
      width: screenW,
      height: PHONE_HEIGHT,
    },
    slideContainer: {
      width: PHONE_WIDTH,
      height: PHONE_HEIGHT,
      marginHorizontal: 24,
      borderRadius: 16,
      overflow: 'hidden',
    },
    slideImage: {
      width: PHONE_WIDTH,
      height: PHONE_HEIGHT,
    },
    dotsWrapper: {
      position: 'absolute',
      bottom: 8,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },

    // --- Pricing block ---
    pricingBlock: {
      marginTop: -PRICING_OVERLAP,
      zIndex: 1,
      paddingHorizontal: 24,
    },
    plansRow: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 14, // space for the floating badge
    },

    // --- Pricing card ---
    pricingCard: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderWidth: 1.5,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      overflow: 'visible',
    },
    bestValuePill: {
      position: 'absolute',
      top: -13,
      alignSelf: 'center',
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    bestValueText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '700',
      backgroundColor: '#007AFF',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
      overflow: 'hidden',
    },
    pillPlaceholder: {
      height: 0,
    },
    freeTrialPill: {
      position: 'absolute',
      top: -13,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    freeTrialText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '700',
      backgroundColor: colors.textPrimary,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
      overflow: 'hidden',
    },
    pricingCardRow: {
      flexDirection: 'column',
    },
    pricingLabel: {
      color: colors.textPrimary,
      fontSize: 17,
      fontWeight: '600',
    },
    pricingPrice: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '400',
      marginTop: 2,
    },
    pricingPeriod: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    pricingRenewNote: {
      color: colors.textTertiary,
      fontSize: 11,
      marginTop: 2,
    },
    checkCircle: {
      alignSelf: 'flex-end',
      marginTop: 8,
    },

    // --- CTA block ---
    ctaBlock: {
      paddingHorizontal: 24,
      paddingTop: 16,
      alignItems: 'center',
    },
    ctaButton: {
      backgroundColor: isDark ? '#FFFFFF' : '#000000',
      borderRadius: 28,
      height: 56,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    ctaText: {
      color: isDark ? '#000000' : '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
    billingNote: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 10,
    },
    footerDivider: {
      width: '60%',
      height: 1,
      backgroundColor: colors.separator,
      marginVertical: 10,
    },
    restoreLink: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 6,
    },
    footerLinks: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    footerLink: {
      color: colors.textTertiary,
      fontSize: 11,
    },
    footerSep: {
      color: colors.textTertiary,
      fontSize: 11,
    },
  });
}
