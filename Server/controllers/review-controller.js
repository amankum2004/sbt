// controllers/review-controller.js
const Review = require('../models/review');
const Shop = require('../models/registerShop-model');
const mongoose = require('mongoose');

exports.submitReview = async (req, res) => {
  try {
    const { shopId, rating, title, comment, photos = [] } = req.body;
    const userId = req.user.userId;
    const userName = req.user.name || 'Anonymous';
    const userEmail = req.user.email || '';

    const existing = await Review.findOne({ shopId, userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this shop' });
    }

    const review = new Review({
      shopId,
      userId,
      userName,
      userEmail,
      rating,
      title,
      comment,
      photos,
      status: 'pending'
    });

    await review.save();
    res.status(201).json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getShopReviews = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { page = 1, limit = 10, sort = 'recent', rating, status = 'approved' } = req.query;

    const query = { shopId, status };
    if (rating) query.rating = parseInt(rating);

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'highest') sortOption = { rating: -1 };
    if (sort === 'lowest') sortOption = { rating: 1 };
    if (sort === 'helpful') sortOption = { helpfulCount: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Review.countDocuments(query);

    // ✅ Rating breakdown (approved only)
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
      }
    ]);

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingSummary.forEach(item => {
      breakdown[item._id] = item.count;
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      ratingSummary: breakdown
    });
  } catch (error) {
    console.error('Get shop reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, shopId } = req.query;

    const query = { userId };
    if (shopId) query.shopId = shopId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('shopId', 'shopname city state street')
      .select('-__v');

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// New: returns single review existence for the logged-in user for a given shopId
exports.checkUserReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shopId } = req.query;
    if (!shopId) {
      return res.status(400).json({ success: false, message: 'shopId required' });
    }
    const review = await Review.findOne({ shopId, userId }).select('rating title comment status createdAt');
    res.json({ success: true, exists: !!review, review: review || null });
  } catch (err) {
    console.error('checkUserReview error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCustomerReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;
    const { rating, title, comment, photos } = req.body;

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found or access denied' });

    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (photos !== undefined) review.photos = photos;
    review.status = 'pending';

    await review.save();
    await updateShopRatings(review.shopId);

    res.json({ success: true, message: 'Review updated', review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserReviewForShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user.userId;
    const review = await Review.findOne({ shopId, userId });
    res.json({ success: true, review: review || null, hasReviewed: !!review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found or access denied' });

    const shopId = review.shopId;
    await review.deleteOne();
    await updateShopRatings(shopId);

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin functions
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, shopId, userId, sort = 'recent' } = req.query;
    const query = {};
    if (status) query.status = status;
    if (shopId) query.shopId = shopId;
    if (userId) query.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('shopId', 'shopname')
      .populate('userId', 'name email')
      .select('-__v');

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const previousStatus = review.status;
    review.status = status;
    await review.save();

    // ✅ recalc only if approval state changed
    const approvalChanged =
      (previousStatus === 'approved' && status !== 'approved') ||
      (previousStatus !== 'approved' && status === 'approved');

    if (approvalChanged) {
      await updateShopRatings(review.shopId);
    }

    res.json({ success: true, review });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



exports.updateReviewAdmin = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, photos, status } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const previousStatus = review.status;
    const previousRating = review.rating;

    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (photos !== undefined) review.photos = photos;
    if (status !== undefined) review.status = status;

    await review.save();

    // ✅ determine if shop rating must be recalculated
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
      message: 'Review updated by admin',
      review
    });
  } catch (err) {
    console.error('Update review admin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Helper to recalc shop ratings after changes
const updateShopRatings = async (shopId) => {
  try {
    const reviews = await Review.find({ shopId, status: 'approved' });
    if (!reviews.length) {
      await Shop.findByIdAndUpdate(shopId, {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    const totalRating = reviews.reduce((s, r) => s + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; });

    await Shop.findByIdAndUpdate(shopId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      ratingBreakdown: breakdown
    });
  } catch (err) {
    console.error('updateShopRatings error', err);
  }
};
