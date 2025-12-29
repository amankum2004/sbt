// controllers/review-controller.js
const Review = require('../models/review');
const Shop = require('../models/registerShop-model');
const Appointment = require('../models/appointment-model');
const mongoose = require('mongoose');

exports.submitReview = async (req, res) => {
  try {
    const { shopId, appointmentId, rating, comment } = req.body;
    const userId = req.user.userId;
    const userName = req.user.name || 'Anonymous';
    const userEmail = req.user.email || '';

    console.log('=== REVIEW SUBMISSION START ===');
    console.log('User:', { userId, userName, userEmail });
    console.log('Data:', { shopId, appointmentId, rating });

    // Validate required fields
    if (!appointmentId) {
      console.log('Validation failed: Missing appointmentId');
      return res.status(400).json({ 
        success: false, 
        message: 'Appointment ID is required' 
      });
    }

    if (!shopId) {
      console.log('Validation failed: Missing shopId');
      return res.status(400).json({ 
        success: false, 
        message: 'Shop ID is required' 
      });
    }

    if (!rating) {
      console.log('Validation failed: Missing rating');
      return res.status(400).json({ 
        success: false, 
        message: 'Rating is required' 
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      console.log('Validation failed: Invalid rating', rating);
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Validate comment length if provided
    if (comment && comment.length > 1000) {
      console.log('Validation failed: Comment too long', comment.length);
      return res.status(400).json({ 
        success: false, 
        message: 'Comment must be less than 1000 characters' 
      });
    }

    // ✅ Check if user already reviewed this appointment (by appointmentId)
    console.log('Checking for existing review by appointmentId:', appointmentId);
    const existingReview = await Review.findOne({ 
      appointmentId: appointmentId, 
      userId: userId 
    });

    if (existingReview) {
      console.log('Duplicate review found for appointment:', appointmentId);
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this appointment.' 
      });
    }

    // ✅ Verify appointment exists and belongs to user
    console.log('Verifying appointment:', appointmentId);
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customerEmail: userEmail
    });

    if (!appointment) {
      console.log('Appointment not found or not owned by user');
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found or does not belong to you' 
      });
    }

    // ✅ Verify appointment is completed
    if (appointment.status !== 'completed') {
      console.log('Appointment not completed, status:', appointment.status);
      return res.status(400).json({ 
        success: false, 
        message: 'You can only review completed appointments' 
      });
    }

    // Create the review
    console.log('Creating new review...');
    const review = new Review({
      shopId,
      appointmentId,
      userId,
      userName,
      userEmail,
      rating,
      comment: comment || '',
      status: 'approved'
    });

    await review.save();
    console.log('Review saved successfully:', review._id);
    
    // Update shop ratings
    await updateShopRatings(shopId);
    
    res.status(201).json({ 
      success: true, 
      message: 'Review submitted successfully', 
      review: {
        _id: review._id,
        appointmentId: review.appointmentId,
        shopId: review.shopId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Submit review error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      console.error('Duplicate key error details:', {
        code: error.code,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue
      });
      
      // Check which index caused the error
      if (error.keyPattern?.userId && error.keyPattern?.shopId) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already reviewed this shop. Please contact support to update your review permissions.' 
        });
      } else if (error.keyPattern?.appointmentId && error.keyPattern?.userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already reviewed this appointment.' 
        });
      }
      
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate review detected.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getShopReviews = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sort = 'recent', 
      rating, 
      status = 'approved' 
    } = req.query;

    // Validate shopId
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid shop ID' 
      });
    }

    const query = { shopId, status };
    if (rating) {
      const ratingNum = parseInt(rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        query.rating = ratingNum;
      }
    }

    // Set sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'highest') sortOption = { rating: -1 };
    if (sort === 'lowest') sortOption = { rating: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const reviews = await Review.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .select('-__v -updatedAt');

    const total = await Review.countDocuments(query);

    // Get rating breakdown for approved reviews only
    const ratingSummary = await Review.aggregate([
      {
        $match: {
          shopId: new mongoose.Types.ObjectId(shopId),
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    // Format rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingSummary.forEach(item => {
      if (item._id >= 1 && item._id <= 5) {
        breakdown[item._id] = item.count;
      }
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      ratingSummary: breakdown,
      averageRating: await calculateAverageRating(shopId)
    });
  } catch (error) {
    console.error('Get shop reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, shopId } = req.query;

    const query = { userId };
    if (shopId) {
      if (!mongoose.Types.ObjectId.isValid(shopId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid shop ID' 
        });
      }
      query.shopId = shopId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('shopId', 'shopname city state street')
      .populate('appointmentId', 'status') // Populate appointment info
      .select('-__v -updatedAt');

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

exports.checkUserReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shopId } = req.query;
    
    if (!shopId) {
      return res.status(400).json({ 
        success: false, 
        message: 'shopId is required' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid shop ID' 
      });
    }

    const review = await Review.findOne({ shopId, userId })
      .select('rating comment status createdAt');

    res.json({ 
      success: true, 
      exists: !!review, 
      review: review || null 
    });
  } catch (err) {
    console.error('checkUserReview error', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

exports.updateCustomerReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid review ID' 
      });
    }

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found or access denied' 
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Validate comment length if provided
    if (comment !== undefined && comment.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment must be less than 1000 characters' 
      });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    
    // Set to pending for admin review if needed, or keep as approved
    // review.status = 'pending'; // Uncomment if you want updates to require approval
    
    await review.save();
    
    // Update shop ratings if review is approved
    if (review.status === 'approved') {
      await updateShopRatings(review.shopId);
    }

    res.json({ 
      success: true, 
      message: 'Review updated successfully', 
      review 
    });
  } catch (err) {
    console.error('Update customer review error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

exports.getUserReviewForShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user.userId;

    // Validate shopId
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid shop ID' 
      });
    }

    const review = await Review.findOne({ shopId, userId })
      .select('-__v -updatedAt');

    res.json({ 
      success: true, 
      review: review || null, 
      hasReviewed: !!review 
    });
  } catch (err) {
    console.error('Get user review for shop error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid review ID' 
      });
    }

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found or access denied' 
      });
    }

    const shopId = review.shopId;
    await review.deleteOne();
    
    // Update shop ratings after deletion
    await updateShopRatings(shopId);

    res.json({ 
      success: true, 
      message: 'Review deleted successfully' 
    });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

