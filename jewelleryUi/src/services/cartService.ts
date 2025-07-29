import BaseService from './baseService';
import { API_ENDPOINTS } from '../constants/appConstants';
import { CartItem } from '../types';
import { ApiResponse } from '../types/api';

class CartService extends BaseService {
  async addToCart(productId: string, quantity: number, selectedSize?: string): Promise<ApiResponse<CartItem>> {
    return this.post<CartItem>(API_ENDPOINTS.ADD_TO_CART, { productId, quantity, selectedSize }, true);
  }

  async getCart(): Promise<ApiResponse<CartItem[]>> {
    return this.get<CartItem[]>(API_ENDPOINTS.GET_CART, true);
  }

  // ✅ Updated to use cartId instead of cartId
  async updateCartItem(cartId: string, quantity: number, selectedSize?: string): Promise<ApiResponse<void>> {
    return this.put<void>(
      `${API_ENDPOINTS.UPDATE_CART}/${cartId}?quantity=${quantity}${selectedSize ? `&selectedSize=${encodeURIComponent(selectedSize)}` : ''}`,
      null,
      true
    );
  }

  // ✅ Also update remove to use cartId
  async removeFromCart(cartId: string, selectedSize?: string): Promise<ApiResponse<void>> {
    const sizeParam = selectedSize ? `?selectedSize=${encodeURIComponent(selectedSize)}` : '';
    return this.delete<void>(`${API_ENDPOINTS.REMOVE_FROM_CART}/${cartId}${sizeParam}`, true);
  }

  async mergeCart(guestCartItems: any[]): Promise<ApiResponse<void>> {
    return this.post<void>(API_ENDPOINTS.MERGE_CART, { items: guestCartItems }, true);
  }

  async updateCartItemSize(cartId: string, selectedSize: string): Promise<ApiResponse<void>> {
    return this.put<void>(API_ENDPOINTS.UPDATE_CART_ITEM_SIZE, { cartId, selectedSize }, true);
  }
}

export const cartService = new CartService();
