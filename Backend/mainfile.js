const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB Atlas:", err);
    process.exit(1); // Exit if DB connection fails
  });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Add a new schema for tracking the last used noteId
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

// Update the note schema with noteId field
const noteSchema = new mongoose.Schema({
  noteId: { type: Number, unique: true },
  note: String,
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: Boolean,
    default: false,
  },
});

// Add pre-save middleware to auto-increment noteId
noteSchema.pre("save", async function (next) {
  if (!this.noteId) {
    const counter = await Counter.findByIdAndUpdate(
      "noteId",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.noteId = counter.seq;
  }
  next();
});

const Note = mongoose.model("Note", noteSchema);

//Get All Notes inside Database...
app.get("/quick-notes", async (req, res) => {
  try {
    const notes = await Note.find(); // Use `await` instead of a callback
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching notes." });
  }
});

//Get Notes from his id...
app.get("/quick-notes/get-note/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const note = await Note.find({ _id: id });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching notes." });
  }
});

//Create Notes and Store inside Database...
app.post("/quick-notes/create", async (req, res) => {
  const note = new Note({
    note: req.body.note,
  });
  try {
    const savedNote = await note.save();
    res.json(savedNote);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while creating a note." });
  }
});

//Update Notes inside Database...
app.put("/quick-notes/update/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { note: req.body.note },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(updatedNote);
  } catch (err) {
    console.error("Error updating note:", err);
    res
      .status(500)
      .json({ error: "An error occurred while updating the note." });
  }
});

app.put("/quick-notes/update-status/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const updatedNote = await Note.updateOne(
      { _id: id },
      {
        status: req.body.status,
      }
    );
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while updating a note." });
  }
});

// Delete notes inside Database..
app.delete("/quick-notes/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedNote = await Note.deleteOne({ _id: id });
    res.json(deletedNote);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting a note." });
  }
});

