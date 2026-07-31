import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, ShoppingCart, LogOut } from 'lucide-react'
import { useState } from 'react'
import StatusIndicator from './StatusIndicator'
import ChatBot, { ChatFloatingButton } from './ChatBot'
import apiService from '../services/api'
import './Layout.css'

function Layout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    // Check if we're on a page that should hide footer
    const hideFooter = ['/', '/login', '/register', '/guest-selection'].includes(location.pathname)

    const handleExit = () => {
        apiService.logout()
        navigate('/')
    }

    return (
        <div className="layout">
            {/* Header Navigation - Figma Style */}
            <header className="header">
                <div className="header-container">
                    {/* Mobile Menu Toggle */}
                    <button
                        className="menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo - Maxim's Script Style */}
                    <NavLink to="/" className="logo">
                        <span className="logo-text">Maxim's</span>
                    </NavLink>

                    {/* Right Side Actions */}
                    <div className="header-actions">
                        <NavLink to="/preferences" className="header-icon-btn" aria-label="Profile">
                            <User size={22} />
                        </NavLink>
                        <button className="header-icon-btn" aria-label="Cart">
                            <ShoppingCart size={22} />
                        </button>
                        <button className="exit-btn" onClick={handleExit}>
                            Exit
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            <motion.div
                                className="nav-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileMenuOpen(false)}
                            />
                            <motion.nav
                                className="nav-drawer"
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'tween', duration: 0.3 }}
                            >
                                <div className="nav-drawer-header">
                                    <span className="logo-text">Maxim's</span>
                                    <button
                                        className="nav-close-btn"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="nav-drawer-content">
                                    <NavLink
                                        to="/"
                                        className="nav-drawer-item"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Home
                                    </NavLink>
                                    <NavLink
                                        to="/discover"
                                        className="nav-drawer-item"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Discover Restaurants
                                    </NavLink>
                                    <NavLink
                                        to="/menu"
                                        className="nav-drawer-item"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Our Menu
                                    </NavLink>
                                    <NavLink
                                        to="/reservations"
                                        className="nav-drawer-item"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        My Reservations
                                    </NavLink>
                                    <NavLink
                                        to="/corporate-events"
                                        className="nav-drawer-item"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Corporate Events
                                    </NavLink>
                                    <NavLink
                                        to="/preferences"
                                        className="nav-drawer-item"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        My Profile
                                    </NavLink>
                                    <NavLink
                                        to="/admin/login"
                                        className="nav-drawer-item"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Staff Portal
                                    </NavLink>
                                </div>
                            </motion.nav>
                        </>
                    )}
                </AnimatePresence>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer - Only show on certain pages */}
            {!hideFooter && (
                <footer className="footer">
                    <div className="container">
                        <div className="footer-content">
                            <div className="footer-brand">
                                <span className="logo-text">Maxim's</span>
                                <p className="footer-tagline">
                                    Experience the finest Cantonese cuisine since 1988.
                                </p>
                            </div>
                            <div className="footer-links">
                                <NavLink to="/menu">Menu</NavLink>
                                <NavLink to="/reservations">Reservations</NavLink>
                                <NavLink to="/corporate-events">Events</NavLink>
                                <NavLink to="/staff">Staff</NavLink>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <p>&copy; 2026 Maxim's Palace. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            )}

            {/* System Status Indicator */}
            <StatusIndicator />

            {/* AI Chat Bot */}
            <ChatFloatingButton onClick={() => setChatOpen(true)} />
            <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
    )
}

export default Layout
