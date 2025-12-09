import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import StarRating from './StarRating';
import { FaUserCircle, FaThumbsUp, FaFlag, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';

const ReviewList = ({ shopId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    sort: 'recent',
    rating: '',
    page: 1
  });

  useEffect(() => {
    fetchReviews();
  }, [shopId, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page,
        limit: pagination.limit,
        sort: filters.sort,
        ...(filters.rating && { rating: filters.rating })
      }).toString();

      const response = await api.get(`/reviews/shop/${shopId}?${params}`);
      
      if (response.data.success) {
        setReviews(response.data.reviews);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      if (response.data.success) {
        setReviews(reviews.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulCount: response.data.helpfulCount }
            : review
        ));
      }
    } catch (error) {
      console.error('Mark helpful error:', error);
    }
  };

  const handleReport = async (reviewId) => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to report this review?')) {
      try {
        const response = await api.post(`/reviews/${reviewId}/report`, {
          reason: 'Inappropriate content'
        });
        if (response.data.success) {
          alert('Review reported successfully');
        }
      } catch (error) {
        console.error('Report review error:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
        <p className="text-gray-500">Be the first to review this shop!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
          <select
            value={filters.sort}
            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by rating</label>
          <select
            value={filters.rating}
            onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Review Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {review.userPhoto ? (
                    <img 
                      src={review.userPhoto} 
                      alt={review.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="text-3xl text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{review.userName}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatDate(review.createdAt)}</span>
                    {review.isVerifiedPurchase && (
                      <span className="flex items-center gap-1 text-green-600">
                        <FaCheckCircle className="text-xs" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <StarRating rating={review.rating} />
              </div>
            </div>

            {/* Review Title */}
            {review.title && (
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{review.title}</h3>
            )}

            {/* Review Content */}
            <p className="text-gray-600 mb-4 whitespace-pre-line">{review.comment}</p>

            {/* Review Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {review.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-90"
                    onClick={() => window.open(photo, '_blank')}
                  />
                ))}
              </div>
            )}

            {/* Review Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleHelpful(review._id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <FaThumbsUp />
                  <span>Helpful ({review.helpfulCount})</span>
                </button>
                
                <button
                  onClick={() => handleReport(review._id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <FaFlag />
                  <span>Report</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={filters.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="text-gray-600">
            Page {filters.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={filters.page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;