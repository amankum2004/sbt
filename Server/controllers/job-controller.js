const prisma = require("../utils/prisma");

// ─── Shop Owner: Create a job post ───────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      title, description, requirements, jobType,
      salaryMin, salaryMax, salaryCurrency,
      workingDays, startTime, endTime, hoursPerDay,
      experience, skills,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    // Find the shop owned by this user
    const shop = await prisma.shop.findFirst({ where: { ownerPhone: req.user.phone } });
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found for this owner" });
    }

    const job = await prisma.jobPost.create({
      data: {
        shopId: shop.id,
        title,
        description,
        requirements: requirements || null,
        jobType: jobType || "full_time",
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        salaryCurrency: salaryCurrency || "INR",
        workingDays: Array.isArray(workingDays) ? workingDays : [],
        startTime: startTime || null,
        endTime: endTime || null,
        hoursPerDay: hoursPerDay ? parseFloat(hoursPerDay) : null,
        experience: experience || null,
        skills: Array.isArray(skills) ? skills : [],
      },
      include: { shop: { select: { shopname: true, city: true, state: true } } },
    });

    return res.status(201).json({ success: true, message: "Job posted successfully", job });
  } catch (error) {
    console.error("createJob error:", error);
    return res.status(500).json({ success: false, message: "Failed to create job" });
  }
};

// ─── Public: List all open jobs with filters ─────────────────────────────────
exports.getJobs = async (req, res) => {
  try {
    const { jobType, city, state, minSalary, maxSalary, search, page = 1, limit = 20 } = req.query;

    const where = { status: "open" };

    if (jobType) where.jobType = jobType;
    if (minSalary) where.salaryMax = { gte: parseFloat(minSalary) };
    if (maxSalary) where.salaryMin = { lte: parseFloat(maxSalary) };

    if (city || state) {
      where.shop = {};
      if (city) where.shop.city = { contains: city, mode: "insensitive" };
      if (state) where.shop.state = { contains: state, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { skills: { has: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      prisma.jobPost.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          shop: { select: { shopname: true, city: true, state: true, district: true, phone: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.jobPost.count({ where }),
    ]);

    // If user is authenticated, mark which jobs they've already applied to
    let appliedJobIds = new Set();
    const userId = req.user?.userId;
    if (userId && jobs.length > 0) {
      const jobIds = jobs.map((j) => j.id);
      const applied = await prisma.jobApplication.findMany({
        where: { userId, jobId: { in: jobIds } },
        select: { jobId: true },
      });
      appliedJobIds = new Set(applied.map((a) => a.jobId));
    }

    const jobsWithApplied = jobs.map((j) => ({ ...j, hasApplied: appliedJobIds.has(j.id) }));

    return res.json({
      success: true,
      jobs: jobsWithApplied,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error("getJobs error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

// ─── Public: Get single job ───────────────────────────────────────────────────
exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      include: {
        shop: { select: { shopname: true, city: true, state: true, district: true, street: true, phone: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    // Check if the authenticated user has already applied
    let hasApplied = false;
    const userId = req.user?.userId;
    if (userId) {
      const existing = await prisma.jobApplication.findUnique({
        where: { jobId_userId: { jobId, userId } },
        select: { id: true },
      });
      hasApplied = !!existing;
    }

    return res.json({ success: true, job: { ...job, hasApplied } });
  } catch (error) {
    console.error("getJobById error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch job" });
  }
};

// ─── Authenticated User: Apply for a job ─────────────────────────────────────
exports.applyForJob = async (req, res) => {
  try {
    const { userId, name, phone, email } = req.user;
    const { jobId } = req.params;
    const { coverLetter, experience } = req.body;

    const job = await prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "open") {
      return res.status(404).json({ success: false, message: "Job is not available" });
    }

    const existing = await prisma.jobApplication.findUnique({
      where: { jobId_userId: { jobId, userId } },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already applied for this job" });
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        userId,
        applicantName: name,
        applicantPhone: phone,
        applicantEmail: email || null,
        coverLetter: coverLetter || null,
        experience: experience || null,
      },
    });

    return res.status(201).json({ success: true, message: "Application submitted successfully", application });
  } catch (error) {
    console.error("applyForJob error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit application" });
  }
};

// ─── Authenticated User: Get my applications ─────────────────────────────────
exports.getMyApplications = async (req, res) => {
  try {
    const { userId } = req.user;
    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { appliedAt: "desc" },
      include: {
        job: {
          include: { shop: { select: { shopname: true, city: true, state: true } } },
        },
      },
    });
    return res.json({ success: true, applications });
  } catch (error) {
    console.error("getMyApplications error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

// ─── Shop Owner: Get jobs for their shop ─────────────────────────────────────
exports.getShopJobs = async (req, res) => {
  try {
    const shop = await prisma.shop.findFirst({ where: { ownerPhone: req.user.phone } });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const jobs = await prisma.jobPost.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });

    return res.json({ success: true, jobs });
  } catch (error) {
    console.error("getShopJobs error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch shop jobs" });
  }
};

// ─── Shop Owner: Update job ───────────────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const shop = await prisma.shop.findFirst({ where: { ownerPhone: req.user.phone } });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const job = await prisma.jobPost.findFirst({ where: { id: jobId, shopId: shop.id } });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const {
      title, description, requirements, jobType,
      salaryMin, salaryMax, salaryCurrency,
      workingDays, startTime, endTime, hoursPerDay,
      experience, skills, status,
    } = req.body;

    const updated = await prisma.jobPost.update({
      where: { id: jobId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(requirements !== undefined && { requirements }),
        ...(jobType && { jobType }),
        ...(salaryMin !== undefined && { salaryMin: salaryMin ? parseFloat(salaryMin) : null }),
        ...(salaryMax !== undefined && { salaryMax: salaryMax ? parseFloat(salaryMax) : null }),
        ...(salaryCurrency && { salaryCurrency }),
        ...(workingDays && { workingDays }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(hoursPerDay !== undefined && { hoursPerDay: hoursPerDay ? parseFloat(hoursPerDay) : null }),
        ...(experience !== undefined && { experience }),
        ...(skills && { skills }),
        ...(status && { status }),
      },
    });

    return res.json({ success: true, message: "Job updated", job: updated });
  } catch (error) {
    console.error("updateJob error:", error);
    return res.status(500).json({ success: false, message: "Failed to update job" });
  }
};

// ─── Shop Owner: Delete job ───────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const shop = await prisma.shop.findFirst({ where: { ownerPhone: req.user.phone } });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const job = await prisma.jobPost.findFirst({ where: { id: jobId, shopId: shop.id } });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    await prisma.jobPost.delete({ where: { id: jobId } });
    return res.json({ success: true, message: "Job deleted" });
  } catch (error) {
    console.error("deleteJob error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete job" });
  }
};

// ─── Shop Owner: View applications for a job ─────────────────────────────────
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const shop = await prisma.shop.findFirst({ where: { ownerPhone: req.user.phone } });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const job = await prisma.jobPost.findFirst({ where: { id: jobId, shopId: shop.id } });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const applications = await prisma.jobApplication.findMany({
      where: { jobId },
      orderBy: { appliedAt: "desc" },
    });

    return res.json({ success: true, applications });
  } catch (error) {
    console.error("getJobApplications error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

// ─── Shop Owner: Update application status ───────────────────────────────────
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "hired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const shop = await prisma.shop.findFirst({ where: { ownerPhone: req.user.phone } });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application || application.job.shopId !== shop.id) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    return res.json({ success: true, message: "Application status updated", application: updated });
  } catch (error) {
    console.error("updateApplicationStatus error:", error);
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
};
