const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
  try {
    // Skip token verification for development if configured
    if (
      process.env.NODE_ENV === "development" &&
      process.env.BYPASS_AUTH === "true"
    ) {
      console.log("⚠️ Bypassing authentication in development mode");
      req.user = { _id: "dev-user-id", email: "dev@example.com" };
      return next();
    }

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // First verify the token without database access
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if userId exists in the decoded token
      if (!decoded.userId) {
        throw new Error("Invalid token structure");
      }

      // Try to find the user
      try {
        // Add a timeout to the database query
        const user = await Promise.race([
          User.findOne({ _id: decoded.userId }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Database query timed out")),
              5000
            )
          ),
        ]);

        if (!user) {
          throw new Error("User not found");
        }

        // Attach user and token to request object
        req.token = token;
        req.user = user;
        next();
      } catch (dbError) {
        console.error("Auth middleware database error:", dbError.message);

        // In case of DB issues, still allow request with limited user info from token
        if (process.env.NODE_ENV !== "production") {
          console.warn("⚠️ Using token data without database verification");
          req.user = {
            _id: decoded.userId,
            tokenOnly: true,
          };
          next();
        } else {
          // In production, require full authentication
          res.status(503).json({
            error: "Service temporarily unavailable",
            message:
              "Authentication service is currently unavailable. Please try again later.",
          });
        }
      }
    } catch (tokenError) {
      // Invalid token
      console.error("Token validation error:", tokenError.message);
      res.status(401).json({ error: "Invalid or expired token" });
    }
  } catch (error) {
    console.log("Auth middleware error:", error.message);
    res.status(401).json({ error: "Please authenticate" });
  }
};

module.exports = auth;
