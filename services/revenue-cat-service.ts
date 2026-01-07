/**
 * RevenueCat Service
 * Handles subscription management, entitlements, and purchases
 *
 * Products:
 * - monthly: Monthly subscription
 * - yearly: Yearly subscription
 *
 * Entitlements:
 * - Memento Calendar Pro: Premium features access
 */

import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

/**
 * RevenueCat API Key
 * Loaded from environment variable for security
 * IMPORTANT: Never commit API keys to version control
 */
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';

/**
 * Entitlement identifier
 */
export const ENTITLEMENTS = {
  PRO: 'Memento Calendar Pro',
} as const;

/**
 * Product identifiers
 */
export const PRODUCT_IDS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export async function initializeRevenueCat(): Promise<void> {
  try {
    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure Purchases SDK
    Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
    });

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    throw error;
  }
}

/**
 * Get current customer info
 * Contains all purchase and subscription information
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error getting customer info:', error);
    throw error;
  }
}

/**
 * Check if user has Pro subscription
 * Checks for active "Memento Calendar Pro" entitlement
 */
export async function isPro(): Promise<boolean> {
  try {
    const customerInfo = await getCustomerInfo();
    const hasProEntitlement =
      customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;

    console.log('Pro status:', hasProEntitlement);
    return hasProEntitlement;
  } catch (error) {
    console.error('Error checking pro status:', error);
    // Fail open - allow access if error checking
    return false;
  }
}

/**
 * Get available offerings (subscription plans)
 * Returns the current offering with available packages
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current !== null) {
      console.log('Current offering:', offerings.current.identifier);
      console.log(
        'Available packages:',
        offerings.current.availablePackages.map((pkg) => pkg.identifier)
      );
      return offerings.current;
    } else {
      console.log('No current offering available');
      return null;
    }
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
}

/**
 * Purchase a package
 * Handles the purchase flow and returns updated customer info
 */
export async function purchasePackage(
  packageToPurchase: PurchasesPackage
): Promise<{ customerInfo: CustomerInfo; userCancelled: boolean }> {
  try {
    const { customerInfo, productIdentifier } =
      await Purchases.purchasePackage(packageToPurchase);

    console.log('Purchase successful:', productIdentifier);
    console.log(
      'Active entitlements:',
      Object.keys(customerInfo.entitlements.active)
    );

    return { customerInfo, userCancelled: false };
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('User cancelled purchase');
      return { customerInfo: await getCustomerInfo(), userCancelled: true };
    } else {
      console.error('Error purchasing package:', error);
      throw error;
    }
  }
}

/**
 * Restore purchases
 * Restores previous purchases from App Store/Play Store
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log('Purchases restored successfully');
    console.log(
      'Active entitlements:',
      Object.keys(customerInfo.entitlements.active)
    );
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
}

/**
 * Get specific package by identifier
 * Useful for direct purchase of monthly or yearly plans
 */
export async function getPackageByIdentifier(
  identifier: string
): Promise<PurchasesPackage | null> {
  try {
    const offering = await getOfferings();
    if (!offering) {
      return null;
    }

    const packageFound = offering.availablePackages.find(
      (pkg) => pkg.identifier === identifier
    );

    return packageFound || null;
  } catch (error) {
    console.error('Error getting package by identifier:', error);
    return null;
  }
}

/**
 * Check if a specific feature is available
 * Returns true if user has Pro or if feature is free
 */
export async function isFeatureAvailable(
  feature: keyof typeof PRO_FEATURES
): Promise<boolean> {
  const hasProAccess = await isPro();

  if (hasProAccess) {
    return true;
  }

  // Check if feature is available in free tier
  switch (feature) {
    case 'UNLIMITED_TIMELINES':
    case 'UNLIMITED_CUSTOM_TIMELINES':
    case 'ALL_WIDGET_SIZES':
    case 'CUSTOM_ACCENT_COLORS':
    case 'CLOUD_SYNC':
    case 'PRIORITY_SUPPORT':
      return false;
    default:
      return true;
  }
}

/**
 * Get anonymous user ID from RevenueCat
 * Useful for customer support
 */
export async function getAnonymousUserId(): Promise<string> {
  try {
    const appUserId = await Purchases.getAppUserID();
    return appUserId;
  } catch (error) {
    console.error('Error getting anonymous user ID:', error);
    return 'unknown';
  }
}

/**
 * Login user (for cross-device sync)
 * Call this when user logs in with your authentication system
 */
export async function loginUser(userId: string): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    console.log('User logged in:', userId);
    return customerInfo;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

/**
 * Logout user
 * Call this when user logs out
 */
export async function logoutUser(): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.logOut();
    console.log('User logged out');
    return customerInfo;
  } catch (error) {
    console.error('Error logging out user:', error);
    throw error;
  }
}

/**
 * Feature limits for free tier
 */
export const FREE_TIER_LIMITS = {
  MAX_TIMELINES: 3,
  MAX_CUSTOM_TIMELINES: 1,
  WIDGET_SIZES: ['small', 'medium'], // Pro unlocks 'large'
} as const;

/**
 * Pro features configuration
 */
export const PRO_FEATURES = {
  UNLIMITED_TIMELINES: true,
  UNLIMITED_CUSTOM_TIMELINES: true,
  ALL_WIDGET_SIZES: true,
  CUSTOM_ACCENT_COLORS: true, // Future feature
  CLOUD_SYNC: true, // Future feature with Firebase
  PRIORITY_SUPPORT: true,
} as const;