// Admin functions
exports.getAllReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      shopId, 
      userId, 
      sort = 'recent' 
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (shopId) {
      if (!mongoose.Types.ObjectId.isValid(shopId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid shop ID' 
        });
      }
      query.shopId = shopId;
    }
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid user ID' 
        });
      }
      query.userId = userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Set sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'highest') sortOption = { rating: -1 };
    if (sort === 'lowest') sortOption = { rating: 1 };

    const reviews = await Review.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('shopId', 'shopname')
      .populate('userId', 'name email')
      .select('-__v -updatedAt');

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('Get all reviews error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid review ID' 
      });
    }

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be: pending, approved, or rejected' 
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    const previousStatus = review.status;
    review.status = status;
    await review.save();

    // Recalculate shop ratings only if approval status changed
    const approvalChanged =
      (previousStatus === 'approved' && status !== 'approved') ||
      (previousStatus !== 'approved' && status === 'approved');

    if (approvalChanged) {
      await updateShopRatings(review.shopId);
    }

    res.json({ 
      success: true, 
      message: 'Review status updated successfully',
      review 
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

exports.updateReviewAdmin = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, status } = req.body;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid review ID' 
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    const previousStatus = review.status;
    const previousRating = review.rating;

    // Validate and update rating
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Rating must be between 1 and 5' 
        });
      }
      review.rating = rating;
    }

    // Validate and update comment
    if (comment !== undefined) {
      if (comment.length > 1000) {
        return res.status(400).json({ 
          success: false, 
          message: 'Comment must be less than 1000 characters' 
        });
      }
      review.comment = comment;
    }

    // Validate and update status
    if (status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid status' 
        });
      }
      review.status = status;
    }

    await review.save();

    // Determine if shop rating must be recalculated
    const approvalChanged =
      (previousStatus === 'approved' && review.status !== 'approved') ||
      (previousStatus !== 'approved' && review.status === 'approved');

    const ratingChangedWhileApproved =
      previousStatus === 'approved' &&
      review.status === 'approved' &&
      rating !== undefined &&
      rating !== previousRating;

    if (approvalChanged || ratingChangedWhileApproved) {
      await updateShopRatings(review.shopId);
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (err) {
    console.error('Update review admin error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

// Helper to calculate average rating
const calculateAverageRating = async (shopId) => {
  try {
    const reviews = await Review.find({ shopId, status: 'approved' });
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(1));
  } catch (error) {
    console.error('Calculate average rating error:', error);
    return 0;
  }
};

// Helper to recalc shop ratings after changes
const updateShopRatings = async (shopId) => {
  try {
    // Get all approved reviews for this shop
    const reviews = await Review.find({ shopId, status: 'approved' });
    
    if (!reviews.length) {
      // If no approved reviews, reset shop ratings
      await Shop.findByIdAndUpdate(shopId, {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    // Calculate total rating and average
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

    // Calculate rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        breakdown[review.rating] = (breakdown[review.rating] || 0) + 1;
      }
    });

    // Update shop with new ratings
    await Shop.findByIdAndUpdate(shopId, {
      averageRating,
      totalReviews: reviews.length,
      ratingBreakdown: breakdown
    }, { new: true });

    console.log(`Updated shop ${shopId} ratings: avg=${averageRating}, total=${reviews.length}`);
  } catch (err) {
    console.error('updateShopRatings error:', err);
    throw err;
  }
};

// Export helper function for testing
exports._updateShopRatings = updateShopRatings;





// // controllers/review-controller.js
// const Review = require('../models/review');
// const Shop = require('../models/registerShop-model');
// const mongoose = require('mongoose');

// exports.submitReview = async (req, res) => {
//   try {
//     // const { shopId, rating, title, comment, photos = [] } = req.body;
//     const { shopId, rating, comment} = req.body;
//     const userId = req.user.userId;
//     const userName = req.user.name || 'Anonymous';
//     const userEmail = req.user.email || '';

//     const existing = await Review.findOne({ shopId, userId });
//     if (existing) {
//       return res.status(400).json({ success: false, message: 'You have already reviewed this shop' });
//     }

//     const review = new Review({
//       shopId,
//       userId,
//       userName,
//       userEmail,
//       rating,
//       title,
//       comment,
//       photos,
//       status: 'pending'
//     });

//     await review.save();
//     res.status(201).json({ success: true, message: 'Review submitted successfully', review });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.getShopReviews = async (req, res) => {
//   try {
//     const { shopId } = req.params;
//     const { page = 1, limit = 10, sort = 'recent', rating, status = 'approved' } = req.query;

//     const query = { shopId, status };
//     if (rating) query.rating = parseInt(rating);

//     let sortOption = { createdAt: -1 };
//     if (sort === 'oldest') sortOption = { createdAt: 1 };
//     if (sort === 'highest') sortOption = { rating: -1 };
//     if (sort === 'lowest') sortOption = { rating: 1 };
//     if (sort === 'helpful') sortOption = { helpfulCount: -1 };

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const reviews = await Review.find(query)
//       .sort(sortOption)
//       .skip(skip)
//       .limit(parseInt(limit))
//       .select('-__v');

//     const total = await Review.countDocuments(query);

//     // ✅ Rating breakdown (approved only)
//     const ratingSummary = await Review.aggregate([
//       {
//         $match: {
//           shopId: new mongoose.Types.ObjectId(shopId),
//           status: 'approved'
//         }
//       },
//       {
//         $group: {
//           _id: '$rating',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
//     ratingSummary.forEach(item => {
//       breakdown[item._id] = item.count;
//     });

//     res.json({
//       success: true,
//       reviews,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / parseInt(limit))
//       },
//       ratingSummary: breakdown
//     });
//   } catch (error) {
//     console.error('Get shop reviews error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


// exports.getUserReviews = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { page = 1, limit = 10, shopId } = req.query;

//     const query = { userId };
//     if (shopId) query.shopId = shopId;

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const reviews = await Review.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit))
//       .populate('shopId', 'shopname city state street')
//       .select('-__v');

