import React, { useEffect, useState } from 'react';
import { FaEye, FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import StarRating from '../components/StarRating';

const AdminReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [filters, setFilters] = useState({
    status: 'all',
    sort: 'recent',
    search: ''
  });
  const [searchInput, setSearchInput] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/admin/reviews/all-reviews', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: filters.status === 'all' ? undefined : filters.status,
          sort: filters.sort || undefined,
          search: filters.search?.trim() || undefined
        }
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to load reviews');
      }

      setReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
      setPagination((prev) => ({ ...prev, ...(response.data.pagination || {}) }));
    } catch (fetchError) {
      console.error('Fetch admin reviews error:', fetchError);
      setError(fetchError?.response?.data?.message || 'Could not load reviews.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filters.status, filters.sort, filters.search, pagination.page, pagination.limit]);

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rejected: 'bg-rose-100 text-rose-800 border-rose-200'
    };

    return (
      <span
        className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${
          classes[status] || 'bg-slate-100 text-slate-700 border-slate-200'
        }`}
      >
        {status || 'pending'}
      </span>
    );
  };

  const formatDate = (dateValue) => {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return '-';
    return parsedDate.toLocaleString();
  };

  const handleStatusChange = async (reviewId, status) => {
    try {
      const response = await api.put(`/admin/reviews/${reviewId}/status`, { status });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Status update failed');
      }

      setReviews((prev) => {
        const updated = prev.map((review) =>
          review._id === reviewId ? { ...review, status } : review
        );

        if (filters.status !== 'all' && filters.status !== status) {
          return updated.filter((review) => review._id !== reviewId);
        }
        return updated;
      });
    } catch (updateError) {
      console.error('Review status update error:', updateError);
      Swal.fire({
        title: 'Update Failed',
        text: updateError?.response?.data?.message || updateError.message || 'Could not update review.',
        icon: 'error'
      });
    }
  };

  const handleReject = async (reviewId) => {
    const result = await Swal.fire({
      title: 'Reject this review?',
      text: 'Rejected reviews will not be shown publicly.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#475569'
    });

    if (!result.isConfirmed) return;
    handleStatusChange(reviewId, 'rejected');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Reviews Management</h1>
          <p className="mt-1 text-sm text-slate-600">Moderate customer reviews and keep quality high.</p>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[180px_180px_1fr_auto] gap-3">
            <select
              value={filters.status}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setFilters((prev) => ({ ...prev, status: event.target.value }));
              }}
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.sort}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setFilters((prev) => ({ ...prev, sort: event.target.value }));
              }}
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setPagination((prev) => ({ ...prev, page: 1 }));
                    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
                  }
                }}
                placeholder="Search by customer, email, shop, or comment..."
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
              <button
                type="button"
                onClick={() => {
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white hover:bg-cyan-700"
              >
                <FaSearch />
                Search
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setPagination((prev) => ({ ...prev, page: 1 }));
                setFilters({ status: 'all', sort: 'recent', search: '' });
              }}
              className="h-11 rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-14 text-center">
              <div className="mx-auto h-12 w-12 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin" />
            </div>
          ) : error ? (
            <div className="py-14 text-center">
              <h3 className="text-lg font-semibold text-rose-700">Failed to load reviews</h3>
              <p className="mt-1 text-sm text-slate-600">{error}</p>
              <button
                type="button"
                onClick={fetchReviews}
                className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
              >
                Try Again
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-14 text-center">
              <div className="text-4xl">📝</div>
              <h3 className="mt-2 text-lg font-semibold text-slate-700">No reviews found</h3>
              <p className="text-sm text-slate-500">Try a different status, sort, or search keyword.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Review</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Shop</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((review) => (
                    <tr key={review._id}>
                      <td className="px-4 py-4 align-top">
                        <StarRating rating={Number(review.rating || 0)} size="text-base" />
                        <p className="mt-2 max-w-[340px] text-sm text-slate-700 whitespace-pre-wrap">
                          {review.comment || 'No written comment.'}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-800">
                        {review.shopId?.shopname || '-'}
                      </td>
                      <td className="px-4 py-4 align-top text-sm">
                        <p className="font-semibold text-slate-800">
                          {review.userId?.name || review.userName || 'Unknown'}
                        </p>
                        <p className="text-slate-500 break-all">
                          {review.userId?.email || review.userEmail || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-600">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-4 py-4 align-top">{getStatusBadge(review.status)}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={review.status || 'pending'}
                            onChange={(event) => handleStatusChange(review._id, event.target.value)}
                            className="h-9 rounded-lg border border-slate-300 px-2 text-sm text-slate-700"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>

                          <button
                              type="button"
                              onClick={() => navigate(`/admin/${review.shopId?._id}/review`)}
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-100"
                          >
                              <FaEye />
                              View Shop
                          </button>

                          {review.status !== 'rejected' ? (
                            <button
                              type="button"
                              onClick={() => handleReject(review._id)}
                              className="inline-flex h-9 items-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Reject
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.pages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-4">
              <p className="text-sm text-slate-600">
                Showing {reviews.length} of {pagination.total} reviews
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  type="button"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
