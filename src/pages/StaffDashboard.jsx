import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, Users, Search, Filter,
    Phone, Mail, Check, X, Edit, Eye,
    AlertCircle, TrendingUp, CalendarCheck, UserCheck
} from 'lucide-react'
import apiService from '../services/api'
import './StaffDashboard.css'

function StaffDashboard() {
    // Default to empty date to show ALL reservations initially
    const [selectedDate, setSelectedDate] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)

    // ... (rest of filtering logic needs update too)

    // Fetch reservations
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true)
                // Fetch all reservations for filtering locally, or pass parameters
                // Using getAllReservations to get everything for now to handle simple filtering
                const data = await apiService.getAllReservations()
                setReservations(data)
            } catch (error) {
                console.error("Failed to fetch reservations:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchReservations()
    }, []) // Refresh on mount. Could add polling interval.

    const stats = {
        total: reservations.filter(r => r.date.startsWith(selectedDate)).length,
        confirmed: reservations.filter(r => r.date.startsWith(selectedDate) && r.status === 'confirmed').length,
        pending: reservations.filter(r => r.date.startsWith(selectedDate) && r.status === 'pending').length,
        seated: reservations.filter(r => r.date.startsWith(selectedDate) && r.status === 'seated').length,
        totalGuests: reservations
            .filter(r => r.date.startsWith(selectedDate) && r.status !== 'cancelled')
            .reduce((sum, r) => sum + r.guests, 0)
    }

    const updateStatus = async (id, newStatus) => {
        try {
            await apiService.updateReservationStatus(id, newStatus)
            // Optimistic update
            setReservations(prev =>
                prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
            )
        } catch (error) {
            console.error("Failed to update status:", error)
            alert("Failed to update status")
        }
    }

    const filteredReservations = reservations
        .filter(r => {
            if (!selectedDate) return true
            // API returns ISO strings, compare YYYY-MM-DD
            const resDate = r.date.split('T')[0]
            return resDate === selectedDate
        })
        .filter(r => filterStatus === 'all' || r.status === filterStatus)
        .filter(r => {
            const name = r.name || r.guest_name || ''
            const phone = r.phone || r.guest_phone || ''
            return searchQuery === '' ||
                name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                phone.includes(searchQuery)
        })
        .sort((a, b) => a.time.localeCompare(b.time))

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'status-confirmed'
            case 'pending': return 'status-pending'
            case 'seated': return 'status-seated'
            case 'cancelled': return 'status-cancelled'
            case 'completed': return 'status-completed'
            default: return ''
        }
    }

    return (
        <div className="staff-dashboard page">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="dashboard-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="heading-display heading-3">Staff Dashboard</h1>
                        <p className="dashboard-subtitle">Manage reservations and guest arrivals</p>
                    </div>
                    <div className="date-selector">
                        <Calendar size={18} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="date-input"
                        />
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    className="stats-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-card glass-card">
                        <CalendarCheck size={24} />
                        <div className="stat-info">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total Bookings</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <Check size={24} />
                        <div className="stat-info">
                            <span className="stat-value">{stats.confirmed}</span>
                            <span className="stat-label">Confirmed</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <AlertCircle size={24} />
                        <div className="stat-info">
                            <span className="stat-value">{stats.pending}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <UserCheck size={24} />
                        <div className="stat-info">
                            <span className="stat-value">{stats.seated}</span>
                            <span className="stat-label">Seated</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <Users size={24} />
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalGuests}</span>
                            <span className="stat-label">Total Guests</span>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    className="filters-bar glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-buttons">
                        <Filter size={18} />
                        {['all', 'pending', 'confirmed', 'seated', 'cancelled'].map(status => (
                            <button
                                key={status}
                                className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                                onClick={() => setFilterStatus(status)}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Reservations List */}
                <motion.div
                    className="reservations-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {filteredReservations.length === 0 ? (
                        <div className="no-reservations glass-card">
                            <Calendar size={48} />
                            <p>No reservations found for this date/filter</p>
                        </div>
                    ) : (
                        filteredReservations.map((res, index) => (
                            <motion.div
                                key={res.id}
                                className="reservation-row glass-card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="res-time">
                                    <Clock size={16} />
                                    <span>{res.time}</span>
                                </div>

                                <div className="res-guest-info">
                                    <h4>{res.name || res.guest_name || 'Guest'}</h4>
                                    <div className="res-contact">
                                        <span><Phone size={12} /> {res.phone || res.guest_phone}</span>
                                        {(res.email || res.guest_email) && <span><Mail size={12} /> {res.email || res.guest_email}</span>}
                                    </div>
                                </div>

                                <div className="res-details">
                                    <span className="res-guests">
                                        <Users size={14} /> {res.guests} guests
                                    </span>
                                    <span className="res-table">Table: {res.table || res.table_number || 'Unassigned'}</span>
                                    {res.occasion && <span className="res-occasion">{res.occasion}</span>}
                                </div>

                                <div className="res-special">
                                    {res.specialRequests && (
                                        <span className="special-request" title={res.specialRequests}>
                                            📝 {res.specialRequests.substring(0, 30)}...
                                        </span>
                                    )}
                                    {res.deposit > 0 && (
                                        <span className="deposit-info">💰 HK${res.deposit}</span>
                                    )}
                                </div>

                                <div className={`res-status ${getStatusColor(res.status)}`}>
                                    {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                                </div>

                                <div className="res-actions">
                                    {res.status === 'pending' && (
                                        <>
                                            <button
                                                className="action-btn confirm"
                                                onClick={() => updateStatus(res.id, 'confirmed')}
                                                title="Confirm"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                className="action-btn cancel"
                                                onClick={() => updateStatus(res.id, 'cancelled')}
                                                title="Cancel"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    )}
                                    {res.status === 'confirmed' && (
                                        <button
                                            className="action-btn seat"
                                            onClick={() => updateStatus(res.id, 'seated')}
                                            title="Mark as Seated"
                                        >
                                            <UserCheck size={16} />
                                        </button>
                                    )}
                                    {res.status === 'seated' && (
                                        <button
                                            className="action-btn complete"
                                            onClick={() => updateStatus(res.id, 'completed')}
                                            title="Complete"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button className="action-btn view" title="View Details">
                                        <Eye size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default StaffDashboard
