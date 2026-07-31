import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Filter, RefreshCw, User, MapPin, DollarSign } from 'lucide-react'
import apiService from '../services/api'
import RestaurantCard from '../components/RestaurantCard'
import './Recommendations.css'

function Recommendations() {
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [scenario, setScenario] = useState('dinner')
    const [topN, setTopN] = useState(6)

    const scenarios = [
        { value: 'dinner', label: 'Dinner Date', emoji: '🍷' },
        { value: 'business', label: 'Business Meeting', emoji: '💼' },
        { value: 'family', label: 'Family Gathering', emoji: '👨‍👩‍👧‍👦' },
        { value: 'casual', label: 'Casual Dining', emoji: '🍔' },
        { value: 'celebration', label: 'Celebration', emoji: '🎉' },
        { value: 'quick', label: 'Quick Bite', emoji: '⚡' }
    ]

    const fetchRecommendations = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await apiService.getRecommendations(1, scenario, topN)
            setRecommendations(data.results || [])
        } catch (err) {
            setError('Failed to fetch recommendations. Please try again.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRecommendations()
    }, [scenario, topN])

    return (
        <div className="recommendations-page page">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="page-header-content">
                        <span className="page-badge">
                            <Sparkles size={14} />
                            AI-Powered
                        </span>
                        <h1 className="heading-display heading-2">
                            Personalized <span className="text-gradient">Recommendations</span>
                        </h1>
                        <p className="page-subtitle">
                            Our AI analyzes your preferences to find the perfect dining experience for any occasion.
                        </p>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    className="filters-section glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="filter-group">
                        <label className="filter-label">
                            <Filter size={16} />
                            Occasion
                        </label>
                        <div className="scenario-buttons">
                            {scenarios.map((s) => (
                                <button
                                    key={s.value}
                                    className={`scenario-btn ${scenario === s.value ? 'active' : ''}`}
                                    onClick={() => setScenario(s.value)}
                                >
                                    <span className="scenario-emoji">{s.emoji}</span>
                                    <span>{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-group">
                            <label className="filter-label">
                                <DollarSign size={16} />
                                Results
                            </label>
                            <select
                                className="input filter-select"
                                value={topN}
                                onChange={(e) => setTopN(Number(e.target.value))}
                            >
                                <option value={3}>Top 3</option>
                                <option value={6}>Top 6</option>
                                <option value={10}>Top 10</option>
                            </select>
                        </div>

                        <button
                            className="btn btn-secondary refresh-btn"
                            onClick={fetchRecommendations}
                            disabled={loading}
                        >
                            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                            Refresh
                        </button>
                    </div>
                </motion.div>

                {/* Results */}
                <div className="results-section">
                    {loading ? (
                        <div className="loading-grid">
                            {[...Array(topN)].map((_, i) => (
                                <div key={i} className="skeleton-card glass-card">
                                    <div className="skeleton skeleton-image"></div>
                                    <div className="skeleton-content">
                                        <div className="skeleton skeleton-title"></div>
                                        <div className="skeleton skeleton-text"></div>
                                        <div className="skeleton skeleton-text short"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="error-state glass-card">
                            <p>{error}</p>
                            <button className="btn btn-primary" onClick={fetchRecommendations}>
                                Try Again
                            </button>
                        </div>
                    ) : recommendations.length === 0 ? (
                        <div className="empty-state glass-card">
                            <Sparkles size={48} className="empty-icon" />
                            <h3>No recommendations found</h3>
                            <p>Try adjusting your filters or refresh the results.</p>
                        </div>
                    ) : (
                        <>
                            <div className="results-header">
                                <h2>Top {recommendations.length} Picks for You</h2>
                                <span className="results-count">
                                    Based on your preferences
                                </span>
                            </div>
                            <div className="card-grid">
                                {recommendations.map((restaurant, index) => (
                                    <RestaurantCard
                                        key={restaurant.id}
                                        restaurant={restaurant}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Recommendations