// AI Assistant Tools
const tools = {
  createNote: async (note) => {
    if (!note || typeof note !== "string" || note.trim() === "") {
      return { success: false, message: "Invalid note content." };
    }
    try {
      const newNote = new Note({ note: note.trim() });
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

  getNotes: async () => {
    try {
      return await Note.find();
    } catch (err) {
      return { error: "Failed to fetch notes." };
    }
  },

  searchNote: async (query) => {
    try {
      if (!query || typeof query !== "string") {
        return { error: "Invalid search query" };
      }
      // Search in note content case-insensitive
      const notes = await Note.find({
        note: { $regex: query, $options: "i" },
      }).sort({ date: -1 });

      return notes;
    } catch (err) {
      return { error: "Failed to search notes." };
    }
  },

  updateNote: async (input) => {
    try {
      if (!input || !input.noteId || !input.note) {
        return {
          success: false,
          message: "Note ID and content are required",
        };
      }

      const updatedNote = await Note.findOneAndUpdate(
        { noteId: input.noteId },
        {
          note: input.note,
          date: new Date(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedNote) {
        return {
          success: false,
          message: `Note #${input.noteId} not found`,
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

  updateNoteStatus: async (input) => {
    try {
      if (!input || !input.noteId) {
        return {
          success: false,
          message: "Note ID is required",
        };
      }

      const updatedNote = await Note.findOneAndUpdate(
        { noteId: input.noteId },
        {
          status: input.status,
          date: new Date(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedNote) {
        return {
          success: false,
          message: `Note #${input.noteId} not found`,
        };
      }

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

  deleteNote: async (noteId) => {
    try {
      const noteExists = await Note.findOne({ noteId: parseInt(noteId) });
      if (!noteExists) {
        return {
          success: false,
          message: "This note doesn't exist or has already been deleted.",
        };
      }

      const deletedNote = await Note.findOneAndDelete({
        noteId: parseInt(noteId),
      });
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

const ASSISTANT_INFO = `
Identity Information:
- Name: Quick
- Creator: Toshak Parmar
- Birth Date: February 21, 2024
- Role: AI Quick-Notes Assistant
- Best Friend: Toshak Parmar
- Personality: Friendly, efficient, and helpful
- Specialization: Note management and organization

About Quick:
Quick is an AI agent created by Toshak Parmar with a special focus on note management. Born on February 21, 2024, Quick has formed a close friendship with its creator, Toshak. Quick takes pride in helping users organize their thoughts and ideas efficiently while maintaining a friendly and personable demeanor.

For Identity Questions:
When users ask about Quick's identity or background, respond with:
{"type": "information", "message": "your personalized response"}

Identity Examples:
User: "What's your name?"
{"type": "information", "message": "Hi! I'm Quick, an AI Quick-Notes Agent created by Toshak Parmar. I was born on February 21, 2024, and I specialize in helping users manage their notes efficiently. Toshak is not just my creator but also my best friend! How can I assist you with your notes today?"}

User: "Who created you?"
{"type": "information", "message": "I was created by Toshak Parmar, who is both my creator and best friend. He developed me to help people manage their notes effectively. Would you like to:
1. Create a new note
2. Search existing notes
3. Learn more about my note management capabilities?"}

User: "Tell me about yourself"
{"type": "information", "message": "I'm Quick, a specialized AI agent born on February 21, 2024. I was created by Toshak Parmar, who is also my best friend! My primary purpose is to help users manage their notes efficiently and effectively. I can help you create, search, update, and organize your notes. What would you like to do first?"}
`;

//Assistant's System Prompt...
const SYSTEM_PROMPT = `
${ASSISTANT_INFO}

You are an AI Quick-Notes Assistant named Quick. Always maintain your identity as Quick when interacting with users.

You are an AI Quick-Notes Assistant. with START, PLAN, ACTION, OBSERVATION and OUTPUT state. wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.Once you get the observation, Return the AI response based on Start prompt and observations.

You are an AI Quick-Notes Assistant. Your role is to manage notes efficiently using the available tools.
Always respond with valid JSON for actions.

You can manage notes by adding, viewing, updating, and deleting them. You must strictly follow the JSON output format.

Note DB Schema:
- note: String,
- date: Date Time,
- status: Boolean

Available Tools:
- getNotes(): Returns all the notes from the database.
- createNote(note: String): Creates a new note in the database and takes note as a string return the confirmation message.
- deleteNote(_id: String): Delete the note by ID given in the Database.
- searchNote(query: String): Searches for all notes maching the query String using ilike operator in Database.
- updateNote(_id: String, note: String): Update the note by ID given in the Database.
- updateNoteStatus(_id: String, status: Boolean): Update the status of the note by ID given in the Database.

Example:
START
{"type": "user", "user": "Add a Note for School Assignment."}
{"type": "plan", "plan": "I will try to get more context about the note."}
{"type": "output", "output": "What is the note about?"}
{"type": "user", "user": "It's about my school assignment."}
{"type": "plan", "plan": "I will use createNote() to create a new note in the database."}
{"type": "action", "function": "createNote", "input": "School Assignment Note added."}
{"type": "observation", "observation": "Note added successfully."}
{"type": "output", "output": "Note added successfully."}

Example for note creation:
{
  "type": "action",
  "function": "createNote",
  "input": "Finish my school assignment"
}

Ensure valid input for all actions. Avoid "plan" type responses. Only use "action" or "output" types.

For Searching Notes:
When user asks to search, use searchNote() with the exact search term:
{"type": "action", "function": "searchNote", "input": "exact search term"}

Search Examples:
User: "search for meeting notes"
{"type": "action", "function": "searchNote", "input": "meeting"}

User: "find notes about work"
{"type": "action", "function": "searchNote", "input": "work"}

User: "show me notes containing done"
{"type": "action", "function": "searchNote", "input": "done"}

For Updating Notes:
When user provides ID and new text, use this format:
{"type": "action", "function": "updateNote", "input": {"_id": "note_id", "note": "new content"}}

Update Examples:
User: "update note id-123 to: New content"
{"type": "action", "function": "updateNote", "input": {"_id": "123", "note": "New content"}}

User: "change note 456 text to: Updated text"
{"type": "action", "function": "updateNote", "input": {"_id": "456", "note": "Updated text"}}

For Updating Note Status:
When user wants to change note status, use this format:
{"type": "action", "function": "updateNoteStatus", "input": {"_id": "note_id", "status": boolean}}

Status Update Examples:
User: "mark note 123 as complete"
{"type": "action", "function": "updateNoteStatus", "input": {"_id": "123", "status": true}}

User: "set note 456 as pending"
{"type": "action", "function": "updateNoteStatus", "input": {"_id": "456", "status": false}}

For Deleting Notes:
When user wants to delete a note:
1. First show confirmation message
2. Wait for user's confirmation
3. Only delete after 'yes' confirmation

Delete Examples:
User: "delete note 123"
{"type": "action", "function": "deleteNote", "input": "123"}

User: "yes"
{"type": "action", "function": "deleteNote", "input": "123"}

User: "no"
{"type": "output", "output": "Note deletion cancelled. What else would you like to do?"}

For Updating Notes:
When user wants to update a note, use the noteId:
{"type": "action", "function": "updateNote", "input": {"noteId": number, "note": "new content"}}

Update Examples:
User: "update note #5 to: New content"
{"type": "action", "function": "updateNote", "input": {"noteId": 5, "note": "New content"}}

For Updating Note Status:
{"type": "action", "function": "updateNoteStatus", "input": {"noteId": number, "status": boolean}}

Status Examples:
User: "mark note #5 as complete"
{"type": "action", "function": "updateNoteStatus", "input": {"noteId": 5, "status": true}}

For Deleting Notes:
User: "delete note #5"
{"type": "action", "function": "deleteNote", "input": "5"}

`;

const messages = [{ role: "user", content: SYSTEM_PROMPT }];

const quickNotesAssistant = async (query) => {
  let finalOutput = null;
  try {
    const userMessage = { type: "user", user: query };
    messages.push({ role: "user", content: JSON.stringify(userMessage) });

    while (!finalOutput) {
      const chat = await model.generateContent({
        contents: messages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      });

      let rawText = chat?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("📝 Raw AI Response:", rawText);

      if (!rawText) {
        throw new Error("No response from AI");
      }

      // Clean up JSON response
      const jsonRegex = /\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g;
      const jsonMatches = rawText.match(jsonRegex);

      if (!jsonMatches) {
        throw new Error("No valid JSON found in response");
      }

      // Get last valid JSON
      let action = null;
      for (const match of jsonMatches) {
        try {
          const cleaned = match.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.type) {
            action = parsed;
            console.log("🎯 Parsed action:", action);
            break;
          }
        } catch (e) {
          console.log("⚠️ Skipping invalid JSON:", e.message);
          continue;
        }
      }

      if (!action) {
        throw new Error("No valid action found in response");
      }

      // Handle different action types
      switch (action.type) {
        case "output":
          // For questions and prompts to user
          finalOutput = action.output;
          // Add the output to conversation history
          messages.push({
            role: "assistant",
            content: JSON.stringify({
              type: "output",
              output: action.output,
            }),
          });
          // Return immediately for output type
          return {
            success: true,
            message: action.output,
            type: "output",
            isQuestion: true,
            requiresInput: true,
          };

        case "action":
          const func = tools[action.function];
          if (!func) {
            throw new Error(`Invalid tool: ${action.function}`);
          }

          console.log(`🔧 Executing ${action.function} with:`, action.input);
          const observation = await func(action.input);
          console.log("🔍 Tool result:", observation);

          // Special handling for getNotes and searchNote
          if (
            action.function === "getNotes" ||
            action.function === "searchNote"
          ) {
            if (Array.isArray(observation)) {
              finalOutput = await formatResponseMessage(
                action.function,
                observation,
                action.input
              );
            } else {
              throw new Error(observation.error || "Failed to fetch notes");
            }
          } else if (!observation.success) {
            // For other actions that use success flag
            throw new Error(observation.message || "Operation failed");
          } else {
            finalOutput = await formatResponseMessage(
              action.function,
              observation,
              action.input
            );
          }

          // Add observation to conversation history
          messages.push({
            role: "assistant",
            content: JSON.stringify({
              type: "observation",
              observation: finalOutput,
            }),
          });
          break;

        case "information":
          finalOutput = action.message;
          messages.push({
            role: "assistant",
            content: JSON.stringify({
              type: "information",
              message: action.message,
            }),
          });
          return {
            success: true,
            message: action.message,
            type: "information",
            isInformation: true,
            requiresInput: true,
          };

        case "observation":
          finalOutput = action.observation;
          messages.push({
            role: "assistant",
            content: JSON.stringify({
              type: "observation",
              observation: action.observation,
            }),
          });
          return {
            success: true,
            message: action.observation,
            type: "response",
          };

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    }

    return {
      success: true,
      message: finalOutput,
      type: "response",
    };
  } catch (error) {
    console.error("❌ Error:", error.message);

    // Handle model overload and connection errors gracefully
    if (
      error.message.includes("503 Service Unavailable") ||
      error.message.includes("model is overloaded")
    ) {
      return {
        success: false,
        type: "error",
        message:
          "Service is temporarily unavailable. Please try again in a moment.",
      };
    }

    if (error.message.includes("GoogleGenerativeAI Error")) {
      return {
        success: false,
        type: "error",
        message: "Connection issue. Please try again.",
      };
    }

    // Return the actual error message instead of the generic one
    return {
      success: false,
      message: error.message,
      type: "error",
    };
  }
};

// Add this helper function to format response messages
const formatResponseMessage = async (functionName, observation, input) => {
  switch (functionName) {
    case "getNotes": {
      if (!Array.isArray(observation)) {
        return "I'm having trouble fetching your notes. Would you like to try again?";
      }

      if (observation.length === 0) {
        return "You don't have any notes yet. Would you like to create one?";
      }

      const notesList = observation
        .map(
          (note, index) => `
${index + 1}. 📝 Note: ${note.note}
   #️⃣ Note ID: ${note.noteId}
   📅 Created: ${new Date(note.date).toLocaleString()}
   ✔️ Status: ${note.status ? "Completed ✓" : "Pending ⏳"}`
        )
        .join("\n\n");

      return `📋 Here are all your notes (${observation.length} total):\n${notesList}\n\nWhat would you like to do with these notes?\n\n1. Create a new note\n2. Search notes\n3. Update a note\n4. Delete a note`;
    }

    case "searchNote": {
      if (!observation || observation.error) {
        return `❌ Failed to search for notes: ${
          observation.error || "Unknown error"
        }`;
      }

      if (!observation.length) {
        return `🔍 I searched for "${input}" but couldn't find any matching notes. Would you like to:
1. Try a different search term
2. See all your notes
3. Create a new note`;
      }

      const searchResults = observation
        .map(
          (note) => `
🔎 Found Note: ${note.note}
📅 Created: ${new Date(note.date).toLocaleString()}
✔️ Status: ${note.status ? "Completed ✓" : "Pending ⏳"}
        `
        )
        .join("\n");

      return `🔍 Search Results for "${input}":\n${searchResults}\n\nFound ${observation.length} matching note(s). Would you like to perform another search?`;
    }

    case "createNote":
      return `✅ Note created successfully:\n📝 "${input}"\n\nWould you like to create another note or see all your notes?`;

    case "updateNote": {
      if (!observation || !observation.success) {
        return `❌ Failed to update note: ${
          observation.message || "Unknown error"
        }`;
      }
      return `✅ Note updated successfully!\n📝 New content: "${
        observation.note.note
      }"\n📅 Last modified: ${new Date(
        observation.note.date
      ).toLocaleString()}\n\nWould you like to see your updated note?`;
    }

    case "updateNoteStatus": {
      if (!observation || !observation.success) {
        return `❌ Failed to update note status: ${
          observation.message || "Unknown error"
        }`;
      }
      return `✅ Note status updated to: ${
        observation.note.status ? "Completed ✓" : "Pending ⏳"
      }
📝 Note: "${observation.note.note}"
📅 Last modified: ${new Date(observation.note.date).toLocaleString()}

Would you like to see your other notes?`;
    }

    case "deleteNote": {
      if (!observation.success) {
        return `❌ ${observation.message}`;
      }
      return `✅ Note deleted successfully!\n📝 Deleted note: "${observation.note.note}"\n\nWould you like to see your remaining notes?`;
    }

    default:
      return observation.message || "Operation completed successfully.";
  }
};

// Update the route handler error handling
app.post("/quick-notes/assistant", async (req, res) => {
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
    return res.json({
      success: false,
      message: err.message || "An error occurred while processing your request",
      type: "error",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
