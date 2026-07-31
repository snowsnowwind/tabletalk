import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Plus, Star, Flame, ShoppingCart, MapPin, Utensils } from 'lucide-react'
import { useCart } from '../context/CartContext'
import apiService from '../services/api'
import './Menu.css'

function Menu() {
    const navigate = useNavigate()
    const { cart, addToCart, totalItems } = useCart()
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [menuItems, setMenuItems] = useState([])
    const [restaurants, setRestaurants] = useState([])
    const [selectedRestaurantId, setSelectedRestaurantId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const selectedRestaurant = restaurants.find(({ id }) => id === selectedRestaurantId)
    const formatCategory = (category) => category
        .replaceAll('_', ' ')
        .replace(/\b\w/g, letter => letter.toUpperCase())
    const categories = [
        { id: 'all', label: 'All' },
        ...Array.from(new Set(menuItems.map(item => item.category))).map(category => ({
            id: category,
            label: formatCategory(category)
        }))
    ]

    useEffect(() => {
        let active = true
        const fetchRestaurants = async () => {
            try {
                const data = await apiService.getRestaurants()
                if (!active) return
                const available = data.filter(restaurant => restaurant.is_active)
                setRestaurants(available)
                const defaultRestaurant = available.find(({ id }) => id === 1) || available[0]
                setSelectedRestaurantId(defaultRestaurant?.id ?? null)
            } catch (error) {
                if (active) setError('Unable to load restaurants from the server.')
            }
        }
        fetchRestaurants()
        return () => { active = false }
    }, [])

    useEffect(() => {
        if (!selectedRestaurantId) {
            setLoading(false)
            return
        }

        let active = true
        const fetchMenu = async () => {
            setLoading(true)
            setError('')
            try {
                const items = await apiService.getRestaurantMenu(selectedRestaurantId)
                if (active) setMenuItems(items)
            } catch (error) {
                if (active) {
                    setMenuItems([])
                    setError('Unable to load this restaurant menu from the server.')
                }
            } finally {
                if (active) setLoading(false)
            }
        }
        fetchMenu()
        return () => { active = false }
    }, [selectedRestaurantId])

    const handleRestaurantChange = (restaurantId) => {
        setSelectedRestaurantId(restaurantId)
        setActiveCategory('all')
        setSearchQuery('')
    }

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const handleAddToCart = (item) => {
        // Normalize API data shape for cart compatibility
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image_url,
            description: item.description,
            category: item.category
        })
    }

    const handleViewCart = () => {
        navigate('/cart')
    }

    return (
        <div className="menu-page">
            <div className="menu-container">
                {/* Header */}
                <div className="menu-header">
                    <h1 className="menu-title">
                        {selectedRestaurant?.name || 'Restaurant'} <span className="text-orange">Menu</span>
                    </h1>

                    {/* Search Bar */}
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <section className="restaurant-picker" aria-label="Choose a restaurant">
                    <div className="restaurant-picker-heading">
                        <div>
                            <span className="restaurant-picker-eyebrow">Dining at</span>
                            <p>{selectedRestaurant?.cuisine || 'Choose a restaurant'} cuisine</p>
                        </div>
                        {selectedRestaurant?.address && (
                            <span className="restaurant-address">
                                <MapPin size={15} />
                                {selectedRestaurant.address}
                            </span>
                        )}
                    </div>
                    <div className="restaurant-tabs">
                        {restaurants.map(restaurant => (
                            <button
                                key={restaurant.id}
                                type="button"
                                className={`restaurant-tab ${selectedRestaurantId === restaurant.id ? 'active' : ''}`}
                                onClick={() => handleRestaurantChange(restaurant.id)}
                            >
                                <Utensils size={17} />
                                <span>
                                    <strong>{restaurant.name}</strong>
                                    <small>{restaurant.cuisine}</small>
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Category Tabs */}
                <div className="category-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {cat.id === 'all' && <Star size={16} />}
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                {error ? (
                    <div className="menu-empty">
                        <p>{error}</p>
                    </div>
                ) : loading ? (
                    <div className="menu-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading menu...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="menu-empty">
                        <p>No items found</p>
                    </div>
                ) : (
                    <div className="menu-grid">
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="menu-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="menu-card-image">
                                    <img
                                        src={item.image_url || '/images/menu/har-gow.jpg'}
                                        alt={item.name}
                                        loading="lazy"
                                    />
                                    {item.is_spicy && (
                                        <span className="recommend-badge spicy-badge">
                                            <Flame size={12} /> Spicy
                                        </span>
                                    )}
                                </div>
                                <div className="menu-card-content">
                                    <h3 className="menu-item-name">{item.name}</h3>
                                    <p className="menu-item-desc">{item.description}</p>
                                    <div className="menu-card-footer">
                                        <span className="menu-item-price">HKD {item.price}</span>
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Cart Badge (if items in cart) */}
                {totalItems > 0 && (
                    <motion.div
                        className="cart-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                    >
                        <span><ShoppingCart size={18} /> {totalItems} items in cart</span>
                        <button
                            className="btn btn-primary cart-checkout-btn"
                            onClick={handleViewCart}
                        >
                            View Cart
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Menu
