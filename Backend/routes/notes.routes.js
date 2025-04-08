const express = require("express");
const router = express.Router();
const Note = require("../models/note.model");

router.get("/", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching notes." });
  }
});

router.get("/get-note/:id", async (req, res) => {
  try {
    const note = await Note.find({ _id: req.params.id });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching notes." });
  }
});

router.post("/create", async (req, res) => {
  const note = new Note({ note: req.body.note });
  try {
    const savedNote = await note.save();
    res.json(savedNote);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while creating a note." });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
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

router.put("/update-status/:id", async (req, res) => {
  try {
    const updatedNote = await Note.updateOne(
      { _id: req.params.id },
      { status: req.body.status }
    );
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while updating a note." });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedNote = await Note.deleteOne({ _id: req.params.id });
    res.json(deletedNote);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting a note." });
  }
});

module.exports = router;
