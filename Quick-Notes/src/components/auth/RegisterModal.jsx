import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaTimes, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

const RegisterModal = ({ isOpen, onClose, onRegister, onLoginClick }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onRegister(formData);
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
                <div className="absolute -left-2 top-6 bg-gradient-to-r from-blue-500 to-blue-400 
                              text-white text-sm font-medium px-6 py-1.5 rounded-r-full shadow-lg">
                    Create Account
                </div>

                {/* Content */}
                <div className="relative p-8 pt-16">
                    <div className="flex justify-center mb-6">
                        <FaUserPlus className="text-[120px] text-white/10" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-700/50 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                required
                            />
                        </div>

                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-700/50 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                required
                            />
                        </div>

                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-700/50 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors duration-200"
                        >
                            Sign Up
                        </button>
                    </form>

                    <div className="mt-6 flex justify-center">
                        <motion.button
                            onClick={onLoginClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-zinc-400 hover:text-blue-400 text-sm
                                     transition-colors duration-300 flex items-center gap-2"
                        >
                            <span>Back to Sign In</span>
                            <FaSignInAlt className="text-lg" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default RegisterModal;
