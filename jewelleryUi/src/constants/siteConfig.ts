// Site configuration - centralized settings
export const staticImageBaseUrl = '/api/static/images/';

export const SITE_CONFIG = {
  name: import.meta.env.VITE_SITE_NAME || 'Taanira',
  shortName: import.meta.env.VITE_SITE_SHORT_NAME || '𝒯𝒶𝒶𝓃𝒾𝓇𝒶',
  description: import.meta.env.VITE_SITE_DESCRIPTION || 'Handmade treasures with heart, history, and harmony.',
  tagline: import.meta.env.VITE_SITE_TAGLINE || 'Each piece is made with love and care — a touch of tradition, a bit of art, and a lot of heart.',
  domain: import.meta.env.VITE_SITE_DOMAIN || 'Taanira.com',
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@Taanira.com',
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '1800-102-0103',
  address: import.meta.env.VITE_SITE_ADDRESS || 'Hyderabad Manikonda, Hyderabad',
  workingHours: import.meta.env.VITE_WORKING_HOURS || '10:00 AM - 10:00 PM',

  // Social media
  social: {
    facebook: import.meta.env.VITE_FACEBOOK_URL || '#',
    instagram: import.meta.env.VITE_INSTAGRAM_URL || '#',
    twitter: import.meta.env.VITE_TWITTER_URL || '#',
    youtube: import.meta.env.VITE_YOUTUBE_URL || '#',
  },

  // Business settings
  freeShippingThreshold: parseInt(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD || '500'),
  internationalShippingCost: parseInt(import.meta.env.VITE_INTERNATIONAL_SHIPPING_COST || '3000'),
  currency: import.meta.env.VITE_CURRENCY || 'INR',
  currencySymbol: import.meta.env.VITE_CURRENCY_SYMBOL || '₹',

  // Features
  features: {
    codEnabled: import.meta.env.VITE_COD_ENABLED === 'true',
    returnsEnabled: import.meta.env.VITE_RETURNS_ENABLED !== 'false',
    reviewsEnabled: import.meta.env.VITE_REVIEWS_ENABLED !== 'false',
    wishlistEnabled: import.meta.env.VITE_WISHLIST_ENABLED !== 'false',
  }
};
