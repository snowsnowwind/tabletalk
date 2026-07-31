import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { X, Heart, MapPin, Star, Clock, UtensilsCrossed, Percent, ChevronRight } from 'lucide-react'
import apiService from '../services/api'
import './Discover.css'

function Discover() {
    const navigate = useNavigate()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [restaurants, setRestaurants] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState('')

    useEffect(() => {
        let cancelled = false

        apiService.getRestaurants()
            .then((data) => {
                if (cancelled) return
                const availableRestaurants = data
                    .filter((restaurant) => restaurant.is_active !== false)
                    .map((restaurant) => ({
                        id: restaurant.id,
                        name: restaurant.name,
                        cuisine: restaurant.cuisine,
                        image: restaurant.images?.[0] || '/images/menu/har-gow.jpg',
                        rating: restaurant.rating,
                        priceLevel: '$'.repeat(restaurant.price_level || 1),
                        distance: 'Hong Kong',
                        tags: restaurant.features?.length
                            ? restaurant.features.slice(0, 3)
                            : [restaurant.cuisine],
                        discount: 'Online reservations available',
                        timeSlots: ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'],
                        location: restaurant.address || 'Hong Kong',
                    }))
                setRestaurants(availableRestaurants)
                setCurrentIndex(0)
                setLoadError('')
            })
            .catch((error) => {
                if (cancelled) return
                console.error('Failed to load restaurants', error)
                setLoadError('Unable to load restaurants. Please try again.')
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    const currentRestaurant = restaurants[currentIndex]

    const handleSwipe = (dir) => {
        setDirection(dir)
        setTimeout(() => {
            if (dir === 1) {
                // Liked - navigate to reservation
                navigate('/reservations', { state: { restaurantId: currentRestaurant.id } })
            } else {
                // Disliked - next card
                setCurrentIndex((prev) => (prev + 1) % restaurants.length)
            }
            setDirection(0)
        }, 300)
    }

    const handleViewMenu = () => {
        navigate('/menu', { state: { restaurantId: currentRestaurant.id } })
    }

    if (isLoading) {
        return <div className="discover-state">Loading restaurants...</div>
    }

    if (loadError || !currentRestaurant) {
        return <div className="discover-state">{loadError || 'No restaurants are available.'}</div>
    }

    return (
        <div className="discover-page">
            <div className="discover-container">
                {/* Page Header */}
                <div className="discover-header">
                    <h1 className="discover-title">
                        Discover <span className="text-orange">Restaurants</span>
                    </h1>
                    <p className="discover-subtitle">Swipe right to book, left to skip</p>
                </div>

                <div className="discover-restaurant-selector" aria-label="Restaurant selector">
                    {restaurants.map((restaurant, index) => (
                        <button
                            key={restaurant.id}
                            type="button"
                            className={`discover-restaurant-option ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => {
                                setDirection(0)
                                setCurrentIndex(index)
                            }}
                        >
                            {restaurant.name}
                        </button>
                    ))}
                </div>

                {/* Card Stack */}
                <div className="card-stack">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentRestaurant.id}
                            className="restaurant-card"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                x: direction === -1 ? -300 : direction === 1 ? 300 : 0,
                                rotate: direction === -1 ? -15 : direction === 1 ? 15 : 0
                            }}
                            exit={{
                                x: direction === -1 ? -300 : 300,
                                opacity: 0,
                                rotate: direction === -1 ? -15 : 15
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Card Image */}
                            <div className="card-image-container">
                                <img
                                    src={currentRestaurant.image}
                                    alt={currentRestaurant.name}
                                    className="card-image"
                                />
                                <div className="card-image-overlay"></div>

                                {/* Menu Button */}
                                <button className="menu-button" onClick={handleViewMenu}>
                                    <UtensilsCrossed size={16} />
                                    Menu
                                </button>

                                {/* Rating Badge */}
                                <div className="rating-badge">
                                    <Star size={14} fill="#fff" />
                                    <span>{currentRestaurant.rating}</span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="card-content">
                                {/* Restaurant Info */}
                                <div className="restaurant-info">
                                    <h2 className="restaurant-name">{currentRestaurant.name}</h2>
                                    <p className="restaurant-cuisine">{currentRestaurant.cuisine}</p>

                                    {/* Tags */}
                                    <div className="restaurant-tags">
                                        {currentRestaurant.tags.map((tag, i) => (
                                            <span key={i} className="tag tag-primary">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Discount Banner */}
                                <div className="discount-banner">
                                    <Percent size={18} />
                                    <span>{currentRestaurant.discount}</span>
                                </div>

                                {/* Time Slots */}
                                <div className="time-slots-section">
                                    <h4 className="time-slots-title">Available Times</h4>
                                    <div className="time-slots">
                                        {currentRestaurant.timeSlots.map((time, i) => (
                                            <button
                                                key={i}
                                                className="time-slot"
                                                onClick={() => navigate('/reservations', { state: { restaurantId: currentRestaurant.id } })}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="location-section">
                                    <div className="location-info">
                                        <MapPin size={16} />
                                        <span>{currentRestaurant.location}</span>
                                        <span className="distance">({currentRestaurant.distance})</span>
                                    </div>
                                    <button className="view-map-btn">
                                        View Map <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Background Cards for Stack Effect */}
                    <div className="stack-card stack-card-1"></div>
                    <div className="stack-card stack-card-2"></div>
                </div>

                {/* Action Buttons */}
                <div className="swipe-actions">
                    <button
                        className="swipe-btn swipe-btn-reject"
                        onClick={() => handleSwipe(-1)}
                        aria-label="Skip"
                    >
                        <X size={28} />
                    </button>
                    <button
                        className="swipe-btn swipe-btn-like"
                        onClick={() => handleSwipe(1)}
                        aria-label="Like"
                    >
                        <Heart size={28} />
                    </button>
                </div>

                {/* Progress Dots */}
                <div className="progress-dots">
                    {restaurants.map((_, i) => (
                        <div
                            key={i}
                            className={`progress-dot ${i === currentIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Discover
