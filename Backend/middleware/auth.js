const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Verify token with the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if userId exists in the decoded token
    if (!decoded.userId) {
      throw new Error("Invalid token structure");
    }

    // Find user by id
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error("User not found");
    }

    // Attach user and token to request object
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log("Auth middleware error:", error.message);
    res.status(401).json({ error: "Please authenticate" });
  }
};

module.exports = auth;
