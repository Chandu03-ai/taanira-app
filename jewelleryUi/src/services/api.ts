import { 
  authService, 
  productService, 
  categoryService, 
  cartService,   
  orderService,
  paymentService,
  adminService,
  reviewService
} from './index';
import { Product, Category, CartItem, ProductFilters, ProductImport, Order, User, OrderRequest } from '../types';
import { Review, ReviewFormData } from '../types/review';
import { addressService } from '../services/addressService';

class ApiService {
  // Auth methods
  async login(credentials: { username: string; password: string }) {
    const response = await authService.login(credentials);
    return response.result;
  }

  async register(userData: any) {
    const response = await authService.register(userData);
    return response.result;
  }

  async verifyToken() {
    return await authService.verifyToken();
  }

  async logout() {
    return await authService.logout();
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    try {
      const response = await productService.getProducts();
      return response?.result || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await productService.getFeaturedProducts();
      return response?.result || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  async getProductsByTag(tag: string): Promise<Product[]> {
    try {
      const response = await productService.getProductsByTag(tag);
      return response?.result || [];
    } catch (error) {
      console.error('Error fetching products by tag:', error);
      return [];
    }
  }

  async getProductBySlug(slug: string): Promise<Product> {
    try {
      const response = await productService.getProductBySlug(slug);
      return response?.result || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async filterProducts(filters: ProductFilters): Promise<Product[]> {
    try {
      const response = await productService.filterProducts(filters);
      return response?.result || [];
    } catch (error) {
      console.error('Error filtering products:', error);
      return [];
    }
  }

  async searchProducts(query: string): Promise<{ products: Product[]; total: number; suggestions?: any[] }> {
    try {
      const response = await productService.searchProducts(query);
      return response?.result || { products: [], total: 0 };
    } catch (error) {
      console.error('Error searching products:', error);
      return { products: [], total: 0 };
    }
  }

 async createProduct(product: ProductImport): Promise<void> {
  await productService.createProduct(product);
}

  async uploadProductImage(file: File): Promise<{ url: string }> {
    const response = await productService.uploadProductImage(file);
    return response.result;
  }

  async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    const response = await productService.updateProduct(productId, productData);
    return response.result;
  }

  async updateProductStock(productId: string, quantity: number): Promise<void> {
    await productService.updateProductStock(productId, quantity);
  }

  async deleteProducts(): Promise<void> {
    await productService.deleteProducts();
  }

  async deleteProductById(productId: string): Promise<void> {
    await productService.deleteProductById(productId);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    try {
      const response = await categoryService.getCategories();
      return response?.result || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await categoryService.createCategory(category);
    return response.result;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const response = await categoryService.updateCategory(id, data);
  return response.result;
}


  async deleteCategory(id: string): Promise<void> {
    await categoryService.deleteCategory(id);
  }

  // Cart methods
  async addToCart(productId: string, quantity: number): Promise<void> {
    await cartService.addToCart(productId, quantity);
  }

  async getCart(): Promise<CartItem[]> {
    const response = await cartService.getCart();
    return response.result;
  }


  // Order methods
  async createOrder(orderData: OrderRequest) {
    const response = await orderService.createOrder(orderData);
    return response.result;
  }


  async getOrder(orderId: string) {
    const response = await orderService.getOrder(orderId);
    return response.result;
  }

  async getOrderPayments(orderId: string) {
    const response = await orderService.getOrderPayments(orderId);
    return response.result;
  }

  async listOrders() {
    const response = await orderService.listOrders();
    return response.result;
  }

  async verifyPayment(paymentData: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    const response = await orderService.verifyPayment(paymentData);
    return response.result;
  }


async getUserOrders(): Promise<Order[]> {
  const response = await orderService.getUserOrders();
  console.log("getuser",response)
  return response.result;
}


  // Payment methods
  async createPaymentOrder(orderData: any) {
    const response = await paymentService.createPaymentOrder(orderData);
    return response.result;
  }

  async verifyPaymentSignature(paymentData: any) {
    const response = await paymentService.verifyPayment(paymentData);
    return response.result;
  }

  // Address methods
  async getUserAddresses() {
    const response = await addressService.getUserAddresses();
    return response.result;
  }

  async createAddress(addressData: any) {
    const response = await addressService.createAddress(addressData);
    return response.result;
  }

  async updateAddress(addressId: string, addressData: any) {
    const response = await addressService.updateAddress(addressId, addressData);
    return response.result;
  }

  async deleteAddress(addressId: string) {
    await addressService.deleteAddress(addressId);
  }

  async setDefaultAddress(addressId: string) {
    await addressService.setDefaultAddress(addressId);
  }

  async validatePincode(pincode: string) {
    const response = await addressService.validatePincode(pincode);
    return response.result;
  }

  // Admin methods
  async getProductStats() {
    const response = await adminService.getProductStats();
    return response.result;
  }

  async getOrderStats() {
    const response = await adminService.getOrderStats();
    return response.result;
  }

  async getAllOrders(): Promise<Order[]> {
    const response = await adminService.getAllOrders();
    return response.result;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await adminService.getAllUsers();
    return response.result;
  }

  async updateOrderStatus(orderId: string, status: string) {
    await adminService.updateOrderStatus(orderId, status);
  }

  async updateUserRole(userId: string, role: string) {
    await adminService.updateUserRole(userId, role);
  }

  // Review methods
  async createReview(reviewData: ReviewFormData): Promise<Review> {
    const response = await reviewService.createReview(reviewData);
    return response.result;
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const response = await reviewService.getProductReviews(productId);
      return response.result || [];
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  }

  async getReviewById(reviewId: string): Promise<Review> {
    const response = await reviewService.getReviewById(reviewId);
    return response.result;
  }

  async deleteReview(reviewId: string): Promise<void> {
    await reviewService.deleteReview(reviewId);
  }

}

export const apiService = new ApiService();