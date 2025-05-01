import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaCog, FaSignOutAlt, FaRegBell, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import notesService from '../services/notesService';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';

const Navbar = ({ onSearch }) => {
    const { user, login, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleRegister = async (userData) => {
        try {
            await authService.register(userData);
            setShowRegisterModal(false);
            setShowLoginModal(true);
            console.log('Registration successful! Please login.');
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
        }
    };

    const handleSwitchToRegister = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
    };

    const handleSwitchToLogin = () => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            onSearch('');
            return;
        }

        setIsSearching(true);

        try {
            if (user) {
                const results = await notesService.searchNotes(searchQuery.trim());
                onSearch(searchQuery.trim(), results);
            } else {
                onSearch(searchQuery.trim());
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const navVariants = {
        hidden: { y: -100, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 30 }
        }
    };

    const containerVariants = {
        expanded: { height: "4.5rem" },
        collapsed: { height: "3.5rem" }
    };

    const handleLogin = async (credentials) => {
        try {
            if (!credentials.email || !credentials.password) {
                throw new Error("Please enter both email and password");
            }

            await login(credentials);
            setShowLoginModal(false);
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = error.message || "Login failed. Please try again.";
            alert(errorMessage);
        }
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <motion.nav
                variants={navVariants}
                initial="hidden"
                animate="visible"
                className={`sticky top-0 w-full z-50 transition-all duration-300
                   ${isScrolled
                        ? 'bg-zinc-900/85 backdrop-blur-lg shadow-md border-b border-zinc-800/50'
                        : 'bg-zinc-900'}`}
            >
                <motion.div
                    variants={containerVariants}
                    animate={isScrolled ? "collapsed" : "expanded"}
                    className="container mx-auto px-2 sm:px-4"
                >
                    <div className="flex items-center h-full justify-between gap-2 sm:gap-4">
                        <Link to="/" className="flex-shrink-0 group">
                            <motion.div
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative text-lg sm:text-xl md:text-2xl font-bold"
                            >
                                <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600
                               text-transparent bg-clip-text group-hover:opacity-0 
                               transition-opacity duration-300">
                                    CodeSmachers
                                </span>
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-300 via-blue-400 
                               to-blue-500 text-transparent bg-clip-text opacity-0 
                               group-hover:opacity-100 transition-opacity duration-300 
                               blur-[0.5px]">
                                    CodeSmachers
                                </span>
                            </motion.div>
                        </Link>

                        <div className="hidden sm:block flex-1 max-w-xl mx-2 sm:mx-4">
                            <form onSubmit={handleSearch} className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search notes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-1.5 bg-zinc-800/50 rounded-xl 
                           text-sm text-white placeholder-zinc-400 
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                           transition-all duration-300 group-hover:bg-zinc-800/70
                           border border-zinc-700/50 focus:border-blue-500/50"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 15 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="submit"
                                    disabled={isSearching}
                                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2"
                                >
                                    {isSearching ? (
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <FaSearch className="text-zinc-400 group-hover:text-blue-400 
                                        transition-colors duration-300" />
                                    )}
                                </motion.button>
                            </form>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            {!user ? (
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowLoginModal(true)}
                                        className="relative px-5 py-2 text-sm font-medium overflow-hidden
                             rounded-xl transition-all duration-300 group flex items-center gap-2"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 
                                  to-blue-600 transition-all duration-300 group-hover:opacity-90" />

                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 
                                  transition-opacity duration-300">
                                            <div className="absolute inset-0 translate-x-full 
                                    animate-[shine_1.5s_infinite]
                                    bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                        </div>

                                        <FaSignInAlt className="relative text-white w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span className="relative text-white group-hover:text-zinc-100">
                                            Sign In
                                        </span>
                                    </motion.button>
                                </div>
                            ) : (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative hidden sm:flex p-2 hover:bg-zinc-800/80 
                             rounded-xl transition-all duration-300 group"
                                    >
                                        <FaRegBell className="text-lg text-zinc-400 group-hover:text-blue-400 
                                       transition-colors duration-300" />
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 
                                  rounded-full animate-pulse" />
                                    </motion.button>

                                    <div className="relative">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowDropdown(!showDropdown)}
                                            className="flex items-center gap-3 px-3 py-1.5 
                               bg-zinc-800/50 hover:bg-zinc-700/50 
                               border border-zinc-700/50 hover:border-blue-500/30
                               rounded-xl transition-all duration-300 group"
                                        >
                                            <div className="relative">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.fullName}
                                                        className="w-8 h-8 rounded-full object-cover
                                     ring-2 ring-blue-500/50 group-hover:ring-blue-400 
                                     transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br 
                                        from-blue-500 to-blue-600 flex items-center justify-center
                                        ring-2 ring-blue-500/50 group-hover:ring-blue-400">
                                                        <span className="text-sm font-medium text-white">
                                                            {user.fullName?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 
                                      bg-green-500 rounded-full border-2 border-zinc-800"></span>
                                            </div>
                                            <div className="hidden md:block text-left">
                                                <p className="text-sm font-medium text-zinc-200 group-hover:text-white">
                                                    {user.fullName}
                                                </p>
                                                <p className="text-xs text-zinc-400 group-hover:text-zinc-300">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </motion.button>

                                        <AnimatePresence>
                                            {showDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ type: "spring", duration: 0.3 }}
                                                    className="absolute right-0 mt-2 w-64 origin-top-right
                                   bg-zinc-800/90 backdrop-blur-sm rounded-xl 
                                   shadow-lg border border-zinc-700/50"
                                                >
                                                    <div className="p-3 border-b border-zinc-700/50">
                                                        <p className="text-sm font-medium text-zinc-200">
                                                            Signed in as
                                                        </p>
                                                        <p className="text-sm text-zinc-400 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <div className="p-2">
                                                        <Link
                                                            to="/profile"
                                                            className="flex items-center gap-3 px-3 py-2 
                                       text-sm text-zinc-200 rounded-lg
                                       hover:bg-zinc-700/50 transition-colors"
                                                        >
                                                            <FaCog className="text-zinc-400" />
                                                            <span>Profile Settings</span>
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                handleLogout();
                                                                setShowDropdown(false);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-3 py-2 
                                       text-sm text-red-400 rounded-lg
                                       hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <FaSignOutAlt />
                                                            <span>Sign Out</span>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.nav>
            <div className="h-12 sm:h-14 transition-all duration-300" />

            <AnimatePresence mode="wait">
                {showLoginModal && (
                    <LoginModal
                        isOpen={showLoginModal}
                        onClose={() => setShowLoginModal(false)}
                        onLogin={handleLogin}
                        onRegisterClick={handleSwitchToRegister}
                    />
                )}

                {showRegisterModal && (
                    <RegisterModal
                        isOpen={showRegisterModal}
                        onClose={() => setShowRegisterModal(false)}
                        onRegister={handleRegister}
                        onLoginClick={handleSwitchToLogin}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
