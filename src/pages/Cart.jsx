import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import './Cart.css'

function Cart() {
    const navigate = useNavigate()
    const { cart, updateQuantity, removeFromCart, clearCart, subtotal, serviceCharge, total } = useCart()
    const [couponCode, setCouponCode] = useState('')
    const [couponApplied, setCouponApplied] = useState(false)

    const handleApplyCoupon = () => {
        // Demo coupon logic
        if (couponCode.toLowerCase() === 'save10') {
            setCouponApplied(true)
        }
    }

    const handlePlaceOrder = () => {
        if (cart.length === 0) return
        navigate('/checkout')
    }

    if (cart.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-container">
                    <div className="cart-empty">
                        <ShoppingBag size={64} className="empty-icon" />
                        <h2>Your cart is empty</h2>
                        <p>Add some delicious dishes to get started!</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/menu')}
                        >
                            <ArrowLeft size={18} />
                            Back to Menu
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <h1 className="cart-title">My <span className="text-orange">Cart</span></h1>
                </div>

                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cart.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="cart-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="cart-item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="cart-item-info">
                                    <h3 className="cart-item-name">{item.name}</h3>
                                    <p className="cart-item-price">HKD {item.price}</p>
                                </div>
                                <div className="cart-item-actions">
                                    <div className="quantity-controls">
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button
                                            className="qty-btn qty-btn-add"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="cart-summary">
                        {/* Coupon Section */}
                        <div className="coupon-section">
                            <h3>Coupons</h3>
                            <div className="coupon-input-group">
                                <input
                                    type="text"
                                    className="coupon-input"
                                    placeholder="Coupon Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    disabled={couponApplied}
                                />
                                <button
                                    className="btn btn-coupon"
                                    onClick={handleApplyCoupon}
                                    disabled={couponApplied}
                                >
                                    {couponApplied ? 'Applied' : 'Apply Now'}
                                </button>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="order-details">
                            <h3>Your Order</h3>
                            <div className="order-row">
                                <span>Subtotal</span>
                                <span className="order-value">HKD {subtotal.toFixed(0)}</span>
                            </div>
                            <div className="order-row">
                                <span>Service Charge (10%)</span>
                                <span className="order-value">HKD {serviceCharge.toFixed(1)}</span>
                            </div>
                            {couponApplied && (
                                <div className="order-row discount">
                                    <span>Discount (SAVE10)</span>
                                    <span className="order-value">-HKD {(total * 0.1).toFixed(1)}</span>
                                </div>
                            )}
                            <div className="order-divider"></div>
                            <div className="order-row total">
                                <span>Total</span>
                                <span className="order-value">
                                    HKD {couponApplied ? (total * 0.9).toFixed(1) : total.toFixed(1)}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <button
                            className="btn btn-primary btn-place-order"
                            onClick={handlePlaceOrder}
                        >
                            Place Order
                        </button>
                        <button
                            className="btn btn-clear"
                            onClick={clearCart}
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
