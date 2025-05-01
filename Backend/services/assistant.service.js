const { model } = require("../config/ai.config");
const tools = require("./note.service");
const {
  SYSTEM_PROMPT,
  formatResponseMessage,
  isUpdateRequest,
  getUpdateIntent,
  UPDATE_KEYWORDS,
  isDeleteRequest,
} = require("../utils/assistant.utils");

// Initialize conversation context
let pendingStatusUpdate = null;
let pendingDelete = null;
let conversationMessages = [{ role: "user", content: SYSTEM_PROMPT }];

// Add userId parameter
const quickNotesAssistant = async (query, userId = null) => {
  try {
    // Handle pending delete
    if (pendingDelete && !isNaN(query)) {
      const action = {
        type: "action",
        function: "deleteNote",
        input: query.trim(),
      };
      pendingDelete = null;

      // Pass userId to the tool function
      const observation = await tools[action.function](action.input, userId);
      const formattedResponse = await formatResponseMessage(
        action.function,
        observation,
        action.input
      );

      return {
        success: true,
        message: formattedResponse,
        type: "response",
      };
    }

    // Check for delete request before status update
    if (isDeleteRequest(query)) {
      pendingDelete = true;
      pendingStatusUpdate = null; // Clear any pending status update
      return {
        success: true,
        message:
          "Which note would you like to delete? Please provide the note ID.",
        type: "output",
        isQuestion: true,
        requiresInput: true,
      };
    }

    // Handle pending status update
    if (
      pendingStatusUpdate &&
      (query.toLowerCase() === "true" || query.toLowerCase() === "false")
    ) {
      const status = query.toLowerCase() === "true";
      const action = {
        type: "action",
        function: "updateNoteStatus",
        input: {
          _id: pendingStatusUpdate,
          status: status,
        },
      };
      pendingStatusUpdate = null;

      // Pass userId to the tool function
      const observation = await tools[action.function](action.input, userId);
      const formattedResponse = await formatResponseMessage(
        action.function,
        observation,
        action.input
      );

      return {
        success: true,
        message: formattedResponse,
        type: "response",
      };
    }

    // Handle numeric input - check pending delete first
    if (!isNaN(query) && query.trim() !== "") {
      if (pendingDelete) {
        const action = {
          type: "action",
          function: "deleteNote",
          input: query.trim(),
        };
        pendingDelete = null;

        // Pass userId to the tool function
        const observation = await tools[action.function](action.input, userId);
        const formattedResponse = await formatResponseMessage(
          action.function,
          observation,
          action.input
        );

        return {
          success: true,
          message: formattedResponse,
          type: "response",
        };
      } else {
        // Handle status update as before
        pendingStatusUpdate = query.trim();
        return {
          success: true,
          message: `Please provide the status for note #${query} (true for complete, false for incomplete):`,
          type: "output",
          isQuestion: true,
          requiresInput: true,
        };
      }
    }

    // Add user message to conversation
    const userMessage = { type: "user", user: query };
    conversationMessages.push({
      role: "user",
      content: JSON.stringify(userMessage),
    });

    const chat = await model.generateContent({
      contents: conversationMessages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    let rawText = chat?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("📝 Raw AI Response:", rawText);

    if (!rawText) {
      throw new Error("No response from AI");
    }

    const jsonRegex = /\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g;
    const jsonMatches = rawText.match(jsonRegex);

    if (!jsonMatches) {
      throw new Error("No valid JSON found in response");
    }

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

    // Handle update requests before other actions
    if (isUpdateRequest(query)) {
      const newContent = getUpdateIntent(query);
      if (newContent) {
        // Search for existing notes first
        const searchResult = await tools.searchNote(
          // Remove update keywords from search
          query.replace(new RegExp(UPDATE_KEYWORDS.join("|"), "gi"), "").trim()
        );

        if (searchResult && searchResult.length > 0) {
          // Found existing note, update it
          action = {
            type: "action",
            function: "updateNote",
            input: {
              noteId: searchResult[0].noteId,
              note: newContent,
            },
          };
        }
      }
    }

    switch (action.type) {
      case "output":
      case "information":
        return {
          success: true,
          message: action.message || action.output,
          type: action.type,
          isQuestion: action.type === "output",
          requiresInput: true,
        };

      case "action":
        const func = tools[action.function];
        if (!func) {
          throw new Error(`Invalid tool: ${action.function}`);
        }

        // Pass userId to the tool function
        const observation = await func(action.input, userId);
        if (!observation) {
          throw new Error("Tool returned no result");
        }

        const formattedResponse = await formatResponseMessage(
          action.function,
          observation,
          action.input
        );

        // Add assistant response to conversation
        if (action && action.type) {
          conversationMessages.push({
            role: "assistant",
            content: JSON.stringify(action),
          });
        }

        return {
          success: true,
          message: formattedResponse,
          type: "response",
        };

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  } catch (error) {
    console.error("❌ Assistant Error:", error);
    pendingStatusUpdate = null;
    pendingDelete = null;
    return {
      success: false,
      message:
        error.message || "An error occurred while processing your request",
      type: "error",
    };
  }
};

const resetContext = () => {
  pendingStatusUpdate = null;
  pendingDelete = null;
  conversationMessages = [{ role: "user", content: SYSTEM_PROMPT }];
};

module.exports = { quickNotesAssistant, resetContext };
