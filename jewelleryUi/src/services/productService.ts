import BaseService from './baseService';
import { Product, ProductFilters, ProductImport } from '../types';
import { ApiResponse } from '../types/api';

class ProductService extends BaseService {
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.get<Product[]>('/public/products');
  }
 
  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return this.get<Product[]>('/public/products/featured');
  }

  async getProductsByTag(tag: string): Promise<ApiResponse<Product[]>> {
    return this.get<Product[]>(`/public/products/by-tag/${encodeURIComponent(tag)}`);
  }

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    return this.get<Product>(`/public/products/${slug}`);
  }

  async filterProducts(filters: ProductFilters): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.priceMin) queryParams.append('priceMin', filters.priceMin.toString());
    if (filters.priceMax) queryParams.append('priceMax', filters.priceMax.toString());
    // if (filters.tags) {
    //   filters.tags.forEach(tag => queryParams.append('tags', tag));
    // }
    if (filters.q) queryParams.append('q', filters.q);
    if (filters.sort) queryParams.append('sort', filters.sort);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const endpoint = `/public/products/filter?${queryParams.toString()}`;
    return this.get<Product[]>(endpoint);
  }

  async searchProducts(query: string): Promise<ApiResponse<{ products: Product[]; total: number; suggestions?: any[] }>> {
    return this.get<{ products: Product[]; total: number; suggestions?: any[] }>(`/products/search?q=${encodeURIComponent(query)}`);
  }

  async getSearchSuggestions(query: string): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(`/public/products/suggestions?q=${encodeURIComponent(query)}`);
  }

async createProduct(product: ProductImport): Promise<ApiResponse<void>> {
  return this.post<void>('/admin/product/create', product, true);
}


  async uploadProductImage(file: File): Promise<ApiResponse<{ url: string }>> {
    return this.uploadFile<{ url: string }>('/upload-file', file, true);
  }

  async updateProduct(productId: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.put<Product>(`/admin/product/id/${productId}`, productData, true);
  }

  async updateProductStock(productId: string, quantity: number): Promise<ApiResponse<void>> {
    return this.put<void>(`/admin/product/${productId}/stock`, { quantity }, true);
  }

  async updateProductRating(productId: string, rating: number): Promise<ApiResponse<void>> {
    return this.put<void>(`/products/${productId}/rating`, { rating }, true);
  }

  async deleteProductById(productId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/admin/product/${productId}`, true);
  }

  async deleteProducts(): Promise<ApiResponse<void>> {
    return this.delete<void>('/admin/product/deleteProducts', true);
  }
}

export const productService = new ProductService();