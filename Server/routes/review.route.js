const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review-controller');
// const { auth, adminAuth } = require('../middleware/auth');
const {authenticate, authorize} = require('../middlewares/auth')

// Public: get reviews for shop (approved or controlled via query param)
router.get('/shop/:shopId', reviewController.getShopReviews);

// Authenticated customer actions
router.post('/submit-review', reviewController.submitReview);
router.get('/user', reviewController.getUserReviews); // list of user's reviews
router.get('/check-user-review', reviewController.checkUserReview); // expects ?shopId=...
router.get('/shop/:shopId/user-review', reviewController.getUserReviewForShop);
router.put('/:reviewId', reviewController.updateCustomerReview);
router.delete('/:reviewId', reviewController.deleteReview);


// router.post('/submit-review', authenticate, authorize('user'), reviewController.submitReview);
// router.get('/user', authenticate, authorize('user'), reviewController.getUserReviews); // list of user's reviews
// router.get('/check-user-review', authenticate, authorize('user'), reviewController.checkUserReview); // expects ?shopId=...
// router.get('/shop/:shopId/user-review', authenticate, authorize('user'), reviewController.getUserReviewForShop);
// router.put('/:reviewId', authenticate, authorize('user'), reviewController.updateCustomerReview);
// router.delete('/:reviewId', authenticate, authorize('user'), reviewController.deleteReview);

module.exports = router;

// // Public routes
// router.get('/shop/:shopId', reviewController.getShopReviews);

// // User routes (authenticated)
// router.post('/', auth, reviewController.submitReview);
// router.get('/user', auth, reviewController.getUserReviews);
// router.put('/:reviewId', auth, reviewController.updateReview);
// router.delete('/:reviewId', auth, reviewController.deleteReview);
// router.post('/:reviewId/helpful', auth, reviewController.markHelpful);
// router.post('/:reviewId/report', auth, reviewController.reportReview);

// // Admin routes
// router.get('/admin/all', adminAuth, reviewController.getAllReviews);
// router.put('/admin/:reviewId/status', adminAuth, reviewController.updateReviewStatus);

// module.exports = router;