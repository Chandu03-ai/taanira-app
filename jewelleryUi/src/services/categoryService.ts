import BaseService from './baseService';
import { API_ENDPOINTS } from '../constants/appConstants';
import { Category, ImageFile } from '../types';
import { ApiResponse } from '../types/api';


interface FormDataShape {
  image?: string;
  [key: string]: any;
}

class CategoryService extends BaseService {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.get<Category[]>(API_ENDPOINTS.CATEGORIES, true);
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<ApiResponse<Category>> {
    return this.post<Category>(API_ENDPOINTS.CREATE_CATEGORY, category, true);
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${API_ENDPOINTS.DELETE_CATEGORY}/${id}`, true);
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<ApiResponse<Category>> {
    return this.put<Category>(`${API_ENDPOINTS.UPDATE_CATEGORY}/${id}`, data, true);
  }

  /**
   * Uploads multiple category images to the server.
   * @param imageFiles - Array of image files.
   * @param formData - The form data containing fallback image URLs.
   * @returns A promise that resolves to an array of uploaded image filenames.
   */
  async uploadImage(imageFiles: ImageFile[], formData: FormDataShape): Promise<string[]> {
    if (imageFiles.length === 0) {
      return formData.image ? [formData.image] : [];
    }

    // Filter out already uploaded images
    const alreadyUploadedUrls = imageFiles
      .filter(file => file.uploaded && file.url)
      .map(file => file.url as string);

    const filesToUpload = imageFiles.filter(file => !file.uploaded && file.file);

    if (filesToUpload.length === 0) {
      // No new files, return existing URLs
      return alreadyUploadedUrls;
    }

    try {
      const formDataUpload = new FormData();
      filesToUpload.forEach(fileObj => {
        if (fileObj.file) {
          formDataUpload.append('files', fileObj.file); // Use 'files' to match backend
        }
      });

      const response = await fetch('/api/upload-files', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 2100 && Array.isArray(result.result)) {
        return [...alreadyUploadedUrls, ...result.result]; // Combine both
      } else {
        console.error('Unexpected upload response:', result);
        throw new Error('Invalid upload response');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
