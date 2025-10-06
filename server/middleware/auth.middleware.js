// server/middleware/auth.middleware.js
// Firebase Admin SDK verification middleware
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // In production, verify with Firebase Admin SDK
    // For now, we'll just check if token exists
    // TODO: Implement Firebase Admin SDK verification

    req.user = { uid: "admin" }; // Placeholder
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = { verifyFirebaseToken };
