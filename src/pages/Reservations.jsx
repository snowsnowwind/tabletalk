import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, Users, User, Phone, Mail,
    MessageSquare, Check, Sparkles, CreditCard
} from 'lucide-react'
import ChatBot from '../components/ChatBot'
import './Reservations.css'

function Reservations() {
    const [chatOpen, setChatOpen] = useState(false)
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        guests: '2',
        name: '',
        phone: '',
        email: '',
        occasion: '',
        specialRequests: '',
        seating: 'any'
    })
    const [submitted, setSubmitted] = useState(false)

    const timeSlots = [
        '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
        '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'
    ]

    const occasions = [
        'Regular Dining', 'Birthday', 'Anniversary', 'Business Dinner',
        'Date Night', 'Family Gathering', 'Other'
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Here you would send to backend
        console.log('Reservation:', formData)
        setSubmitted(true)
    }

    const handleReservationComplete = (reservation) => {
        console.log('Chat reservation:', reservation)
        setSubmitted(true)
        setChatOpen(false)
    }

    if (submitted) {
        return (
            <div className="reservations-page page">
                <div className="container">
                    <motion.div
                        className="confirmation-card glass-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="confirmation-icon">
                            <Check size={40} />
                        </div>
                        <h2>Reservation Confirmed!</h2>
                        <p>
                            Thank you for your reservation at Maxim Palace.
                            You will receive a confirmation SMS and email shortly.
                        </p>
                        <div className="confirmation-details">
                            <div className="detail-item">
                                <Calendar size={18} />
                                <span>{formData.date || 'Selected date'}</span>
                            </div>
                            <div className="detail-item">
                                <Clock size={18} />
                                <span>{formData.time || 'Selected time'}</span>
                            </div>
                            <div className="detail-item">
                                <Users size={18} />
                                <span>{formData.guests} guests</span>
                            </div>
                        </div>
                        <div className="confirmation-note">
                            <p>📞 For changes or cancellations, please call us at <strong>+852 1234 5678</strong></p>
                        </div>
                        <button
                            className="btn btn-accent"
                            onClick={() => {
                                setSubmitted(false)
                                setFormData({
                                    date: '', time: '', guests: '2', name: '',
                                    phone: '', email: '', occasion: '', specialRequests: '', seating: 'any'
                                })
                            }}
                        >
                            Make Another Reservation
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="reservations-page page">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="page-badge">
                        <Calendar size={14} />
                        Reservations
                    </span>
                    <h1 className="heading-display heading-2">
                        Book Your <span className="text-gradient-gold">Table</span>
                    </h1>
                    <p className="page-subtitle">
                        Reserve your table at Maxim Palace.
                        Book via our chat assistant or fill out the form below.
                    </p>
                </motion.div>

                {/* Booking Options */}
                <div className="booking-options">
                    {/* Chat Option */}
                    <motion.div
                        className="booking-option chat-option glass-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="option-header">
                            <Sparkles size={24} />
                            <h3>Chat with AI Assistant</h3>
                        </div>
                        <p>
                            Book your table through a natural conversation with our AI assistant.
                            Quick, easy, and available 24/7.
                        </p>
                        <button
                            className="btn btn-accent btn-lg"
                            onClick={() => setChatOpen(true)}
                        >
                            <MessageSquare size={20} />
                            Start Chat Booking
                        </button>
                    </motion.div>

                    {/* Form Option */}
                    <motion.div
                        className="booking-option form-option glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <form onSubmit={handleSubmit}>
                            <h3>Reservation Form</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <Calendar size={16} />
                                        Date
                                    </label>
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
                                    <label>
                                        <Clock size={16} />
                                        Time
                                    </label>
                                    <select
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    >
                                        <option value="">Select time</option>
                                        {timeSlots.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Users size={16} />
                                        Guests
                                    </label>
                                    <select
                                        name="guests"
                                        value={formData.guests}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                            <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                                        ))}
                                        <option value="10+">10+ (Private room)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <User size={16} />
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Your full name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Phone size={16} />
                                        Phone
                                    </label>
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
                            </div>

                            <div className="form-group">
                                <label>
                                    <Mail size={16} />
                                    Email (optional)
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Occasion</label>
                                    <select
                                        name="occasion"
                                        value={formData.occasion}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="">Select occasion</option>
                                        {occasions.map(occ => (
                                            <option key={occ} value={occ}>{occ}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Seating Preference</label>
                                    <select
                                        name="seating"
                                        value={formData.seating}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="any">No preference</option>
                                        <option value="window">Window seat</option>
                                        <option value="booth">Booth</option>
                                        <option value="private">Private room</option>
                                        <option value="outdoor">Outdoor terrace</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    <MessageSquare size={16} />
                                    Special Requests
                                </label>
                                <textarea
                                    name="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={handleChange}
                                    className="input textarea"
                                    placeholder="Dietary restrictions, allergies, special arrangements..."
                                    rows={3}
                                />
                            </div>

                            <div className="deposit-notice">
                                <CreditCard size={18} />
                                <p>
                                    <strong>Deposit Policy:</strong> A deposit of HK$200 per person is required
                                    for bookings of 6+ guests or during peak hours. The deposit will be
                                    deducted from your final bill.
                                </p>
                            </div>

                            <button type="submit" className="btn btn-accent btn-lg submit-btn">
                                <Check size={20} />
                                Confirm Reservation
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Contact Info */}
                <motion.div
                    className="contact-strip glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <p>
                        Need help? Call us at <strong>+852 1234 5678</strong> or email
                        <strong> reservations@maximpalace.com</strong>
                    </p>
                </motion.div>
            </div>

            {/* Chat Bot */}
            <ChatBot
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                onReservationComplete={handleReservationComplete}
            />
        </div>
    )
}

export default Reservations
