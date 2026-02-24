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

// Initialization state tracking
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

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
  if (isInitialized) return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      // Skip initialization in Expo Go (native store not available)
      if (MOCK_OFFERINGS_ENABLED) {
        isInitialized = true;
        console.log('[DEV] RevenueCat skipped in mock mode');
        return;
      }

      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Configure Purchases SDK
      Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
      });

      isInitialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      initializationPromise = null;
      console.error('Error initializing RevenueCat:', error);
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Ensure RevenueCat is initialized before calling SDK methods
 */
async function ensureInitialized(): Promise<void> {
  if (isInitialized) return;
  if (initializationPromise) {
    await initializationPromise;
    return;
  }
  throw new Error('RevenueCat not initialized');
}

/**
 * Get current customer info
 * Contains all purchase and subscription information
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  if (MOCK_OFFERINGS_ENABLED) {
    return { entitlements: { active: {}, all: {} }, activeSubscriptions: [], allPurchasedProductIdentifiers: [], latestExpirationDate: null, firstSeen: '', originalAppUserId: '', requestDate: '', allExpirationDates: {}, originalApplicationVersion: null, originalPurchaseDate: null, managementURL: null, nonSubscriptionTransactions: [] } as any;
  }
  try {
    await ensureInitialized();
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

// ---------------------------------------------------------------------------
// Mock offerings for simulator/development (no StoreKit sandbox needed)
// ---------------------------------------------------------------------------

const MOCK_OFFERINGS_ENABLED = __DEV__ && false; // Set to `true` to use mock data in simulator

function buildMockOffering(): PurchasesOffering {
  const makeProduct = (id: string, price: number, priceString: string) => ({
    productIdentifier: id,
    identifier: id,
    localizedDescription: 'Memento Calendar Pro',
    localizedTitle: 'Memento Calendar Pro',
    price,
    priceString,
    currencyCode: 'USD',
    introPrice: null,
    discounts: [],
    productCategory: 'SUBSCRIPTION' as any,
    productType: 'AUTO_RENEWABLE_SUBSCRIPTION' as any,
    subscriptionPeriod: '',
    defaultOption: null,
    subscriptionOptions: [],
    presentedOfferingContext: { offeringIdentifier: 'default', placementIdentifier: null, targetingContext: null },
  });

  const monthly: PurchasesPackage = {
    identifier: '$rc_monthly',
    packageType: 'MONTHLY' as any,
    product: makeProduct('memento_monthly', 2.99, '$2.99'),
    offeringIdentifier: 'default',
    presentedOfferingContext: { offeringIdentifier: 'default', placementIdentifier: null, targetingContext: null },
  };

  const yearly: PurchasesPackage = {
    identifier: '$rc_annual',
    packageType: 'ANNUAL' as any,
    product: {
      ...makeProduct('memento_yearly', 19.99, '$19.99'),
      introPrice: {
        price: 0,
        priceString: 'Free',
        period: 'P1W',
        periodUnit: 'WEEK' as any,
        periodNumberOfUnits: 1,
        cycles: 1,
      },
    },
    offeringIdentifier: 'default',
    presentedOfferingContext: { offeringIdentifier: 'default', placementIdentifier: null, targetingContext: null },
  };

  return {
    identifier: 'default',
    serverDescription: 'Default offering',
    metadata: {},
    availablePackages: [monthly, yearly],
    lifetime: null,
    annual: yearly,
    sixMonth: null,
    threeMonth: null,
    twoMonth: null,
    monthly,
    weekly: null,
  };
}

/**
 * Get available offerings (subscription plans)
 * Returns the current offering with available packages
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (MOCK_OFFERINGS_ENABLED) {
    console.log('[DEV] Using mock offerings');
    return buildMockOffering();
  }

  try {
    await ensureInitialized();
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
    await ensureInitialized();
    const { customerInfo, productIdentifier } =
      await Purchases.purchasePackage(packageToPurchase);

    console.log('Purchase successful:', productIdentifier);
    console.log(
      'Active entitlements:',
      Object.keys(customerInfo.entitlements.active)
    );

    // Sync Pro status to widgets after successful purchase
    try {
      const { syncProStatusToWidget } = await import('@/services/widget-data-service');
      await syncProStatusToWidget();
    } catch (widgetError) {
      console.warn('Failed to sync Pro status to widgets:', widgetError);
    }

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
    await ensureInitialized();
    const customerInfo = await Purchases.restorePurchases();
    console.log('Purchases restored successfully');
    console.log(
      'Active entitlements:',
      Object.keys(customerInfo.entitlements.active)
    );

    // Sync Pro status to widgets after successful restore
    try {
      const { syncProStatusToWidget } = await import('@/services/widget-data-service');
      await syncProStatusToWidget();
    } catch (widgetError) {
      console.warn('Failed to sync Pro status to widgets:', widgetError);
    }

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
    await ensureInitialized();
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
    await ensureInitialized();
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
    await ensureInitialized();
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
