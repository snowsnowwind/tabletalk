import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, X, Sparkles, MessageCircle } from 'lucide-react'
import apiService from '../services/api'
import './ChatBot.css'

function ChatBot({ isOpen, onClose }) {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [quickReplies, setQuickReplies] = useState([])
    const [context, setContext] = useState({
        date: null,
        time: null,
        guests: null,
        name: null,
        phone: null
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
                response: "您好！我是 Table Talk 的 AI 预订助手。请问您想预订什么时候的位子？🥢",
                quick_replies: ['明天晚上', '这周六', '查看推荐']
            })
        }
    }, [isOpen])

    const handleBotResponse = (data) => {
        setIsTyping(false)

        // Add bot message
        if (data.response) {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: data.response,
                timestamp: new Date()
            }])
        }

        // Update context if data was extracted
        if (data.extracted_data) {
            setContext(prev => ({ ...prev, ...data.extracted_data }))
        }

        // Set quick replies
        setQuickReplies(data.quick_replies || [])

        // Handle specific actions (e.g. if booking confirmed)
        if (data.action === 'complete') {
            // Could trigger a toast or redirect here
            console.log("Booking completed!", data.extracted_data)
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

            const response = await apiService.chatWithAssistant(text, history, context)
            handleBotResponse(response)

        } catch (error) {
            console.error("Chat error:", error)
            setIsTyping(false)
            setMessages(prev => [...prev, {
                type: 'bot',
                text: "抱歉，我现在连接有点问题。您可以直接致电 +852 1234 5678 进行预订。",
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
                                <span className="chatbot-status">To help with your booking</span>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={onClose}>
                            <X size={20} />
                        </button>
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
