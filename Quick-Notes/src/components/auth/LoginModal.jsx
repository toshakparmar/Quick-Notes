import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLock, FaTimes, FaLockOpen } from 'react-icons/fa';

const LoginModal = ({ isOpen, onClose, onLogin, onRegisterClick }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(formData);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md bg-gradient-to-b from-zinc-800 to-zinc-900
                         rounded-[40px] overflow-hidden shadow-xl relative"
            >
                {/* Top Decorative Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                }} />

                {/* Badge */}
                <div className="absolute -left-2 top-6 bg-gradient-to-r from-blue-600 to-blue-500 
                              text-white text-sm font-medium px-6 py-1.5 rounded-r-full shadow-lg">
                    Welcome Back
                </div>

                {/* Content */}
                <div className="relative p-8 pt-16">
                    <div className="flex justify-end mb-6">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-zinc-700/50 hover:bg-zinc-600/50
                                     flex items-center justify-center transition-colors"
                        >
                            <FaTimes className="text-zinc-400" />
                        </motion.button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div className="group relative">
                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 
                                                    text-zinc-400 group-hover:text-blue-400 
                                                    transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-700/30 rounded-2xl
                                             text-white placeholder-zinc-500 focus:outline-none
                                             focus:ring-2 focus:ring-blue-500/50 group-hover:bg-zinc-700/50
                                             transition-all duration-300"
                                    required
                                />
                            </div>

                            <div className="group relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 
                                                text-zinc-400 group-hover:text-blue-400 
                                                transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-700/30 rounded-2xl
                                             text-white placeholder-zinc-500 focus:outline-none
                                             focus:ring-2 focus:ring-blue-500/50 group-hover:bg-zinc-700/50
                                             transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500
                                     hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl
                                     transition-all duration-300 font-medium shadow-lg
                                     shadow-blue-500/25 hover:shadow-blue-500/40"
                        >
                            Sign In
                        </motion.button>
                    </form>

                    <div className="mt-6 flex justify-center">
                        <motion.button
                            onClick={onRegisterClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-zinc-400 hover:text-blue-400 text-sm
                                     transition-colors duration-300 flex items-center gap-2"
                        >
                            <span>Create Account</span>
                            <FaLockOpen className="text-lg" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LoginModal;
