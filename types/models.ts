/**
 * Data models for SubDeck.
 *
 * These shapes intentionally mirror the planned Convex schema (see project
 * brief section 10) so the local persistence layer in `store/` can be
 * swapped for real Convex queries/mutations later without reshaping data
 * that screens already depend on.
 */

export type BillingType =
  | 'monthly'
  | 'annual'
  | 'trial'
  | 'lifetime'
  | 'free'
  | 'variable'
  | 'per_seat'
  | 'unknown';

export type SubscriptionStatus =
  | 'keep'
  | 'review_later'
  | 'downgrade'
  | 'cancel_soon'
  | 'paused'
  | 'cancelled';

export type SubscriptionCategory =
  | 'ai'
  | 'design'
  | 'coding'
  | 'business'
  | 'marketing'
  | 'hosting'
  | 'finance'
  | 'productivity'
  | 'entertainment'
  | 'other';

export interface Subscription {
  id: string;
  userId: string;
  softwareName: string;
  logoUrl?: string;
  category: SubscriptionCategory;
  websiteUrl?: string;
  pricingUrl?: string;
  loginUrl?: string;
  cancellationUrl?: string;
  planName?: string;
  billingType: BillingType;
  currency: string;
  cost: number;
  estimatedMonthlyCost?: number;
  seatCount?: number;
  costPerSeat?: number;
  renewalDate?: string;
  trialEndDate?: string;
  cancelByDate?: string;
  dateStarted?: string;
  autoRenew: boolean;
  status: SubscriptionStatus;
  paymentMethod?: string;
  notes?: string;
  cancellationNotes?: string;
  cancellationSupportTicket?: string;
  cancellationConfirmed?: boolean;
  cancellationConfirmedDate?: string;
  valueRating?: number;
  tags?: string[];
  alertEnabled: boolean;
  alertDaysBefore: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertType = 'renewal' | 'trial_ending' | 'cancel_by' | 'review';

export type AlertStatus =
  | 'pending'
  | 'sent'
  | 'snoozed'
  | 'reviewed'
  | 'dismissed'
  | 'completed';

export interface SubscriptionAlertState {
  subscriptionId: string;
  alertType: AlertType;
  status: AlertStatus;
  snoozedUntil?: string;
  updatedAt: string;
}

export interface SweepDecision {
  id: string;
  sweepId: string;
  subscriptionId: string;
  decision: SubscriptionStatus;
  notes?: string;
  createdAt: string;
}

export interface StackSweep {
  id: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  toolsReviewed: number;
  toolsKept: number;
  toolsMarkedCancelSoon: number;
  toolsMarkedDowngrade: number;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  nextSweepDate?: string;
  decisions: SweepDecision[];
}

export interface NotificationPreferences {
  renewalAlerts: boolean;
  trialAlerts: boolean;
  reviewReminders: boolean;
  sweepReminders: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferredCurrency: string;
  notificationPreferences: NotificationPreferences;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
