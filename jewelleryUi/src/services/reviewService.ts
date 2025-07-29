import BaseService from './baseService';
import { Review, ReviewFormData } from '../types/review';
import { ApiResponse } from '../types/api';
import { API_ENDPOINTS } from '../constants/appConstants';

class ReviewService extends BaseService {
  async createReview(reviewData: ReviewFormData): Promise<ApiResponse<Review>> {
    return this.post<Review>(API_ENDPOINTS.CREATE_REVIEW, reviewData, true);
  }

  async getProductReviews(productId: string): Promise<ApiResponse<Review[]>> {
    return this.get<Review[]>(`${API_ENDPOINTS.GET_PRODUCT_REVIEWS}/${productId}`, true);
  }

  async getReviewById(reviewId: string): Promise<ApiResponse<Review>> {
    return this.get<Review>(`${API_ENDPOINTS.GET_REVIEW_BY_ID}/${reviewId}`, true);
  }

  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${API_ENDPOINTS.DELETE_REVIEW}/${reviewId}`, true);
  }
}

export const reviewService = new ReviewService();