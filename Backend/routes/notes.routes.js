const express = require("express");
const router = express.Router();
const Note = require("../models/note.model");
const auth = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(auth);

// Get all notes for the logged in user
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching notes." });
  }
});

router.get("/get-note/:id", async (req, res) => {
  try {
    // Only return if the note belongs to the user
    const note = await Note.find({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note || note.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching notes." });
  }
});

router.post("/create", async (req, res) => {
  // Include the userId from the authenticated user
  const note = new Note({
    note: req.body.note,
    userId: req.user._id,
  });

  try {
    const savedNote = await note.save();
    res.json(savedNote);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while creating a note." });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    // Only update if the note belongs to the user
    const updatedNote = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      { note: req.body.note },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(updatedNote);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the note." });
  }
});

// Make sure the update-status route is properly defined
router.put("/update-status/:id", async (req, res) => {
  try {
    // Only update if the note belongs to the user
    const updatedNote = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      { status: req.body.status },
      { new: true } // Return the updated document
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(updatedNote);
  } catch (err) {
    console.error("Error updating note status:", err);
    res
      .status(500)
      .json({ error: "An error occurred while updating note status." });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    // Only delete if the note belongs to the user
    const deletedNote = await Note.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (deletedNote.deletedCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(deletedNote);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting a note." });
  }
});

// Add a search endpoint that filters by the logged-in user
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Search notes by content and filter by current user's ID
    const notes = await Note.find({
      userId: req.user._id, // Filter by logged-in user
      note: { $regex: query, $options: "i" }, // Case-insensitive search
    }).sort({ date: -1 }); // Most recent first

    res.json(notes);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "An error occurred while searching notes." });
  }
});

module.exports = router;
