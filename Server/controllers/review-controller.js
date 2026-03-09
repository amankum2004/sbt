const prisma = require("../utils/prisma");
const { mapReview, mapShop } = require("../utils/legacy-mappers");

exports.submitReview = async (req, res) => {
  try {
    const { shopId, appointmentId, rating, comment } = req.body;
    const userId = req.user.userId;
    const userName = req.user.name || "Anonymous";
    const userEmail = req.user.email || "";

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required",
      });
    }

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (comment && comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment must be less than 1000 characters",
      });
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        appointmentId,
        userId,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this appointment.",
      });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        customerEmail: userEmail,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or does not belong to you",
      });
    }

    if (String(appointment.shopId) !== String(shopId)) {
      return res.status(400).json({
        success: false,
        message: "Appointment does not belong to this shop",
      });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed appointments",
      });
    }

    const review = await prisma.review.create({
      data: {
        shopId,
        appointmentId,
        userId,
        userName,
        userEmail,
        rating,
        comment: comment || "",
        status: "approved",
      },
    });

    await updateShopRatings(shopId);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: {
        _id: review.id,
        appointmentId: review.appointmentId,
        shopId: review.shopId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Submit review error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this appointment.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getShopReviews = async (req, res) => {
  try {
    const { shopId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = "recent",
      rating,
      status = "approved",
      search = "",
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const where = { shopId };
    if (status && status !== "all") {
      where.status = status;
    }

    if (rating) {
      const ratingNum = parseInt(rating, 10);
      if (ratingNum >= 1 && ratingNum <= 5) {
        where.rating = ratingNum;
      }
    }

    const normalizedSearch = String(search || "").trim();
    if (normalizedSearch) {
      where.OR = [
        { userName: { contains: normalizedSearch, mode: "insensitive" } },
        { userEmail: { contains: normalizedSearch, mode: "insensitive" } },
        { comment: { contains: normalizedSearch, mode: "insensitive" } },
      ];
    }

    let orderBy = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "highest") orderBy = { rating: "desc" };
    if (sort === "lowest") orderBy = { rating: "asc" };

    const skip = (pageNum - 1) * limitNum;

    const reviews = await prisma.review.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
    });

    const total = await prisma.review.count({ where });

    const ratingSummary = await prisma.review.groupBy({
      by: ["rating"],
      where: { shopId, status: "approved" },
      _count: { rating: true },
      orderBy: { rating: "desc" },
    });

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingSummary.forEach((item) => {
      if (item.rating >= 1 && item.rating <= 5) {
        breakdown[item.rating] = item._count.rating;
      }
    });

    res.json({
      success: true,
      reviews: reviews.map(mapReview),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      ratingSummary: breakdown,
      averageRating: await calculateAverageRating(shopId),
    });
  } catch (error) {
    console.error("Get shop reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, shopId } = req.query;

    const where = { userId };
    if (shopId) {
      where.shopId = shopId;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
      include: {
        shop: true,
        appointment: true,
      },
    });

    const total = await prisma.review.count({ where });

    res.json({
      success: true,
      reviews: reviews.map(mapReview),
      pagination: {
        page: parseInt(page, 10),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.checkUserReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shopId, appointmentId } = req.query;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "shopId is required",
      });
    }

    const where = { shopId, userId };
    if (appointmentId) {
      where.appointmentId = appointmentId;
    }

    const review = await prisma.review.findFirst({
      where,
      orderBy: { createdAt: "desc" },
      select: { rating: true, comment: true, status: true, createdAt: true, id: true },
    });

    res.json({
      success: true,
      exists: !!review,
      review: review ? mapReview(review) : null,
    });
  } catch (err) {
    console.error("checkUserReview error", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

exports.updateCustomerReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or access denied",
      });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (comment !== undefined && comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment must be less than 1000 characters",
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating !== undefined ? { rating } : {}),
        ...(comment !== undefined ? { comment } : {}),
      },
    });

    if (updatedReview.status === "approved") {
      await updateShopRatings(updatedReview.shopId);
    }

    res.json({
      success: true,
      message: "Review updated successfully",
      review: mapReview(updatedReview),
    });
  } catch (err) {
    console.error("Update customer review error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getUserReviewForShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user.userId;
    const { appointmentId } = req.query;

    const where = { shopId, userId };
    if (appointmentId) {
      where.appointmentId = appointmentId;
    }

    const review = await prisma.review.findFirst({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      review: review ? mapReview(review) : null,
      hasReviewed: !!review,
    });
  } catch (err) {
    console.error("Get user review for shop error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId },
    });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or access denied",
      });
    }

    await prisma.review.delete({ where: { id: reviewId } });
    await updateShopRatings(review.shopId);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Admin functions
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, shopId, userId, sort = "recent", search = "" } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const where = {};
    if (status && status !== "all") where.status = status;
    if (shopId) where.shopId = shopId;
    if (userId) where.userId = userId;

    const normalizedSearch = String(search || "").trim();
    if (normalizedSearch) {
      const matchingShops = await prisma.shop.findMany({
        where: { shopname: { contains: normalizedSearch, mode: "insensitive" } },
        select: { id: true },
      });
      const matchingShopIds = matchingShops.map((shop) => shop.id);

      where.OR = [
        { userName: { contains: normalizedSearch, mode: "insensitive" } },
        { userEmail: { contains: normalizedSearch, mode: "insensitive" } },
        { comment: { contains: normalizedSearch, mode: "insensitive" } },
        ...(matchingShopIds.length ? [{ shopId: { in: matchingShopIds } }] : []),
      ];
    }

    let orderBy = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "highest") orderBy = { rating: "desc" };
    if (sort === "lowest") orderBy = { rating: "asc" };

    const skip = (pageNum - 1) * limitNum;

    const reviews = await prisma.review.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        shop: { select: { id: true, shopname: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const total = await prisma.review.count({ where });

    res.json({
      success: true,
      reviews: reviews.map(mapReview),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Get all reviews error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: pending, approved, or rejected",
      });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const previousStatus = review.status;
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });

    const approvalChanged =
      (previousStatus === "approved" && status !== "approved") ||
      (previousStatus !== "approved" && status === "approved");

    if (approvalChanged) {
      await updateShopRatings(updatedReview.shopId);
    }

    res.json({
      success: true,
      message: "Review status updated successfully",
      review: mapReview(updatedReview),
    });
  } catch (error) {
    console.error("Update review status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateReviewAdmin = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, status } = req.body;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const previousStatus = review.status;
    const previousRating = review.rating;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (comment !== undefined && comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment must be less than 1000 characters",
      });
    }

    if (status !== undefined && !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating !== undefined ? { rating } : {}),
        ...(comment !== undefined ? { comment } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });

    const approvalChanged =
      (previousStatus === "approved" && updatedReview.status !== "approved") ||
      (previousStatus !== "approved" && updatedReview.status === "approved");

    const ratingChangedWhileApproved =
      previousStatus === "approved" &&
      updatedReview.status === "approved" &&
      rating !== undefined &&
      rating !== previousRating;

    if (approvalChanged || ratingChangedWhileApproved) {
      await updateShopRatings(updatedReview.shopId);
    }

    res.json({
      success: true,
      message: "Review updated successfully",
      review: mapReview(updatedReview),
    });
  } catch (err) {
    console.error("Update review admin error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const calculateAverageRating = async (shopId) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { shopId, status: "approved" },
      select: { rating: true },
    });
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(1));
  } catch (error) {
    console.error("Calculate average rating error:", error);
    return 0;
  }
};

const updateShopRatings = async (shopId) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { shopId, status: "approved" },
      select: { rating: true },
    });

    if (!reviews.length) {
      await prisma.shop.update({
        where: { id: shopId },
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        breakdown[review.rating] = (breakdown[review.rating] || 0) + 1;
      }
    });

    await prisma.shop.update({
      where: { id: shopId },
      data: {
        averageRating,
        totalReviews: reviews.length,
        ratingBreakdown: breakdown,
      },
    });

    console.log(`Updated shop ${shopId} ratings: avg=${averageRating}, total=${reviews.length}`);
  } catch (err) {
    console.error("updateShopRatings error:", err);
    throw err;
  }
};

exports._updateShopRatings = updateShopRatings;
