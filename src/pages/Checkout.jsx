import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CreditCard, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import './Checkout.css'

// Payment method icons (simplified SVG representations)
const MastercardIcon = () => (
    <div className="payment-icon mastercard">
        <div className="mc-circles">
            <div className="mc-circle red"></div>
            <div className="mc-circle yellow"></div>
        </div>
        <span>mastercard</span>
    </div>
)

const VisaIcon = () => (
    <div className="payment-icon visa">
        <span>VISA</span>
    </div>
)

const PaypalIcon = () => (
    <div className="payment-icon paypal">
        <span className="pp">P</span>
        <span>PayPal</span>
    </div>
)

function Checkout() {
    const navigate = useNavigate()
    const { cart, subtotal, serviceCharge, total, clearCart } = useCart()

    const [paymentMethod, setPaymentMethod] = useState('mastercard')
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    })
    const [isProcessing, setIsProcessing] = useState(false)

    const updateForm = (field, value) => {
        setFormData({ ...formData, [field]: value })
    }

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\D/g, '')
        const groups = cleaned.match(/.{1,4}/g)
        return groups ? groups.join(' ').substring(0, 19) : ''
    }

    const formatExpiry = (value) => {
        const cleaned = value.replace(/\D/g, '')
        if (cleaned.length >= 2) {
            return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4)
        }
        return cleaned
    }

    const handlePay = async () => {
        if (!formData.firstName || !formData.lastName || !formData.cardNumber || !formData.expiry || !formData.cvv) {
            return
        }

        setIsProcessing(true)

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Clear cart and navigate to success
        clearCart()
        navigate('/payment-success', {
            state: {
                subtotal,
                serviceCharge,
                total
            }
        })
    }

    if (cart.length === 0) {
        navigate('/menu')
        return null
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <button className="back-btn" onClick={() => navigate('/cart')}>
                    <ArrowLeft size={18} />
                    Back to Cart
                </button>

                <h1 className="checkout-title">Checkout</h1>

                <div className="checkout-layout">
                    {/* Payment Form */}
                    <div className="payment-form">
                        {/* Payment Method Selection */}
                        <div className="form-section">
                            <h3>Payment Method</h3>
                            <div className="payment-methods">
                                <button
                                    className={`payment-method-btn ${paymentMethod === 'mastercard' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('mastercard')}
                                >
                                    <MastercardIcon />
                                    {paymentMethod === 'mastercard' && (
                                        <div className="check-badge">✓</div>
                                    )}
                                </button>
                                <button
                                    className={`payment-method-btn ${paymentMethod === 'visa' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('visa')}
                                >
                                    <VisaIcon />
                                    {paymentMethod === 'visa' && (
                                        <div className="check-badge">✓</div>
                                    )}
                                </button>
                                <button
                                    className={`payment-method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('paypal')}
                                >
                                    <PaypalIcon />
                                    {paymentMethod === 'paypal' && (
                                        <div className="check-badge">✓</div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="form-section">
                            <h3>Payment Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        className="checkout-input"
                                        value={formData.firstName}
                                        onChange={(e) => updateForm('firstName', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        className="checkout-input"
                                        value={formData.lastName}
                                        onChange={(e) => updateForm('lastName', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Card Number</label>
                                <div className="card-input-wrapper">
                                    <input
                                        type="text"
                                        className="checkout-input"
                                        placeholder="1234 5678 9012 3456"
                                        value={formData.cardNumber}
                                        onChange={(e) => updateForm('cardNumber', formatCardNumber(e.target.value))}
                                        maxLength={19}
                                    />
                                    <div className="card-brand-icon">
                                        {paymentMethod === 'mastercard' && <MastercardIcon />}
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expiration Date</label>
                                    <input
                                        type="text"
                                        className="checkout-input"
                                        placeholder="MM/YY"
                                        value={formData.expiry}
                                        onChange={(e) => updateForm('expiry', formatExpiry(e.target.value))}
                                        maxLength={5}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CVV / CVC</label>
                                    <input
                                        type="text"
                                        className="checkout-input"
                                        placeholder="123"
                                        value={formData.cvv}
                                        onChange={(e) => updateForm('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                                        maxLength={4}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-summary">
                        <div className="summary-card">
                            <h3>{cart.length} Items</h3>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span className="summary-value">HKD {subtotal.toFixed(0)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Service Charge (10%)</span>
                                <span className="summary-value">HKD {serviceCharge.toFixed(1)}</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row total">
                                <span>Total</span>
                                <span className="summary-total">HKD {total.toFixed(1)}</span>
                            </div>

                            <button
                                className="btn btn-primary btn-pay"
                                onClick={handlePay}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Pay'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