//     const total = await Review.countDocuments(query);

//     res.json({
//       success: true,
//       reviews,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / parseInt(limit))
//       }
//     });
//   } catch (error) {
//     console.error('Get user reviews error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // New: returns single review existence for the logged-in user for a given shopId
// exports.checkUserReview = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { shopId } = req.query;
//     if (!shopId) {
//       return res.status(400).json({ success: false, message: 'shopId required' });
//     }
//     const review = await Review.findOne({ shopId, userId }).select('rating title comment status createdAt');
//     res.json({ success: true, exists: !!review, review: review || null });
//   } catch (err) {
//     console.error('checkUserReview error', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.updateCustomerReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const userId = req.user.userId;
//     const { rating, title, comment, photos } = req.body;

//     const review = await Review.findOne({ _id: reviewId, userId });
//     if (!review) return res.status(404).json({ success: false, message: 'Review not found or access denied' });

//     if (rating !== undefined) review.rating = rating;
//     if (title !== undefined) review.title = title;
//     if (comment !== undefined) review.comment = comment;
//     if (photos !== undefined) review.photos = photos;
//     review.status = 'pending';

//     await review.save();
//     await updateShopRatings(review.shopId);

//     res.json({ success: true, message: 'Review updated', review });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.getUserReviewForShop = async (req, res) => {
//   try {
//     const { shopId } = req.params;
//     const userId = req.user.userId;
//     const review = await Review.findOne({ shopId, userId });
//     res.json({ success: true, review: review || null, hasReviewed: !!review });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.deleteReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const userId = req.user.userId;
//     const review = await Review.findOne({ _id: reviewId, userId });
//     if (!review) return res.status(404).json({ success: false, message: 'Review not found or access denied' });

