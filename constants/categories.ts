import type { SubscriptionCategory } from '../types/models';

export const CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  ai: 'AI Tools',
  design: 'Design',
  coding: 'Coding',
  business: 'Business',
  marketing: 'Marketing',
  hosting: 'Hosting',
  finance: 'Finance',
  productivity: 'Productivity',
  entertainment: 'Entertainment',
  other: 'Other',
};

export const CATEGORY_OPTIONS: SubscriptionCategory[] = [
  'ai',
  'design',
  'coding',
  'business',
  'marketing',
  'hosting',
  'finance',
  'productivity',
  'entertainment',
  'other',
];
