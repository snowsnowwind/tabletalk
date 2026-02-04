import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Star, MapPin, Phone, Clock, DollarSign,
    ArrowLeft, Heart, Share2, Calendar, Users,
    CheckCircle, Sparkles
} from 'lucide-react'
import apiService from '../services/api'
import './RestaurantDetail.css'

function RestaurantDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [restaurant, setRestaurant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [reservationData, setReservationData] = useState({
        date: '',
        time: '',
        guests: 2
    })

    useEffect(() => {
        loadRestaurant()
    }, [id])

    const loadRestaurant = async () => {
        setLoading(true)
        try {
            const data = await apiService.getRestaurantById(id)
            setRestaurant(data)
        } catch (err) {
            console.error('Failed to load restaurant:', err)
        } finally {
            setLoading(false)
        }
    }

    const renderPriceLevel = (level) => {
        return Array(5).fill(null).map((_, i) => (
            <DollarSign
                key={i}
                size={18}
                className={i < level ? 'price-active' : 'price-inactive'}
            />
        ))
    }

    const handleReservation = () => {
        alert(`Reservation request submitted for ${reservationData.guests} guests on ${reservationData.date} at ${reservationData.time}`)
    }

    if (loading) {
        return (
            <div className="detail-page page">
                <div className="container">
                    <div className="detail-loading">
                        <div className="skeleton skeleton-hero"></div>
                        <div className="skeleton-content">
                            <div className="skeleton skeleton-title"></div>
                            <div className="skeleton skeleton-text"></div>
                            <div className="skeleton skeleton-text short"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="detail-page page">
                <div className="container">
                    <div className="not-found glass-card">
                        <h2>Restaurant not found</h2>
                        <button className="btn btn-primary" onClick={() => navigate('/discover')}>
                            Back to Discovery
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="detail-page">
            {/* Hero Section */}
            <div className="detail-hero">
                <img
                    src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
                    alt={restaurant.name}
                    className="detail-hero-image"
                />
                <div className="detail-hero-overlay"></div>

                <div className="detail-hero-actions">
                    <button className="btn btn-icon glass-card" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="detail-hero-right">
                        <button className="btn btn-icon glass-card">
                            <Share2 size={20} />
                        </button>
                        <button className="btn btn-icon glass-card">
                            <Heart size={20} />
                        </button>
                    </div>
                </div>

                {restaurant.score && (
                    <motion.div
                        className="detail-ai-badge glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Sparkles size={16} />
                        <span>AI Score: {restaurant.score.toFixed(1)}</span>
                    </motion.div>
                )}
            </div>

            <div className="container">
                <div className="detail-content">
                    {/* Main Info */}
                    <motion.div
                        className="detail-main glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Header */}
                        <div className="detail-header">
                            <div className="detail-header-left">
                                <span className="badge badge-accent">{restaurant.cuisine}</span>
                                <h1 className="detail-title heading-display">{restaurant.name}</h1>
                                <div className="detail-meta">
                                    <div className="detail-rating">
                                        <Star size={20} fill="#fbbf24" color="#fbbf24" />
                                        <span className="rating-value">{restaurant.rating.toFixed(1)}</span>
                                        <span className="rating-count">(2.3k reviews)</span>
                                    </div>
                                    <div className="detail-price">
                                        {renderPriceLevel(restaurant.price_level)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="detail-quick-info">
                            {restaurant.address && (
                                <div className="quick-info-item">
                                    <MapPin size={18} />
                                    <span>{restaurant.address}</span>
                                </div>
                            )}
                            {restaurant.phone && (
                                <div className="quick-info-item">
                                    <Phone size={18} />
                                    <span>{restaurant.phone}</span>
                                </div>
                            )}
                            <div className="quick-info-item">
                                <Clock size={18} />
                                <span>Open now · Closes 10:00 PM</span>
                            </div>
                        </div>

                        {/* AI Reason */}
                        {restaurant.reason && (
                            <div className="detail-reason">
                                <Sparkles size={18} />
                                <div>
                                    <span className="reason-label">Why AI recommends this</span>
                                    <p>{restaurant.reason}</p>
                                </div>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="detail-tabs">
                            {['overview', 'menu', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {activeTab === 'overview' && (
                                <div className="overview-content">
                                    <h3>About</h3>
                                    <p>
                                        Experience the finest {restaurant.cuisine} cuisine in an elegant setting.
                                        Our chef-curated menu features traditional dishes with a modern twist,
                                        using only the freshest seasonal ingredients. Perfect for intimate dinners,
                                        business meetings, or special celebrations.
                                    </p>

                                    <h3>Highlights</h3>
                                    <div className="highlights-grid">
                                        <div className="highlight-item">
                                            <CheckCircle size={16} />
                                            <span>Private Dining Available</span>
                                        </div>
                                        <div className="highlight-item">
                                            <CheckCircle size={16} />
                                            <span>Outdoor Seating</span>
                                        </div>
                                        <div className="highlight-item">
                                            <CheckCircle size={16} />
                                            <span>Wheelchair Accessible</span>
                                        </div>
                                        <div className="highlight-item">
                                            <CheckCircle size={16} />
                                            <span>Vegan Options</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'menu' && (
                                <div className="menu-content">
                                    <p className="menu-note">
                                        Contact the restaurant directly for the full menu.
                                        Below are some popular dishes:
                                    </p>
                                    <div className="menu-items">
                                        <div className="menu-item">
                                            <div className="menu-item-info">
                                                <h4>Chef's Special Tasting Menu</h4>
                                                <p>7-course seasonal tasting experience</p>
                                            </div>
                                            <span className="menu-item-price">$128</span>
                                        </div>
                                        <div className="menu-item">
                                            <div className="menu-item-info">
                                                <h4>Signature Main Course</h4>
                                                <p>Premium selection with chef's sauce</p>
                                            </div>
                                            <span className="menu-item-price">$68</span>
                                        </div>
                                        <div className="menu-item">
                                            <div className="menu-item-info">
                                                <h4>Wine Pairing</h4>
                                                <p>Curated wine selection per course</p>
                                            </div>
                                            <span className="menu-item-price">$75</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="reviews-content">
                                    <div className="review-item">
                                        <div className="review-header">
                                            <div className="review-avatar">JD</div>
                                            <div>
                                                <span className="review-author">John D.</span>
                                                <div className="review-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} fill="#fbbf24" color="#fbbf24" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="review-text">
                                            Absolutely incredible experience! The food was exceptional and the
                                            service was impeccable. Will definitely be coming back.
                                        </p>
                                    </div>
                                    <div className="review-item">
                                        <div className="review-header">
                                            <div className="review-avatar">SM</div>
                                            <div>
                                                <span className="review-author">Sarah M.</span>
                                                <div className="review-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} fill={i < 4 ? "#fbbf24" : "#374151"} color={i < 4 ? "#fbbf24" : "#374151"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="review-text">
                                            Great ambiance and delicious food. The tasting menu is a must-try!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Reservation Sidebar */}
                    <motion.div
                        className="detail-sidebar"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="reservation-card glass-card">
                            <h3>Make a Reservation</h3>

                            <div className="reservation-form">
                                <div className="form-group">
                                    <label>
                                        <Calendar size={16} />
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={reservationData.date}
                                        onChange={(e) => setReservationData(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Clock size={16} />
                                        Time
                                    </label>
                                    <select
                                        className="input"
                                        value={reservationData.time}
                                        onChange={(e) => setReservationData(prev => ({ ...prev, time: e.target.value }))}
                                    >
                                        <option value="">Select time</option>
                                        <option value="18:00">6:00 PM</option>
                                        <option value="18:30">6:30 PM</option>
                                        <option value="19:00">7:00 PM</option>
                                        <option value="19:30">7:30 PM</option>
                                        <option value="20:00">8:00 PM</option>
                                        <option value="20:30">8:30 PM</option>
                                        <option value="21:00">9:00 PM</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Users size={16} />
                                        Guests
                                    </label>
                                    <select
                                        className="input"
                                        value={reservationData.guests}
                                        onChange={(e) => setReservationData(prev => ({ ...prev, guests: Number(e.target.value) }))}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                            <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    className="btn btn-primary btn-lg reserve-btn"
                                    onClick={handleReservation}
                                >
                                    Reserve Now
                                </button>
                            </div>

                            <p className="reservation-note">
                                Free cancellation up to 24 hours before
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default RestaurantDetail
