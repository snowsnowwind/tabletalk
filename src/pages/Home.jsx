import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Calendar, Clock, MapPin, Phone, Star, Award,
    ChefHat, Wine, Users, ArrowRight, Sparkles
} from 'lucide-react'
import ChatBot, { ChatFloatingButton } from '../components/ChatBot'
import './Home.css'

function Home() {
    const navigate = useNavigate()
    const [chatOpen, setChatOpen] = useState(false)

    const features = [
        {
            icon: ChefHat,
            title: 'Master Chefs',
            description: 'Our award-winning culinary team brings decades of expertise in authentic Cantonese cuisine.'
        },
        {
            icon: Wine,
            title: 'Premium Selection',
            description: 'Curated wine list and premium tea selection to complement your dining experience.'
        },
        {
            icon: Users,
            title: 'Private Rooms',
            description: 'Elegant private dining rooms for business meetings and family celebrations.'
        }
    ]

    const testimonials = [
        {
            name: 'Michael C.',
            rating: 5,
            text: 'The best dim sum in Hong Kong! The service is impeccable and the private rooms are perfect for business dinners.',
            date: 'January 2024'
        },
        {
            name: 'Sarah L.',
            rating: 5,
            text: 'We held our wedding banquet here and it was absolutely stunning. Highly recommend for special occasions!',
            date: 'December 2023'
        }
    ]

    const handleReservationComplete = (reservation) => {
        console.log('Reservation completed:', reservation)
        // Here you would send to backend
    }

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <img
                        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920"
                        alt="Restaurant interior"
                        className="hero-bg-image"
                    />
                    <div className="hero-overlay"></div>
                </div>

                <div className="container hero-content">
                    <motion.div
                        className="hero-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="hero-badge">
                            <Award size={14} />
                            <span>Michelin Recommended</span>
                        </div>
                        <h1 className="hero-title heading-display">
                            Experience <span className="text-gradient-gold">Authentic</span><br />
                            Cantonese Cuisine
                        </h1>
                        <p className="hero-subtitle">
                            Nestled in the heart of Tsim Sha Tsui, Maxim Palace offers an unforgettable
                            dining journey through the finest traditions of Cantonese gastronomy.
                        </p>
                        <div className="hero-actions">
                            <button
                                className="btn btn-accent btn-lg"
                                onClick={() => setChatOpen(true)}
                            >
                                <Sparkles size={20} />
                                Book via Chat
                            </button>
                            <button
                                className="btn btn-secondary btn-lg"
                                onClick={() => navigate('/reservations')}
                            >
                                <Calendar size={20} />
                                Reserve a Table
                            </button>
                        </div>

                        <div className="hero-info">
                            <div className="hero-info-item">
                                <MapPin size={18} />
                                <span>123 Canton Road, TST</span>
                            </div>
                            <div className="hero-info-item">
                                <Phone size={18} />
                                <span>+852 1234 5678</span>
                            </div>
                            <div className="hero-info-item">
                                <Clock size={18} />
                                <span>Open until 10:30 PM</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Booking Strip */}
            <section className="quick-booking">
                <div className="container">
                    <motion.div
                        className="quick-booking-card glass-card"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3>Quick Reservation</h3>
                        <div className="quick-booking-form">
                            <div className="form-group">
                                <label><Calendar size={16} /> Date</label>
                                <input type="date" className="input" />
                            </div>
                            <div className="form-group">
                                <label><Clock size={16} /> Time</label>
                                <select className="input">
                                    <option>6:00 PM</option>
                                    <option>6:30 PM</option>
                                    <option>7:00 PM</option>
                                    <option>7:30 PM</option>
                                    <option>8:00 PM</option>
                                    <option>8:30 PM</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label><Users size={16} /> Guests</label>
                                <select className="input">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                        <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                className="btn btn-accent"
                                onClick={() => navigate('/reservations')}
                            >
                                Check Availability
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section">
                <div className="container">
                    <div className="about-grid">
                        <motion.div
                            className="about-image"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800"
                                alt="Dim sum"
                            />
                            <div className="about-image-badge glass-card">
                                <span className="badge-number">35+</span>
                                <span className="badge-text">Years of Excellence</span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="about-content"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="heading-display heading-2">
                                A Legacy of <span className="text-gradient-gold">Flavors</span>
                            </h2>
                            <p>
                                Since 1988, Maxim Palace has been serving Hong Kong's most discerning
                                diners with authentic Cantonese cuisine. Our master chefs bring generations
                                of culinary wisdom to every dish, from delicate dim sum to grand banquet fare.
                            </p>
                            <p>
                                Whether you're celebrating a milestone, hosting a business dinner, or simply
                                craving the finest Hong Kong cuisine, our team is dedicated to making every
                                visit memorable.
                            </p>
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/menu')}
                            >
                                Explore Our Menu
                                <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="heading-display heading-2">
                            Why <span className="text-gradient-gold">Maxim Palace</span>
                        </h2>
                    </motion.div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="feature-card glass-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="feature-icon">
                                    <feature.icon size={28} />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="heading-display heading-2">
                            Guest <span className="text-gradient-gold">Reviews</span>
                        </h2>
                    </motion.div>

                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                className="testimonial-card glass-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="testimonial-rating">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                                    ))}
                                </div>
                                <p className="testimonial-text">"{testimonial.text}"</p>
                                <div className="testimonial-author">
                                    <span className="author-name">{testimonial.name}</span>
                                    <span className="author-date">{testimonial.date}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <motion.div
                        className="cta-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="heading-display heading-3">
                            Ready to Experience Maxim Palace?
                        </h2>
                        <p>
                            Book your table today and discover why we've been Hong Kong's
                            destination for fine Cantonese dining for over 35 years.
                        </p>
                        <div className="cta-actions">
                            <button
                                className="btn btn-accent btn-lg"
                                onClick={() => setChatOpen(true)}
                            >
                                <Sparkles size={20} />
                                Chat to Book
                            </button>
                            <a href="tel:+85212345678" className="btn btn-secondary btn-lg">
                                <Phone size={20} />
                                Call Us
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Chat Bot */}
            <ChatFloatingButton onClick={() => setChatOpen(true)} />
            <ChatBot
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                onReservationComplete={handleReservationComplete}
            />
        </div>
    )
}

export default Home
