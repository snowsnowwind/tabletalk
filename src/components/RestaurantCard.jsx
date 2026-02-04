import { motion } from 'framer-motion'
import { Star, MapPin, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './RestaurantCard.css'

function RestaurantCard({ restaurant, index = 0 }) {
    const navigate = useNavigate()

    const renderPriceLevel = (level) => {
        return Array(5).fill(null).map((_, i) => (
            <DollarSign
                key={i}
                size={14}
                className={i < level ? 'price-active' : 'price-inactive'}
            />
        ))
    }

    const renderRating = (rating) => {
        const fullStars = Math.floor(rating)
        const hasHalf = rating % 1 >= 0.5

        return (
            <div className="card-rating">
                <Star size={16} className="star-icon" fill="currentColor" />
                <span className="rating-value">{rating.toFixed(1)}</span>
            </div>
        )
    }

    return (
        <motion.div
            className="restaurant-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
        >
            {/* Image Section */}
            <div className="card-image-wrapper">
                <img
                    src={restaurant.image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800`}
                    alt={restaurant.name}
                    className="card-image"
                />
                <div className="card-image-overlay">
                    <span className="badge badge-accent">{restaurant.cuisine}</span>
                </div>
                {restaurant.score && (
                    <div className="ai-score">
                        <span className="ai-score-label">AI Score</span>
                        <span className="ai-score-value">{restaurant.score.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="card-content">
                <div className="card-header">
                    <h3 className="card-title">{restaurant.name}</h3>
                    {renderRating(restaurant.rating)}
                </div>

                <div className="card-meta">
                    <div className="price-level">
                        {renderPriceLevel(restaurant.price_level)}
                    </div>
                    {restaurant.address && (
                        <div className="card-location">
                            <MapPin size={14} />
                            <span>{restaurant.address}</span>
                        </div>
                    )}
                </div>

                {restaurant.reason && (
                    <p className="card-reason">
                        <span className="reason-icon">✨</span>
                        {restaurant.reason}
                    </p>
                )}

                <div className="card-actions">
                    <button className="btn btn-secondary btn-sm">View Details</button>
                    <button className="btn btn-primary btn-sm">Reserve</button>
                </div>
            </div>
        </motion.div>
    )
}

export default RestaurantCard
