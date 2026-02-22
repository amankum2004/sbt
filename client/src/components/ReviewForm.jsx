import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { api } from '../utils/api';
import StarRating from './StarRating';

const DEFAULT_FORM = { rating: 0, comment: '' };

const ReviewForm = ({
  shopId,
  shopName,
  appointmentId,
  existingReview = null,
  onReviewSubmitted,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const isEditMode = Boolean(existingReview?._id);
  const missingAppointment = !appointmentId && !isEditMode;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        rating: Number(existingReview.rating || 0),
        comment: String(existingReview.comment || '')
      });
      return;
    }

    setFormData(DEFAULT_FORM);
  }, [existingReview, isEditMode]);

  const isUnchanged = useMemo(() => {
    if (!isEditMode) return false;
    const initialRating = Number(existingReview?.rating || 0);
    const initialComment = String(existingReview?.comment || '').trim();
    const currentComment = String(formData.comment || '').trim();

    return initialRating === Number(formData.rating || 0) && initialComment === currentComment;
  }, [existingReview, formData.comment, formData.rating, isEditMode]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedComment = String(formData.comment || '').trim();
    const ratingValue = Number(formData.rating || 0);

    if (missingAppointment) {
      Swal.fire({
        title: 'Appointment Required',
        text: 'Reviews can only be submitted for completed appointments.',
        icon: 'info'
      });
      return;
    }

    if (!ratingValue) {
      Swal.fire({
        title: 'Rating Required',
        text: 'Please select a star rating before submitting.',
        icon: 'warning'
      });
      return;
    }

    if (trimmedComment.length > 1000) {
      Swal.fire({
        title: 'Comment Too Long',
        text: 'Feedback must be 1000 characters or less.',
        icon: 'warning'
      });
      return;
    }

    if (isEditMode && isUnchanged) {
      Swal.fire({
        title: 'No Changes',
        text: 'Update something before saving.',
        icon: 'info',
        timer: 1200,
        showConfirmButton: false
      });
      return;
    }

    setLoading(true);
    try {
      const payload = isEditMode
        ? { rating: ratingValue, comment: trimmedComment }
        : {
            shopId,
            appointmentId,
            rating: ratingValue,
            comment: trimmedComment
          };

      const response = isEditMode
        ? await api.put(`/reviews/${existingReview._id}`, payload)
        : await api.post('/reviews/submit-review', payload);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Could not save review');
      }

      Swal.fire({
        title: isEditMode ? 'Review Updated' : 'Review Submitted',
        text: isEditMode
          ? 'Your feedback has been updated successfully.'
          : 'Thanks for sharing your experience.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      if (!isEditMode) {
        setFormData(DEFAULT_FORM);
      }

      onReviewSubmitted?.(response.data.review || response.data);
    } catch (error) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to submit review.';

      if (status === 401) {
        Swal.fire({
          title: 'Login Required',
          text: 'Please login again to continue.',
          icon: 'warning'
        });
        return;
      }

      Swal.fire({
        title: 'Review Failed',
        text: message,
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
      <h2 className="text-2xl font-bold text-slate-900">
        {isEditMode ? 'Edit Your Review' : 'Rate This Appointment'}
      </h2>

      <div className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-900">
        <strong>Shop:</strong> {shopName}
      </div>

      {missingAppointment ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Review submission is available only from a completed appointment card.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Overall Rating *</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <StarRating
              rating={formData.rating}
              size="text-3xl"
              editable
              onRatingChange={(rating) => setFormData((prev) => ({ ...prev, rating }))}
            />
            <p className="text-sm text-slate-600">
              {formData.rating > 0 ? `${formData.rating} out of 5` : 'Select your rating'}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-semibold text-slate-700 mb-2">
            Your Feedback (Optional)
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={4}
            maxLength={1000}
            value={formData.comment}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, comment: event.target.value }))
            }
            placeholder="Tell others about your experience..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 resize-none"
          />
          <p className="mt-1 text-xs text-slate-500">{formData.comment.length}/1000</p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FaTimes />
              Cancel
            </button>
          ) : null}

          <button
            type="submit"
            disabled={loading || formData.rating === 0 || missingAppointment || isUnchanged}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-amber-400 px-6 py-2.5 text-sm font-black text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Review' : 'Submit Review'}
            {!loading ? <FaPaperPlane className="text-xs" /> : null}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
