import React, { useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaUserCircle } from 'react-icons/fa';
import { api } from '../utils/api';
import StarRating from './StarRating';
import { LoadingSpinner } from "./Loading";

const ReviewList = ({ shopId, isAdminView = false, refreshKey = 0 }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    sort: 'recent',
    rating: '',
    status: isAdminView ? 'all' : 'approved',
    search: ''
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: isAdminView ? prev.status || 'all' : 'approved'
    }));
  }, [isAdminView]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sort || undefined,
        rating: filters.rating || undefined,
        search: filters.search?.trim() || undefined,
        status: isAdminView ? filters.status || 'all' : 'approved'
      };

      const response = await api.get(`/reviews/shop/${shopId}`, { params });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to load reviews');
      }

      setReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
      setPagination((prev) => ({
        ...prev,
        ...(response.data.pagination || {})
      }));
    } catch (fetchError) {
      console.error('Fetch reviews error:', fetchError);
      setReviews([]);
      setError(fetchError?.response?.data?.message || 'Could not load reviews right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!shopId) return;
    fetchReviews();
  }, [
    shopId,
    pagination.page,
    pagination.limit,
    filters.sort,
    filters.rating,
    filters.status,
    filters.search,
    isAdminView,
    refreshKey
  ]);

  const headerText = useMemo(() => {
    if (pagination.total === 1) return '1 review found';
    return `${pagination.total || 0} reviews found`;
  }, [pagination.total]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'approved') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'pending') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (status === 'rejected') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const hasFilters = Boolean(filters.rating || filters.search || (isAdminView && filters.status !== 'all'));

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={filters.sort}
            onChange={(event) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setFilters((prev) => ({ ...prev, sort: event.target.value }));
            }}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>

          <select
            value={filters.rating}
            onChange={(event) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setFilters((prev) => ({ ...prev, rating: event.target.value }));
            }}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {isAdminView ? (
            <select
              value={filters.status}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setFilters((prev) => ({ ...prev, status: event.target.value }));
              }}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          ) : (
            <div className="hidden md:block" />
          )}

          <input
            type="text"
            value={filters.search}
            onChange={(event) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setFilters((prev) => ({ ...prev, search: event.target.value }));
            }}
            placeholder="Search by name, email, or comment..."
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <p>{headerText}</p>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setFilters({
                  sort: 'recent',
                  rating: '',
                  status: isAdminView ? 'all' : 'approved',
                  search: ''
                });
              }}
              className="text-cyan-700 hover:text-cyan-800 font-semibold"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      </div>

      {loading && reviews.length === 0 ? (
        <div className="text-center py-10">
          <div className="mx-auto flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
          <p className="text-sm text-slate-600 mt-3">Loading reviews...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-sm">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="text-lg font-semibold text-slate-700">No Reviews Found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {hasFilters ? 'Try changing your filters.' : 'Be the first to review this shop.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <FaUserCircle className="text-2xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{review.userName || 'Anonymous User'}</p>
                    <p className="text-xs text-slate-500">{review.userEmail || '-'}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span>{formatDate(review.createdAt)}</span>
                      {review.appointmentId ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <FaCheckCircle className="text-[10px]" />
                          Verified Appointment
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StarRating rating={Number(review.rating || 0)} />
                  {isAdminView ? (
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${getStatusBadgeClass(
                        review.status
                      )}`}
                    >
                      {review.status || 'pending'}
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {review.comment || 'No written comment.'}
              </p>
            </article>
          ))}
        </div>
      )}

      {pagination.pages > 1 ? (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page <= 1}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ReviewList;
