import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { User, Building2, ShoppingBag, ChefHat, Star } from 'lucide-react'
import './GuestSelection.css'

function GuestSelection() {
    const navigate = useNavigate()

    const guestOptions = [
        {
            id: 'regular',
            icon: User,
            title: 'Regular Guest',
            subtitle: 'Dining Experience',
            features: [
                '• Browse restaurant recommendations',
                '• View menus and make reservations',
                '• Access loyalty rewards',
                '• Save favorite restaurants'
            ],
            action: () => navigate('/discover'),
            buttonText: 'Continue'
        },
        {
            id: 'corporate',
            icon: Building2,
            title: 'Corporate Events',
            subtitle: 'Business Dining',
            features: [
                '• Book private dining rooms',
                '• Plan company celebrations',
                '• Team building events',
                '• Custom catering menus'
            ],
            action: () => navigate('/corporate-events'),
            buttonText: 'Plan Event'
        },
        {
            id: 'online',
            icon: ShoppingBag,
            title: 'Online Ordering',
            subtitle: 'Takeaway & Delivery',
            features: [
                '• Order delicious meals online',
                '• Schedule pickup or delivery',
                '• Track your order in real-time',
                '• Access exclusive deals'
            ],
            action: () => navigate('/menu'),
            buttonText: 'Order Now'
        }
    ]

    return (
        <div className="guest-selection-page">
            <div className="guest-selection-container">
                <motion.div
                    className="guest-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="guest-title">
                        What brings you here <span className="text-orange">today</span>?
                    </h1>
                    <p className="guest-subtitle">
                        Choose your dining experience
                    </p>
                </motion.div>

                <div className="guest-options">
                    {guestOptions.map((option, index) => (
                        <motion.div
                            key={option.id}
                            className="guest-option-card"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                        >
                            <div className="option-icon">
                                <option.icon size={28} />
                            </div>
                            <h2 className="option-title">{option.title}</h2>
                            <p className="option-subtitle">{option.subtitle}</p>
                            <ul className="option-features">
                                {option.features.map((feature, i) => (
                                    <li key={i}>{feature}</li>
                                ))}
                            </ul>
                            <button
                                className="btn btn-primary option-btn"
                                onClick={option.action}
                            >
                                {option.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GuestSelection
