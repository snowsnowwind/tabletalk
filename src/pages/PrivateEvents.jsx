import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    PartyPopper, Calendar, Clock, Users, Building,
    Phone, Mail, UtensilsCrossed, Music, Mic,
    Camera, Cake, ArrowRight, Check, Sparkles
} from 'lucide-react'
import './PrivateEvents.css'

function PrivateEvents() {
    const [formData, setFormData] = useState({
        eventType: '',
        date: '',
        time: '',
        guests: '',
        companyName: '',
        contactName: '',
        phone: '',
        email: '',
        budget: '',
        menuPreference: '',
        additionalServices: [],
        specialRequests: ''
    })
    const [submitted, setSubmitted] = useState(false)

    const eventTypes = [
        { id: 'corporate', label: 'Corporate Dinner', icon: Building },
        { id: 'wedding', label: 'Wedding Banquet', icon: PartyPopper },
        { id: 'birthday', label: 'Birthday Party', icon: Cake },
        { id: 'anniversary', label: 'Anniversary', icon: Sparkles },
        { id: 'other', label: 'Other Event', icon: Calendar }
    ]

    const additionalServices = [
        { id: 'dj', label: 'DJ/Music', icon: Music },
        { id: 'mc', label: 'MC/Host', icon: Mic },
        { id: 'photography', label: 'Photography', icon: Camera },
        { id: 'decoration', label: 'Custom Decoration', icon: PartyPopper },
        { id: 'cake', label: 'Custom Cake', icon: Cake }
    ]

    const menuOptions = [
        { id: 'classic', label: 'Classic Cantonese (HK$888/person)', description: '8-course traditional menu' },
        { id: 'premium', label: 'Premium Selection (HK$1,288/person)', description: '10-course with premium seafood' },
        { id: 'deluxe', label: 'Deluxe Banquet (HK$1,888/person)', description: '12-course with abalone & lobster' },
        { id: 'custom', label: 'Custom Menu', description: 'Work with our chef to design your menu' }
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleService = (serviceId) => {
        setFormData(prev => ({
            ...prev,
            additionalServices: prev.additionalServices.includes(serviceId)
                ? prev.additionalServices.filter(s => s !== serviceId)
                : [...prev.additionalServices, serviceId]
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Private event inquiry:', formData)
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="private-events-page page">
                <div className="container">
                    <motion.div
                        className="submission-card glass-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="submission-icon">
                            <Check size={40} />
                        </div>
                        <h2>Inquiry Submitted!</h2>
                        <p>
                            Thank you for your interest in hosting your event at Table Talk.
                            Our events team will contact you within 24 hours to discuss your requirements.
                        </p>
                        <div className="submission-info">
                            <p>📧 A confirmation email has been sent to <strong>{formData.email}</strong></p>
                            <p>📞 For urgent inquiries, call us at <strong>+852 1234 5678</strong></p>
                        </div>
                        <button
                            className="btn btn-accent"
                            onClick={() => {
                                setSubmitted(false)
                                setFormData({
                                    eventType: '', date: '', time: '', guests: '', companyName: '',
                                    contactName: '', phone: '', email: '', budget: '', menuPreference: '',
                                    additionalServices: [], specialRequests: ''
                                })
                            }}
                        >
                            Submit Another Inquiry
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="private-events-page page">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="page-badge">
                        <PartyPopper size={14} />
                        Private Events
                    </span>
                    <h1 className="heading-display heading-2">
                        Host Your <span className="text-gradient-gold">Special Event</span>
                    </h1>
                    <p className="page-subtitle">
                        From intimate gatherings to grand celebrations, our private dining rooms
                        and expert team will make your event unforgettable.
                    </p>
                </motion.div>

                {/* Event Spaces Gallery */}
                <motion.div
                    className="spaces-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3>Our Private Spaces</h3>
                    <div className="spaces-grid">
                        <div className="space-card glass-card">
                            <img
                                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"
                                alt="Private Room"
                            />
                            <div className="space-info">
                                <h4>Imperial Room</h4>
                                <p>Up to 20 guests • Perfect for corporate dinners</p>
                            </div>
                        </div>
                        <div className="space-card glass-card">
                            <img
                                src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600"
                                alt="Banquet Hall"
                            />
                            <div className="space-info">
                                <h4>Grand Ballroom</h4>
                                <p>Up to 150 guests • Ideal for weddings & galas</p>
                            </div>
                        </div>
                        <div className="space-card glass-card">
                            <img
                                src="https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600"
                                alt="Terrace"
                            />
                            <div className="space-info">
                                <h4>Garden Terrace</h4>
                                <p>Up to 50 guests • Outdoor celebrations</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Inquiry Form */}
                <motion.div
                    className="inquiry-form glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3>Event Inquiry Form</h3>
                    <form onSubmit={handleSubmit}>
                        {/* Event Type */}
                        <div className="form-section">
                            <label className="section-label">Event Type</label>
                            <div className="event-type-grid">
                                {eventTypes.map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        className={`event-type-btn ${formData.eventType === type.id ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, eventType: type.id }))}
                                    >
                                        <type.icon size={20} />
                                        <span>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date, Time, Guests */}
                        <div className="form-row three-col">
                            <div className="form-group">
                                <label><Calendar size={16} /> Preferred Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="form-group">
                                <label><Clock size={16} /> Preferred Time</label>
                                <select
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                >
                                    <option value="">Select time</option>
                                    <option value="lunch">Lunch (12:00 - 3:00 PM)</option>
                                    <option value="dinner">Dinner (6:00 - 10:00 PM)</option>
                                    <option value="full-day">Full Day Event</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label><Users size={16} /> Expected Guests</label>
                                <select
                                    name="guests"
                                    value={formData.guests}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                >
                                    <option value="">Select range</option>
                                    <option value="10-20">10-20 guests</option>
                                    <option value="20-50">20-50 guests</option>
                                    <option value="50-100">50-100 guests</option>
                                    <option value="100+">100+ guests</option>
                                </select>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="form-section">
                            <label className="section-label">Contact Information</label>
                            <div className="form-row two-col">
                                <div className="form-group">
                                    <label><Building size={16} /> Company/Organization</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact Name</label>
                                    <input
                                        type="text"
                                        name="contactName"
                                        value={formData.contactName}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row two-col">
                                <div className="form-group">
                                    <label><Phone size={16} /> Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="+852 XXXX XXXX"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Mail size={16} /> Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Menu Selection */}
                        <div className="form-section">
                            <label className="section-label"><UtensilsCrossed size={16} /> Menu Preference</label>
                            <div className="menu-options">
                                {menuOptions.map(menu => (
                                    <label
                                        key={menu.id}
                                        className={`menu-option ${formData.menuPreference === menu.id ? 'active' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="menuPreference"
                                            value={menu.id}
                                            checked={formData.menuPreference === menu.id}
                                            onChange={handleChange}
                                        />
                                        <div className="menu-option-content">
                                            <span className="menu-name">{menu.label}</span>
                                            <span className="menu-desc">{menu.description}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Additional Services */}
                        <div className="form-section">
                            <label className="section-label">Additional Services</label>
                            <div className="services-grid">
                                {additionalServices.map(service => (
                                    <button
                                        key={service.id}
                                        type="button"
                                        className={`service-btn ${formData.additionalServices.includes(service.id) ? 'active' : ''}`}
                                        onClick={() => toggleService(service.id)}
                                    >
                                        <service.icon size={18} />
                                        <span>{service.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Special Requests */}
                        <div className="form-group">
                            <label>Special Requests / Additional Details</label>
                            <textarea
                                name="specialRequests"
                                value={formData.specialRequests}
                                onChange={handleChange}
                                className="input textarea"
                                placeholder="Tell us more about your event, dietary requirements, or any special arrangements..."
                                rows={4}
                            />
                        </div>

                        <button type="submit" className="btn btn-accent btn-lg submit-btn">
                            <ArrowRight size={20} />
                            Submit Inquiry
                        </button>
                    </form>
                </motion.div>

                {/* Contact CTA */}
                <motion.div
                    className="contact-cta glass-card"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <h4>Prefer to speak directly?</h4>
                    <p>Call our Events Team at <strong>+852 1234 5678</strong> or email <strong>events@maximpalace.com</strong></p>
                </motion.div>
            </div>
        </div>
    )
}

export default PrivateEvents
