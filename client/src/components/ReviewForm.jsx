import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Swal from 'sweetalert2';
import StarRating from './StarRating';
import { FaPaperPlane } from 'react-icons/fa';

const ReviewForm = ({ shopId, shopName, appointmentId, onReviewSubmitted }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: ''
  });

  // Debug authentication on mount
  useEffect(() => {
    console.log('🔍 ReviewForm Auth Debug:');
    console.log('jwt_token:', localStorage.getItem('jwt_token') ? 'Present' : 'Missing');
    console.log('user_data:', localStorage.getItem('user_data') ? 'Present' : 'Missing');
    console.log('token (old):', localStorage.getItem('token') ? 'Present' : 'Missing');
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate rating
    if (formData.rating === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Please select a rating by clicking on the stars',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        shopId: shopId,
        appointmentId: appointmentId,
        rating: formData.rating,
        comment: formData.comment || ''
      };

      console.log('Submitting review data:', reviewData);
      
      // Check authentication before submitting
      const jwtToken = localStorage.getItem('jwt_token');
      if (!jwtToken) {
        throw {
          response: {
            status: 401,
            data: { success: false, message: 'Authentication required. Please login again.' }
          }
        };
      }

      const response = await api.post('/reviews/submit-review', reviewData);
      
      console.log('Review submission response:', response.data);

      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Thank you for your feedback!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Reset form
        setFormData({
          rating: 0,
          comment: ''
        });

        // Notify parent component
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data.review || response.data);
        }
      }
    } catch (error) {
      console.error('❌ Submit review error:', error);
      
      let errorMessage = 'Failed to submit review. Please try again.';
      let errorTitle = 'Error';
      let errorIcon = 'error';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorTitle = 'Authentication Required';
          errorMessage = data?.message || 'Please login again to submit your review.';
          errorIcon = 'warning';
          
          // Clear auth data and redirect
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user_data');
          
          Swal.fire({
            title: errorTitle,
            text: errorMessage,
            icon: errorIcon,
            confirmButtonText: 'Login',
            showCancelButton: true,
            cancelButtonText: 'Cancel'
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = '/login';
            }
          });
          return;
        } 
        else if (status === 400 && data?.message?.includes('already reviewed')) {
          errorTitle = 'Already Reviewed';
          errorMessage = data.message;
          errorIcon = 'info';
          
          if (onReviewSubmitted) {
            onReviewSubmitted({ 
              alreadyReviewed: true,
              message: data.message
            });
          }
        }
        else {
          errorMessage = data?.message || `Error: ${status}`;
        }
      }
      
      // Don't show alert for already reviewed case (handled above)
      if (!(error.response?.status === 400 && error.response?.data?.message?.includes('already reviewed'))) {
        Swal.fire({
          title: errorTitle,
          text: errorMessage,
          icon: errorIcon,
          confirmButtonText: 'OK'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Rate This Appointment
      </h2>
      
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Shop:</strong> {shopName}
        </p>
      </div>
      
      <p className="text-gray-600 mb-6">
        How was your experience ?
      </p>

      <form onSubmit={handleSubmit}>
        {/* Rating Section */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3">
            Overall Rating *
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <StarRating
              rating={formData.rating}
              size="text-3xl"
              editable={true}
              onRatingChange={handleRatingChange}
            />
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium">
                {formData.rating > 0 ? `${formData.rating} out of 5` : 'Select stars above'}
              </span>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="mb-6">
          <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
            Your Feedback (Optional)
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Share details about this specific appointment..."
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            maxLength="1000"
          />
          <div className="flex justify-between items-center mt-1">
            <div className="text-sm text-gray-500">
              {formData.comment.length}/1000 characters
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || formData.rating === 0}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <FaPaperPlane className="text-sm" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;








// import React, { useState } from 'react';
// import { api } from '../utils/api';
// import Swal from 'sweetalert2';
// import StarRating from './StarRating';
// import { FaPaperPlane } from 'react-icons/fa';
// import { useEffect } from 'react';

// const ReviewForm = ({ shopId, shopName, appointmentId, onReviewSubmitted }) => {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     rating: 0,
//     comment: ''
//   });

//     // Debug authentication on mount
//   useEffect(() => {
//     console.log('🔍 ReviewForm Auth Debug:');
//     console.log('jwt_token:', localStorage.getItem('jwt_token') ? 'Present' : 'Missing');
//     console.log('user_data:', localStorage.getItem('user_data') ? 'Present' : 'Missing');
//     console.log('token (old):', localStorage.getItem('token') ? 'Present' : 'Missing');
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleRatingChange = (rating) => {
//     setFormData(prev => ({ ...prev, rating }));
//   };

//   // Add this debug function
// const checkTokenDebug = () => {
//   const token = localStorage.getItem('token');
//   console.log('🔍 Token Debug:');
//   console.log('Token exists:', !!token);
//   console.log('Token value:', token);
//   console.log('Token type:', typeof token);
//   console.log('Token length:', token?.length);
  
//   if (token) {
//     try {
//       // Try to parse as JSON (might be storing user object)
//       const parsed = JSON.parse(token);
//       console.log('Token is JSON object:', parsed);
//       console.log('If token is in object, actual token might be at:', {
//         token: parsed.token,
//         accessToken: parsed.accessToken,
//         jwt: parsed.jwt
//       });
//     } catch (e) {
//       console.log('Token is not JSON, might be plain JWT string');
      
//       // Check JWT format
//       if (token.includes('.')) {
//         const parts = token.split('.');
//         console.log('Token has JWT format, parts:', parts.length);
//         if (parts.length === 3) {
//           try {
//             const payload = JSON.parse(atob(parts[1]));
//             console.log('JWT payload:', {
//               userId: payload.userId,
//               email: payload.email,
//               exp: new Date(payload.exp * 1000),
//               isExpired: payload.exp * 1000 < Date.now()
//             });
//           } catch (e) {
//             console.error('Failed to decode JWT payload');
//           }
//         }
//       }
//     }
//   }
// };

// // Call it in useEffect or before submit
// useEffect(() => {
//   checkTokenDebug();
// }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate rating
//     if (formData.rating === 0) {
//       Swal.fire({
//         title: 'Error',
//         text: 'Please select a rating by clicking on the stars',
//         icon: 'error',
//         confirmButtonText: 'OK'
//       });
//       return;
//     }

//     // Validate comment length
//     if (formData.comment.length > 1000) {
//       Swal.fire({
//         title: 'Error',
//         text: 'Review comment must be less than 1000 characters',
//         icon: 'error',
//         confirmButtonText: 'OK'
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       const reviewData = {
//         shopId: shopId,
//         appointmentId: appointmentId,
//         rating: formData.rating,
//         comment: formData.comment
//       };

//       console.log('Submitting review data:', reviewData);
//       console.log('Endpoint: /reviews/submit-review');
      
//       // Debug: Check if user is authenticated
//       const token = localStorage.getItem('token');
//       console.log('User token exists:', !!token);
      
//       // Make the API request
//       const response = await api.post('/reviews/submit-review', reviewData);
      
//       console.log('Review submission response:', response.data);

//       if (response.data.success) {
//         Swal.fire({
//           title: 'Success!',
//           text: 'Thank you for your feedback!',
//           icon: 'success',
//           timer: 2000,
//           showConfirmButton: false
//         });

//         // Reset form
//         setFormData({
//           rating: 0,
//           comment: ''
//         });

//         // Notify parent component with the review data
//         if (onReviewSubmitted) {
//           onReviewSubmitted(response.data.review || response.data);
//         }
//       }
//     } catch (error) {
//       console.error('❌ Submit review error:', error);
//       console.error('Error status:', error.response?.status);
//       console.error('Error data:', error.response?.data);
//       console.error('Error headers:', error.response?.headers);
      
//       let errorMessage = 'Failed to submit review. Please try again.';
//       let errorTitle = 'Error';
//       let errorIcon = 'error';
      
//       // Handle specific error cases
//       if (error.response) {
//         const status = error.response.status;
//         const data = error.response.data;
        
//         switch (status) {
//           case 401:
//             if (data.message?.includes('token')) {
//               errorTitle = 'Authentication Required';
//               errorMessage = 'Please login again to submit your review.';
//               errorIcon = 'warning';
              
//               // Optionally redirect to login
//               setTimeout(() => {
//                 window.location.href = '/';
//               }, 3000);
//             } else {
//               errorMessage = 'Unauthorized access. Please login again.';
//             }
//             break;
            
//           case 400:
//             if (data.message?.includes('already reviewed')) {
//               errorTitle = 'Already Reviewed';
//               errorMessage = 'You have already reviewed this appointment.';
//               errorIcon = 'info';
              
//               // If already reviewed, notify parent component
//               if (onReviewSubmitted) {
//                 onReviewSubmitted({ 
//                   alreadyReviewed: true,
//                   message: 'Already reviewed this appointment'
//                 });
//               }
//             } else if (data.message?.includes('Appointment ID')) {
//               errorMessage = data.message || 'Invalid appointment information.';
//             } else if (data.message) {
//               errorMessage = data.message;
//             }
//             break;
            
//           case 403:
//             errorTitle = 'Permission Denied';
//             errorMessage = 'You do not have permission to review this appointment.';
//             errorIcon = 'warning';
//             break;
            
//           case 404:
//             errorMessage = 'Appointment not found.';
//             break;
            
//           case 422:
//             errorMessage = 'Invalid data. Please check your input.';
//             break;
            
//           case 429:
//             errorMessage = 'Too many requests. Please wait a moment.';
//             break;
            
//           case 500:
//             errorMessage = 'Server error. Please try again later.';
//             break;
            
//           default:
//             errorMessage = data?.message || `Error: ${status}`;
//         }
//       } else if (error.request) {
//         errorMessage = 'No response from server. Please check your internet connection.';
//       } else {
//         errorMessage = error.message || 'An unexpected error occurred.';
//       }
      
//       Swal.fire({
//         title: errorTitle,
//         text: errorMessage,
//         icon: errorIcon,
//         confirmButtonText: 'OK',
//         showCancelButton: errorIcon === 'warning',
//         cancelButtonText: 'Cancel'
//       }).then((result) => {
//         // If "OK" clicked and it's an auth error, redirect to login
//         if (result.isConfirmed && error.response?.status === 401) {
//           window.location.href = '/login';
//         }
        
//         // If already reviewed, close the form
//         if (error.response?.status === 400 && 
//             error.response.data.message?.includes('already reviewed')) {
//           if (onReviewSubmitted) {
//             onReviewSubmitted({ 
//               alreadyReviewed: true,
//               message: 'Already reviewed'
//             });
//           }
//         }
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6">
//       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//         Rate This Appointment
//       </h2>
      
//       <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
//         <p className="text-sm text-blue-800">
//           <strong>Shop:</strong> {shopName}
//         </p>
//         <p className="text-xs text-blue-600 mt-1">
//           <strong>Appointment ID:</strong> {appointmentId?.substring(0, 8)}...
//         </p>
//       </div>
      
//       <p className="text-gray-600 mb-6">
//         How was your experience during this specific visit?
//       </p>

//       <form onSubmit={handleSubmit}>
//         {/* Rating Section */}
//         <div className="mb-6">
//           <label className="block text-gray-700 font-medium mb-3">
//             Overall Rating *
//           </label>
//           <div className="flex flex-col sm:flex-row sm:items-center gap-4">
//             <StarRating
//               rating={formData.rating}
//               size="text-3xl"
//               editable={true}
//               onRatingChange={handleRatingChange}
//             />
//             <div className="flex flex-col">
//               <span className="text-gray-600 font-medium">
//                 {formData.rating > 0 ? `${formData.rating} out of 5` : 'Select stars above'}
//               </span>
//               <span className="text-sm text-gray-500">
//                 {formData.rating === 5 && '⭐ Excellent'}
//                 {formData.rating === 4 && '👍 Good'}
//                 {formData.rating === 3 && '😐 Average'}
//                 {formData.rating === 2 && '👎 Poor'}
//                 {formData.rating === 1 && '😞 Terrible'}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Comment Section */}
//         <div className="mb-6">
//           <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
//             Your Feedback (Optional)
//           </label>
//           <textarea
//             id="comment"
//             name="comment"
//             value={formData.comment}
//             onChange={handleInputChange}
//             placeholder="Share details about this specific appointment..."
//             rows="4"
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//             maxLength="1000"
//           />
//           <div className="flex justify-between items-center mt-1">
//             <div className="text-sm text-gray-500">
//               {formData.comment.length}/1000 characters
//             </div>
//             {formData.comment.length > 900 && (
//               <div className="text-sm text-amber-600">
//                 {1000 - formData.comment.length} characters remaining
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end">
//           <button
//             type="submit"
//             disabled={loading || formData.rating === 0}
//             className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
//           >
//             {loading ? (
//               <>
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 Submitting...
//               </>
//             ) : (
//               <>
//                 <FaPaperPlane className="text-sm" />
//                 Submit Review
//               </>
//             )}
//           </button>
//         </div>
        
//         {/* Note */}
//         <div className="mt-4 pt-3 border-t border-gray-200">
//           <p className="text-xs text-gray-500 text-center">
//             Note: You can review each appointment separately. Once submitted, reviews cannot be edited.
//           </p>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ReviewForm;