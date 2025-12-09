// middlewares/auth.js
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    let token = null;

    // ✅ 1. Try Authorization header (JWT)
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        usertype: decoded.usertype,
        name: decoded.name,
      };

      return next();
    }

    // ✅ 2. Fallback: x-auth-token (optional)
    if (req.headers["x-auth-token"]) {
      token = req.headers["x-auth-token"];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

      req.user = {
        userId: user.userId,
        email: user.email,
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



// // middlewares/auth.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/user/user-model'); // adjust path if different

// const authenticate = async (req, res, next) => {
//   try {
//     const header = req.headers.authorization || req.headers.Authorization;
//     console.log("AUTH HEADER:", req.headers.authorization);
//     if (!header?.startsWith('Bearer ')) {
//       return res.status(401).json({ success: false, message: 'Unauthorized' });
//     }
//     const token = header.split(' ')[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // decoded should contain userId and usertype at least
//     req.user = {
//       userId: decoded.userId,
//       usertype: decoded.usertype,
//       name: decoded.name,
//       email: decoded.email
//     };
//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: 'Invalid or expired token' });
//   }
// };

// const authorize = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: 'Unauthorized' });
//     }
//     if (!allowedRoles.length) return next();
//     if (!allowedRoles.includes(req.user.usertype)) {
//       return res.status(403).json({ success: false, message: 'Access forbidden. You do not have permission.' });
//     }
//     next();
//   };
// };

// module.exports = { authenticate, authorize };









// const jwt = require('jsonwebtoken');
// const User = require('../models/user/user-model');

// const JWT_SECRET = process.env.JWT_SECRET;

// // Define role hierarchy and permissions
// const roleHierarchy = {
//   admin: ['admin', 'shopOwner', 'customer'], // Admin can access all
//   shopOwner: ['shopOwner', 'customer'], // ShopOwner can access shopOwner and customer routes
//   customer: ['customer'] // Customer can only access customer routes
// };

// // Check if user has required permission
// const hasPermission = (requiredRole, userRole) => {
//   if (!requiredRole || !userRole) return false;
  
//   const allowedRoles = roleHierarchy[requiredRole];
//   if (!allowedRoles) return false;
  
//   return allowedRoles.includes(userRole);
// };

// // Extract token from request (supports multiple methods)
// const extractToken = (req) => {
//   // 1. Check Authorization header (Bearer token)
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
//     return req.headers.authorization.split(' ')[1];
//   }
  
//   // 2. Check cookies
//   if (req.cookies?.token) {
//     return req.cookies.token;
//   }
  
//   // 3. Check query parameter
//   if (req.query?.token) {
//     return req.query.token;
//   }
  
//   // 4. Check x-access-token header
//   if (req.headers['x-access-token']) {
//     return req.headers['x-access-token'];
//   }
  
//   return null;
// };

// // Main authentication middleware
// const authenticate = async (req, res, next) => {
//   try {
//     const token = extractToken(req);
    
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Access denied. No token provided.'
//       });
//     }

//     // Verify JWT token
//     const decoded = jwt.verify(token, JWT_SECRET);
    
//     // Fetch fresh user data from database (optional but recommended)
//     const user = await User.findById(decoded.userId || decoded._id || decoded.id)
//       .select('-password')
//       .lean();
    
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found or token is invalid.'
//       });
//     }

//     // Attach user to request
//     req.user = {
//       ...user,
//       userId: user._id,
//       isAdmin: user.usertype === 'admin'
//     };
//     req.token = token;

//     next();
//   } catch (error) {
//     console.error('Authentication error:', error.message);
    
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Token has expired. Please login again.'
//       });
//     }
    
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token. Please login again.'
//       });
//     }
    
//     return res.status(500).json({
//       success: false,
//       message: 'Authentication failed. Please try again.'
//     });
//   }
// };

// // Role-based access control middleware
// const authorize = (requiredRole = 'customer') => {
//   return (req, res, next) => {
//     try {
//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           message: 'User not authenticated.'
//         });
//       }

//       const userRole = req.user.usertype;
      
//       if (!hasPermission(requiredRole, userRole)) {
//         return res.status(403).json({
//           success: false,
//           message: `Access denied. ${requiredRole} role required.`
//         });
//       }

//       next();
//     } catch (error) {
//       console.error('Authorization error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Authorization failed.'
//       });
//     }
//   };
// };

// // Admin-specific middleware (convenience wrapper)
// const adminOnly = (req, res, next) => {
//   return authorize('admin')(req, res, next);
// };

// // ShopOwner-specific middleware
// const shopOwnerOnly = (req, res, next) => {
//   return authorize('shopOwner')(req, res, next);
// };

// // Customer-specific middleware
// const customerOnly = (req, res, next) => {
//   return authorize('customer')(req, res, next);
// };

// // Optional authentication (for routes that work with or without auth)
// const optionalAuth = async (req, res, next) => {
//   try {
//     const token = extractToken(req);
    
//     if (token) {
//       const decoded = jwt.verify(token, JWT_SECRET);
//       const user = await User.findById(decoded.userId || decoded._id || decoded.id)
//         .select('-password')
//         .lean();
      
//       if (user) {
//         req.user = {
//           ...user,
//           userId: user._id,
//           isAdmin: user.usertype === 'admin'
//         };
//         req.token = token;
//       }
//     }
    
//     next();
//   } catch (error) {
//     // If token is invalid, just continue without authentication
//     next();
//   }
// };

// // Export all middlewares
// module.exports = {
//   authenticate,      // Main auth middleware (required)
//   authorize,         // Role-based access control
//   adminOnly,         // Admin only
//   shopOwnerOnly,     // ShopOwner only
//   customerOnly,      // Customer only
//   optionalAuth,      // Optional authentication
//   hasPermission,     // Utility function
//   extractToken       // Utility function
// };