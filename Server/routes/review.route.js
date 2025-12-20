const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review-controller');
// const { auth, adminAuth } = require('../middleware/auth');
const {authenticate, authorize} = require('../middlewares/auth')

// Public: get reviews for shop (approved or controlled via query param)
router.get('/shop/:shopId', reviewController.getShopReviews);

// Authenticated customer actions

// router.post('/submit-review', authenticate, authorize('customer'), reviewController.submitReview);
// router.get('/user', authenticate, authorize('customer'), reviewController.getUserReviews); // list of user's reviews
// router.get('/check-user-review', authenticate, authorize('customer'), reviewController.checkUserReview); // expects ?shopId=...
// router.get('/shop/:shopId/user-review', authenticate, authorize('customer'), reviewController.getUserReviewForShop);
// router.put('/:reviewId', authenticate, authorize('customer'), reviewController.updateCustomerReview);
// router.delete('/:reviewId', authenticate, authorize('customer'), reviewController.deleteReview);

// Authenticated customer actions - Allow ALL authenticated users
router.post('/submit-review', authenticate, reviewController.submitReview); 
router.get('/user', authenticate, reviewController.getUserReviews); 
router.get('/check-user-review', authenticate, reviewController.checkUserReview);
router.get('/shop/:shopId/user-review', authenticate, reviewController.getUserReviewForShop);
router.put('/:reviewId', authenticate, reviewController.updateCustomerReview);
router.delete('/:reviewId', authenticate, reviewController.deleteReview);
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