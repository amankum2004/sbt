import React from 'react';

const RatingSummary = ({ averageRating, totalReviews }) => {
  const total = totalReviews || 0;
  
  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.0) return 'Good';
    if (rating >= 2.0) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Rating Circle */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">
              {averageRating?.toFixed(1) || '0.0'}
            </span>
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
            {total} reviews
          </div>
        </div>

        {/* Rating Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-yellow-400">
                  {star <= (averageRating || 0) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {getRatingText(averageRating || 0)}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Customer satisfaction based on {total} verified reviews
          </p>
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