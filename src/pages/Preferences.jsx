import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, User, Heart, Bell, MapPin,
    DollarSign, Sparkles, Save, ChefHat,
    TrendingUp
} from 'lucide-react'
import './Preferences.css'

function Preferences() {
    const [preferences, setPreferences] = useState({
        // Cuisine Preferences
        cuisines: {
            chinese: 80,
            japanese: 70,
            italian: 60,
            french: 50,
            korean: 65,
            thai: 55,
            indian: 45,
            american: 40
        },
        // Price Range
        priceRange: [2, 4],
        // Ambiance
        ambiance: ['romantic', 'quiet'],
        // Dietary
        dietary: [],
        // Location
        preferredAreas: ['central', 'tst'],
        // Notifications
        notifications: {
            newRestaurants: true,
            deals: true,
            aiRecommendations: true,
            reservationReminders: true
        }
    })

    const cuisineList = [
        { id: 'chinese', name: 'Chinese', emoji: '🥢' },
        { id: 'japanese', name: 'Japanese', emoji: '🍣' },
        { id: 'italian', name: 'Italian', emoji: '🍝' },
        { id: 'french', name: 'French', emoji: '🥐' },
        { id: 'korean', name: 'Korean', emoji: '🍜' },
        { id: 'thai', name: 'Thai', emoji: '🍛' },
        { id: 'indian', name: 'Indian', emoji: '🍲' },
        { id: 'american', name: 'American', emoji: '🍔' }
    ]

    const ambianceOptions = [
        { id: 'romantic', label: 'Romantic', emoji: '💕' },
        { id: 'quiet', label: 'Quiet', emoji: '🤫' },
        { id: 'lively', label: 'Lively', emoji: '🎉' },
        { id: 'casual', label: 'Casual', emoji: '😊' },
        { id: 'fine_dining', label: 'Fine Dining', emoji: '✨' },
        { id: 'outdoor', label: 'Outdoor', emoji: '🌿' }
    ]

    const dietaryOptions = [
        { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
        { id: 'vegan', label: 'Vegan', emoji: '🌱' },
        { id: 'halal', label: 'Halal', emoji: '☪️' },
        { id: 'gluten_free', label: 'Gluten-Free', emoji: '🌾' },
        { id: 'nut_free', label: 'Nut-Free', emoji: '🥜' }
    ]

    const locationOptions = [
        { id: 'central', label: 'Central' },
        { id: 'tst', label: 'Tsim Sha Tsui' },
        { id: 'causeway', label: 'Causeway Bay' },
        { id: 'wanchai', label: 'Wan Chai' },
        { id: 'mongkok', label: 'Mong Kok' },
        { id: 'admiralty', label: 'Admiralty' }
    ]

    const updateCuisinePreference = (cuisine, value) => {
        setPreferences(prev => ({
            ...prev,
            cuisines: { ...prev.cuisines, [cuisine]: value }
        }))
    }

    const toggleAmbiance = (id) => {
        setPreferences(prev => ({
            ...prev,
            ambiance: prev.ambiance.includes(id)
                ? prev.ambiance.filter(a => a !== id)
                : [...prev.ambiance, id]
        }))
    }

    const toggleDietary = (id) => {
        setPreferences(prev => ({
            ...prev,
            dietary: prev.dietary.includes(id)
                ? prev.dietary.filter(d => d !== id)
                : [...prev.dietary, id]
        }))
    }

    const toggleLocation = (id) => {
        setPreferences(prev => ({
            ...prev,
            preferredAreas: prev.preferredAreas.includes(id)
                ? prev.preferredAreas.filter(l => l !== id)
                : [...prev.preferredAreas, id]
        }))
    }

    const toggleNotification = (key) => {
        setPreferences(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }))
    }

    const handleSave = () => {
        alert('Preferences saved! AI will use these to improve recommendations.')
    }

    return (
        <div className="preferences-page page">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="page-badge">
                        <Settings size={14} />
                        Personalization
                    </span>
                    <h1 className="heading-display heading-2">
                        Your <span className="text-gradient">Preferences</span>
                    </h1>
                    <p className="page-subtitle">
                        Help our AI understand your tastes for better recommendations.
                    </p>
                </motion.div>

                <div className="preferences-grid">
                    {/* AI Insights Card */}
                    <motion.div
                        className="ai-insights-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="ai-insights-header">
                            <Sparkles size={24} />
                            <h3>AI Insights</h3>
                        </div>
                        <div className="insights-list">
                            <div className="insight-item">
                                <TrendingUp size={16} />
                                <span>You prefer Asian cuisines over Western</span>
                            </div>
                            <div className="insight-item">
                                <Heart size={16} />
                                <span>Romantic settings match 78% of your picks</span>
                            </div>
                            <div className="insight-item">
                                <DollarSign size={16} />
                                <span>Mid-range pricing is your sweet spot</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Cuisine Preferences */}
                    <motion.div
                        className="preference-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <div className="preference-header">
                            <ChefHat size={20} />
                            <h3>Cuisine Preferences</h3>
                        </div>
                        <p className="preference-description">
                            Adjust sliders to indicate how much you enjoy each cuisine
                        </p>
                        <div className="cuisine-sliders">
                            {cuisineList.map(cuisine => (
                                <div key={cuisine.id} className="cuisine-slider-item">
                                    <div className="cuisine-label">
                                        <span className="cuisine-emoji">{cuisine.emoji}</span>
                                        <span>{cuisine.name}</span>
                                    </div>
                                    <div className="slider-container">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={preferences.cuisines[cuisine.id]}
                                            onChange={(e) => updateCuisinePreference(cuisine.id, Number(e.target.value))}
                                            className="cuisine-slider"
                                            style={{
                                                background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${preferences.cuisines[cuisine.id]}%, var(--gray-700) ${preferences.cuisines[cuisine.id]}%, var(--gray-700) 100%)`
                                            }}
                                        />
                                        <span className="slider-value">{preferences.cuisines[cuisine.id]}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Price Range */}
                    <motion.div
                        className="preference-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="preference-header">
                            <DollarSign size={20} />
                            <h3>Price Range</h3>
                        </div>
                        <p className="preference-description">
                            Select your comfortable price range
                        </p>
                        <div className="price-buttons">
                            {[1, 2, 3, 4, 5].map(level => (
                                <button
                                    key={level}
                                    className={`price-btn ${level >= preferences.priceRange[0] && level <= preferences.priceRange[1]
                                            ? 'active'
                                            : ''
                                        }`}
                                    onClick={() => {
                                        const [min, max] = preferences.priceRange
                                        if (level < min) {
                                            setPreferences(prev => ({ ...prev, priceRange: [level, max] }))
                                        } else if (level > max) {
                                            setPreferences(prev => ({ ...prev, priceRange: [min, level] }))
                                        } else if (level === min && level === max) {
                                            // Do nothing, at least one must be selected
                                        } else if (level === min) {
                                            setPreferences(prev => ({ ...prev, priceRange: [level + 1, max] }))
                                        } else if (level === max) {
                                            setPreferences(prev => ({ ...prev, priceRange: [min, level - 1] }))
                                        }
                                    }}
                                >
                                    {'$'.repeat(level)}
                                </button>
                            ))}
                        </div>
                        <div className="price-labels">
                            <span>Budget</span>
                            <span>Luxury</span>
                        </div>
                    </motion.div>

                    {/* Ambiance */}
                    <motion.div
                        className="preference-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <div className="preference-header">
                            <Heart size={20} />
                            <h3>Preferred Ambiance</h3>
                        </div>
                        <div className="toggle-grid">
                            {ambianceOptions.map(option => (
                                <button
                                    key={option.id}
                                    className={`toggle-btn ${preferences.ambiance.includes(option.id) ? 'active' : ''}`}
                                    onClick={() => toggleAmbiance(option.id)}
                                >
                                    <span className="toggle-emoji">{option.emoji}</span>
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Dietary Restrictions */}
                    <motion.div
                        className="preference-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="preference-header">
                            <User size={20} />
                            <h3>Dietary Restrictions</h3>
                        </div>
                        <div className="toggle-grid">
                            {dietaryOptions.map(option => (
                                <button
                                    key={option.id}
                                    className={`toggle-btn ${preferences.dietary.includes(option.id) ? 'active' : ''}`}
                                    onClick={() => toggleDietary(option.id)}
                                >
                                    <span className="toggle-emoji">{option.emoji}</span>
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Preferred Locations */}
                    <motion.div
                        className="preference-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <div className="preference-header">
                            <MapPin size={20} />
                            <h3>Preferred Areas</h3>
                        </div>
                        <div className="location-chips">
                            {locationOptions.map(option => (
                                <button
                                    key={option.id}
                                    className={`location-chip ${preferences.preferredAreas.includes(option.id) ? 'active' : ''}`}
                                    onClick={() => toggleLocation(option.id)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Notification Settings */}
                    <motion.div
                        className="preference-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="preference-header">
                            <Bell size={20} />
                            <h3>Notifications</h3>
                        </div>
                        <div className="notification-toggles">
                            {[
                                { key: 'newRestaurants', label: 'New Restaurant Openings' },
                                { key: 'deals', label: 'Deals & Promotions' },
                                { key: 'aiRecommendations', label: 'AI Recommendations' },
                                { key: 'reservationReminders', label: 'Reservation Reminders' }
                            ].map(item => (
                                <div key={item.key} className="notification-item">
                                    <span>{item.label}</span>
                                    <button
                                        className={`toggle-switch ${preferences.notifications[item.key] ? 'on' : ''}`}
                                        onClick={() => toggleNotification(item.key)}
                                    >
                                        <span className="toggle-knob" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Save Button */}
                <motion.div
                    className="save-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <button className="btn btn-primary btn-lg" onClick={handleSave}>
                        <Save size={20} />
                        Save Preferences
                    </button>
                </motion.div>
            </div>
        </div>
    )
}

export default Preferences
