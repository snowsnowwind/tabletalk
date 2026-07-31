import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Star, MapPin, Clock, Phone, Users, Calendar,
    ChevronLeft, Heart, Share2, Utensils
} from 'lucide-react'
import './RestaurantDetail.css'

function RestaurantDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('description')
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [guests, setGuests] = useState(2)
    const [isFavorite, setIsFavorite] = useState(false)

    // Sample restaurant data
    const restaurant = {
        id: 1,
        name: "Maxim's Palace",
        cuisine: 'Cantonese Fine Dining',
        rating: 4.8,
        reviews: 256,
        priceLevel: '$$$',
        address: '123 Canton Road, Tsim Sha Tsui, Hong Kong',
        phone: '+852 1234 5678',
        hours: '11:30 AM - 10:30 PM',
        description: `Experience the finest Cantonese cuisine at Maxim's Palace. Our master chefs bring generations of culinary wisdom to every dish, from delicate dim sum to grand banquet fare. Established in 1988, we have been serving Hong Kong's most discerning diners with authentic flavors and impeccable service.`,
        features: ['Private Rooms', 'Wine Cellar', 'Valet Parking', 'Wheelchair Accessible', 'Live Music (Fri-Sat)'],
        tags: ['Dim Sum', 'Seafood', 'Private Rooms', 'Michelin Recommended'],
        images: [
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
            'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
            'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
            'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400'
        ],
        timeSlots: ['11:30 AM', '12:00 PM', '12:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM']
    }

    const tabs = [
        { id: 'description', label: 'Description' },
        { id: 'features', label: 'Features' },
        { id: 'reviews', label: 'Reviews' }
    ]

    const handleReservation = () => {
        if (selectedDate && selectedTime) {
            navigate('/reservations', {
                state: {
                    restaurant,
                    date: selectedDate,
                    time: selectedTime,
                    guests
                }
            })
        }
    }

    return (
        <div className="restaurant-detail-page">
            {/* Back Button */}
            <button className="back-button" onClick={() => navigate(-1)}>
                <ChevronLeft size={24} />
            </button>

            <div className="detail-container">
                {/* Left Column - Images & Info */}
                <div className="detail-left">
                    {/* Image Gallery */}
                    <div className="image-gallery">
                        <div className="gallery-main">
                            <img src={restaurant.images[0]} alt={restaurant.name} />
                            <div className="gallery-actions">
                                <button
                                    className={`action-btn ${isFavorite ? 'active' : ''}`}
                                    onClick={() => setIsFavorite(!isFavorite)}
                                >
                                    <Heart size={20} fill={isFavorite ? '#f5a623' : 'none'} />
                                </button>
                                <button className="action-btn">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="gallery-grid">
                            {restaurant.images.slice(1).map((img, i) => (
                                <div key={i} className="gallery-item">
                                    <img src={img} alt={`${restaurant.name} ${i + 2}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Restaurant Header */}
                    <div className="restaurant-header">
                        <h1 className="restaurant-name">{restaurant.name}</h1>
                        <p className="restaurant-cuisine">{restaurant.cuisine}</p>

                        <div className="restaurant-meta">
                            <span className="rating-badge">
                                <Star size={14} fill="#f5a623" color="#f5a623" />
                                {restaurant.rating} ({restaurant.reviews})
                            </span>
                            <span className="price-level">{restaurant.priceLevel}</span>
                        </div>

                        <div className="restaurant-tags">
                            {restaurant.tags.map((tag, i) => (
                                <span key={i} className="tag tag-primary">{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="detail-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'description' && (
                            <div className="description-content">
                                <p>{restaurant.description}</p>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <MapPin size={18} />
                                        <span>{restaurant.address}</span>
                                    </div>
                                    <div className="info-item">
                                        <Phone size={18} />
                                        <span>{restaurant.phone}</span>
                                    </div>
                                    <div className="info-item">
                                        <Clock size={18} />
                                        <span>{restaurant.hours}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'features' && (
                            <div className="features-content">
                                <ul className="features-list">
                                    {restaurant.features.map((feature, i) => (
                                        <li key={i}>
                                            <Utensils size={16} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="reviews-content">
                                <p className="text-secondary">Reviews coming soon...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Booking Form */}
                <div className="detail-right">
                    <motion.div
                        className="booking-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="booking-title">Make a Reservation</h3>

                        <div className="booking-form">
                            <div className="form-group">
                                <label className="form-label">
                                    <Calendar size={16} />
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    className="input"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Clock size={16} />
                                    Select Time
                                </label>
                                <div className="time-slots-grid">
                                    {restaurant.timeSlots.map((time, i) => (
                                        <button
                                            key={i}
                                            className={`time-slot-btn ${selectedTime === time ? 'active' : ''}`}
                                            onClick={() => setSelectedTime(time)}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Users size={16} />
                                    Number of Guests
                                </label>
                                <div className="guest-selector">
                                    <button
                                        className="guest-btn"
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                    >
                                        -
                                    </button>
                                    <span className="guest-count">{guests}</span>
                                    <button
                                        className="guest-btn"
                                        onClick={() => setGuests(Math.min(12, guests + 1))}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary booking-btn"
                                onClick={handleReservation}
                                disabled={!selectedDate || !selectedTime}
                            >
                                Confirm Reservation
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default RestaurantDetail
