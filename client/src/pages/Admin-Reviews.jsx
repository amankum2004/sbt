import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import StarRating from '../components/StarRating';
import { FaCheck, FaTimes, FaEye, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    shopId: '',
    sort: 'recent'
  });

  useEffect(() => {
    fetchReviews();
  }, [filters, pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }).toString();

    //   const response = await api.get(`/reviews/admin/all?${params}`);
      const response = await api.get(`/admin/reviews/all-reviews`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: filters.status || undefined,
          sort: filters.sort || undefined,
          search: filters.search || undefined
        }
      });

      if (response.data.success) {
        setReviews(response.data.reviews);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Fetch admin reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId, status) => {
    if (!window.confirm(`Change review status to "${status}"?`)) return;

    try {
      const res = await api.put(`/admin/reviews/${reviewId}/status`, { status });
      if (res.data.success) {
        setReviews(prev =>
          prev.map(r => r._id === reviewId ? { ...r, status } : r)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        // const response = await api.delete(`/admin/reviews/${reviewId}`);
        const response = await api.put(
          `/admin/reviews/${reviewId}/status`,
          { status: 'rejected' }
        );

        if (response.data.success) {
          setReviews(reviews.filter(r => r._id !== reviewId));
        }
      } catch (error) {
        console.error('Delete review error:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${badges[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reviews Management</h1>
          <p className="text-gray-600">Manage and moderate customer reviews</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="helpful">Most Helpful</option>
                <option value="reported">Most Reported</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by user name or comment..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                />
                <button
                  onClick={fetchReviews}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaSearch />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Found</h3>
              <p className="text-gray-500">No reviews match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review._id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <StarRating rating={review.rating} size="text-sm" />
                          <div>
                            <p className="font-medium text-gray-900">{review.title || 'No title'}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{review.comment}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {review.shopId?.shopname || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{review.userName}</div>
                          <div className="text-gray-500">{review.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(review.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={review.status}
                            onChange={(e) => handleStatusChange(review._id, e.target.value)}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          {/* {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(review._id, 'approved')}
                                className="bg-green-100 text-green-800 p-2 rounded-lg hover:bg-green-200"
                                title="Approve"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleStatusChange(review._id, 'rejected')}
                                className="bg-red-100 text-red-800 p-2 rounded-lg hover:bg-red-200"
                                title="Reject"
                              >
                                <FaTimes /> 
                              </button>
                            </>
                          )} */}
                          <button
                            onClick={() => window.open(`/admin/${review.shopId?._id}/review`, '_blank')}
                            className="bg-blue-100 text-blue-800 p-2 rounded-lg hover:bg-blue-200"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDelete(review._id)}
                            className="bg-gray-100 text-gray-800 p-2 rounded-lg hover:bg-gray-200"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing {reviews.length} of {pagination.total} reviews
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;