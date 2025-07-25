export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_TOKEN: '/verifyToken',
  SEND_EMAIL: '/auth/sendEmail',
  LOGOUT: '/logout',

  // Product endpoints
  PRODUCTS: '/auth/products',
  FEATURED_PRODUCTS: '/products/featured',
  PRODUCTS_BY_TAG: '/products/by-tag',
  SEARCH_PRODUCTS: '/products/search',
  SEARCH_SUGGESTIONS: '/products/suggestions',
  UPDATE_PRODUCT: '/product/id',
  PRODUCT_BY_SLUG: '/auth/products',
  FILTER_PRODUCTS: '/auth/products/filter',
  IMPORT_PRODUCTS: '/importproducts',
  UPLOAD_IMAGE: '/products/image-upload',
  DELETE_PRODUCTS: '/deleteProducts',
  DELETE_PRODUCT: '/products',
  UPDATE_PRODUCT_STOCK: '/products',
  UPDATE_PRODUCT_RATING: '/products',
  PRODUCT_REVIEWS: '/products',
  ADD_PRODUCT_REVIEW: '/products',

  // Category endpoints
  CATEGORIES: '/public/categories',
  CREATE_CATEGORY: '/admin/categories',
  DELETE_CATEGORY: '/admin/categories',
  UPDATE_CATEGORY: '/admin/categories',
  UPDATE_CATEGORY_ORDER: '/admin/categories/order',

  // Tag endpoints
  TAGS: '/public/tags',
  CREATE_TAG: '/admin/tags',
  UPDATE_PRODUCT_TAGS: '/products',
  TAG_STATS: '/admin/stats/tags',

  // Variant endpoints
  VARIANTS: '/auth/variants',
  CREATE_VARIANT: '/variants',

  // Review endpoints
  GET_REVIEWS: '/auth/products',
  ADD_REVIEW: '/products',
  ADMIN_REVIEWS: '/admin/reviews',
  MODERATE_REVIEW: '/admin/reviews',

  // Cart endpoints
  ADD_TO_CART: '/cart/add',
  GET_CART: '/cart',
  UPDATE_CART: '/cart/update',
  REMOVE_FROM_CART: '/cart/remove',
  MERGE_CART: '/cart/merge',

  // Wishlist endpoints
  ADD_TO_WISHLIST: '/user/wishlist',
  GET_WISHLIST: '/user/wishlist',
  REMOVE_FROM_WISHLIST: '/user/wishlist',

  // Order endpoints
  CREATE_ORDER: '/order',
  UPDATE_ORDER_STATUS: '/admin/orders',
  GET_ORDER: '/orders',
  GET_ORDER_PAYMENTS: '/orders',
  LIST_ORDERS: '/orderservice',
  ADMIN_ORDERS: '/admin/orders',
  GET_USER_ORDERS: '/user/orders',

  // Payment endpoints
  CREATE_PAYMENT_ORDER: '/payment/create-order',
  VERIFY_PAYMENT: '/payments/payment/verify',
  PAYMENT_STATUS: '/payment/status',

  // User endpoints
  USER_PROFILE: '/user/profile',
  USER_ORDERS: '/user/orders',
  USER_CART: '/cart',

  // Address endpoints
  USER_ADDRESSES: '/user/addresses',
  CREATE_ADDRESS: '/user/addresses',
  UPDATE_ADDRESS: '/user/addresses',
  DELETE_ADDRESS: '/user/addresses',
  SET_DEFAULT_ADDRESS: '/user/addresses',

  // Admin endpoints
  ADMIN_PRODUCT_STATS: '/admin/stats/products',
  ADMIN_ORDER_STATS: '/admin/stats/orders',
  ADMIN_DASHBOARD_STATS: '/admin/stats/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_ROLE: '/admin/users',
  ADMIN_USER_ORDER_COUNT: '/admin/user',
  ADMIN_SEND_TRACKING: '/admin/send-tracking',
  BULK_CREATE_PRODUCTS: '/admin/products/bulk',
  UPDATE_PRODUCT_VISIBILITY: '/admin/products',
  BULK_UPDATE_TAGS: '/admin/products/tags/bulk',

  // Stock endpoints
  UPDATE_STOCK: '/products',
  BULK_UPDATE_STOCK: '/products/stock/bulk-update',
  STOCK_ALERTS: '/products/stock/alerts',
  STOCK_HISTORY: '/products/stock/history',


  // File upload
  UPLOAD_FILE: '/upload-file',
  UPLOAD_FILES: '/upload-files',

  // SEO endpoints
  SITEMAP: '/sitemap.xml',
  ROBOTS: '/robots.txt',
  META_TAGS: '/seo/meta-tags',
  STRUCTURED_DATA: '/seo/structured-data',
  REDIRECTS: '/seo/redirects',
};

export const RESPONSE_CODES = {
  SUCCESS: 1000,
  TOKEN_VERIFIED: 1040,
  LOGIN_SUCCESS: 1003,
  REGISTER_SUCCESS: 1046,
  ERROR: 2000,
  UNAUTHORIZED: 2001,
  NOT_FOUND: 2004,
  VALIDATION_ERROR: 2002,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  WISHLIST_DATA: 'wishlist_data',
  ANALYTICS_SESSION: 'analytics_session_id',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export const CACHE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  USER_PROFILE: 'user_profile',
};

export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
};