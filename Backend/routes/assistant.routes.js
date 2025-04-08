const express = require("express");
const router = express.Router();
const {
  quickNotesAssistant,
  resetContext,
} = require("../services/assistant.service");

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 Received message:", message);

    if (!message?.trim()) {
      return res.json({
        success: false,
        message: "Please provide a question or command.",
        type: "error",
      });
    }

    const result = await quickNotesAssistant(message);
    console.log("🚀 Assistant Result:", result);
    return res.json({
      success: true,
      message: result,
      type: "success",
    });
  } catch (err) {
    console.error("❌ Assistant Error:", err);
    resetContext(); // Reset context on error
    return res.json({
      success: false,
      message: err.message || "An error occurred while processing your request",
      type: "error",
    });
  }
});

module.exports = router;
