import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaArrowUp, FaPlus, FaRegEdit, FaRegCopy } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { IoIosClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Foreground() {
  const ref = useRef(null);

  const showSuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000, // Closes after 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const showError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000, // Closes after 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const [notesList, setNotesList] = useState([]);
  const [noteId, setNoteId] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [getEditNote, setGetEditNote] = useState({ note: "" });
  const [viewNote, setViewNote] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewNoteModal, setViewNoteModal] = useState(false);
  const [editModelStatus, setEditModalStatus] = useState(false);

  // QuickNotes AI Assistant API
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const chatContainerRef = useRef(null);

  // Add this state for chat interface visibility
  const [isChatOpen, setIsChatOpen] = useState(false);

  const backdropClass = React.useMemo(() => {
    return isModalOpen || isDeleteModalOpen || viewNoteModal
      ? "transition-all duration-300 blur-sm"
      : "transition-all duration-300";
  }, [isModalOpen, isDeleteModalOpen, viewNoteModal]);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8080/quick-notes");
      setNotesList(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notes");
      console.error("Error fetching notes:", err);
      showError("Error fetching notes!");
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = async (type, id) => {
    if (type === 1 && id) {
      try {
        const response = await axios.get(`http://localhost:8080/quick-notes/get-note/${id}`);
        setGetEditNote(response.data[0]);
        setEditModalStatus(true);
      } catch (err) {
        console.error("Error fetching note:", err);
        showError("Error fetching note!");
      }
    } else {
      setEditModalStatus(false);
      setGetEditNote({ note: "" });
    }
    setIsModalOpen(!isModalOpen);
  };

  const closeModal = () => {
    setNewNote("");
    setGetEditNote({ note: "" });
    setIsModalOpen(false);
  };

  const toggleViewNoteModal = (note) => {
    setViewNote(note);
    setViewNoteModal(!viewNoteModal);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(viewNote.note);
    showSuccess("Note copied to clipboard!");
  };

  const toggleDeleteModal = (id) => {
    setNoteId(id);
    setIsDeleteModalOpen(!isDeleteModalOpen);
  };

  const handleNoteStatus = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:8080/quick-notes/update-status/${id}`, {
        status: !currentStatus,
      });
      showSuccess("Note status updated successfully!");
      fetchNotes();
    } catch (err) {
      console.error("Error updating status:", err);
      showError("Failed to update note status!");
    }
  };

  const saveNotes = async () => {
    try {
      await axios.post("http://localhost:8080/quick-notes/create", {
        note: newNote,
      });
      showSuccess("Note saved successfully!");
      setNewNote("");
      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error("Error creating note:", err);
      showError("Failed to save note!");
    }
  };

  const updateNotes = async (id) => {
    try {
      await axios.put(`http://localhost:8080/quick-notes/update/${id}`, {
        note: getEditNote.note,
      });
      showSuccess("Note updated successfully!");
      setGetEditNote({ note: "" });
      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error("Error updating note:", err);
      showError("Failed to update note!");
    }
  };

  const deleteNotes = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/quick-notes/delete/${id}`);
      showSuccess("Note deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
      showError("Failed to delete note!");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const modalVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      y: 50,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  // Update message type handling
  const handleAssistant = async () => {
    try {
      setAssistantLoading(true);

      // Add user message
      const userMessage = {
        content: assistantQuery,
        type: 'user',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);

      const response = await axios.post('http://localhost:8080/quick-notes/assistant', {
        query: assistantQuery
      });

      const result = response.data;

      // Handle different response types
      let formattedMessage = result.message;
      let messageType = 'assistant';

      if (result.type === 'confirmation' && result.requiresConfirmation) {
        messageType = 'confirmation';
      } else if (result.type === 'information') {
        messageType = 'information';
      }

      // Add assistant message
      const assistantMessage = {
        content: formattedMessage,
        type: messageType,
        error: !result.success,
        timestamp: new Date(),
        requiresConfirmation: result.requiresConfirmation,
        isInformation: result.isInformation,
        noteDetails: result.noteDetails
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      setAssistantQuery('');
      await fetchNotes(); // Refresh notes list

    } catch (error) {
      console.error("Assistant Error:", error);
      const errorMessage = {
        content: "Sorry, I encountered an error. Please try again.",
        type: 'assistant',
        error: true,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setAssistantLoading(false);
    }
  };

  // Add this function to toggle chat interface
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Add this helper function for message formatting
  const formatMessage = (content) => {
    // Check if content contains newlines
    if (content.includes('\n')) {
      return content.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          <br />
        </React.Fragment>
      ));
    }
    return content;
  };

  return (
    <div className="fixed w-full h-full z-[3] bg-zinc-900/20">
      {error && <div className="text-red-500 p-4">{error}</div>}
      {loading ? (
        <div className="text-white p-4">Loading...</div>
      ) : (
        <div className="z-[3] w-full h-full flex justify-center items-center">
          <ToastContainer />
          <div ref={ref} className={`top-0 left-0 z-[4] w-full h-screen flex flex-wrap gap-4 p-2 ${backdropClass}`}>
            <AnimatePresence>
              {notesList.map((items) => (
                <motion.div
                  key={items._id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  drag
                  dragConstraints={ref}
                  whileDrag={{ scale: 1.1 }}
                  dragElastic={0.1}
                  dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
                  className='relative w-[220px] h-[250px] rounded-[50px] bg-zinc-800/90 text-white p-10 overflow-clip cursor-pointer'
                  onDoubleClick={() => toggleViewNoteModal(items)} // Changed from onClick to onDoubleClick
                >
                  <div className='absolute top-2 w-full left-0'>
                    <div className='flex items-center justify-between px-5 py-3'
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDeleteModal(items._id);
                      }}>
                      <div className="flex items-center space-x-2">
                        <HiOutlineClipboardDocumentList />
                        <span className="text-xs text-zinc-400">#{items.noteId}</span>
                      </div>
                      <span className='w-6 h-6 bg-zinc-600 rounded-full flex items-center justify-center'>
                        <IoIosClose size=".8em" color='#fff' />
                      </span>
                    </div>
                  </div>
                  <div className='relative h-[120px] overflow-hidden'>
                    <p className='text-sm leading-tight mt-5 font-semibold line-clamp-6 hover:line-clamp-none'>
                      {items.note.slice(0, 80)}....
                    </p>
                  </div>
                  <div className='absolute footer bottom-0 w-full left-0'>
                    <div className='flex items-center justify-between px-5 py-3'>
                      <span
                        className='w-7 h-7 bg-zinc-600 rounded-full flex items-center justify-center'
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModal(1, items._id);
                        }}>
                        <FaRegEdit size=".7em" color='#fff' />
                      </span>
                      <span className='w-7 h-7 bg-zinc-600 rounded-full flex items-center justify-center'>
                        <MdOutlineFileDownload size=".7em" color='#fff' />
                      </span>
                    </div>
                    <div
                      className={`w-full p-2 text-center transition-colors duration-300 ${items.status ? 'bg-green-600' : 'bg-blue-600'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNoteStatus(items._id, items.status);
                      }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-zinc-200">
                          {items.status ? 'Completed' : 'Pending...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* All Modals */}
      <AnimatePresence>
        {/* Create/Edit Note Modal */}
        {isModalOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 w-full md:w-[500px] lg:w-[700px] mx-auto z-20"
          >
            <div className="bg-zinc-800/95 rounded-t-2xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="text-zinc-200 font-medium">
                    {editModelStatus ? "Edit Note" : "Add New Note"}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <IoIosClose size="1.5em" color="#fff" />
                </button>
              </div>

              <div className="p-4">
                <textarea
                  className="w-full p-3 resize-none bg-zinc-700 rounded-xl text-zinc-200 outline-none placeholder-zinc-400"
                  placeholder="Enter your note here..."
                  value={editModelStatus ? getEditNote.note : newNote}
                  onChange={(e) =>
                    editModelStatus
                      ? setGetEditNote({ ...getEditNote, note: e.target.value })
                      : setNewNote(e.target.value)
                  }
                  rows={6}
                  autoFocus
                />
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-zinc-600 text-zinc-200 rounded-full hover:bg-zinc-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-zinc-200 rounded-full hover:bg-blue-700 transition-colors duration-200"
                    onClick={() =>
                      editModelStatus ? updateNotes(getEditNote._id) : saveNotes()
                    }
                  >
                    {editModelStatus ? "Update Note" : "Save Note"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 w-full md:w-[500px] lg:w-[700px] mx-auto z-20"
          >
            <div className="bg-zinc-800/95 rounded-t-2xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <h3 className="text-zinc-200 font-medium">Delete Note</h3>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <IoIosClose size="1.5em" color="#fff" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-zinc-300 text-center mb-6">
                  Are you sure you want to delete this note? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 bg-zinc-600 text-zinc-200 rounded-full hover:bg-zinc-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-zinc-200 rounded-full hover:bg-red-700 transition-colors duration-200"
                    onClick={() => deleteNotes(noteId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* View Note Modal */}
        {viewNoteModal && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 w-full md:w-[500px] lg:w-[700px] mx-auto z-20"
          >
            <div className="bg-zinc-800/95 rounded-t-2xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-zinc-200 font-medium">View Note</h3>
                    <span className="text-xs text-zinc-400">#{viewNote.noteId}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewNoteModal(false)}
                  className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <IoIosClose size="1.5em" color="#fff" />
                </button>
              </div>

              <div className="p-4">
                <div className="bg-zinc-700 rounded-xl p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                  <p className="text-zinc-200 whitespace-pre-wrap break-words">
                    {viewNote.note}
                  </p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 text-zinc-200 rounded-full hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <FaRegCopy size="1em" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => setViewNoteModal(false)}
                    className="px-4 py-2 bg-zinc-600 text-zinc-200 rounded-full hover:bg-zinc-700 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Improved Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 w-full md:w-[500px] lg:w-[700px] mx-auto z-20"
          >
            <div className="bg-zinc-800/95 rounded-t-2xl shadow-lg overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h3 className="text-zinc-200 font-medium">Quick Notes Assistant</h3>
                </div>
                <button
                  onClick={toggleChat}
                  className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <IoIosClose size="1.5em" color="#fff" />
                </button>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="h-[400px] max-h-[60vh] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent"
              >
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${message.type === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : message.type === 'confirmation'
                          ? 'bg-red-600/90 text-white rounded-tl-none'
                          : message.type === 'information'
                            ? 'bg-purple-600/90 text-white rounded-tl-none'
                            : message.error
                              ? 'bg-red-500/10 text-red-200 rounded-tl-none'
                              : 'bg-zinc-700 text-zinc-200 rounded-tl-none'
                        }`}
                    >
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {message.type === 'information' ? (
                          <>
                            <div className="font-medium mb-2">💡 Information</div>
                            {formatMessage(message.content)}
                          </>
                        ) : (
                          formatMessage(message.content)
                        )}
                      </div>
                      <span className="text-xs opacity-50 mt-1 block">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {assistantLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-zinc-700 text-zinc-200 p-3 rounded-2xl rounded-tl-none">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-zinc-700">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAssistant();
                  }}
                  className="flex items-center space-x-2"
                >
                  <textarea
                    placeholder="Ask me anything about your notes..."
                    className="flex-1 p-3 h-12 max-h-32 resize-none bg-zinc-700 rounded-xl text-zinc-200 outline-none placeholder-zinc-400"
                    value={assistantQuery}
                    onChange={(e) => setAssistantQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAssistant();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={assistantLoading || !assistantQuery.trim()}
                  >
                    {assistantLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaArrowUp size="1.2em" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="fixed bottom-4 right-4 md:right-8 flex flex-col space-y-4 z-20">
        {/* Add Note Button with Tooltip */}
        <div className="group relative">
          <button
            onClick={() => toggleModal(0)}
            className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            {isModalOpen ? <IoIosClose size="1.5em" /> : <FaPlus size="1.5em" />}
          </button>
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-zinc-800 text-zinc-200 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isModalOpen ? "Close" : "Add New Note"}
          </div>
        </div>

        {/* Chat Toggle Button with Tooltip */}
        <div className="group relative">
          <button
            onClick={toggleChat}
            className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            {isChatOpen ? <IoIosClose size="1.5em" /> : <FaArrowUp size="1.5em" />}
          </button>
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-zinc-800 text-zinc-200 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isChatOpen ? "Close Assistant" : "Open Quick Assistant"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Foreground;


