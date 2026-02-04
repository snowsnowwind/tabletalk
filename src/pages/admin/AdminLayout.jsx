import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Utensils,
    CalendarRange,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    Menu as MenuIcon
} from 'lucide-react'
import { useState, useEffect } from 'react'
import apiService from '../../services/api'
import './AdminLayout.css'

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()
    const [user, setUser] = useState(null)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const currentUser = await apiService.getCurrentUser()
            if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'corporate')) {
                navigate('/admin/login')
            }
            setUser(currentUser)
        } catch (error) {
            navigate('/admin/login')
        }
    }

    const handleLogout = () => {
        apiService.logout()
        navigate('/admin/login')
    }

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { path: '/admin/menu', icon: Utensils, label: 'Menu Management' },
        { path: '/admin/reservations', icon: CalendarRange, label: 'Reservations' },
        { path: '/admin/staff', icon: Users, label: 'Staff' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ]

    if (!user) return null // Or a loading spinner

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <motion.aside
                className={`admin-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 80 }}
            >
                <div className="sidebar-header">
                    <div className="admin-brand">
                        <div className="brand-logo">MP</div>
                        {sidebarOpen && <span className="brand-name">Admin Portal</span>}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                            title={!sidebarOpen ? item.label : ''}
                        >
                            <item.icon size={20} />
                            {sidebarOpen && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user.name.charAt(0)}
                        </div>
                        {sidebarOpen && (
                            <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-role">{user.role}</span>
                            </div>
                        )}
                    </div>
                    <button onClick={handleLogout} className="logout-btn" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <button
                        className="toggle-sidebar-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <ChevronLeft size={20} /> : <MenuIcon size={20} />}
                    </button>
                    <h1>{navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}</h1>
                </header>

                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
