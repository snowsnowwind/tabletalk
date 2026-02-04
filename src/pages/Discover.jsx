import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X, RotateCcw, Sparkles, Star, MapPin, DollarSign } from 'lucide-react'
import apiService from '../services/api'
import './Discover.css'

function Discover() {
    const [restaurants, setRestaurants] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [liked, setLiked] = useState([])
    const [direction, setDirection] = useState(null)

    useEffect(() => {
        loadRestaurants()
    }, [])

    const loadRestaurants = async () => {
        setLoading(true)
        try {
            const data = await apiService.getRecommendations(1, 'discover', 10)
            setRestaurants(data.results || [])
            setCurrentIndex(0)
        } catch (err) {
            console.error('Failed to load restaurants:', err)
        } finally {
            setLoading(false)
        }
    }

    const currentRestaurant = restaurants[currentIndex]

    const handleSwipe = (swipeDirection) => {
        if (!currentRestaurant) return

        setDirection(swipeDirection)

        if (swipeDirection === 'right') {
            setLiked(prev => [...prev, currentRestaurant])
        }

        setTimeout(() => {
            setCurrentIndex(prev => prev + 1)
            setDirection(null)
        }, 300)
    }

    const handleUndo = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
            // Remove from liked if it was liked
            setLiked(prev => prev.filter(r => r.id !== restaurants[currentIndex - 1]?.id))
        }
    }

    const renderPriceLevel = (level) => {
        return Array(5).fill(null).map((_, i) => (
            <DollarSign
                key={i}
                size={16}
                className={i < level ? 'price-active' : 'price-inactive'}
            />
        ))
    }

    const cardVariants = {
        enter: {
            scale: 0.95,
            opacity: 0,
            y: 50
        },
        center: {
            scale: 1,
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        },
        exitLeft: {
            x: -300,
            opacity: 0,
            rotate: -20,
            transition: { duration: 0.3 }
        },
        exitRight: {
            x: 300,
            opacity: 0,
            rotate: 20,
            transition: { duration: 0.3 }
        }
    }

    if (loading) {
        return (
            <div className="discover-page page">
                <div className="container">
                    <div className="discover-loading">
                        <div className="skeleton-swipe-card glass-card">
                            <div className="skeleton skeleton-image-large"></div>
                            <div className="skeleton-content">
                                <div className="skeleton skeleton-title"></div>
                                <div className="skeleton skeleton-text"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const isFinished = currentIndex >= restaurants.length

    return (
        <div className="discover-page page">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="discover-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="heading-display heading-3">
                        <Sparkles className="header-icon" />
                        Discover
                    </h1>
                    <p className="discover-subtitle">Swipe right to like, left to skip</p>
                    <div className="liked-count">
                        <Heart size={18} fill="currentColor" />
                        <span>{liked.length} liked</span>
                    </div>
                </motion.div>

                {/* Swipe Area */}
                <div className="swipe-container">
                    {isFinished ? (
                        <motion.div
                            className="finished-state glass-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Sparkles size={64} className="finished-icon" />
                            <h2>You've seen them all!</h2>
                            <p>You liked {liked.length} restaurant{liked.length !== 1 ? 's' : ''}</p>
                            <button className="btn btn-primary btn-lg" onClick={loadRestaurants}>
                                <RotateCcw size={20} />
                                Start Over
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            {/* Background Cards Stack */}
                            <div className="cards-stack">
                                {restaurants.slice(currentIndex + 1, currentIndex + 3).map((r, i) => (
                                    <div
                                        key={r.id}
                                        className="stack-card glass-card"
                                        style={{
                                            transform: `scale(${0.95 - i * 0.05}) translateY(${(i + 1) * 15}px)`,
                                            zIndex: 10 - i
                                        }}
                                    >
                                        <img src={r.image} alt="" className="stack-card-image" />
                                    </div>
                                ))}
                            </div>

                            {/* Active Card */}
                            <AnimatePresence mode="wait">
                                {currentRestaurant && (
                                    <motion.div
                                        key={currentRestaurant.id}
                                        className="swipe-card glass-card"
                                        variants={cardVariants}
                                        initial="enter"
                                        animate="center"
                                        exit={direction === 'left' ? 'exitLeft' : 'exitRight'}
                                    >
                                        {/* Card Image */}
                                        <div className="swipe-card-image-wrapper">
                                            <img
                                                src={currentRestaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
                                                alt={currentRestaurant.name}
                                                className="swipe-card-image"
                                            />
                                            <div className="swipe-card-overlay">
                                                <span className="badge badge-accent">{currentRestaurant.cuisine}</span>
                                            </div>

                                            {/* Swipe Indicators */}
                                            <AnimatePresence>
                                                {direction === 'right' && (
                                                    <motion.div
                                                        className="swipe-indicator like"
                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    >
                                                        <Heart size={48} fill="currentColor" />
                                                    </motion.div>
                                                )}
                                                {direction === 'left' && (
                                                    <motion.div
                                                        className="swipe-indicator nope"
                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    >
                                                        <X size={48} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Card Content */}
                                        <div className="swipe-card-content">
                                            <div className="swipe-card-header">
                                                <h2 className="swipe-card-title">{currentRestaurant.name}</h2>
                                                <div className="swipe-card-rating">
                                                    <Star size={18} fill="#fbbf24" color="#fbbf24" />
                                                    <span>{currentRestaurant.rating.toFixed(1)}</span>
                                                </div>
                                            </div>

                                            <div className="swipe-card-meta">
                                                <div className="swipe-card-price">
                                                    {renderPriceLevel(currentRestaurant.price_level)}
                                                </div>
                                                {currentRestaurant.address && (
                                                    <div className="swipe-card-location">
                                                        <MapPin size={14} />
                                                        <span>{currentRestaurant.address}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {currentRestaurant.reason && (
                                                <div className="swipe-card-reason">
                                                    <Sparkles size={16} />
                                                    <span>{currentRestaurant.reason}</span>
                                                </div>
                                            )}

                                            {currentRestaurant.score && (
                                                <div className="swipe-card-score">
                                                    <span className="score-label">AI Match</span>
                                                    <span className="score-value">{currentRestaurant.score.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                {!isFinished && (
                    <motion.div
                        className="swipe-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <button
                            className="action-btn undo-btn"
                            onClick={handleUndo}
                            disabled={currentIndex === 0}
                        >
                            <RotateCcw size={24} />
                        </button>
                        <button
                            className="action-btn nope-btn"
                            onClick={() => handleSwipe('left')}
                        >
                            <X size={32} />
                        </button>
                        <button
                            className="action-btn like-btn"
                            onClick={() => handleSwipe('right')}
                        >
                            <Heart size={32} />
                        </button>
                    </motion.div>
                )}

                {/* Liked Restaurants Preview */}
                {liked.length > 0 && (
                    <motion.div
                        className="liked-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3>Your Likes</h3>
                        <div className="liked-avatars">
                            {liked.slice(-5).map((r) => (
                                <div key={r.id} className="liked-avatar">
                                    <img src={r.image} alt={r.name} />
                                </div>
                            ))}
                            {liked.length > 5 && (
                                <div className="liked-more">+{liked.length - 5}</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Discover
