import { ApiResponse } from '../types/api';

class BaseService {
  private baseURL: string;

  constructor() {
    this.baseURL = '/api'; // Using Vite proxy
  }

  private getHeaders(requireAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    return headers;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(requireAuth),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error [${response.status}] ${endpoint}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  protected async get<T>(endpoint: string, requireAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, requireAuth);
  }

  protected async post<T>(
    endpoint: string,
    body?: any,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      requireAuth
    );
  }

  protected async put<T>(
    endpoint: string,
    body?: any,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      requireAuth
    );
  }

  protected async delete<T>(endpoint: string, requireAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requireAuth);
  }

  protected async uploadFile<T>(
    endpoint: string,
    file: File,
    requireAuth = true
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }
}

export default BaseService;