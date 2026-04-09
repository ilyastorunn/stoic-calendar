/**
 * Paywall Experiment Service
 * Orchestrates offering-based paywall behavior for monetization experiments.
 *
 * default   => No automatic paywall
 * variant_a => One-time dismissable paywall after the first value moment
 * variant_b => Hard paywall after the first value moment
 */

import {
  cacheAbVariant,
  getCachedAbVariant,
  hasSeenPaywallFirstValue,
  hasShownSoftUpsell,
  markPaywallFirstValueSeen,
  markSoftUpsellShown,
  migratePaywallExperimentState,
} from '@/services/storage';

export const OFFERING_IDS = {
  DEFAULT: 'default',
  VARIANT_A: 'variant_a',
  VARIANT_B: 'variant_b',
} as const;

export type PaywallOfferingId = (typeof OFFERING_IDS)[keyof typeof OFFERING_IDS];

function isPaywallOfferingId(value: string | null): value is PaywallOfferingId {
  return value === OFFERING_IDS.DEFAULT
    || value === OFFERING_IDS.VARIANT_A
    || value === OFFERING_IDS.VARIANT_B;
}

/**
 * Initialize paywall experiment state after RevenueCat is ready.
 */
export async function initTrial(offeringIdentifier: string | null): Promise<void> {
  await migratePaywallExperimentState();

  if (isPaywallOfferingId(offeringIdentifier)) {
    await cacheAbVariant(offeringIdentifier);
  }
}

/**
 * Resolve the persisted offering identifier, defaulting to the non-experiment path.
 */
export async function getPaywallOfferingId(): Promise<PaywallOfferingId> {
  const cachedOfferingId = await getCachedAbVariant();
  return isPaywallOfferingId(cachedOfferingId)
    ? cachedOfferingId
    : OFFERING_IDS.DEFAULT;
}

/**
 * Whether the user has already reached the first value moment.
 */
export async function hasReachedFirstValueMoment(): Promise<boolean> {
  return hasSeenPaywallFirstValue();
}

/**
 * Mark that the user has seen the first value moment.
 */
export async function markFirstValueMoment(): Promise<void> {
  await markPaywallFirstValueSeen();
}

/**
 * Whether the current offering should present the one-time soft paywall.
 */
export async function shouldPresentSoftUpsell(): Promise<boolean> {
  const offeringId = await getPaywallOfferingId();
  if (offeringId !== OFFERING_IDS.VARIANT_A) {
    return false;
  }

  return !(await hasShownSoftUpsell());
}

/**
 * Record that the one-time soft paywall has been presented.
 */
export async function markSoftUpsellPresented(): Promise<void> {
  await markSoftUpsellShown();
}

/**
 * Whether the current offering should force a hard paywall.
 */
export async function shouldEnforceHardPaywall(): Promise<boolean> {
  const offeringId = await getPaywallOfferingId();
  if (offeringId !== OFFERING_IDS.VARIANT_B) {
    return false;
  }

  return hasSeenPaywallFirstValue();
}
