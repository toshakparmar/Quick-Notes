import { useState, useCallback } from "react";
import assistantService from "../services/assistantService";

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingOperation, setPendingOperation] = useState(null);

  const sendMessage = useCallback(async (content) => {
    if (!content?.trim()) return;

    try {
      setLoading(true);
      // Add user message
      const userMessage = {
        type: "user",
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Get AI response
      const response = await assistantService.sendMessage(content);

      if (response.success) {
        const messageContent =
          typeof response.message === "string"
            ? response.message
            : response.message.message;

        // Handle operations that need confirmation
        if (response.message?.operation) {
          const { operation } = response.message;

          if (operation.type === "delete") {
            setPendingOperation(operation);
            const confirmationMessage = {
              type: "confirmation",
              confirmationType: "delete",
              content: `Are you sure you want to delete note #${operation.noteId}?`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, confirmationMessage]);
            return;
          }

          if (operation.type === "status") {
            setPendingOperation(operation);
            const confirmationMessage = {
              type: "confirmation",
              confirmationType: "status",
              content: `Do you want to mark note #${operation.noteId} as ${
                operation.status ? "completed" : "pending"
              }?`,
              timestamp: new Date(),
              noteStatus: operation.status,
            };
            setMessages((prev) => [...prev, confirmationMessage]);
            return;
          }

          if (operation.type === "update") {
            setPendingOperation(operation);
            const confirmationMessage = {
              type: "confirmation",
              confirmationType: "update",
              content: `Update note #${operation.noteId}:`,
              timestamp: new Date(),
              noteContent: operation.note,
            };
            setMessages((prev) => [...prev, confirmationMessage]);
            return;
          }
        }

        const assistantMessage = {
          type: "assistant",
          content: messageContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      setError(error.message);
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: error.message || "Failed to communicate with assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConfirm = async (value) => {
    if (!pendingOperation) return;

    try {
      setLoading(true);
      let result;

      switch (pendingOperation.type) {
        case "delete":
          result = await notesService.deleteNote(pendingOperation.noteId);
          break;
        case "status":
          result = await notesService.updateNoteStatus(
            pendingOperation.noteId,
            value
          );
          break;
        case "update":
          result = await notesService.updateNote(
            pendingOperation.noteId,
            value
          );
          break;
      }

      if (result.success) {
        const successMessage = {
          type: "assistant",
          content: result.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
      }
    } catch (error) {
      setError(error.message);
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: error.message || "Failed to communicate with assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setPendingOperation(null);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const cancelMessage = {
      type: "assistant",
      content: "Operation cancelled. What else would you like to do?",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, cancelMessage]);
    setPendingOperation(null);
  };

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    handleConfirm,
    handleCancel,
    clearChat,
  };
};

export default useChat;
