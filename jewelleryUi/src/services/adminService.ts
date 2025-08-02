import BaseService from './baseService';
import { Order, User } from '../types';
import { ApiResponse } from '../types/api';
import { DashboardStats, ProductStats, OrderStats } from '../types/dashboard';
import { API_ENDPOINTS } from '../constants/appConstants';

class AdminService extends BaseService {
  // Consolidated dashboard data fetching
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const [productStats, orderStats, users] = await Promise.all([
        this.getProductStats(),
        this.getOrderStats(),
        this.getAllUsers(),
      ]);

      const dashboardStats: DashboardStats = {
        products: {
          total: productStats.result.totalProducts,
          inStock: productStats.result.stock,
          categories: productStats.result.categories,
        },
        orders: {
          total: orderStats.result.totalOrders,
          pending: orderStats.result.pendingOrders,
          completed: orderStats.result.completedOrders,
          revenue: orderStats.result.totalRevenue,
        },
        users: {
          total: users.result?.length || 0,
        },
      };

      return {
        code: 1000,
        message: 'Dashboard stats retrieved successfully',
        success: true,
        result: dashboardStats,
        data: dashboardStats,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Product
  async updateProductVisibility(productId: string, visible: boolean): Promise<ApiResponse<void>> {
    return this.put<void>(`${API_ENDPOINTS.UPDATE_PRODUCT_VISIBILITY}/${productId}/visibility`, { visible }, true);
  }

  async getProductStats(): Promise<ApiResponse<ProductStats>> {
    return this.get<ProductStats>(API_ENDPOINTS.ADMIN_PRODUCT_STATS, true);
  }

  // Order
  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    return this.get<Order[]>(API_ENDPOINTS.ADMIN_ORDERS, true);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<void>> {
    return this.put<void>(`${API_ENDPOINTS.UPDATE_ORDER_STATUS}/${orderId}/status`, { status }, true);
  }

  async getOrderStats(): Promise<ApiResponse<OrderStats>> {
    return this.get<OrderStats>(API_ENDPOINTS.ADMIN_ORDER_STATS, true);
  }

  // User
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.get<User[]>(API_ENDPOINTS.ADMIN_USERS, true);
  }

  async updateUserRole(userId: string, role: string): Promise<ApiResponse<void>> {
    return this.put<void>(`${API_ENDPOINTS.ADMIN_USER_ROLE}/${userId}/role`, { role }, true);
  }

  // Category
  async updateCategoryOrder(categoryIds: string[]): Promise<ApiResponse<void>> {
    return this.put<void>(API_ENDPOINTS.UPDATE_CATEGORY_ORDER, { categoryIds }, true);
  }

  // Manual Tracking
  async addManualTracking(userId: string, trackingId: string): Promise<ApiResponse<void>> {
    return this.post<void>(`${API_ENDPOINTS.ADMIN_USERS}/${userId}/tracking`, { trackingId }, true);
  }

  // User order count
  async getUserOrderCount(userId: string): Promise<ApiResponse<{ totalProducts: number }>> {
    return this.get<{ totalProducts: number }>(`${API_ENDPOINTS.ADMIN_USERS}/${userId}/order-count`, true);
  }

  async getUserOrders(userId: string): Promise<ApiResponse<Order[]>> {
  return this.get<Order[]>(`${API_ENDPOINTS.ADMIN_USERS}/${userId}/orders`, true);
}


  // Send tracking ID
  async sendTrackingId(trackingNumber: string, orderId: string): Promise<ApiResponse<any>> {
    return this.post<any>(`${API_ENDPOINTS.ADMIN_SEND_TRACKING}`, {trackingNumber, orderId }, true);
  }

  // Enable remaining payment for half-paid orders
  async enableRemainingPayment(orderId: string): Promise<ApiResponse<any>> {
    return this.post<any>(API_ENDPOINTS.ENABLE_REMAINING_PAYMENT.replace('{orderId}', orderId), {}, true);
  }

  // Send remaining payment notification
  async sendRemainingPaymentNotification(orderId: string): Promise<ApiResponse<any>> {
    return this.post<any>(API_ENDPOINTS.SEND_REMAINING_PAYMENT_NOTIFICATION.replace('{orderId}', orderId), {}, true);
  }

  // Create remaining payment order
  async createRemainingPaymentOrder(originalOrderId: string, amount: number): Promise<ApiResponse<any>> {
    return this.post<any>(API_ENDPOINTS.CREATE_REMAINING_PAYMENT_ORDER, {
      originalOrderId,
      amount,
      currency: 'INR'
    }, true);
  }
}

export const adminService = new AdminService();
