// errors - pincode errors to ui -> done
// validation failed - after payment -> done


// Phase 5: Important Features to Implement
// 1. Email Notifications (Optional)
// Set up email notifications when:
// A new review is submitted (to admin)
// A review is approved/rejected (to user)

// Shop owner gets a new review

// 2. Review Moderation Guidelines
// Create guidelines for what constitutes acceptable reviews and implement automated filtering for spam.

// 3. Review Analytics Dashboard
// Add analytics for shop owners to track:

// Average rating over time

// Review volume

// Common keywords in reviews

// Response rates

// 4. Response System
// Allow shop owners to respond to reviews:

// javascript
// // Add to Review schema
// responses: [{
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   message: String,
//   createdAt: { type: Date, default: Date.now }
// }]
// 5. Review Verification
// Implement verification system:

// Verify users actually booked/appointed the shop

// Mark reviews as "Verified Purchase"

// Prevent fake reviews

// Testing Your Implementation:
// Submit a Review: Test the complete flow from user submission to admin approval

// Rating Calculation: Verify average ratings are calculated correctly

// Pagination: Test loading more reviews

// Filters: Test sorting and filtering by rating

// Admin Moderation: Test approving/rejecting reviews

// Mobile Responsiveness: Ensure it works well on all devices

// This complete system will give you professional reviews and ratings functionality similar to major platforms. You can start with the basic implementation and add advanced features later as needed.

