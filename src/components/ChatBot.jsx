import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Calendar, Clock, Users, Sparkles, X, MessageCircle } from 'lucide-react'
import './ChatBot.css'

// Chat bot state machine for reservation flow
const CHAT_STATES = {
    GREETING: 'greeting',
    ASK_DATE: 'ask_date',
    ASK_TIME: 'ask_time',
    ASK_GUESTS: 'ask_guests',
    ASK_NAME: 'ask_name',
    ASK_PHONE: 'ask_phone',
    ASK_SPECIAL: 'ask_special',
    CONFIRM: 'confirm',
    COMPLETE: 'complete'
}

const BOT_RESPONSES = {
    [CHAT_STATES.GREETING]: "Hello! Welcome to Maxim Palace. 🥢 I'm here to help you book a table. When would you like to dine with us?",
    [CHAT_STATES.ASK_DATE]: "What date would you like to reserve? (e.g., 'tomorrow', 'February 15', 'next Saturday')",
    [CHAT_STATES.ASK_TIME]: "Great! What time would you prefer? We're open 11:30 AM - 10:30 PM on weekdays.",
    [CHAT_STATES.ASK_GUESTS]: "How many guests will be joining?",
    [CHAT_STATES.ASK_NAME]: "May I have your name for the reservation?",
    [CHAT_STATES.ASK_PHONE]: "And your phone number so we can confirm?",
    [CHAT_STATES.ASK_SPECIAL]: "Any special requests? (dietary restrictions, occasion, seating preference) Just type 'none' if not.",
    [CHAT_STATES.CONFIRM]: "Perfect! Let me confirm your reservation:",
    [CHAT_STATES.COMPLETE]: "Your reservation is confirmed! 🎉 You'll receive a confirmation SMS shortly. We look forward to seeing you!"
}

