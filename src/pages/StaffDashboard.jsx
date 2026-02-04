import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, Users, Search, Filter,
    Phone, Mail, Check, X, Edit, Eye,
    AlertCircle, TrendingUp, CalendarCheck, UserCheck
} from 'lucide-react'
import './StaffDashboard.css'

function StaffDashboard() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Mock reservation data
    const [reservations, setReservations] = useState([
        {
            id: 1,
            name: 'Michael Chen',
            phone: '+852 9123 4567',
            email: 'michael@example.com',
            date: new Date().toISOString().split('T')[0],
            time: '7:00 PM',
            guests: 4,
            status: 'confirmed',
            table: 'A3',
            occasion: 'Birthday',
            specialRequests: 'Birthday cake arrangement',
            deposit: 800,
            createdAt: '2024-02-01 14:30'
        },
        {
            id: 2,
            name: 'Sarah Wong',
            phone: '+852 9234 5678',
            email: 'sarah@company.com',
            date: new Date().toISOString().split('T')[0],
            time: '7:30 PM',
            guests: 6,
            status: 'pending',
            table: 'B2',
            occasion: 'Business Dinner',
            specialRequests: 'Private room if available',
            deposit: 1200,
            createdAt: '2024-02-02 09:15'
        },
        {
            id: 3,
            name: 'David Lee',
            phone: '+852 9345 6789',
            email: '',
            date: new Date().toISOString().split('T')[0],
            time: '8:00 PM',
            guests: 2,
            status: 'confirmed',
            table: 'C5',
            occasion: 'Date Night',
            specialRequests: 'Window seat',
            deposit: 0,
            createdAt: '2024-02-02 11:45'
        },
        {
            id: 4,
            name: 'Emily Tan',
            phone: '+852 9456 7890',
            email: 'emily.tan@email.com',
            date: new Date().toISOString().split('T')[0],
            time: '6:30 PM',
            guests: 8,
            status: 'seated',
            table: 'Private Room 1',
            occasion: 'Anniversary',
            specialRequests: 'Vegetarian options needed',
            deposit: 1600,
            createdAt: '2024-02-01 16:20'
        },
        {
            id: 5,
            name: 'James Liu',
            phone: '+852 9567 8901',
            email: '',
            date: new Date().toISOString().split('T')[0],
            time: '8:30 PM',
            guests: 3,
            status: 'cancelled',
            table: '-',
            occasion: 'Regular Dining',
            specialRequests: '',
            deposit: 0,
            createdAt: '2024-02-02 10:00'
        }
    ])

    const stats = {
        total: reservations.filter(r => r.date === selectedDate).length,
        confirmed: reservations.filter(r => r.date === selectedDate && r.status === 'confirmed').length,
        pending: reservations.filter(r => r.date === selectedDate && r.status === 'pending').length,
        seated: reservations.filter(r => r.date === selectedDate && r.status === 'seated').length,
        totalGuests: reservations
            .filter(r => r.date === selectedDate && r.status !== 'cancelled')
            .reduce((sum, r) => sum + r.guests, 0)
    }

    const updateStatus = (id, newStatus) => {
        setReservations(prev =>
            prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
        )
    }

    const filteredReservations = reservations
        .filter(r => r.date === selectedDate)
        .filter(r => filterStatus === 'all' || r.status === filterStatus)
        .filter(r =>
            searchQuery === '' ||
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.phone.includes(searchQuery)
        )
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
                                    <h4>{res.name}</h4>
                                    <div className="res-contact">
                                        <span><Phone size={12} /> {res.phone}</span>
                                        {res.email && <span><Mail size={12} /> {res.email}</span>}
                                    </div>
                                </div>

                                <div className="res-details">
                                    <span className="res-guests">
                                        <Users size={14} /> {res.guests} guests
                                    </span>
                                    <span className="res-table">Table: {res.table}</span>
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
