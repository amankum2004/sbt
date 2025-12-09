import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { useLogin } from '../components/LoginContext';
import RatingSummary from '../components/RatingSummary';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import { FaArrowLeft, FaStar, FaEdit } from 'react-icons/fa';

const ShopReviews = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useLogin();

  const isAdminView = location.pathname.startsWith('/admin');

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    if (shopId) {
      fetchShopDetails();

      // ✅ ONLY CUSTOMER CHECKS THEIR REVIEW
      if (!isAdminView && user) {
        checkUserReview();
      }
    }
  }, [shopId, user, isAdminView]);

  // ✅ Fetch shop details (admin + user)
    const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/shop/shoplists/${shopId}`);
      // console.log('API DATA:', res.data);

      const shopData = res.data?.shop || res.data;

      if (shopData && shopData._id) {
        setShop(shopData);
      } else {
        setShop(null);
      }

    } catch (error) {
      console.error('Fetch shop details error:', error);
      setShop(null);
    } finally {
      setLoading(false);
    }
  };


  // ✅ Customer-only review check
  const checkUserReview = async () => {
    try {
      const res = await api.get(`/reviews/check-user-review`, {
        params: { shopId }
      });
      console.log('Check user review response:', res);
      if (res.data.success && res.data.exists) {
        setUserReview(res.data.review);
      }
    } catch (error) {
      console.error('Check user review error:', error);
    }
  };

  const handleReviewSubmitted = (newReview) => {
    setUserReview(newReview);
    setShowReviewForm(false);
    fetchShopDetails();
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading reviews...</p>
        </div>
      </div>
    );
  }

  // ---------------- SHOP NOT FOUND ----------------
  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Shop Not Found
          </h2>
          <button
            onClick={() => navigate(isAdminView ? '/admin/shops' : '/salons')}
            className="text-blue-600 hover:text-blue-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <FaArrowLeft />
          Back
        </button>

        {/* SHOP HEADER */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {shop.shopname}
          </h1>
          <p className="text-gray-600 mb-4">
            {shop.street}, {shop.city}, {shop.state}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              <span className="text-xl font-bold">
                {shop.averageRating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-gray-500">
                ({shop.totalReviews || 0} reviews)
              </span>
            </div>

            {/* ✅ CUSTOMER ACTIONS ONLY */}
            {!isAdminView && user && !userReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <FaEdit />
                Write a Review
              </button>
            )}

            {!isAdminView && userReview && (
              <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <FaStar />
                <span>
                  You reviewed this shop ({userReview.rating}⭐)
                </span>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="underline ml-2"
                >
                  Edit
                </button>
              </div>
            )}

            {isAdminView && (
              <div className="text-sm text-blue-600 font-semibold">
                Admin View
              </div>
            )}
          </div>
        </div>

        {/* RATING SUMMARY */}
        <RatingSummary
          averageRating={shop.averageRating}
          totalReviews={shop.totalReviews}
          ratingBreakdown={shop.ratingBreakdown}
        />

        {/* REVIEW FORM (CUSTOMER ONLY) */}
        {!isAdminView && showReviewForm && (
          <div className="my-8">
            <ReviewForm
              shopId={shopId}
              shopName={shop.shopname}
              existingReview={userReview}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}

        {/* REVIEW LIST */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Customer Reviews
          </h2>
          <ReviewList shopId={shopId} isAdminView={isAdminView} />
        </div>
      </div>
    </div>
  );
};

export default ShopReviews;









// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { api } from '../utils/api';
// import { useLogin } from '../components/LoginContext';
// import RatingSummary from '../components/RatingSummary';
// import ReviewList from '../components/ReviewList';
// import ReviewForm from '../components/ReviewForm';
// import { FaArrowLeft, FaStar, FaEdit } from 'react-icons/fa';
// import { useLocation } from "react-router-dom";


// const ShopReviews = () => {
//   const location = useLocation();
//   const isAdminView = location.pathname.startsWith("/admin");
//   const { shopId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useLogin();
//   const [shop, setShop] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showReviewForm, setShowReviewForm] = useState(false);
//   const [userReview, setUserReview] = useState(null);

//   useEffect(() => {
//     fetchShopDetails();
//     if (!isAdminView) {
//       checkUserReview(); // only for customers
//     }
//   }, [shopId, user,isAdminView]);

//   const fetchShopDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get(`/shop/shoplists/${shopId}`);
//       console.log('Shop details response:', response);
//       if (response.data.success) {
//         setShop(response.data.shop);
//       }
//     } catch (error) {
//       console.error('Fetch shop details error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkUserReview = async () => {
//     if (!user) return;
    
//     try {
//       const response = await api.get(`/reviews/user-review`);
//       console.log('User reviews response:', response);
//       const userReview = response.data.reviews.find(review => review.shopId === shopId);
//       setUserReview(userReview);
//     } catch (error) {
//       console.error('Check user review error:', error);
//     }
//   };

//   const handleReviewSubmitted = (newReview) => {
//     setUserReview(newReview);
//     setShowReviewForm(false);
//     // Refresh shop details to update ratings
//     fetchShopDetails();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="text-gray-600 mt-2">Loading reviews...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!shop) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-4xl mb-4">❌</div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop Not Found</h2>
//           <button
//             onClick={() => navigate('/salons')}
//             className="text-blue-600 hover:text-blue-800"
//           >
//             Back to Salons
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
//           >
//             <FaArrowLeft />
//             Back
//           </button>
          
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">{shop.shopname}</h1>
//             <p className="text-gray-600 mb-4">
//               {shop.street}, {shop.city}, {shop.state}
//             </p>
            
//             <div className="flex flex-wrap items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <FaStar className="text-yellow-500" />
//                 <span className="text-xl font-bold">{shop.averageRating?.toFixed(1) || '0.0'}</span>
//                 <span className="text-gray-500">({shop.totalReviews || 0} reviews)</span>
//               </div>
              
//               {user && !userReview && (
//                 <button
//                   onClick={() => setShowReviewForm(true)}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
//                 >
//                   <FaEdit />
//                   Write a Review
//                 </button>
//               )}
              
//               {userReview && (
//                 <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2">
//                   <FaStar />
//                   <span>You reviewed this shop ({userReview.rating} stars)</span>
//                   <button
//                     onClick={() => setShowReviewForm(true)}
//                     className="text-green-600 hover:text-green-800 ml-2"
//                   >
//                     Edit
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Rating Summary */}
//         <div className="mb-8">
//           <RatingSummary
//             averageRating={shop.averageRating}
//             totalReviews={shop.totalReviews}
//             ratingBreakdown={shop.ratingBreakdown}
//           />
//         </div>

//         {/* Review Form (if shown) */}
//         {showReviewForm && (
//           <div className="mb-8">
//             <ReviewForm
//               shopId={shopId}
//               shopName={shop.shopname}
//               existingReview={userReview}
//               onReviewSubmitted={handleReviewSubmitted}
//               onCancel={() => setShowReviewForm(false)}
//             />
//           </div>
//         )}

//         {/* Reviews List */}
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
//           <ReviewList shopId={shopId} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShopReviews;