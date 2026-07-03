import type { BillingType, SubscriptionStatus } from '../types/models';

export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  monthly: 'Monthly',
  annual: 'Annual',
  trial: 'Trial',
  lifetime: 'Lifetime',
  free: 'Free',
  variable: 'Variable',
  per_seat: 'Per-seat',
  unknown: 'Unknown',
};

export const BILLING_TYPE_OPTIONS: BillingType[] = [
  'monthly',
  'annual',
  'trial',
  'lifetime',
  'free',
  'variable',
  'per_seat',
  'unknown',
];

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  keep: 'Keep',
  review_later: 'Review Later',
  downgrade: 'Downgrade',
  cancel_soon: 'Cancel Soon',
  paused: 'Paused',
  cancelled: 'Cancelled',
};

export const STATUS_OPTIONS: SubscriptionStatus[] = [
  'keep',
  'review_later',
  'downgrade',
  'cancel_soon',
  'paused',
  'cancelled',
];

export const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
