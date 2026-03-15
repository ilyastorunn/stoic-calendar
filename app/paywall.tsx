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
  ScrollView,
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
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { PurchasesPackage, PurchasesStoreProduct } from 'react-native-purchases';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { X, CheckCircle } from 'phosphor-react-native';
import {
  ENTITLEMENTS,
  getOfferings,
  hasActiveEntitlement,
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
const PHONE_HEIGHT = Math.min(screenH * 0.42, 400);
const PRICING_OVERLAP = 15;
const AUTO_PLAY_MS = 3000;

const SLIDE_SOURCES = [
  { key: 'lock', source: require('../assets/new-paywall/cropped/lock-screen 2.png') },
  { key: 'small', source: require('../assets/new-paywall/cropped/small-circular-percentage 2.png') },
  { key: 'medium', source: require('../assets/new-paywall/cropped/medium-text-circular 2.png') },
  { key: 'big', source: require('../assets/new-paywall/cropped/big-grid 2.png') },
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
  const { t } = useTranslation();

  const SLIDES = [
    { key: 'lock', source: SLIDE_SOURCES[0].source, line1: t('paywall.slide1Line1'), line2: t('paywall.slide1Line2'), subtitle: t('paywall.slide1Subtitle') },
    { key: 'small', source: SLIDE_SOURCES[1].source, line1: t('paywall.slide2Line1'), line2: t('paywall.slide2Line2'), subtitle: t('paywall.slide2Subtitle') },
    { key: 'medium', source: SLIDE_SOURCES[2].source, line1: t('paywall.slide3Line1'), line2: t('paywall.slide3Line2'), subtitle: t('paywall.slide3Subtitle') },
    { key: 'big', source: SLIDE_SOURCES[3].source, line1: t('paywall.slide4Line1'), line2: t('paywall.slide4Line2'), subtitle: t('paywall.slide4Subtitle') },
  ];

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
          t('alerts.notAvailable'),
          t('alerts.notAvailableMessage'),
          [{ text: t('common.ok'), onPress: () => router.back() }]
        );
        return;
      }

      const monthly =
        offering.monthly ||
        offering.availablePackages.find(
          (pkg) => pkg.packageType === 'MONTHLY' || pkg.identifier === '$rc_monthly'
        );
      const yearly =
        offering.annual ||
        offering.availablePackages.find(
          (pkg) => pkg.packageType === 'ANNUAL' || pkg.identifier === '$rc_annual'
        );

      setMonthlyPackage(monthly || null);
      setYearlyPackage(yearly || null);
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert(t('common.error'), t('alerts.failedToLoadOptions'), [
        { text: t('common.ok'), onPress: () => router.back() },
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
      Alert.alert(t('common.error'), t('alerts.selectedPlanNotAvailable'));
      return;
    }

    try {
      setIsPurchasing(true);
      const { customerInfo, userCancelled } = await purchasePackage(packageToPurchase);

      if (userCancelled) return;

      const hasProAccess = hasActiveEntitlement(customerInfo, ENTITLEMENTS.PRO);

      if (hasProAccess) {
        Alert.alert(t('alerts.welcomeToPro'), t('alerts.welcomeToProMessage'), [
          { text: t('alerts.getStarted'), onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      console.error('Error purchasing:', error);
      Alert.alert(t('alerts.purchaseFailed'), error.message || t('alerts.purchaseFailedMessage'));
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsPurchasing(true);
      const customerInfo = await restorePurchases();

      const hasProAccess = hasActiveEntitlement(customerInfo, ENTITLEMENTS.PRO);

      if (hasProAccess) {
        Alert.alert(t('alerts.purchasesRestored'), t('alerts.purchasesRestoredMessage'), [
          { text: t('common.ok'), onPress: () => router.back() },
        ]);
      } else if (customerInfo.allPurchasedProductIdentifiers.length > 0) {
        // User has past purchases but no active entitlement — likely expired
        Alert.alert(t('alerts.subscriptionExpired'), t('alerts.subscriptionExpiredMessage'));
      } else {
        Alert.alert(t('alerts.noPurchasesFound'), t('alerts.noPurchasesFoundMessage'));
      }
    } catch (error: any) {
      console.error('Error restoring purchases:', error);
      Alert.alert(t('alerts.restoreFailed'), error.message || t('alerts.restoreFailed'));
    } finally {
      setIsPurchasing(false);
    }
  };

  const openTerms = () => Linking.openURL('https://memento-calendar.pages.dev/terms-of-use');
  const openPrivacy = () => Linking.openURL('https://memento-calendar.pages.dev/privacy-policy');

  // ---------------------------------------------------------------------------
  // Auto-play carousel
  // ---------------------------------------------------------------------------

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = (activeIndexRef.current + 1) % SLIDE_SOURCES.length;
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
      {/* Close button — fixed top-right */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={22} color={colors.textSecondary} weight="bold" />
      </TouchableOpacity>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.headerTextBlock, textAnimatedStyle]}>
          <Text style={styles.headerLine1}>{SLIDES[visibleIndex].line1}</Text>
          <Text style={styles.headerLine2}>{SLIDES[visibleIndex].line2}</Text>
          <Text style={styles.subtitle}>{SLIDES[visibleIndex].subtitle}</Text>
        </Animated.View>

        {/* Phone carousel area */}
        <View style={styles.carouselWrapper}>
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
          <View style={styles.dotsWrapper}>
            <PaginationDots total={SLIDES.length} activeIndex={activeIndex} />
          </View>
        </View>

        {/* Pricing cards */}
        <View style={styles.pricingBlock}>
          <View style={styles.plansRow}>
            <PricingCard
              label={t('paywall.labelMonthly')}
              price={monthlyPackage?.product.priceString || '...'}
              period={t('paywall.perMonth')}
              isSelected={selectedPlan === 'monthly'}
              onPress={() => setSelectedPlan('monthly')}
              colors={colors}
            />
            <PricingCard
              label={t('paywall.labelYearly')}
              price={yearlyPackage?.product.priceString || '...'}
              period={t('paywall.perYear')}
              isSelected={selectedPlan === 'yearly'}
              showBestValue
              introPrice={yearlyPackage?.product.introPrice ?? null}
              onPress={() => setSelectedPlan('yearly')}
              colors={colors}
            />
          </View>
        </View>

        {/* Pro features + CTA */}
        <View style={styles.ctaBlock}>
          <Text style={styles.featureDescription}>
            {t('paywall.featureDescription')}
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handlePurchase}
            disabled={isPurchasing || isLoading || (!monthlyPackage && !yearlyPackage)}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {isPurchasing ? t('paywall.processing') : t('paywall.subscribe')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.billingNote}>
            {selectedPlan === 'yearly'
              ? t('paywall.billingYearly', { price: yearlyPackage?.product.priceString || '...' })
              : t('paywall.billingMonthly', { price: monthlyPackage?.product.priceString || '...' })}
          </Text>

          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={openTerms}>
              <Text style={styles.footerLink}>{t('paywall.termsOfUse')}</Text>
            </TouchableOpacity>
            <Text style={styles.footerSep}> · </Text>
            <TouchableOpacity onPress={openPrivacy}>
              <Text style={styles.footerLink}>{t('paywall.privacyPolicy')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleRestore} disabled={isPurchasing}>
            <Text style={styles.restoreLink}>{t('paywall.restorePurchases')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

function PricingCard({ label, price, period, isSelected, showBestValue, introPrice, onPress, colors }: PricingCardProps) {
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const hasFreeTrial = introPrice != null && introPrice.price === 0;

  const trialLabel = hasFreeTrial
    ? (() => {
        const n = introPrice!.periodNumberOfUnits;
        const unit = introPrice!.periodUnit.toLowerCase();
        return n === 1
          ? t('paywall.trialLabel', { n, unit })
          : t('paywall.trialLabelPlural', { n, unit });
      })()
    : '';

  return (
    <TouchableOpacity
      style={[styles.pricingCard, { borderColor: isSelected ? '#007AFF' : colors.separator }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {hasFreeTrial && (
        <View style={styles.freeTrialPill}>
          <Text style={styles.freeTrialText}>{trialLabel}</Text>
        </View>
      )}
      {showBestValue && !hasFreeTrial && (
        <View style={styles.bestValuePill}>
          <Text style={styles.bestValueText}>{t('paywall.bestValue')}</Text>
        </View>
      )}
      <View style={styles.pricingCardRow}>
        <View>
          <Text style={styles.pricingLabel}>{label}</Text>
          <Text style={styles.pricingPrice}>
            {price} <Text style={styles.pricingPeriod}>{period}</Text>
          </Text>
          <Text style={styles.pricingRenewNote}>
            {label === t('paywall.labelYearly') ? t('paywall.renewYearly') : t('paywall.renewMonthly')}
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

    // --- Close button ---
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 24,
      zIndex: 20,
    },

    // --- Main scroll ---
    mainScroll: {
      flex: 1,
    },
    mainScrollContent: {
      paddingBottom: 40,
    },

    // --- Header ---
    headerTextBlock: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 8,
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
    featureDescription: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 12,
    },
    billingNote: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 6,
    },
    restoreLink: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 8,
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
