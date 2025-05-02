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

// Initialize conversation context - make these user-specific
let userContexts = new Map();

// Helper to get or create user context
const getUserContext = (userId) => {
  if (!userId) {
    console.error("Invalid userId provided to getUserContext");
    return null;
  }

  if (!userContexts.has(userId)) {
    userContexts.set(userId, {
      pendingStatusUpdate: null,
      pendingDelete: null,
      pendingUpdateContent: null,
      conversationMessages: [{ role: "user", content: SYSTEM_PROMPT }],
    });
  }
  return userContexts.get(userId);
};

module.exports = {
  // Process a user message through the assistant
  quickNotesAssistant: async (query, userId) => {
    try {
      // Ensure userId is provided
      if (!userId) {
        console.error("User authentication required for assistant");
        return {
          success: false,
          message: "User authentication required",
          type: "error",
        };
      }

      // Get user-specific context
      const context = getUserContext(userId);
      if (!context) {
        return {
          success: false,
          message: "Failed to initialize user context",
          type: "error",
        };
      }

      console.log(`💬 Processing message for user ${userId}: "${query}"`);
      console.log("📊 Current context:", {
        pendingDelete: context.pendingDelete,
        pendingStatusUpdate: context.pendingStatusUpdate,
        pendingUpdateContent: context.pendingUpdateContent,
      });

      // Handle pending delete confirmation
      if (context.pendingDelete && !isNaN(query)) {
        const noteId = query.trim();
        console.log(`🗑️ Confirmed delete for note ${noteId} by user ${userId}`);

        // Reset pending delete flag immediately to prevent multiple deletion attempts
        context.pendingDelete = null;

        try {
          console.log(
            `Attempting to delete note with ID: ${noteId} for user ${userId}`
          );

          // Call the deleteNote function directly with the noteId and userId
          const observation = await tools.deleteNote(noteId, userId);

          // Log the result for debugging
          console.log(`Delete operation result:`, observation);

          // Handle the response
          if (observation && observation.success) {
            const formattedResponse = await formatResponseMessage(
              "deleteNote",
              observation,
              noteId
            );

            return {
              success: true,
              message: formattedResponse,
              type: "response",
            };
          } else {
            return {
              success: false,
              message: observation.message || "Failed to delete note",
              type: "error",
            };
          }
        } catch (error) {
          console.error(
            `Error deleting note ${noteId} by user ${userId}:`,
            error
          );
          return {
            success: false,
            message: `Failed to delete note: ${error.message}`,
            type: "error",
          };
        }
      }

      // Handle pending status update
      if (
        context.pendingStatusUpdate &&
        (query.toLowerCase() === "true" ||
          query.toLowerCase() === "false" ||
          query.toLowerCase() === "complete" ||
          query.toLowerCase() === "completed" ||
          query.toLowerCase() === "pending" ||
          query.toLowerCase() === "incomplete")
      ) {
        // Convert string inputs to boolean
        let status = false;
        if (
          query.toLowerCase() === "true" ||
          query.toLowerCase() === "complete" ||
          query.toLowerCase() === "completed"
        ) {
          status = true;
        }

        console.log(
          `🔄 Updating status for note ${context.pendingStatusUpdate} by user ${userId} to ${status}`
        );

        const action = {
          type: "action",
          function: "updateNoteStatus",
          input: {
            noteId: context.pendingStatusUpdate, // Using noteId instead of _id for clarity
            status: status,
          },
        };
        context.pendingStatusUpdate = null;

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

      // Handle pending note content update
      if (context.pendingUpdateContent && query.trim()) {
        console.log(
          `📝 Updating content for note ${context.pendingUpdateContent} by user ${userId}`
        );

        const action = {
          type: "action",
          function: "updateNote",
          input: {
            noteId: context.pendingUpdateContent, // Using noteId instead of _id for clarity
            note: query.trim(),
          },
        };
        context.pendingUpdateContent = null;

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

      // Check for delete request
      if (isDeleteRequest(query)) {
        // Extract noteId if it's in the query like "delete note 6"
        const noteIdMatch = query.match(/\b(\d+)\b/);

        if (noteIdMatch) {
          // If note ID is in the command, delete directly
          const noteId = noteIdMatch[1];
          console.log(`🗑️ Direct delete for note ${noteId} by user ${userId}`);

          try {
            console.log(
              `Attempting direct delete of note with ID: ${noteId} for user ${userId}`
            );

            // Call the deleteNote function directly
            const observation = await tools.deleteNote(noteId, userId);

            // Log the result for debugging
            console.log(`Direct delete operation result:`, observation);

            // Handle the response
            if (observation && observation.success) {
              const formattedResponse = await formatResponseMessage(
                "deleteNote",
                observation,
                noteId
              );

              return {
                success: true,
                message: formattedResponse,
                type: "response",
              };
            } else {
              return {
                success: false,
                message: observation.message || "Failed to delete note",
                type: "error",
              };
            }
          } catch (error) {
            console.error(
              `Error in direct delete for note ${noteId} by user ${userId}:`,
              error
            );
            return {
              success: false,
              message: `Failed to delete note: ${error.message}`,
              type: "error",
            };
          }
        } else {
          // Otherwise, ask for the note ID
          context.pendingDelete = true;
          context.pendingStatusUpdate = null;
          context.pendingUpdateContent = null;
          return {
            success: true,
            message:
              "Which note would you like to delete? Please provide the note ID.",
            type: "output",
            isQuestion: true,
            requiresInput: true,
          };
        }
      }

      // Check for update status request
      const statusUpdateMatch = query.match(
        /(?:mark|set|update|change)\s+(?:note\s+)?(\d+)\s+(?:as|to)\s+(complete|completed|done|pending|incomplete|not\s+done|true|false)/i
      );
      if (statusUpdateMatch) {
        const noteId = statusUpdateMatch[1];
        const statusText = statusUpdateMatch[2].toLowerCase();
        const status =
          statusText === "complete" ||
          statusText === "completed" ||
          statusText === "done" ||
          statusText === "true";

        console.log(
          `🔄 Direct status update for note ${noteId} by user ${userId} to ${status}`
        );

        const action = {
          type: "action",
          function: "updateNoteStatus",
          input: {
            noteId: noteId, // Using noteId instead of _id for clarity
            status: status,
          },
        };

        try {
          const observation = await tools[action.function](
            action.input,
            userId
          );
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
        } catch (error) {
          console.error(`Error updating status for note ${noteId}:`, error);
          return {
            success: false,
            message: `Failed to update note status: ${error.message}`,
            type: "error",
          };
        }
      }

      // Check for content update request
      const updateContentMatch = query.match(
        /update\s+(?:note\s+)?(\d+)(?:\s+content|\s+to)?\s*(?::|\s+to\s*:)?\s*(.*)/i
      );
      if (updateContentMatch && updateContentMatch[2].trim()) {
        // If we have both note ID and content in the same command
        const noteId = updateContentMatch[1];
        const newContent = updateContentMatch[2].trim();

        if (newContent) {
          console.log(
            `📝 Direct content update for note ${noteId} by user ${userId}: "${newContent}"`
          );

          const action = {
            type: "action",
            function: "updateNote",
            input: {
              noteId: noteId, // Using noteId instead of _id for clarity
              note: newContent,
            },
          };

          try {
            const observation = await tools[action.function](
              action.input,
              userId
            );
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
          } catch (error) {
            console.error(`Error updating content for note ${noteId}:`, error);
            return {
              success: false,
              message: `Failed to update note content: ${error.message}`,
              type: "error",
            };
          }
        } else {
          // If we only have note ID, ask for the content
          context.pendingUpdateContent = noteId;
          context.pendingDelete = null;
          context.pendingStatusUpdate = null;

          return {
            success: true,
            message: `Please provide the new content for note ${noteId}:`,
            type: "output",
            isQuestion: true,
            requiresInput: true,
          };
        }
      } else if (query.match(/update\s+(?:note\s+)?(\d+)/i)) {
        // If query is just "update note X", ask for the content
        const noteId = query.match(/update\s+(?:note\s+)?(\d+)/i)[1];
        context.pendingUpdateContent = noteId;
        context.pendingDelete = null;
        context.pendingStatusUpdate = null;

        return {
          success: true,
          message: `Please provide the new content for note ${noteId}:`,
          type: "output",
          isQuestion: true,
          requiresInput: true,
        };
      }

      // Handle numeric input for pending operations
      if (!isNaN(query) && query.trim() !== "") {
        const noteId = query.trim();

        if (context.pendingDelete) {
          console.log(
            `🗑️ Processing delete for note ${noteId} by user ${userId}`
          );

          // Reset pending delete flag immediately to prevent multiple deletion attempts
          context.pendingDelete = null;

          try {
            console.log(
              `Attempting to delete note with ID: ${noteId} for user ${userId}`
            );

            // Call the deleteNote function directly
            const observation = await tools.deleteNote(noteId, userId);

            // Log the result for debugging
            console.log(`Delete operation result:`, observation);

            // Handle the response
            if (observation && observation.success) {
              const formattedResponse = await formatResponseMessage(
                "deleteNote",
                observation,
                noteId
              );

              return {
                success: true,
                message: formattedResponse,
                type: "response",
              };
            } else {
              return {
                success: false,
                message: observation.message || "Failed to delete note",
                type: "error",
              };
            }
          } catch (error) {
            console.error(
              `Error processing delete for note ${noteId} by user ${userId}:`,
              error
            );
            return {
              success: false,
              message: `Failed to delete note: ${error.message}`,
              type: "error",
            };
          }
        } else {
          // Ask for status
          context.pendingStatusUpdate = noteId;
          context.pendingDelete = null;
          context.pendingUpdateContent = null;

          return {
            success: true,
            message: `Please provide the status for note #${noteId} (true/complete for complete, false/pending for incomplete):`,
            type: "output",
            isQuestion: true,
            requiresInput: true,
          };
        }
      }

      // Regular message processing with AI model
      try {
        const userMessage = { type: "user", user: query };
        context.conversationMessages.push({
          role: "user",
          content: JSON.stringify(userMessage),
        });

        const chat = await model.generateContent({
          contents: context.conversationMessages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          })),
        });

        let rawText =
          chat?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(`📝 Raw AI Response for user ${userId}:`, rawText);

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
              console.log(`🎯 Parsed action for user ${userId}:`, action);
              break;
            }
          } catch (e) {
            console.log(
              `⚠️ Skipping invalid JSON for user ${userId}:`,
              e.message
            );
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
              query
                .replace(new RegExp(UPDATE_KEYWORDS.join("|"), "gi"), "")
                .trim(),
              userId
            );

            if (searchResult && searchResult.length > 0) {
              // Found existing note, update it
              action = {
                type: "action",
                function: "updateNote",
                input: {
                  noteId: searchResult[0].noteId, // Using noteId instead of _id for clarity
                  note: newContent,
                },
              };
            }
          }
        }

        // Process the action
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

            try {
              // Always pass userId to the tool function
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
                context.conversationMessages.push({
                  role: "assistant",
                  content: JSON.stringify(action),
                });
              }

              return {
                success: true,
                message: formattedResponse,
                type: "response",
              };
            } catch (toolError) {
              console.error(
                `❌ Tool execution error for ${action.function}:`,
                toolError
              );
              return {
                success: false,
                message: `Failed to execute ${action.function}: ${toolError.message}`,
                type: "error",
              };
            }

          default:
            throw new Error(`Unknown action type: ${action.type}`);
        }
      } catch (aiError) {
        console.error(`❌ AI Processing Error for user ${userId}:`, aiError);
        return {
          success: false,
          message: `I'm having trouble understanding that request. Could you try rephrasing it? (Error: ${aiError.message})`,
          type: "error",
        };
      }
    } catch (error) {
      console.error(`❌ Assistant Error for user ${userId}:`, error);

      // Reset pending states on error
      if (userId) {
        const context = getUserContext(userId);
        if (context) {
          context.pendingStatusUpdate = null;
          context.pendingDelete = null;
          context.pendingUpdateContent = null;
        }
      }

      return {
        success: false,
        message:
          error.message || "An error occurred while processing your request",
        type: "error",
      };
    }
  },

  // Reset context for a specific user or all users
  resetContext: (userId) => {
    try {
      if (userId) {
        // Reset only specific user's context
        console.log(`🔄 Resetting context for user ${userId}`);
        userContexts.set(userId, {
          pendingStatusUpdate: null,
          pendingDelete: null,
          pendingUpdateContent: null,
          conversationMessages: [{ role: "user", content: SYSTEM_PROMPT }],
        });
        return {
          success: true,
          message: `Conversation reset for user ${userId}`,
        };
      } else {
        // Reset all contexts
        console.log("🔄 Resetting all user contexts");
        userContexts = new Map();
        return {
          success: true,
          message: "All conversations reset",
        };
      }
    } catch (error) {
      console.error("❌ Error resetting context:", error);
      return {
        success: false,
        message: `Failed to reset conversation: ${error.message}`,
      };
    }
  },

  // Get conversation history for a specific user
  getConversationHistory: (userId) => {
    try {
      if (!userId) {
        return {
          success: false,
          message: "User authentication required",
        };
      }

      const context = getUserContext(userId);
      if (!context) {
        return {
          success: false,
          message: "No conversation history found",
        };
      }

      // Extract just the messages, not the entire context
      const history = context.conversationMessages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => {
          try {
            const content = JSON.parse(msg.content);
            return {
              role: msg.role,
              content: msg.role === "user" ? content.user : content,
              timestamp: new Date(),
            };
          } catch (e) {
            return {
              role: msg.role,
              content: "Could not parse message content",
              timestamp: new Date(),
            };
          }
        });

      return {
        success: true,
        history,
        message: `Retrieved ${history.length} messages`,
      };
    } catch (error) {
      console.error(
        `❌ Error getting conversation history for user ${userId}:`,
        error
      );
      return {
        success: false,
        message: `Failed to retrieve conversation history: ${error.message}`,
      };
    }
  },
};
