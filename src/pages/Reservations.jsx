import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, AlertCircle, ChevronDown, MapPin } from 'lucide-react'
import apiService from '../services/api'
import { buildManualReservationPayload } from '../utils/booking'
import './Reservations.css'

const fallbackImages = [
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
    'https://images.unsplash.com/photo-1576577445504-6af96477db52?w=400',
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
]

function Reservations() {
    const location = useLocation()
    const navigate = useNavigate()
    const prefilledData = location.state || {}

    const [restaurants, setRestaurants] = useState([])
    const [selectedRestaurantId, setSelectedRestaurantId] = useState(
        Number(prefilledData.restaurantId) || null,
    )
    const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true)

    const [formData, setFormData] = useState({
        name: prefilledData.name || '',
        phone: prefilledData.phone || '',
        email: prefilledData.email || '',
        guests: prefilledData.guests || '',
        date: prefilledData.date || '',
        time: prefilledData.time || '',
        specialRequests: prefilledData.specialRequests || '',
        dietaryRestrictions: prefilledData.dietaryRestrictions || ''
    })
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [confirmationCode, setConfirmationCode] = useState('')
    const [activeTab, setActiveTab] = useState('description')

    useEffect(() => {
        let active = true

        Promise.all([
            apiService.getRestaurants(),
            apiService.getCurrentUser().catch(() => null),
        ])
            .then(([availableRestaurants, currentUser]) => {
                if (!active) return
                setRestaurants(availableRestaurants)
                setSelectedRestaurantId((currentId) => (
                    availableRestaurants.some(({ id }) => id === currentId)
                        ? currentId
                        : availableRestaurants[0]?.id || null
                ))

                if (currentUser) {
                    const dietary = currentUser.preferences?.dietary || {}
                    const savedDietary = [
                        ...(dietary.dietary_restrictions || []),
                        ...(dietary.allergies || []).map((item) => `${item} Allergy`),
                        dietary.notes,
                    ].filter(Boolean).join(', ')

                    setFormData((current) => ({
                        ...current,
                        name: current.name || currentUser.name,
                        phone: current.phone || currentUser.phone || '',
                        email: current.email || currentUser.email,
                        dietaryRestrictions: current.dietaryRestrictions || savedDietary,
                    }))
                }
            })
            .catch(() => {
                if (active) {
                    setError('Restaurants could not be loaded. Please try again later.')
                }
            })
            .finally(() => {
                if (active) setIsLoadingRestaurants(false)
            })

        return () => {
            active = false
        }
    }, [])

    const restaurant = restaurants.find(({ id }) => id === selectedRestaurantId)
    const displayImages = restaurant
        ? fallbackImages.map((fallback, index) => restaurant.images?.[index] || fallback)
        : fallbackImages

    const updateFormData = (field, value) => {
        setFormData({ ...formData, [field]: value })
    }


    const handleSubmitReservation = async (e) => {
        e.preventDefault()

        if (!formData.name || !formData.phone || !formData.guests || !formData.date || !formData.time) {
            setError('Please fill in all required fields')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            const reservationData = buildManualReservationPayload(
                formData,
                selectedRestaurantId,
            )

            console.log('Submitting reservation:', reservationData)

            const response = await apiService.createReservation(reservationData)
            console.log('Reservation created:', response)

            setConfirmationCode(response.confirmation_code)
            setIsSubmitted(true)
        } catch (err) {
            console.error('Failed to create reservation:', err)
            let errorMessage = 'Failed to create reservation. Please try again.'
            if (typeof err === 'string') {
                errorMessage = err
            } else if (err && err.message) {
                errorMessage = err.message
            } else if (err && err.detail) {
                errorMessage = err.detail
            }
            setError(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoadingRestaurants) {
        return <div className="reservations-page"><p>Loading restaurants...</p></div>
    }

    if (!restaurant) {
        return (
            <div className="reservations-page">
                <p>{error || 'No active restaurants are currently available.'}</p>
            </div>
        )
    }

    // Submission acknowledgement screen
    if (isSubmitted) {
        return (
            <div className="reservations-page">
                <div className="reservations-container">
                    <motion.div
                        className="confirmation-modal"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="confirmation-icon">
                            <Check size={48} strokeWidth={3} />
                        </div>
                        <h2>Reservation Request Submitted</h2>
                        <p className="confirmation-subtitle">
                            Thank you for booking with {restaurant.name}.<br />
                            Your request is pending staff confirmation.
                        </p>

                        <div className="confirmation-ticket">
                            <div className="ticket-notch-left"></div>
                            <div className="ticket-notch-right"></div>
                            <div className="ticket-line"></div>

                            <div className="ticket-details">
                                <div className="ticket-row">
                                    <span className="ticket-label">Name</span>
                                    <span className="ticket-value">{formData.name}</span>
                                </div>
                                <div className="ticket-row">
                                    <span className="ticket-label">Date</span>
                                    <span className="ticket-value">{formData.date}</span>
                                </div>
                                <div className="ticket-row">
                                    <span className="ticket-label">Time</span>
                                    <span className="ticket-value">{formData.time}</span>
                                </div>
                                <div className="ticket-row">
                                    <span className="ticket-label">No. of Guests</span>
                                    <span className="ticket-value">{formData.guests}</span>
                                </div>
                            </div>
                        </div>

                        {confirmationCode && (
                            <p className="confirmation-code">
                                Code: <strong>{confirmationCode}</strong>
                            </p>
                        )}

                        <button
                            className="btn btn-primary btn-full"
                            onClick={() => navigate('/')}
                        >
                            Make Another Reservation
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="reservations-page">
            <div className="reservations-layout">
                {/* Left Side - Restaurant Info */}
                <div className="restaurant-info-section">
                    {/* Restaurant Selector */}
                    <div className="restaurant-selector">
                        {restaurants.map(r => (
                            <button
                                key={r.id}
                                className={`restaurant-tab ${selectedRestaurantId === r.id ? 'active' : ''}`}
                                onClick={() => setSelectedRestaurantId(r.id)}
                            >
                                {r.name}
                            </button>
                        ))}
                    </div>

                    {/* Image Gallery */}
                    <div className="image-gallery">
                        <div className="gallery-main">
                            <img src={displayImages[0]} alt={restaurant.name} />
                        </div>
                        <div className="gallery-wide">
                            <img src={displayImages[1]} alt={`${restaurant.name} 2`} />
                        </div>
                        <div className="gallery-row">
                            <div className="gallery-small">
                                <img src={displayImages[2]} alt={`${restaurant.name} 3`} />
                            </div>
                            <div className="gallery-small">
                                <img src={displayImages[3]} alt={`${restaurant.name} 4`} />
                            </div>
                        </div>
                    </div>


                    {/* Restaurant Details */}
                    <div className="restaurant-details">
                        <h1 className="restaurant-name">{restaurant.name}</h1>
                        <p className="restaurant-cuisine">
                            {restaurant.cuisine} • {'$'.repeat(restaurant.price_level || 1)}
                        </p>

                        <div className="restaurant-tags">
                            {(restaurant.features || []).slice(0, 3).map((tag, index) => (
                                <span key={index} className="tag">{tag}</span>
                            ))}
                        </div>

                        {/* Tabs */}
                        <div className="info-tabs">
                            <button
                                className={`info-tab ${activeTab === 'description' ? 'active' : ''}`}
                                onClick={() => setActiveTab('description')}
                            >
                                Description
                            </button>
                            <button
                                className={`info-tab ${activeTab === 'feature' ? 'active' : ''}`}
                                onClick={() => setActiveTab('feature')}
                            >
                                Feature
                            </button>
                            <button
                                className={`info-tab ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                Reviews
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {activeTab === 'description' && (
                                <div className="description-content">
                                    <h3>Our Restaurant</h3>
                                    <div className="description-layout">
                                        <p>{restaurant.description}</p>
                                        <div className="restaurant-map">
                                            <div className="map-placeholder">
                                                <MapPin size={24} />
                                                <span>{restaurant.address || 'Address available from restaurant staff'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'feature' && (
                                <div className="feature-content">
                                    <ul>
                                        {restaurant.features.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {activeTab === 'reviews' && (
                                <div className="reviews-content">
                                    <p>★★★★★ "Best dim sum in the city!" - John D.</p>
                                    <p>★★★★★ "Amazing tea service experience" - Sarah L.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Booking Form */}
                <div className="booking-form-section">
                    <div className="booking-form-card">
                        <h2 className="booking-title">Book a Table</h2>

                        {error && (
                            <div className="error-message">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmitReservation}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => updateFormData('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={(e) => updateFormData('phone', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => updateFormData('email', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Number of Guests</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    min="1"
                                    max="20"
                                    value={formData.guests}
                                    onChange={(e) => updateFormData('guests', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <div className="select-wrapper">
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.date}
                                            onChange={(e) => updateFormData('date', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <div className="select-wrapper">
                                        <select
                                            className="form-input form-select"
                                            value={formData.time}
                                            onChange={(e) => updateFormData('time', e.target.value)}
                                            required
                                        >
                                            <option value="">Select time</option>
                                            <option value="11:30">11:30 AM</option>
                                            <option value="12:00">12:00 PM</option>
                                            <option value="12:30">12:30 PM</option>
                                            <option value="13:00">1:00 PM</option>
                                            <option value="18:00">6:00 PM</option>
                                            <option value="18:30">6:30 PM</option>
                                            <option value="19:00">7:00 PM</option>
                                            <option value="19:30">7:30 PM</option>
                                            <option value="20:00">8:00 PM</option>
                                        </select>
                                        <ChevronDown size={16} className="select-icon" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Special Requests</label>
                                <textarea
                                    className="form-input form-textarea"
                                    rows={3}
                                    value={formData.specialRequests}
                                    onChange={(e) => updateFormData('specialRequests', e.target.value)}
                                    placeholder="Any special requests..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Dietary Restrictions</label>
                                <textarea
                                    className="form-input form-textarea"
                                    rows={3}
                                    value={formData.dietaryRestrictions}
                                    onChange={(e) => updateFormData('dietaryRestrictions', e.target.value)}
                                    placeholder="Allergies, dietary requirements..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-confirm"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Submit Reservation Request'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reservations
