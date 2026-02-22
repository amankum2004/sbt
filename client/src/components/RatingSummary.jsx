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



// import React from 'react';

// const RatingSummary = ({ averageRating, totalReviews, ratingBreakdown }) => {
//   const breakdown = ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
//   const total = totalReviews || Object.values(breakdown).reduce((a, b) => a + b, 0);

//   const getPercentage = (count) => {
//     return total > 0 ? Math.round((count / total) * 100) : 0;
//   };

//   return (
//     <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-5">
//         <h2 className="text-lg font-semibold text-gray-900">Customer Reviews</h2>
//         <div className="text-sm text-gray-500">
//           {total} {total === 1 ? 'review' : 'reviews'}
//         </div>
//       </div>

//       {/* Overall Rating - Compact */}
//       <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
//         <div className="flex items-center gap-3">
//           <div className="text-3xl font-bold text-gray-900">
//             {averageRating?.toFixed(1) || '0.0'}
//           </div>
//           <div className="flex flex-col">
//             <div className="flex">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <span key={star} className="text-yellow-400">
//                   {star <= (averageRating || 0) ? '★' : '☆'}
//                 </span>
//               ))}
//             </div>
//             <div className="text-xs text-gray-500 mt-1">
//               Overall rating
//             </div>
//           </div>
//         </div>
        
//         {/* Rating badge for high ratings */}
//         {averageRating >= 4.5 && total > 0 && (
//           <div className="bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-200">
//             ⭐ Excellent
//           </div>
//         )}
//       </div>

//       {/* Rating Breakdown - Minimalist */}
//       <div className="space-y-3">
//         {[5, 4, 3, 2, 1].map((rating) => {
//           const count = breakdown[rating] || 0;
//           const percentage = getPercentage(count);
          
//           return (
//             <div key={rating} className="flex items-center gap-2">
//               {/* Star label */}
//               <div className="w-8 text-sm font-medium text-gray-700 flex items-center">
//                 {rating}
//                 <span className="text-yellow-400 ml-0.5">★</span>
//               </div>
              
//               {/* Progress bar */}
//               <div className="flex-1">
//                 <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
//                     style={{ width: `${percentage}%` }}
//                   />
//                 </div>
//               </div>
              
//               {/* Count and percentage */}
//               <div className="flex items-center gap-2 w-20 justify-end">
//                 <span className="text-xs text-gray-600 font-medium">
//                   {percentage}%
//                 </span>
//                 <span className="text-xs text-gray-400">
//                   ({count})
//                 </span>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Quick Stats - Only show if there are reviews */}
//       {total > 0 && (
//         <div className="mt-5 pt-4 border-t border-gray-100">
//           <div className="grid grid-cols-3 gap-3">
//             <div className="text-center p-2 bg-green-50 rounded-lg">
//               <div className="text-sm font-bold text-green-700">{breakdown[5] || 0}</div>
//               <div className="text-xs text-green-600">5★</div>
//             </div>
//             <div className="text-center p-2 bg-blue-50 rounded-lg">
//               <div className="text-sm font-bold text-blue-700">{breakdown[4] || 0}</div>
//               <div className="text-xs text-blue-600">4★</div>
//             </div>
//             <div className="text-center p-2 bg-gray-50 rounded-lg">
//               <div className="text-sm font-bold text-gray-700">
//                 {(breakdown[3] || 0) + (breakdown[2] || 0) + (breakdown[1] || 0)}
//               </div>
//               <div className="text-xs text-gray-600">≤3★</div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RatingSummary;
