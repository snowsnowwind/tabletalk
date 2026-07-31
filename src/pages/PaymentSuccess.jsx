import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Check } from 'lucide-react'
import './PaymentSuccess.css'

function PaymentSuccess() {
    const navigate = useNavigate()
    const location = useLocation()

    // Get order details from navigation state
    const { subtotal = 0, serviceCharge = 0, total = 0 } = location.state || {}

    return (
        <div className="payment-success-page">
            <div className="payment-success-container">
                <motion.div
                    className="success-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Success Icon */}
                    <motion.div
                        className="success-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <Check size={48} strokeWidth={3} />
                    </motion.div>

                    {/* Success Message */}
                    <h1 className="success-title">Payment Successful</h1>
                    <p className="success-subtitle">Thank you for dining with us!</p>

                    {/* Ticket Divider */}
                    <div className="ticket-divider">
                        <div className="ticket-notch left"></div>
                        <div className="ticket-line"></div>
                        <div className="ticket-notch right"></div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <div className="summary-row">
                            <span className="summary-label">Subtotal</span>
                            <span className="summary-value">HKD {subtotal.toFixed(0)}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Service Charge (10%)</span>
                            <span className="summary-value">HKD {serviceCharge.toFixed(1)}</span>
                        </div>
                        <div className="summary-row total">
                            <span className="summary-label">Total</span>
                            <span className="summary-value">HKD {total.toFixed(1)}</span>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        className="btn btn-primary btn-continue"
                        onClick={() => navigate('/menu')}
                    >
                        Continue Shopping
                    </button>
                </motion.div>
            </div>
        </div>
    )
}

export default PaymentSuccess
