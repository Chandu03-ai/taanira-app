// Export all services from a single entry point
export { authService } from './authService';
export { productService } from './productService';
export { categoryService } from './categoryService';
export { cartService } from './cartService';
export { orderService } from './orderService';
export { stockService } from './stockService';
export { paymentService } from './paymentService';
export { adminService } from './adminService';
export { addressService } from './addressService';

// Export base service for extending
export { default as BaseService } from './baseService';