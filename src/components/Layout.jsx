import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, UtensilsCrossed, Calendar, PartyPopper, Menu, X, Phone, MapPin } from 'lucide-react'
import { useState } from 'react'
import './Layout.css'

function Layout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/menu', icon: UtensilsCrossed, label: 'Menu' },
        { path: '/reservations', icon: Calendar, label: 'Reservations' },
        { path: '/private-events', icon: PartyPopper, label: 'Private Events' },
    ]

    return (
        <div className="layout">
            {/* Header Navigation */}
            <header className="header">
                <div className="header-container">
                    {/* Logo */}
                    <NavLink to="/" className="logo">
                        <div className="logo-icon">
                            <span>MP</span>
                        </div>
                        <div className="logo-text-group">
                            <span className="logo-text">Maxim Palace</span>
                            <span className="logo-tagline">Fine Dining Since 1988</span>
                        </div>
                    </NavLink>

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                                }
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* CTA Button */}
                    <div className="header-actions">
                        <a href="tel:+85212345678" className="header-phone">
                            <Phone size={16} />
                            <span>+852 1234 5678</span>
                        </a>
                        <NavLink to="/reservations" className="btn btn-primary">
                            Book a Table
                        </NavLink>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.nav
                            className="nav-mobile"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-link-mobile ${isActive ? 'nav-link-active' : ''}`
                                    }
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                            <NavLink
                                to="/reservations"
                                className="btn btn-primary mobile-book-btn"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Book a Table
                            </NavLink>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-section">
                            <h4>Maxim Palace</h4>
                            <p className="footer-about">
                                Experience the finest Cantonese cuisine in an elegant setting.
                                Serving Hong Kong since 1988.
                            </p>
                        </div>
                        <div className="footer-section">
                            <h4>Hours</h4>
                            <p>Monday - Friday: 11:30 AM - 10:30 PM</p>
                            <p>Saturday - Sunday: 10:30 AM - 11:00 PM</p>
                            <p>Dim Sum: 10:30 AM - 3:00 PM (Weekends)</p>
                        </div>
                        <div className="footer-section">
                            <h4>Location</h4>
                            <p className="footer-address">
                                <MapPin size={16} />
                                123 Canton Road, Tsim Sha Tsui, Hong Kong
                            </p>
                            <p className="footer-phone">
                                <Phone size={16} />
                                +852 1234 5678
                            </p>
                        </div>
                        <div className="footer-section">
                            <h4>Quick Links</h4>
                            <nav className="footer-nav">
                                <NavLink to="/menu">Our Menu</NavLink>
                                <NavLink to="/reservations">Make a Reservation</NavLink>
                                <NavLink to="/private-events">Private Events</NavLink>
                                <NavLink to="/staff">Staff Portal</NavLink>
                            </nav>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 Maxim Palace. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Layout
