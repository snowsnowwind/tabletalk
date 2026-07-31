import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, X, Sparkles, MessageCircle } from 'lucide-react'
import apiService from '../services/api'
import {
    applyAssistantTurn,
    assistantMessageForDisplay,
    buildReservationPayload,
} from '../utils/booking'
import { useCart } from '../context/CartContext'
import './ChatBot.css'

function ChatBot({ isOpen, onClose }) {
    const { cart, removeFromCart, clearCart } = useCart()
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [quickReplies, setQuickReplies] = useState([])
    const [restaurants, setRestaurants] = useState(null)
    const [restaurantLoadError, setRestaurantLoadError] = useState(false)
    const [provider, setProvider] = useState(
        () => localStorage.getItem('aiProvider') || 'opencode_go',
    )
    const [aiProviders, setAiProviders] = useState(null)
    const [context, setContext] = useState({
        restaurant_id: null,
        date: null,
        time: null,
        guests: null,
        name: null,
        phone: null,
        special_requests: null
    })

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            handleBotResponse({
                response: "Hello! I can help with restaurant bookings, menu recommendations, dish prices, and other quick questions. What would you like to know? 🥢",
                quick_replies: ['Recommend dishes', 'View menu prices', 'Make a reservation']
            })
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        let cancelled = false
        setRestaurantLoadError(false)
        apiService.getAIStatus()
            .then((status) => {
                if (cancelled) return
                setAiProviders(status.providers || [])
                const selected = status.providers?.find(
                    (item) => item.id === provider && item.configured,
                )
                const fallback = status.providers?.find((item) => item.configured)
                if (!selected && fallback) {
                    setProvider(fallback.id)
                    localStorage.setItem('aiProvider', fallback.id)
                }
            })
            .catch((error) => {
                console.error('Failed to load AI provider status', error)
                if (!cancelled) setAiProviders([])
            })
        apiService.getRestaurants()
            .then((data) => {
                if (!cancelled) setRestaurants(data)
            })
            .catch((error) => {
                console.error('Failed to load restaurants for AI booking', error)
                if (!cancelled) {
                    setRestaurants([])
                    setRestaurantLoadError(true)
                }
            })

        return () => {
            cancelled = true
        }
    }, [isOpen, provider])

    const handleBotResponse = async (data) => {
        setIsTyping(false)

        if (data.action === 'remove_cart_item') {
            const itemId = Number(data.extracted_data?.cart_item_id)
            if (Number.isInteger(itemId)) removeFromCart(itemId)
        } else if (data.action === 'clear_cart') {
            clearCart()
        }

        // Add bot message
        const displayMessage = assistantMessageForDisplay(data)
        if (displayMessage) {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: displayMessage,
                timestamp: new Date()
            }])
        }

        const transition = applyAssistantTurn(context, data)
        const bookingData = transition.bookingData

        setContext(bookingData)

        // Set quick replies
        setQuickReplies(data.quick_replies || [])

        // Handle specific actions (e.g. if booking confirmed)
        if (transition.cancelled) {
            setQuickReplies([])
            return
        }

        if (transition.shouldPersist) {
            try {
                const restaurants = await apiService.getRestaurants()
                const { restaurant, payload } = buildReservationPayload(bookingData, restaurants)
                const confirmed = window.confirm(
                    `Confirm reservation:\nRestaurant: ${restaurant.name}\nDate: ${payload.date.slice(0, 10)} ${payload.time}\nGuests: ${payload.guests}\nName: ${payload.guest_name}\nPhone: ${payload.guest_phone}\nSpecial requests: ${payload.special_requests || 'None'}`,
                )
                if (!confirmed) return

                const reservation = await apiService.createReservation(payload)
                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: `Your reservation request has been saved. Confirmation code: ${reservation.confirmation_code}.`,
                    timestamp: new Date()
                }])
                setQuickReplies([])
                setContext({
                    restaurant_id: null,
                    date: null,
                    time: null,
                    guests: null,
                    name: null,
                    phone: null,
                    special_requests: null
                })
            } catch (error) {
                console.error('Failed to save reservation', error)
                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: error.message === 'restaurant selection is required'
                        ? 'Please select a restaurant before confirming your booking.'
                        : error.message || 'Sorry, there was a problem saving your reservation. Please try again later.',
                    timestamp: new Date()
                }])
            }
        }
    }

    const sendMessage = async (text) => {
        if (!text.trim()) return

        // Add user message
        const userMsg = { type: 'user', text, timestamp: new Date() }
        setMessages(prev => [...prev, userMsg])
        setInputValue('')
        setQuickReplies([])
        setIsTyping(true)

        try {
            // Call backend API
            // Pass recent history to AI context
            const history = messages.slice(-5).map(m => ({
                role: m.type === 'user' ? 'user' : 'model',
                content: m.text
            }))

            const response = await apiService.chatWithAssistant(
                text,
                history,
                {
                    ...context,
                    cart: cart.map(({ id, quantity }) => ({ id, quantity })),
                },
                provider,
            )
            await handleBotResponse(response)

        } catch (error) {
            console.error("Chat error:", error)
            setIsTyping(false)
            setMessages(prev => [...prev, {
                type: 'bot',
                text: "Sorry, I am having connection issues right now. You can book directly by calling +852 1234 5678.",
                timestamp: new Date()
            }])
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(inputValue)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="chatbot-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="chatbot-container glass-card"
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <Sparkles size={18} color="white" />
                            </div>
                            <div>
                                <h3>AI Assistant</h3>
                                <span className="chatbot-status">Bookings, menus, prices, and quick questions</span>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chatbot-restaurant-select">
                        <label htmlFor="chatbot-provider">AI provider</label>
                        <select
                            id="chatbot-provider"
                            value={provider}
                            onChange={(event) => {
                                setProvider(event.target.value)
                                localStorage.setItem('aiProvider', event.target.value)
                            }}
                            disabled={!aiProviders?.some((item) => item.configured)}
                        >
                            {(aiProviders || [
                                { id: 'opencode_go', name: 'OpenCode Go', configured: true },
                                { id: 'deepseek', name: 'DeepSeek', configured: true },
                            ]).map((item) => (
                                <option key={item.id} value={item.id} disabled={!item.configured}>
                                    {item.name}{item.configured ? '' : ' (not configured)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="chatbot-restaurant-select">
                        <label htmlFor="chatbot-restaurant">Restaurant</label>
                        <select
                            id="chatbot-restaurant"
                            value={context.restaurant_id ?? ''}
                            onChange={(event) => setContext((current) => ({
                                ...current,
                                restaurant_id: event.target.value ? Number(event.target.value) : null,
                            }))}
                            disabled={!restaurants?.length}
                        >
                            <option value="">
                                {restaurantLoadError
                                    ? 'Unable to load restaurants'
                                    : restaurants ? 'Select a restaurant' : 'Loading restaurants...'}
                            </option>
                            {restaurants?.map((restaurant) => (
                                <option key={restaurant.id} value={restaurant.id}>
                                    {restaurant.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                className={`message ${msg.type}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="message-content">
                                    <p>{msg.text}</p>
                                    <span className="message-time">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}

                        {isTyping && (
                            <div className="message bot typing">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    {quickReplies.length > 0 && (
                        <div className="quick-replies">
                            {quickReplies.map((reply, index) => (
                                <button
                                    key={index}
                                    className="quick-reply-btn"
                                    onClick={() => sendMessage(reply)}
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isTyping}
                        />
                        <button
                            className="send-btn"
                            onClick={() => sendMessage(inputValue)}
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export function ChatFloatingButton({ onClick }) {
    return (
        <motion.button
            className="chat-floating-btn"
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <MessageCircle size={24} />
            <span className="chat-btn-label">AI Chat</span>
        </motion.button>
    )
}

export default ChatBot
