const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const {
  createJob,
  getJobs,
  getJobById,
  applyForJob,
  getMyApplications,
  getShopJobs,
  updateJob,
  deleteJob,
  getJobApplications,
  updateApplicationStatus,
} = require("../controllers/job-controller");

// Optional auth middleware — attaches req.user if token present, but doesn't block unauthenticated requests
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authenticate(req, res, next);
  }
  next();
};

// Public routes (with optional auth to mark hasApplied)
router.get("/", optionalAuth, getJobs);
router.get("/:jobId", optionalAuth, getJobById);

// Authenticated user routes
router.post("/:jobId/apply", authenticate, applyForJob);
router.get("/user/my-applications", authenticate, getMyApplications);

// Shop owner routes
router.post("/", authenticate, authorize("shopOwner", "admin"), createJob);
router.get("/shop/my-jobs", authenticate, authorize("shopOwner", "admin"), getShopJobs);
router.put("/:jobId", authenticate, authorize("shopOwner", "admin"), updateJob);
router.delete("/:jobId", authenticate, authorize("shopOwner", "admin"), deleteJob);
router.get("/:jobId/applications", authenticate, authorize("shopOwner", "admin"), getJobApplications);
router.patch("/applications/:applicationId/status", authenticate, authorize("shopOwner", "admin"), updateApplicationStatus);

module.exports = router;
