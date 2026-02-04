import { useState } from 'react'
import { motion } from 'framer-motion'
import { UtensilsCrossed, Leaf, Star, Flame, DollarSign } from 'lucide-react'
import './Menu.css'

function Menu() {
    const [activeCategory, setActiveCategory] = useState('dim_sum')

    const categories = [
        { id: 'dim_sum', name: 'Dim Sum', emoji: '🥟' },
        { id: 'appetizers', name: 'Appetizers', emoji: '🥗' },
        { id: 'soups', name: 'Soups', emoji: '🍜' },
        { id: 'mains', name: 'Main Courses', emoji: '🍖' },
        { id: 'seafood', name: 'Seafood', emoji: '🦐' },
        { id: 'vegetarian', name: 'Vegetarian', emoji: '🥬' },
        { id: 'desserts', name: 'Desserts', emoji: '🍮' }
    ]

    const menuItems = {
        dim_sum: [
            { id: 1, name: 'Har Gow (Crystal Shrimp Dumplings)', description: 'Delicate translucent wrapper filled with fresh shrimp', price: 68, isSignature: true },
            { id: 2, name: 'Siu Mai (Pork & Shrimp Dumplings)', description: 'Open-topped dumplings with premium pork and shrimp', price: 58, isSignature: true },
            { id: 3, name: 'Char Siu Bao (BBQ Pork Buns)', description: 'Fluffy steamed buns with honey-glazed BBQ pork', price: 52 },
            { id: 4, name: 'Cheung Fun (Rice Noodle Rolls)', description: 'Silky rice noodles with shrimp or beef', price: 62 },
            { id: 5, name: 'Lo Bak Go (Turnip Cake)', description: 'Pan-fried radish cake with dried shrimp', price: 48 },
            { id: 6, name: 'Phoenix Claws', description: 'Braised chicken feet in black bean sauce', price: 52 },
        ],
        appetizers: [
            { id: 7, name: 'Crispy Roast Pork Belly', description: 'Double-cooked pork belly with crackling skin', price: 128, isSignature: true },
            { id: 8, name: 'Jellyfish Salad', description: 'Chilled jellyfish with sesame and vinegar', price: 88 },
            { id: 9, name: 'Century Egg with Ginger', description: 'Preserved egg with pickled ginger', price: 68 },
        ],
        soups: [
            { id: 10, name: 'Double-Boiled Chicken Soup', description: 'Slow-cooked with ginseng and red dates', price: 138 },
            { id: 11, name: 'Shark Fin Soup', description: 'Premium soup with crab meat', price: 288, isSignature: true },
            { id: 12, name: 'Hot and Sour Soup', description: 'Classic Cantonese style with tofu', price: 78 },
        ],
        mains: [
            { id: 13, name: 'Peking Duck (Whole)', description: 'Served in two courses with pancakes', price: 688, isSignature: true },
            { id: 14, name: 'Wok-Fried Beef with Black Pepper', description: 'Tender beef with bell peppers', price: 188 },
            { id: 15, name: 'Sweet and Sour Pork', description: 'Crispy pork in tangy sauce with pineapple', price: 158 },
            { id: 16, name: 'Kung Pao Chicken', description: 'Spicy chicken with peanuts and dried chilies', price: 148, isSpicy: true },
        ],
        seafood: [
            { id: 17, name: 'Steamed Whole Fish', description: 'Fresh grouper with ginger and scallion', price: 388, isSignature: true },
            { id: 18, name: 'Lobster in Superior Stock', description: 'Boston lobster in rich broth', price: 588 },
            { id: 19, name: 'Salt and Pepper Squid', description: 'Crispy fried with garlic and chili', price: 168, isSpicy: true },
            { id: 20, name: 'Steamed Scallops with Garlic', description: 'Fresh scallops on vermicelli', price: 228 },
        ],
        vegetarian: [
            { id: 21, name: 'Buddha\'s Delight', description: 'Mixed vegetables with tofu and mushrooms', price: 138, isVegetarian: true },
            { id: 22, name: 'Mapo Tofu', description: 'Silken tofu in spicy bean sauce', price: 98, isSpicy: true, isVegetarian: true },
            { id: 23, name: 'Stir-Fried Seasonal Greens', description: 'Fresh vegetables with garlic', price: 88, isVegetarian: true },
        ],
        desserts: [
            { id: 24, name: 'Egg Tarts', description: 'Flaky pastry with silky egg custard', price: 48, isSignature: true },
            { id: 25, name: 'Mango Pomelo Sago', description: 'Chilled mango dessert with grapefruit', price: 68 },
            { id: 26, name: 'Red Bean Soup', description: 'Warm traditional sweet soup', price: 48 },
        ]
    }

    const currentItems = menuItems[activeCategory] || []

    return (
        <div className="menu-page page">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="page-badge">
                        <UtensilsCrossed size={14} />
                        Our Menu
                    </span>
                    <h1 className="heading-display heading-2">
                        Culinary <span className="text-gradient-gold">Excellence</span>
                    </h1>
                    <p className="page-subtitle">
                        Discover our curated selection of authentic Cantonese dishes,
                        prepared by our award-winning chefs.
                    </p>
                </motion.div>

                {/* Category Tabs */}
                <motion.div
                    className="menu-categories"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            <span className="category-emoji">{category.emoji}</span>
                            <span>{category.name}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Menu Items */}
                <div className="menu-items-grid">
                    {currentItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className="menu-item-card glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="menu-item-header">
                                <h3>{item.name}</h3>
                                <span className="menu-item-price">
                                    <DollarSign size={14} />
                                    {item.price}
                                </span>
                            </div>
                            <p className="menu-item-description">{item.description}</p>
                            <div className="menu-item-tags">
                                {item.isSignature && (
                                    <span className="menu-tag signature">
                                        <Star size={12} /> Signature
                                    </span>
                                )}
                                {item.isSpicy && (
                                    <span className="menu-tag spicy">
                                        <Flame size={12} /> Spicy
                                    </span>
                                )}
                                {item.isVegetarian && (
                                    <span className="menu-tag vegetarian">
                                        <Leaf size={12} /> Vegetarian
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Menu Note */}
                <motion.div
                    className="menu-note glass-card"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <p>
                        <strong>Note:</strong> Prices are in HKD and subject to 10% service charge.
                        Please inform our staff of any dietary restrictions or allergies.
                        Some dishes may require advance notice.
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default Menu
