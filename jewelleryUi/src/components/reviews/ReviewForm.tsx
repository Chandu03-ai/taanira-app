import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import StarRating from './StarRating';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
  onCancel?: () => void;
  existingReview?: any;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onReviewSubmitted,
  onCancel,
  existingReview
}) => {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!user?.id) {
      setError('You must be logged in to submit a review');
      return;
    }

    try {
      setLoading(true);
      
      await apiService.createReview({
        productId,
        rating,
        comment: comment.trim(),
        reviewedBy: user.id
      });

      // Reset form
      setRating(0);
      setComment('');
      onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-subtle-beige rounded-xl p-4 sm:p-6 font-serif">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-serif font-semibold italic text-rich-brown">
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-mocha hover:text-rich-brown transition-colors p-1"
            title="Cancel review"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-serif italic">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-serif font-semibold italic text-rich-brown mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-2">
            <StarRating
              rating={rating}
              interactive={true}
              onRatingChange={setRating}
              size="lg"
            />
            <span className="text-sm text-mocha font-serif italic ml-2">
              {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-serif font-semibold italic text-rich-brown mb-2">
            Your Review (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this jewelry piece..."
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 border border-subtle-beige rounded-lg focus:ring-2 focus:ring-soft-gold focus:border-soft-gold transition-all duration-200 ease-in-out font-serif text-rich-brown placeholder:text-mocha/60 resize-none"
          />
          <div className="text-xs text-mocha/70 mt-1 font-serif italic">
            {comment.length}/500 characters
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-serif font-semibold italic text-rich-brown bg-subtle-beige rounded-lg hover:bg-rose-sand transition-all duration-200 ease-in-out disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-serif font-semibold italic text-white bg-rich-brown rounded-lg hover:bg-mocha transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;