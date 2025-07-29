import React, { useState, useEffect } from 'react';
import { Star, Trash2, Edit3, MessageCircle, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { Review, ReviewStats } from '../../types/review';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatReadableDate } from '../../utils/dateUtils';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewerName: string;
  }>({
    isOpen: false,
    reviewId: '',
    reviewerName: ''
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviewsData = await apiService.getProductReviews(productId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (): ReviewStats => {
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce((dist, review) => {
      const rating = Math.floor(review.rating) as keyof typeof dist;
      dist[rating] = (dist[rating] || 0) + 1;
      return dist;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution
    };
  };

  const stats = calculateStats();

  const userHasReviewed = reviews.some(review => review.reviewedBy === user?.id);

  const canDeleteReview = (review: Review) => {
    return user?.role === 'Admin' || review.reviewedBy === user?.id;
  };

  const handleDeleteReview = async () => {
    try {
      setDeleting(true);
      await apiService.deleteReview(deleteDialog.reviewId);
      await loadReviews();
      setDeleteDialog({ isOpen: false, reviewId: '', reviewerName: '' });
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    loadReviews();
  };

  if (loading) {
    return (
      <div className="bg-white border border-subtle-beige rounded-xl p-6 font-serif">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-subtle-beige rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-subtle-beige rounded"></div>
            <div className="h-4 bg-subtle-beige rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-serif">
      {/* Reviews Summary */}
      <div className="bg-white border border-subtle-beige rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-serif font-semibold italic text-rich-brown mb-2">
              Customer Reviews
            </h3>
            {stats.totalReviews > 0 ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <StarRating rating={stats.averageRating} size="md" />
                  <span className="text-lg font-serif font-semibold text-rich-brown">
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-mocha font-serif italic">
                  Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <p className="text-mocha font-serif italic">No reviews yet</p>
            )}
          </div>

          {/* Write Review Button */}
          {isAuthenticated && !userHasReviewed && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-soft-gold text-rich-brown rounded-lg hover:bg-rose-sand transition-all duration-200 ease-in-out font-serif font-semibold italic"
            >
              <Edit3 className="h-4 w-4" />
              <span>Write Review</span>
            </button>
          )}
        </div>

        {/* Rating Distribution */}
        {stats.totalReviews > 0 && (
          <div className="space-y-2 mb-6">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center space-x-2 text-sm">
                  <span className="flex items-center space-x-1 w-12">
                    <span className="text-rich-brown font-serif">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  </span>
                  <div className="flex-1 bg-subtle-beige rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-mocha font-serif w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Review Form */}
      {showReviewForm && isAuthenticated && (
        <ReviewForm
          productId={productId}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => setShowReviewForm(false)}
          existingReview={editingReview}
        />
      )}

      {/* Login Prompt */}
      {!isAuthenticated && (
        <div className="bg-subtle-beige border border-soft-gold rounded-xl p-4 sm:p-6 text-center">
          <MessageCircle className="h-8 w-8 text-mocha mx-auto mb-3" />
          <p className="text-rich-brown font-serif italic mb-3">
            Please log in to write a review
          </p>
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-rich-brown text-white rounded-lg hover:bg-mocha transition-all duration-200 ease-in-out font-serif font-semibold italic"
          >
            Log In
          </a>
        </div>
      )}

      {/* Already Reviewed Message */}
      {isAuthenticated && userHasReviewed && !showReviewForm && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-green-800 font-serif italic">
            Thank you for your review! You can only submit one review per product.
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white border border-subtle-beige rounded-xl p-8 text-center">
            <MessageCircle className="h-12 w-12 text-mocha/50 mx-auto mb-4" />
            <h4 className="text-lg font-serif font-semibold italic text-rich-brown mb-2">
              No Reviews Yet
            </h4>
            <p className="text-mocha font-serif italic">
              Be the first to share your thoughts about this jewelry piece!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-subtle-beige rounded-xl p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-soft-gold rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-rich-brown" />
                  </div>
                  <div>
                    <p className="font-serif font-semibold italic text-rich-brown">
                      User {review.reviewedBy.slice(-6)}
                    </p>
                    <p className="text-xs text-mocha font-serif italic">
                      {formatReadableDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                {canDeleteReview(review) && (
                  <button
                    onClick={() => setDeleteDialog({
                      isOpen: true,
                      reviewId: review.id,
                      reviewerName: `User ${review.reviewedBy.slice(-6)}`
                    })}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
                    title="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-sm font-serif font-semibold text-rich-brown">
                  {review.rating} out of 5
                </span>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-rich-brown font-serif italic leading-relaxed">
                  "{review.comment}"
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, reviewId: '', reviewerName: '' })}
        onConfirm={handleDeleteReview}
        title="Delete Review"
        message={`Are you sure you want to delete the review by ${deleteDialog.reviewerName}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};

export default ProductReviews;