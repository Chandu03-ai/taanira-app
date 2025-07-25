import BaseService from './baseService';
import { API_ENDPOINTS } from '../constants/appConstants';
import { CartItem } from '../types';
import { ApiResponse } from '../types/api';

class CartService extends BaseService {
  async addToCart(productId: string, quantity: number): Promise<ApiResponse<void>> {
    return this.post<void>(API_ENDPOINTS.ADD_TO_CART, { productId, quantity }, true);
  }

  async getCart(): Promise<ApiResponse<CartItem[]>> {
    return this.get<CartItem[]>(API_ENDPOINTS.GET_CART, true);
  }

  // ✅ Updated to use productId instead of cartId
  async updateCartItem(productId: string, quantity: number): Promise<ApiResponse<void>> {
    return this.put<void>(
      `${API_ENDPOINTS.UPDATE_CART}/${productId}?quantity=${quantity}`,
      null,
      true
    );
  }

  // ✅ Also update remove to use productId
  async removeFromCart(productId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${API_ENDPOINTS.REMOVE_FROM_CART}/${productId}`, true);
  }

  async mergeCart(guestCartItems: any[]): Promise<ApiResponse<void>> {
    return this.post<void>(API_ENDPOINTS.MERGE_CART, { items: guestCartItems }, true);
  }
}

export const cartService = new CartService();