//     const shopId = review.shopId;
//     await review.deleteOne();
//     await updateShopRatings(shopId);

//     res.json({ success: true, message: 'Review deleted' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // Admin functions
// exports.getAllReviews = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, status, shopId, userId, sort = 'recent' } = req.query;
//     const query = {};
//     if (status) query.status = status;
//     if (shopId) query.shopId = shopId;
//     if (userId) query.userId = userId;

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const reviews = await Review.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit))
//       .populate('shopId', 'shopname')
//       .populate('userId', 'name email')
//       .select('-__v');

//     const total = await Review.countDocuments(query);

//     res.json({
//       success: true,
//       reviews,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / parseInt(limit))
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.updateReviewStatus = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const { status } = req.body;

//     if (!['pending', 'approved', 'rejected'].includes(status)) {
//       return res.status(400).json({ success: false, message: 'Invalid status' });
//     }

//     const review = await Review.findById(reviewId);
//     if (!review) {
//       return res.status(404).json({ success: false, message: 'Review not found' });
//     }

//     const previousStatus = review.status;
//     review.status = status;
//     await review.save();

//     // ✅ recalc only if approval state changed
//     const approvalChanged =
//       (previousStatus === 'approved' && status !== 'approved') ||
//       (previousStatus !== 'approved' && status === 'approved');

//     if (approvalChanged) {
//       await updateShopRatings(review.shopId);
//     }

//     res.json({ success: true, review });
//   } catch (error) {
//     console.error('Update review status error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.updateReviewAdmin = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const { rating, title, comment, photos, status } = req.body;

//     const review = await Review.findById(reviewId);
//     if (!review) {
//       return res.status(404).json({ success: false, message: 'Review not found' });
//     }

//     const previousStatus = review.status;
//     const previousRating = review.rating;

//     if (rating !== undefined) review.rating = rating;
//     if (title !== undefined) review.title = title;
//     if (comment !== undefined) review.comment = comment;
//     if (photos !== undefined) review.photos = photos;
//     if (status !== undefined) review.status = status;

//     await review.save();

//     // ✅ determine if shop rating must be recalculated
//     const approvalChanged =
//       (previousStatus === 'approved' && review.status !== 'approved') ||
//       (previousStatus !== 'approved' && review.status === 'approved');

//     const ratingChangedWhileApproved =
//       previousStatus === 'approved' &&
//       review.status === 'approved' &&
//       rating !== undefined &&
//       rating !== previousRating;

//     if (approvalChanged || ratingChangedWhileApproved) {
//       await updateShopRatings(review.shopId);
//     }

//     res.json({
//       success: true,
//       message: 'Review updated by admin',
//       review
//     });
//   } catch (err) {
//     console.error('Update review admin error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


// // Helper to recalc shop ratings after changes
// const updateShopRatings = async (shopId) => {
//   try {
//     const reviews = await Review.find({ shopId, status: 'approved' });
//     if (!reviews.length) {
//       await Shop.findByIdAndUpdate(shopId, {
//         averageRating: 0,
//         totalReviews: 0,
//         ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
//       });
//       return;
//     }

//     const totalRating = reviews.reduce((s, r) => s + r.rating, 0);
//     const averageRating = totalRating / reviews.length;

//     const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
//     reviews.forEach(r => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; });

//     await Shop.findByIdAndUpdate(shopId, {
//       averageRating: parseFloat(averageRating.toFixed(1)),
//       totalReviews: reviews.length,
//       ratingBreakdown: breakdown
//     });
//   } catch (err) {
//     console.error('updateShopRatings error', err);
//   }
// };
