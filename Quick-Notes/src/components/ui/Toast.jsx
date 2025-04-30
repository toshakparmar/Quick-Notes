import { motion } from "framer-motion";

const Toast = ({ message, type = "success", onClose }) => {
  const toastColors = {
    success: "bg-blue-600",
    error: "bg-red-500",
    warning: "bg-yellow-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-20 right-4 p-4 rounded-lg text-white shadow-lg z-40 
                  ${toastColors[type]}`}
    >
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

export default Toast;