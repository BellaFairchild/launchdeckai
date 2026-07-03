import type { BillingType, SubscriptionCategory } from '../types/models';

export interface PopularTool {
  name: string;
  category: SubscriptionCategory;
  billingType: BillingType;
  defaultCost: number;
  websiteUrl?: string;
}

/** Curated defaults for Quick Add onboarding (brief section 8.8). */
export const POPULAR_TOOLS: PopularTool[] = [
  // AI Tools
  { name: 'ChatGPT', category: 'ai', billingType: 'monthly', defaultCost: 20, websiteUrl: 'https://chat.openai.com' },
  { name: 'Claude', category: 'ai', billingType: 'monthly', defaultCost: 20, websiteUrl: 'https://claude.ai' },
  { name: 'Midjourney', category: 'ai', billingType: 'monthly', defaultCost: 10, websiteUrl: 'https://midjourney.com' },
  { name: 'ElevenLabs', category: 'ai', billingType: 'monthly', defaultCost: 5, websiteUrl: 'https://elevenlabs.io' },
  // Design
  { name: 'Canva', category: 'design', billingType: 'monthly', defaultCost: 13, websiteUrl: 'https://canva.com' },
  { name: 'Figma', category: 'design', billingType: 'monthly', defaultCost: 15, websiteUrl: 'https://figma.com' },
  { name: 'Adobe Creative Cloud', category: 'design', billingType: 'monthly', defaultCost: 60, websiteUrl: 'https://adobe.com' },
  // Coding
  { name: 'Cursor', category: 'coding', billingType: 'monthly', defaultCost: 20, websiteUrl: 'https://cursor.sh' },
  { name: 'GitHub', category: 'coding', billingType: 'monthly', defaultCost: 4, websiteUrl: 'https://github.com' },
  { name: 'Vercel', category: 'hosting', billingType: 'monthly', defaultCost: 20, websiteUrl: 'https://vercel.com' },
  { name: 'Expo', category: 'coding', billingType: 'monthly', defaultCost: 29, websiteUrl: 'https://expo.dev' },
  // Business
  { name: 'Google Workspace', category: 'business', billingType: 'monthly', defaultCost: 12, websiteUrl: 'https://workspace.google.com' },
  { name: 'Notion', category: 'business', billingType: 'monthly', defaultCost: 10, websiteUrl: 'https://notion.so' },
  { name: 'Zoom', category: 'business', billingType: 'monthly', defaultCost: 15, websiteUrl: 'https://zoom.us' },
  // Marketing
  { name: 'ConvertKit', category: 'marketing', billingType: 'monthly', defaultCost: 29, websiteUrl: 'https://convertkit.com' },
  { name: 'Mailchimp', category: 'marketing', billingType: 'monthly', defaultCost: 13, websiteUrl: 'https://mailchimp.com' },
  { name: 'Buffer', category: 'marketing', billingType: 'monthly', defaultCost: 6, websiteUrl: 'https://buffer.com' },
];

export const POPULAR_TOOL_CATEGORIES: SubscriptionCategory[] = ['ai', 'design', 'coding', 'business', 'marketing'];
