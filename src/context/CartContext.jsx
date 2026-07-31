import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        // Load from localStorage on init
        const saved = localStorage.getItem('cart')
        return saved ? JSON.parse(saved) : []
    })

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart))
    }, [cart])

    const addToCart = (item) => {
        setCart(prevCart => {
            const existing = prevCart.find(c => c.id === item.id)
            if (existing) {
                return prevCart.map(c =>
                    c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
                )
            }
            return [...prevCart, { ...item, quantity: 1 }]
        })
    }

    const removeFromCart = (itemId) => {
        setCart(prevCart => prevCart.filter(c => c.id !== itemId))
    }

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId)
            return
        }
        setCart(prevCart =>
            prevCart.map(c => c.id === itemId ? { ...c, quantity } : c)
        )
    }

    const clearCart = () => {
        setCart([])
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const serviceCharge = subtotal * 0.1 // 10% service charge
    const total = subtotal + serviceCharge

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        serviceCharge,
        total
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export default CartContext
