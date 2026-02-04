import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import apiService from '../../services/api'
import './MenuManager.css'

export default function MenuManager() {
    const [menuItems, setMenuItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('All')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        image_url: '',
        is_vegetarian: false,
        is_spicy: false,
        is_available: true
    })

    const categories = ['All', 'Appetizer', 'Dim Sum', 'Soup', 'Main Course', 'Seafood', 'Vegetable', 'Rice & Noodles', 'Dessert']
    const formCategories = categories.filter(c => c !== 'All')

    useEffect(() => {
        fetchMenu()
    }, [])

    const fetchMenu = async () => {
        try {
            // Assuming restaurant ID 1 for now (single restaurant app)
            const items = await apiService.getRestaurantMenu(1)
            setMenuItems(items)
            setLoading(false)
        } catch (error) {
            console.error("Failed to fetch menu:", error)
            setLoading(false)
        }
    }

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                image_url: item.image_url || '',
                is_vegetarian: item.is_vegetarian,
                is_spicy: item.is_spicy || false,
                is_available: item.is_available
            })
        } else {
            setEditingItem(null)
            setFormData({
                name: '',
                description: '',
                price: '',
                category: 'Main Course',
                image_url: '',
                is_vegetarian: false,
                is_spicy: false,
                is_available: true
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                restaurant_id: 1
            }

            if (editingItem) {
                await apiService.updateMenuItem(editingItem.id, data)
            } else {
                await apiService.createMenuItem(1, data)
            }

            setIsModalOpen(false)
            fetchMenu()
        } catch (error) {
            console.error("Operation failed:", error)
            alert("Failed to save menu item")
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await apiService.deleteMenuItem(id)
                fetchMenu()
            } catch (error) {
                console.error("Delete failed:", error)
            }
        }
    }

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="menu-manager">
            {/* Actions Bar */}
            <div className="actions-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-select"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <button className="btn-add-item" onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    Add New Item
                </button>
            </div>

            {/* Menu Grid */}
            {loading ? (
                <div className="loading-state">Loading menu items...</div>
            ) : (
                <div className="menu-grid">
                    <AnimatePresence>
                        {filteredItems.map(item => (
                            <motion.div
                                className="menu-item-card"
                                key={item.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="item-image">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} />
                                    ) : (
                                        <div className="placeholder-image">
                                            <ImageIcon size={40} />
                                        </div>
                                    )}
                                    <div className={`status-badge ${item.is_available ? 'active' : 'inactive'}`}>
                                        {item.is_available ? 'Available' : 'Unavailable'}
                                    </div>
                                </div>
                                <div className="item-details">
                                    <div className="item-header">
                                        <h4>{item.name}</h4>
                                        <span className="price">${item.price}</span>
                                    </div>
                                    <p className="description">{item.description}</p>
                                    <div className="item-meta">
                                        <span className="category-tag">{item.category}</span>
                                        {item.is_vegetarian && <span className="diet-tag veg">Veg</span>}
                                        {item.is_spicy && <span className="diet-tag spicy">Spicy</span>}
                                    </div>
                                    <div className="item-actions">
                                        <button onClick={() => handleOpenModal(item)} className="btn-icon edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="btn-icon delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-content"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="modal-header">
                            <h3>{editingItem ? 'Edit Menu Item' : 'Add New Item'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group span-2">
                                    <label>Item Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group span-2">
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {formCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group span-2">
                                    <label>Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_vegetarian}
                                            onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                                        />
                                        Vegetarian
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_spicy}
                                            onChange={(e) => setFormData({ ...formData, is_spicy: e.target.checked })}
                                        />
                                        Spicy
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_available}
                                            onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                        />
                                        Available
                                    </label>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    {editingItem ? 'Save Changes' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
