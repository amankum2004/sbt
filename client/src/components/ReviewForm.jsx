import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Swal from 'sweetalert2';
import StarRating from './StarRating';
import { FaCamera, FaTimes, FaPaperPlane } from 'react-icons/fa';

const ReviewForm = ({ shopId, shopName, onReviewSubmitted }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    photos: []
  });
  const [photoPreview, setPhotoPreview] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size and type
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        Swal.fire('Error', 'Only JPG, PNG and GIF images are allowed', 'error');
        return false;
      }
      
      if (file.size > maxSize) {
        Swal.fire('Error', 'Image size must be less than 5MB', 'error');
        return false;
      }
      
      return true;
    });

    // Create preview URLs
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setPhotoPreview(prev => [...prev, ...previews]);

    // In real implementation, you would upload to cloud storage
    // For now, we'll just store the file objects
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...validFiles]
    }));
  };

  const removePhoto = (index) => {
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      Swal.fire('Error', 'Please select a rating', 'error');
      return;
    }
    
    if (!formData.comment.trim()) {
      Swal.fire('Error', 'Please write a review comment', 'error');
      return;
    }

    setLoading(true);

    try {
      // In real implementation, upload photos first
      const uploadedPhotoUrls = [];
      // You would upload to cloud storage here and get URLs
      
      const reviewData = {
        shopId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        photos: uploadedPhotoUrls
      };

      const response = await api.post('/reviews/submit-review', reviewData);

      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Your review has been submitted',
          icon: 'success',
          confirmButtonText: 'OK'
        });

        // Reset form
        setFormData({
          rating: 0,
          title: '',
          comment: '',
          photos: []
        });
        setPhotoPreview([]);

        // Notify parent component
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data.review);
        }
      }
    } catch (error) {
      console.error('Submit review error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to submit review',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Write a Review</h2>
      <p className="text-gray-600 mb-6">Share your experience with {shopName}</p>

      <form onSubmit={handleSubmit}>
        {/* Rating Section */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3">
            Overall Rating *
          </label>
          <div className="flex items-center gap-4">
            <StarRating
              rating={formData.rating}
              size="text-3xl"
              editable={true}
              onRatingChange={handleRatingChange}
            />
            <span className="text-gray-600">
              {formData.rating > 0 ? `${formData.rating} out of 5` : 'Select rating'}
            </span>
          </div>
        </div>

        {/* Title Section */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Review Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Summarize your experience"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength="100"
          />
        </div>

        {/* Comment Section */}
        <div className="mb-6">
          <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
            Your Review *
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Share details of your experience at this salon..."
            rows="5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            maxLength="1000"
            required
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {formData.comment.length}/1000 characters
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Add Photos (Optional)
          </label>
          <div className="space-y-4">
            {/* Photo Previews */}
            {photoPreview.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {photoPreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <FaCamera className="mx-auto text-3xl text-gray-400 mb-2" />
                <p className="text-gray-600">Click to upload photos</p>
                <p className="text-sm text-gray-400">JPG, PNG, GIF up to 5MB</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || formData.rating === 0 || !formData.comment.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <FaPaperPlane />
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