function ChatBot({ isOpen, onClose, onReservationComplete }) {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [chatState, setChatState] = useState(CHAT_STATES.GREETING)
    const [reservation, setReservation] = useState({
        date: '',
        time: '',
        guests: '',
        name: '',
        phone: '',
        special: ''
    })
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Send initial greeting when chat opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            sendBotMessage(BOT_RESPONSES[CHAT_STATES.GREETING])
        }
    }, [isOpen])

    const sendBotMessage = (text) => {
        setIsTyping(true)
        setTimeout(() => {
            setMessages(prev => [...prev, { type: 'bot', text, timestamp: new Date() }])
            setIsTyping(false)
        }, 800)
    }

    const processUserInput = (input) => {
        const trimmedInput = input.trim().toLowerCase()
        let newReservation = { ...reservation }
        let nextState = chatState
        let botResponse = ''

        switch (chatState) {
            case CHAT_STATES.GREETING:
            case CHAT_STATES.ASK_DATE:
                // Parse date from natural language
                newReservation.date = input
                nextState = CHAT_STATES.ASK_TIME
                botResponse = BOT_RESPONSES[CHAT_STATES.ASK_TIME]
                break

            case CHAT_STATES.ASK_TIME:
                newReservation.time = input
                nextState = CHAT_STATES.ASK_GUESTS
                botResponse = BOT_RESPONSES[CHAT_STATES.ASK_GUESTS]
                break

            case CHAT_STATES.ASK_GUESTS:
                const guestCount = parseInt(input.match(/\d+/)?.[0]) || input
                newReservation.guests = guestCount
                nextState = CHAT_STATES.ASK_NAME
                botResponse = BOT_RESPONSES[CHAT_STATES.ASK_NAME]
                break

            case CHAT_STATES.ASK_NAME:
                newReservation.name = input
                nextState = CHAT_STATES.ASK_PHONE
                botResponse = BOT_RESPONSES[CHAT_STATES.ASK_PHONE]
                break

            case CHAT_STATES.ASK_PHONE:
                newReservation.phone = input
                nextState = CHAT_STATES.ASK_SPECIAL
                botResponse = BOT_RESPONSES[CHAT_STATES.ASK_SPECIAL]
                break

            case CHAT_STATES.ASK_SPECIAL:
                newReservation.special = trimmedInput === 'none' ? '' : input
                nextState = CHAT_STATES.CONFIRM
                botResponse = `${BOT_RESPONSES[CHAT_STATES.CONFIRM]}\n\n📅 Date: ${newReservation.date}\n⏰ Time: ${newReservation.time}\n👥 Guests: ${newReservation.guests}\n👤 Name: ${newReservation.name}\n📱 Phone: ${newReservation.phone}${newReservation.special ? `\n📝 Special: ${newReservation.special}` : ''}\n\nShall I confirm this reservation? (yes/no)`
                break

            case CHAT_STATES.CONFIRM:
                if (trimmedInput.includes('yes') || trimmedInput.includes('confirm') || trimmedInput === 'y') {
                    nextState = CHAT_STATES.COMPLETE
                    botResponse = BOT_RESPONSES[CHAT_STATES.COMPLETE]
                    if (onReservationComplete) {
                        onReservationComplete(newReservation)
                    }
                } else if (trimmedInput.includes('no') || trimmedInput === 'n') {
                    nextState = CHAT_STATES.GREETING
                    newReservation = { date: '', time: '', guests: '', name: '', phone: '', special: '' }
                    botResponse = "No problem! Let's start over. When would you like to dine with us?"
                } else {
                    botResponse = "Please reply 'yes' to confirm or 'no' to start over."
                }
                break

            case CHAT_STATES.COMPLETE:
                botResponse = "Your reservation is already confirmed! Is there anything else I can help you with? You can say 'new booking' to make another reservation."
                if (trimmedInput.includes('new') || trimmedInput.includes('another')) {
                    nextState = CHAT_STATES.GREETING
                    newReservation = { date: '', time: '', guests: '', name: '', phone: '', special: '' }
                    botResponse = "Sure! Let's book another table. When would you like to dine with us?"
                }
                break

            default:
                botResponse = "I'm not sure I understood. Can you please rephrase that?"
        }

        setReservation(newReservation)
        setChatState(nextState)
        return botResponse
    }

    const handleSend = () => {
        if (!inputValue.trim()) return

        // Add user message
        setMessages(prev => [...prev, { type: 'user', text: inputValue, timestamp: new Date() }])

        const userInput = inputValue
        setInputValue('')

        // Process and respond
        const botResponse = processUserInput(userInput)
        sendBotMessage(botResponse)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const quickReplies = {
        [CHAT_STATES.GREETING]: ['Tomorrow evening', 'This Saturday', 'Next week'],
        [CHAT_STATES.ASK_DATE]: ['Tomorrow', 'This Friday', 'Next Saturday'],
        [CHAT_STATES.ASK_TIME]: ['7:00 PM', '7:30 PM', '8:00 PM'],
        [CHAT_STATES.ASK_GUESTS]: ['2 people', '4 people', '6 people'],
        [CHAT_STATES.ASK_SPECIAL]: ['Window seat', 'Birthday celebration', 'None'],
        [CHAT_STATES.CONFIRM]: ['Yes, confirm', 'No, start over']
    }

    const currentQuickReplies = quickReplies[chatState] || []

    if (!isOpen) return null

    return (
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
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3>Maxim Palace Assistant</h3>
                            <span className="chatbot-status">
                                <span className="status-dot"></span>
                                Online
                            </span>
                        </div>
                    </div>
                    <button className="chatbot-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="chatbot-messages">
                    <AnimatePresence>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                className={`message ${msg.type}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="message-avatar">
                                    {msg.type === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="message-content">
                                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                                    <span className="message-time">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div
                            className="message bot typing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="message-avatar">
                                <Bot size={16} />
                            </div>
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {currentQuickReplies.length > 0 && (
                    <div className="quick-replies">
                        {currentQuickReplies.map((reply, index) => (
                            <button
                                key={index}
                                className="quick-reply-btn"
                                onClick={() => {
                                    setInputValue(reply)
                                    setTimeout(() => handleSend(), 100)
                                }}
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
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

// Floating chat button component
export function ChatFloatingButton({ onClick }) {
    return (
        <motion.button
            className="chat-floating-btn"
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
        >
            <MessageCircle size={24} />
            <span className="chat-btn-label">Chat to Book</span>
        </motion.button>
    )
}

export default ChatBot
