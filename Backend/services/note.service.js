const mongoose = require("mongoose");
const Note = require("../models/note.model");
const { validateAndParseId } = require("../utils/db.utils");

// Add this function to get user context from request
const getUserFromRequest = (req) => {
  return req.user && req.user._id ? req.user._id : null;
};

const tools = {
  createNote: async (note, userId) => {
    if (!note || typeof note !== "string" || note.trim() === "") {
      return { success: false, message: "Invalid note content." };
    }
    try {
      const newNote = new Note({
        note: note.trim(),
        userId: userId, // Add the user ID
      });
      const savedNote = await newNote.save();
      return {
        success: true,
        message: "Note created successfully.",
        note: savedNote,
      };
    } catch (err) {
      return {
        success: false,
        message: "Failed to create note.",
        error: err.message,
      };
    }
  },

  getNotes: async (userId) => {
    try {
      // Filter by user ID if provided
      const query = userId ? { userId } : {};
      return await Note.find(query);
    } catch (err) {
      return { error: "Failed to fetch notes." };
    }
  },

  searchNote: async (query, userId) => {
    try {
      if (!query || typeof query !== "string") {
        return { error: "Invalid search query" };
      }

      // Add userId to the query if provided
      const searchQuery = { note: { $regex: query, $options: "i" } };
      if (userId) {
        searchQuery.userId = userId;
      }

      const notes = await Note.find(searchQuery).sort({ date: -1 });
      return notes;
    } catch (err) {
      return { error: "Failed to search notes." };
    }
  },

  updateNote: async (input, userId) => {
    try {
      if (!input || !input.note) {
        return {
          success: false,
          message: "Note content is required",
        };
      }

      let query;
      try {
        const id = input.noteId || input._id;
        // Try numeric ID first
        if (!isNaN(id)) {
          query = { noteId: parseInt(id) };
        } else {
          query = validateAndParseId(id);
        }
      } catch (err) {
        return {
          success: false,
          message: "Invalid note ID format",
        };
      }

      // Add userId to query if provided
      const findQuery = query;
      if (userId) {
        findQuery.userId = userId;
      }

      const updatedNote = await Note.findOneAndUpdate(
        findQuery,
        {
          note: input.note,
          date: new Date(),
        },
        { new: true }
      );

      if (!updatedNote) {
        return {
          success: false,
          message: `Note not found`,
        };
      }

      return {
        success: true,
        message: "Note updated successfully",
        note: updatedNote,
      };
    } catch (err) {
      return {
        success: false,
        message: `Failed to update note: ${err.message}`,
      };
    }
  },

  updateNoteStatus: async (input, userId) => {
    try {
      let query = {};

      if (!input || typeof input._id === "undefined") {
        return {
          success: false,
          message: "Note identifier is required",
        };
      }

      // Try to parse as number first for noteId
      const numericId = parseInt(input._id);
      if (!isNaN(numericId)) {
        query.noteId = numericId;
      } else if (mongoose.Types.ObjectId.isValid(input._id)) {
        query._id = input._id;
      } else {
        // Search by note content if no valid ID is provided
        query.note = input._id;
      }

      if (typeof input.status !== "boolean") {
        return {
          success: false,
          message: "Status must be a boolean value",
        };
      }

      // Add userId to query if provided
      if (userId) {
        query.userId = userId;
      }

      const note = await Note.findOne(query);
      if (!note) {
        return {
          success: false,
          message: "Note not found",
        };
      }

      const updatedNote = await Note.findByIdAndUpdate(
        note._id,
        {
          status: input.status,
          date: new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        message: "Note status updated successfully",
        note: updatedNote,
      };
    } catch (err) {
      return {
        success: false,
        message: `Failed to update note status: ${err.message}`,
      };
    }
  },

  deleteNote: async (noteId, userId) => {
    try {
      const query = { noteId: parseInt(noteId) };

      // Add userId to query if provided
      if (userId) {
        query.userId = userId;
      }

      const noteExists = await Note.findOne(query);
      if (!noteExists) {
        return {
          success: false,
          message: "This note doesn't exist or has already been deleted.",
        };
      }

      const deletedNote = await Note.findOneAndDelete(query);
      return {
        success: true,
        message: "Note deleted successfully",
        note: deletedNote,
      };
    } catch (err) {
      return {
        success: false,
        message: `Failed to delete note: ${err.message}`,
      };
    }
  },
};

module.exports = {
  ...tools,
  getUserFromRequest,
};
