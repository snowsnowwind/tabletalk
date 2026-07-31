import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Calendar, Clock, Users, Check, X, Search,
    Filter, RefreshCw, User, Phone, Mail, MapPin
} from 'lucide-react'
import apiService from '../services/api'
import './StaffDashboard.css'

function StaffDashboard() {
    const navigate = useNavigate()
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [dateFilter, setDateFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [refreshing, setRefreshing] = useState(false)

    // Fetch reservations on mount
    useEffect(() => {
        fetchReservations()
    }, [dateFilter, statusFilter])

    const fetchReservations = async () => {
        setLoading(true)
        setError('')
        try {
            const params = {}
            if (dateFilter) params.date = dateFilter
            if (statusFilter) params.status = statusFilter

            const data = await apiService.getAllReservations(params)
            setReservations(data)
        } catch (err) {
            console.error('Failed to fetch reservations:', err)
            if (err.message.includes('401') || err.message.includes('403')) {
                setError('Please log in with an administrator account')
                setTimeout(() => navigate('/admin/login'), 2000)
            } else {
                setError(err.message || 'Failed to load reservations')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchReservations()
        setRefreshing(false)
    }

    const handleStatusUpdate = async (reservationId, newStatus) => {
        try {
            await apiService.updateReservationStatus(reservationId, newStatus)
            // Refresh the list
            fetchReservations()
        } catch (err) {
            console.error('Failed to update status:', err)
            alert('Failed to update status: ' + err.message)
        }
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Pending', class: 'status-pending' },
            confirmed: { label: 'Confirmed', class: 'status-confirmed' },
            cancelled: { label: 'Cancelled', class: 'status-cancelled' },
            completed: { label: 'Completed', class: 'status-completed' },
            no_show: { label: 'No Show', class: 'status-noshow' }
        }
        const s = statusMap[status] || { label: status, class: '' }
        return <span className={`status-badge ${s.class}`}>{s.label}</span>
    }

    const filteredReservations = reservations.filter(res => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase()
        return (
            (res.guest_name || '').toLowerCase().includes(searchLower) ||
            (res.guest_phone || '').includes(searchQuery) ||
            (res.confirmation_code || '').toLowerCase().includes(searchLower) ||
            (res.restaurant_name || '').toLowerCase().includes(searchLower)
        )
    })

    // Stats
    const todayCount = reservations.filter(r => {
        const today = new Date().toISOString().split('T')[0]
        return r.date === today
    }).length
    const pendingCount = reservations.filter(r => r.status === 'pending').length
    const confirmedCount = reservations.filter(r => r.status === 'confirmed').length

    return (
        <div className="staff-dashboard-page">
            <div className="staff-container">
                {/* Header */}
                <div className="staff-header">
                    <div className="staff-title-section">
                        <h1 className="staff-title">
                            Reservation <span className="text-orange">Management</span>
                        </h1>
                        <p className="staff-subtitle">Manage all restaurant reservations</p>
                    </div>

                    <div className="staff-actions">
                        {/* Refresh Button */}
                        <button
                            className="btn btn-outline refresh-btn"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon today">
                            <Calendar size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{todayCount}</span>
                            <span className="stat-label">Today's</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <Clock size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{pendingCount}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon confirmed">
                            <Check size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{confirmedCount}</span>
                            <span className="stat-label">Confirmed</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <Users size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{reservations.length}</span>
                            <span className="stat-label">Total</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search name, phone, code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <input
                            type="date"
                            className="filter-input"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading reservations...</p>
                    </div>
                ) : (
                    /* Reservations List */
                    <div className="reservations-list">
                        {filteredReservations.length === 0 ? (
                            <div className="empty-state">
                                <Calendar size={48} />
                                <h3>No reservations found</h3>
                                <p>{searchQuery ? 'No reservations match your search' : 'There are no reservation records yet'}</p>
                            </div>
                        ) : (
                            filteredReservations.map((res, index) => (
                                <motion.div
                                    key={res.id}
                                    className="reservation-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <div className="res-header">
                                        <div className="res-id">
                                            <span className="confirmation-code">#{res.confirmation_code}</span>
                                            {getStatusBadge(res.status)}
                                        </div>
                                        <div className="res-datetime">
                                            <Calendar size={14} />
                                            <span>{res.date}</span>
                                            <Clock size={14} />
                                            <span>{res.time}</span>
                                        </div>
                                    </div>

                                    <div className="res-body">
                                        <div className="res-guest-info">
                                            <div className="guest-detail">
                                                <User size={16} />
                                                <span>{res.guest_name || res.user_name || 'Unknown'}</span>
                                            </div>
                                            <div className="guest-detail">
                                                <Phone size={16} />
                                                <span>{res.guest_phone || 'None provided'}</span>
                                            </div>
                                            {(res.guest_email || res.user_email) && (
                                                <div className="guest-detail">
                                                    <Mail size={16} />
                                                    <span>{res.guest_email || res.user_email}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="res-details">
                                            <div className="detail-item">
                                                <Users size={16} />
                                                <span>{res.guests} Guests</span>
                                            </div>
                                            {res.restaurant_name && (
                                                <div className="detail-item">
                                                    <MapPin size={16} />
                                                    <span>{res.restaurant_name}</span>
                                                </div>
                                            )}
                                            {res.table_number && (
                                                <div className="detail-item table-num">
                                                    Table: {res.table_number}
                                                </div>
                                            )}
                                        </div>

                                        {res.special_requests && (
                                            <div className="res-notes">
                                                <strong>Notes:</strong> {res.special_requests}
                                            </div>
                                        )}
                                    </div>

                                    {res.status === 'pending' && (
                                        <div className="res-actions">
                                            <button
                                                className="btn btn-confirm"
                                                onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                                            >
                                                <Check size={16} />
                                                Confirm
                                            </button>
                                            <button
                                                className="btn btn-cancel"
                                                onClick={() => handleStatusUpdate(res.id, 'cancelled')}
                                            >
                                                <X size={16} />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default StaffDashboard
