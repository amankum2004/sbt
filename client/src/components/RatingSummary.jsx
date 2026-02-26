import React from 'react';

const EMPTY_BREAKDOWN = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

const RatingSummary = ({ averageRating = 0, totalReviews = 0, ratingBreakdown }) => {
  const normalizedBreakdown = {
    ...EMPTY_BREAKDOWN,
    ...(ratingBreakdown || {}),
  };

  const totalFromBreakdown = Object.values(normalizedBreakdown).reduce(
    (sum, count) => sum + Number(count || 0),
    0
  );
  const total = Number(totalReviews || totalFromBreakdown || 0);
  const ratingValue = Number(averageRating || 0);

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.0) return 'Good';
    if (rating >= 2.0) return 'Fair';
    return 'Needs Improvement';
  };

  const getPercentage = (count) => {
    if (!total) return 0;
    return Math.round((Number(count || 0) / total) * 100);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-500">Overall Rating</p>
          <p className="mt-2 text-4xl font-black text-slate-900">{ratingValue.toFixed(1)}</p>
          <div className="mt-1 text-yellow-500 text-lg">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>{star <= Math.round(ratingValue) ? '★' : '☆'}</span>
            ))}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">{getRatingText(ratingValue)}</p>
          <p className="mt-1 text-xs text-slate-500">{total} {total === 1 ? 'review' : 'reviews'}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">Rating Distribution</p>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = Number(normalizedBreakdown[rating] || 0);
            const percentage = getPercentage(count);

            return (
              <div key={rating} className="grid grid-cols-[48px_1fr_78px] items-center gap-3">
                <span className="text-sm font-medium text-slate-700">{rating} ★</span>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 text-right">{count} ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RatingSummary;

