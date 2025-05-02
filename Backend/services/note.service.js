const mongoose = require("mongoose");
const Note = require("../models/note.model");
const { ObjectId } = require("mongoose").Types;

// Helper to convert string ID to ObjectId if needed
const toObjectId = (id) => {
  try {
    if (ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)) {
      return new ObjectId(id);
    }
    return id; // Return as is if not a valid ObjectId
  } catch (err) {
    console.error("Error converting to ObjectId:", err);
    return id;
  }
};

// Tools for the assistant with userId parameter
module.exports = {
  getNotes: async (_, userId) => {
    try {
      if (!userId) {
        return {
          error: "User authentication required",
          notes: [],
        };
      }

      console.log(`Fetching notes for user ${userId}`);
      const notes = await Note.find({ userId }).sort({ date: -1 });
      return notes;
    } catch (err) {
      console.error("Error fetching notes:", err);
      return {
        error: err.message,
        notes: [],
      };
    }
  },

  createNote: async (noteText, userId) => {
    try {
      if (!userId) {
        return {
          success: false,
          message: "User authentication required",
        };
      }

      console.log(`Creating note for user ${userId}: "${noteText}"`);
      const newNote = new Note({
        note: noteText,
        userId: userId,
        status: false,
      });

      const savedNote = await newNote.save();

      return {
        success: true,
        message: "Note created successfully",
        note: savedNote,
      };
    } catch (err) {
      console.error("Error creating note:", err);
      return {
        success: false,
        message: `Failed to create note: ${err.message}`,
      };
    }
  },

  updateNote: async (input, userId) => {
    try {
      if (!userId) {
        return {
          success: false,
          message: "User authentication required",
        };
      }

      console.log(`Updating note for user ${userId}:`, input);

      const noteId = input._id || input.noteId;
      if (!noteId) {
        return {
          success: false,
          message: "Note ID is required",
        };
      }

      // Try to find the note first
      const note = await Note.findOne({
        $or: [{ _id: toObjectId(noteId) }, { noteId: parseInt(noteId) }],
        userId,
      });

      if (!note) {
        return {
          success: false,
          message: `Note #${noteId} not found or you don't have permission to update it`,
        };
      }

      // Update the note
      const updatedNote = await Note.findByIdAndUpdate(
        note._id,
        { note: input.note },
        { new: true }
      );

      return {
        success: true,
        message: "Note updated successfully",
        note: updatedNote,
      };
    } catch (err) {
      console.error("Error updating note:", err);
      return {
        success: false,
        message: `Failed to update note: ${err.message}`,
      };
    }
  },

  updateNoteStatus: async (input, userId) => {
    try {
      if (!userId) {
        return {
          success: false,
          message: "User authentication required",
        };
      }

      console.log(`Updating note status for user ${userId}:`, input);

      const noteId = input._id || input.noteId;
      if (!noteId) {
        return {
          success: false,
          message: "Note ID is required",
        };
      }

      // Try to find the note first
      const note = await Note.findOne({
        $or: [{ _id: toObjectId(noteId) }, { noteId: parseInt(noteId) }],
        userId,
      });

      if (!note) {
        return {
          success: false,
          message: `Note #${noteId} not found or you don't have permission to update it`,
        };
      }

      // Update the note status
      const updatedNote = await Note.findByIdAndUpdate(
        note._id,
        { status: !!input.status }, // Convert to boolean
        { new: true }
      );

      return {
        success: true,
        message: `Note marked as ${input.status ? "completed" : "pending"}`,
        note: updatedNote,
      };
    } catch (err) {
      console.error("Error updating note status:", err);
      return {
        success: false,
        message: `Failed to update note status: ${err.message}`,
      };
    }
  },

  deleteNote: async (noteId, userId) => {
    try {
      if (!userId) {
        return {
          success: false,
          message: "User authentication required",
        };
      }

      console.log(`Deleting note for user ${userId}: ${noteId}`);

      // First, try to find the note by numeric ID
      let note = null;

      // Check if noteId is a number
      if (!isNaN(noteId)) {
        note = await Note.findOne({
          noteId: parseInt(noteId),
          userId,
        });
      }

      // If not found by numeric ID, try ObjectId
      if (!note && ObjectId.isValid(noteId)) {
        try {
          note = await Note.findOne({
            _id: new ObjectId(noteId),
            userId,
          });
        } catch (objectIdError) {
          console.log(
            `Invalid ObjectId format for ${noteId}, skipping ObjectId lookup`
          );
        }
      }

      if (!note) {
        return {
          success: false,
          message: `Note #${noteId} not found or you don't have permission to delete it`,
        };
      }

      // Delete the note using the found document's _id
      await Note.deleteOne({ _id: note._id });

      return {
        success: true,
        message: "Note deleted successfully",
        note,
      };
    } catch (err) {
      console.error("Error deleting note:", err);
      return {
        success: false,
        message: `Failed to delete note: ${err.message}`,
      };
    }
  },

  searchNote: async (query, userId) => {
    try {
      if (!userId) {
        return [];
      }

      console.log(`Searching notes for user ${userId}: "${query}"`);

      // Search notes belonging to the user
      const notes = await Note.find({
        userId,
        note: { $regex: query, $options: "i" },
      }).sort({ date: -1 });

      return notes;
    } catch (err) {
      console.error("Error searching notes:", err);
      return {
        error: err.message,
        notes: [],
      };
    }
  },
};
