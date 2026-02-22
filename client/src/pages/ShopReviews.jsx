import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaStar } from 'react-icons/fa';
import { api } from '../utils/api';
import { useLogin } from '../components/LoginContext';
import RatingSummary from '../components/RatingSummary';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

const ShopReviews = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useLogin();

  const isAdminView = location.pathname.startsWith('/admin');
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const appointmentId =
    location.state?.appointmentId ||
    queryParams.get('appointmentId') ||
    null;

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/shop/shoplists/${shopId}`);
      const shopData = response.data?.shop || response.data;
      setShop(shopData?._id ? shopData : null);
    } catch (error) {
      console.error('Fetch shop details error:', error);
      setShop(null);
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    if (!user || isAdminView || !shopId || !appointmentId) {
      setUserReview(null);
      return;
    }

    try {
      const response = await api.get(`/reviews/shop/${shopId}/user-review`, {
        params: { appointmentId }
      });

      if (response.data?.success) {
        setUserReview(response.data.review || null);
      }
    } catch (error) {
      console.error('Check user review error:', error);
      setUserReview(null);
    }
  };

  useEffect(() => {
    if (shopId) fetchShopDetails();
  }, [shopId]);

  useEffect(() => {
    checkUserReview();
  }, [shopId, user, isAdminView, appointmentId]);

  const handleReviewSubmitted = (review) => {
    setUserReview(review || null);
    setShowReviewForm(false);
    setReviewRefreshKey((prev) => prev + 1);
    fetchShopDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin" />
          <p className="mt-2 text-slate-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">❌</div>
          <h2 className="text-2xl font-bold text-slate-900">Shop Not Found</h2>
          <button
            type="button"
            onClick={() => navigate(isAdminView ? '/admin/shops' : '/nearbyShops')}
            className="mt-3 text-cyan-700 hover:text-cyan-800 font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <FaArrowLeft />
          Back
        </button>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <h1 className="text-3xl font-bold text-slate-900">{shop.shopname}</h1>
          <p className="mt-1 text-slate-600">{[shop.street, shop.city, shop.state].filter(Boolean).join(', ')}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <FaStar className="text-amber-500" />
              <span className="text-lg font-bold text-slate-900">{Number(shop.averageRating || 0).toFixed(1)}</span>
              <span className="text-sm text-slate-600">({shop.totalReviews || 0} reviews)</span>
            </div>

            {isAdminView ? (
              <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
                Admin View
              </span>
            ) : null}

            {!isAdminView && user && appointmentId && !userReview ? (
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
              >
                <FaEdit />
                Write a Review
              </button>
            ) : null}

            {!isAdminView && userReview ? (
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                <FaStar />
                Edit Your Review ({userReview.rating}★)
              </button>
            ) : null}
          </div>

          {!isAdminView && user && !appointmentId ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              To keep reviews verified, submission is available only from completed appointments in your dashboard.
            </div>
          ) : null}
        </section>

        <div className="mt-6">
          <RatingSummary
            averageRating={shop.averageRating}
            totalReviews={shop.totalReviews}
            ratingBreakdown={shop.ratingBreakdown}
          />
        </div>

        {!isAdminView && showReviewForm ? (
          <div className="mt-6">
            <ReviewForm
              shopId={shopId}
              shopName={shop.shopname}
              appointmentId={appointmentId}
              existingReview={userReview}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        ) : null}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Customer Reviews</h2>
          <ReviewList shopId={shopId} isAdminView={isAdminView} refreshKey={reviewRefreshKey} />
        </section>
      </div>
    </div>
  );
};

export default ShopReviews;
