import BaseService from './baseService';
import { ApiResponse } from '../types/api';

interface StockUpdate {
  productId: string;
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
}

interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  category: string;
}

interface StockHistory {
  id: string;
  productId: string;
  previousQuantity: number;
  newQuantity: number;
  operation: string;
  reason: string;
  timestamp: string;
  userId?: string;
}

class StockService extends BaseService {
  async updateProductStock(productId: string, quantity: number): Promise<ApiResponse<void>> {
    return this.put<void>(`/products/${productId}/stock`, { quantity }, true);
  }

  async bulkUpdateStock(updates: StockUpdate[]): Promise<ApiResponse<void>> {
    return this.post<void>('/products/stock/bulk-update', { updates }, true);
  }

  async getStockAlerts(): Promise<ApiResponse<StockAlert[]>> {
    return this.get<StockAlert[]>('/products/stock/alerts', true);
  }

  async getStockHistory(productId?: string): Promise<ApiResponse<StockHistory[]>> {
    const endpoint = productId 
      ? `/products/${productId}/stock/history`
      : '/products/stock/history';
    return this.get<StockHistory[]>(endpoint, true);
  }

  async setStockAlert(productId: string, threshold: number): Promise<ApiResponse<void>> {
    return this.put<void>(`/products/${productId}/stock/alert`, { threshold }, true);
  }
}

export const stockService = new StockService();