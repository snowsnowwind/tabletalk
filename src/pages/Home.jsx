import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, CircleDollarSign, Star, Utensils } from 'lucide-react'
import './Home.css'

const assistantActions = [
    {
        label: 'Make Reservations',
        icon: CalendarCheck,
        path: '/reservations',
    },
    {
        label: 'Menu Recommendation',
        icon: Star,
        path: '/menu',
    },
    {
        label: 'Dietary Options',
        icon: Utensils,
        path: '/dietary-options',
    },
    {
        label: 'Pricing Info',
        icon: CircleDollarSign,
        path: '/menu',
    },
]

function Home() {
    const navigate = useNavigate()

    return (
        <div className="home-page">
            <section className="assistant-hero" aria-labelledby="assistant-title">
                <div className="assistant-hero-background" aria-hidden="true" />

                <motion.p
                    className="assistant-kicker"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45 }}
                >
                    Customer AI Assistant
                </motion.p>

                <motion.div
                    className="assistant-hero-content"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                >
                    <h1 id="assistant-title">Welcome to Maxims!</h1>
                    <p>
                        I&apos;m your personal dining assistant. I can help with reservations,
                        menu recommendations, dietary questions, and more.
                    </p>
                    <p className="assistant-question">How may I assist you today?</p>

                    <div className="assistant-actions">
                        {assistantActions.map(({ label, icon: Icon, path }, index) => (
                            <motion.button
                                key={label}
                                type="button"
                                className="assistant-action"
                                onClick={() => navigate(path)}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 + index * 0.07 }}
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="assistant-action-icon" aria-hidden="true">
                                    <Icon size={30} strokeWidth={2.2} />
                                </span>
                                <strong>{label}</strong>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </section>
        </div>
    )
}

export default Home
