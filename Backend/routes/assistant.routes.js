const express = require("express");
const router = express.Router();
const {
  quickNotesAssistant,
  resetContext,
} = require("../services/assistant.service");
const auth = require("../middleware/auth");

// Apply auth middleware to ensure we have the user
router.use(auth);

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 Received message:", message);

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        type: "error",
      });
    }

    // Extract user ID from the authenticated request
    const userId = req.user._id.toString();
    console.log(`💡 Processing request for user: ${userId}`);

    if (!message?.trim()) {
      return res.json({
        success: false,
        message: "Please provide a question or command.",
        type: "error",
      });
    }

    // Pass the userId to the assistant
    const result = await quickNotesAssistant(message, userId);
    console.log("🚀 Assistant Result:", result);
    return res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error("❌ Assistant Error:", err);
    resetContext(req.user?._id?.toString()); // Reset context for this user on error
    return res.json({
      success: false,
      message: err.message || "An error occurred while processing your request",
      type: "error",
    });
  }
});

module.exports = router;
