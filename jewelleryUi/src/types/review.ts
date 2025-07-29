export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment?: string;
  reviewedBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  userName: string;
}

export interface ReviewFormData {
  productId: string;
  rating: number;
  comment: string;
  reviewedBy: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}