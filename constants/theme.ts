import type { SubscriptionCategory, SubscriptionStatus } from '../types/models';

export const COLORS = {
  bg: '#0B0F14',
  bgRaised: '#141A22',
  bgCard: '#1A212B',
  border: '#242C38',
  teal: '#1FD1C1',
  tealDark: '#0FA89A',
  indigo: '#4C4CE0',
  indigoDark: '#3634A3',
  yellow: '#FFC93C',
  textPrimary: '#F4F6F8',
  textSecondary: '#A7B0BD',
  textMuted: '#6B7482',
} as const;

export const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  keep: '#2FD1A3',
  review_later: '#FFC93C',
  downgrade: '#5FA8FF',
  cancel_soon: '#FF7A5C',
  paused: '#8A93A3',
  cancelled: '#4B515C',
};

export const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  ai: '#1FD1C1',
  design: '#FF7AC6',
  coding: '#5FA8FF',
  business: '#4C4CE0',
  marketing: '#FFC93C',
  hosting: '#39C7A8',
  finance: '#8A93A3',
  productivity: '#B18CFF',
  entertainment: '#FF7A5C',
  other: '#6B7482',
};

export const CHART_PALETTE = [
  COLORS.teal,
  COLORS.indigo,
  COLORS.yellow,
  '#5FA8FF',
  '#FF7A5C',
  '#B18CFF',
  '#39C7A8',
  '#8A93A3',
];
