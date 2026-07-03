import type { Subscription, SubscriptionStatus } from '../types/models';

const EXCLUDED_FROM_SPEND: SubscriptionStatus[] = ['cancelled', 'paused'];

function isSpendEligible(sub: Subscription): boolean {
  if (EXCLUDED_FROM_SPEND.includes(sub.status)) return false;
  if (sub.billingType === 'free' || sub.billingType === 'lifetime') return false;
  return true;
}

/** Normalized monthly cost of a single subscription, per brief section 11. */
export function monthlyCostOf(sub: Subscription): number {
  if (!isSpendEligible(sub)) return 0;

  switch (sub.billingType) {
    case 'monthly':
    case 'trial':
      return sub.cost;
    case 'annual':
      return sub.cost / 12;
    case 'variable':
      return sub.estimatedMonthlyCost ?? sub.cost;
    case 'per_seat': {
      const perSeat = sub.costPerSeat ?? sub.cost;
      const seats = sub.seatCount ?? 1;
      return perSeat * seats;
    }
    case 'unknown':
    default:
      return sub.estimatedMonthlyCost ?? 0;
  }
}

/** Normalized annual cost of a single subscription, per brief section 11. */
export function annualCostOf(sub: Subscription): number {
  if (!isSpendEligible(sub)) return 0;

  if (sub.billingType === 'annual') return sub.cost;
  return monthlyCostOf(sub) * 12;
}

export function totalMonthlySpend(subs: Subscription[]): number {
  return subs.reduce((sum, s) => sum + monthlyCostOf(s), 0);
}

export function totalAnnualForecast(subs: Subscription[]): number {
  return subs.reduce((sum, s) => sum + annualCostOf(s), 0);
}

const SAVINGS_STATUSES: SubscriptionStatus[] = ['cancel_soon', 'downgrade'];

/** Potential monthly savings from Cancel Soon + Downgrade candidates. */
export function potentialMonthlySavings(subs: Subscription[]): number {
  return subs
    .filter((s) => SAVINGS_STATUSES.includes(s.status))
    .reduce((sum, s) => sum + monthlyCostOf(s), 0);
}

export function potentialAnnualSavings(subs: Subscription[]): number {
  return potentialMonthlySavings(subs) * 12;
}

export function spendByCategory(subs: Subscription[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const s of subs) {
    const amount = monthlyCostOf(s);
    if (amount <= 0) continue;
    result[s.category] = (result[s.category] ?? 0) + amount;
  }
  return result;
}

export function billingTypeBreakdown(subs: Subscription[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const s of subs) {
    result[s.billingType] = (result[s.billingType] ?? 0) + 1;
  }
  return result;
}

export function topCostSubscriptions(subs: Subscription[], limit = 5): Subscription[] {
  return [...subs]
    .filter((s) => isSpendEligible(s))
    .sort((a, b) => monthlyCostOf(b) - monthlyCostOf(a))
    .slice(0, limit);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}
