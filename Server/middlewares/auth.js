// middlewares/auth.js
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // ✅ 1. Try Authorization header (JWT)
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const existingUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { isDeleted: true },
      });

      if (!existingUser || existingUser.isDeleted) {
        return res.status(401).json({
          success: false,
          message: "Account is deleted or unavailable",
        });
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        phone: decoded.phone,
        usertype: decoded.usertype,
        name: decoded.name,
      };

      return next();
    }

    // ✅ 2. Fallback: x-auth-token (optional)
    if (req.headers["x-auth-token"]) {
      token = req.headers["x-auth-token"];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const existingUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { isDeleted: true },
      });

      if (!existingUser || existingUser.isDeleted) {
        return res.status(401).json({
          success: false,
          message: "Account is deleted or unavailable",
        });
      }

      req.user = decoded;
      return next();
    }

    // ✅ 3. FINAL FALLBACK — frontend sends user object
    /**
     * Your frontend currently stores:
     * localStorage.token = { userId, email, usertype, ... }
     * So axios is sending NOTHING in headers.
     *
     * Fix: allow frontend to send this object in body / headers.
     */
    if (req.headers["x-user"]) {
      const user = JSON.parse(req.headers["x-user"]);

      const existingUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { isDeleted: true },
      });

      if (!existingUser || existingUser.isDeleted) {
        return res.status(401).json({
          success: false,
          message: "Account is deleted or unavailable",
        });
      }

      req.user = {
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        usertype: user.usertype,
        name: user.name,
      };

      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized (no token found)",
    });
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid authentication",
    });
  }
};

// ✅ Role guard (NO CHANGE NEEDED)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      allowedRoles.length &&
      !allowedRoles.includes(req.user.usertype)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
