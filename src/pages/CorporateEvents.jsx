import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Building2, Calendar, Users, ChefHat, Clock,
    CheckCircle, ArrowRight, Plus, Sparkles,
    FileText, Download
} from 'lucide-react'
import './CorporateEvents.css'

function CorporateEvents() {
    const [currentStep, setCurrentStep] = useState(1)
    const [eventData, setEventData] = useState({
        eventType: '',
        date: '',
        time: '',
        guestCount: 50,
        budget: '',
        venue: '',
        menuPreferences: [],
        eventFlow: []
    })

    const steps = [
        { id: 1, title: 'Event Details', icon: Calendar },
        { id: 2, title: 'Menu Selection', icon: ChefHat },
        { id: 3, title: 'Event Flow', icon: Clock },
        { id: 4, title: 'Confirmation', icon: CheckCircle }
    ]

    const eventTypes = [
        { value: 'annual_dinner', label: 'Annual Dinner', emoji: '🎉' },
        { value: 'business_meeting', label: 'Business Meeting', emoji: '💼' },
        { value: 'team_building', label: 'Team Building', emoji: '🤝' },
        { value: 'client_dinner', label: 'Client Dinner', emoji: '🍷' },
        { value: 'celebration', label: 'Celebration', emoji: '🎊' },
        { value: 'conference', label: 'Conference', emoji: '📊' }
    ]

    const menuOptions = [
        { id: 1, name: 'Chinese Banquet Set A', description: '10-course traditional banquet', price: 688, perPerson: true },
        { id: 2, name: 'Chinese Banquet Set B', description: '12-course premium selection', price: 888, perPerson: true },
        { id: 3, name: 'Western Fine Dining', description: '5-course French-inspired', price: 998, perPerson: true },
        { id: 4, name: 'Fusion Experience', description: 'Best of East meets West', price: 788, perPerson: true },
        { id: 5, name: 'Vegetarian Special', description: 'Plant-based gourmet', price: 588, perPerson: true }
    ]

    const eventFlowTemplates = [
        { id: 'arrival', name: 'Guest Arrival', duration: '30 min', emoji: '🚪' },
        { id: 'cocktail', name: 'Cocktail Reception', duration: '45 min', emoji: '🍸' },
        { id: 'dinner', name: 'Dinner Service', duration: '90 min', emoji: '🍽️' },
        { id: 'speech', name: 'Speeches & Awards', duration: '30 min', emoji: '🎤' },
        { id: 'entertainment', name: 'Entertainment', duration: '45 min', emoji: '🎵' },
        { id: 'networking', name: 'Networking', duration: '30 min', emoji: '🤝' },
        { id: 'closing', name: 'Closing Remarks', duration: '15 min', emoji: '👋' }
    ]

    const toggleEventFlow = (item) => {
        setEventData(prev => {
            const exists = prev.eventFlow.find(e => e.id === item.id)
            if (exists) {
                return { ...prev, eventFlow: prev.eventFlow.filter(e => e.id !== item.id) }
            } else {
                return { ...prev, eventFlow: [...prev.eventFlow, item] }
            }
        })
    }

    const toggleMenu = (menuId) => {
        setEventData(prev => {
            if (prev.menuPreferences.includes(menuId)) {
                return { ...prev, menuPreferences: prev.menuPreferences.filter(id => id !== menuId) }
            } else {
                return { ...prev, menuPreferences: [...prev.menuPreferences, menuId] }
            }
        })
    }

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="step-content">
                        <h3>Event Details</h3>

                        <div className="form-section">
                            <label>Event Type</label>
                            <div className="event-type-grid">
                                {eventTypes.map(type => (
                                    <button
                                        key={type.value}
                                        className={`event-type-btn glass-card ${eventData.eventType === type.value ? 'active' : ''}`}
                                        onClick={() => setEventData(prev => ({ ...prev, eventType: type.value }))}
                                    >
                                        <span className="event-type-emoji">{type.emoji}</span>
                                        <span>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><Calendar size={16} /> Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={eventData.date}
                                    onChange={(e) => setEventData(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label><Clock size={16} /> Time</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={eventData.time}
                                    onChange={(e) => setEventData(prev => ({ ...prev, time: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><Users size={16} /> Expected Guests</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={eventData.guestCount}
                                    onChange={(e) => setEventData(prev => ({ ...prev, guestCount: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Budget per Person (HKD)</label>
                                <select
                                    className="input"
                                    value={eventData.budget}
                                    onChange={(e) => setEventData(prev => ({ ...prev, budget: e.target.value }))}
                                >
                                    <option value="">Select budget</option>
                                    <option value="500-700">$500 - $700</option>
                                    <option value="700-900">$700 - $900</option>
                                    <option value="900-1200">$900 - $1,200</option>
                                    <option value="1200+">$1,200+</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="step-content">
                        <h3>Menu Selection</h3>
                        <p className="step-description">
                            <Sparkles size={16} />
                            AI recommends menus based on your guest count and budget
                        </p>

                        <div className="menu-options">
                            {menuOptions.map(menu => (
                                <div
                                    key={menu.id}
                                    className={`menu-option glass-card ${eventData.menuPreferences.includes(menu.id) ? 'selected' : ''}`}
                                    onClick={() => toggleMenu(menu.id)}
                                >
                                    <div className="menu-option-info">
                                        <h4>{menu.name}</h4>
                                        <p>{menu.description}</p>
                                    </div>
                                    <div className="menu-option-price">
                                        <span className="price">${menu.price}</span>
                                        <span className="per-person">per person</span>
                                    </div>
                                    <div className="menu-option-check">
                                        {eventData.menuPreferences.includes(menu.id) ? (
                                            <CheckCircle size={24} />
                                        ) : (
                                            <Plus size={24} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="step-content">
                        <h3>Event Flow Builder</h3>
                        <p className="step-description">
                            <Sparkles size={16} />
                            Drag and arrange your event timeline
                        </p>

                        <div className="event-flow-builder">
                            <div className="flow-options">
                                <h4>Add to Timeline</h4>
                                <div className="flow-items-grid">
                                    {eventFlowTemplates.map(item => (
                                        <button
                                            key={item.id}
                                            className={`flow-item-btn ${eventData.eventFlow.find(e => e.id === item.id) ? 'added' : ''}`}
                                            onClick={() => toggleEventFlow(item)}
                                        >
                                            <span className="flow-emoji">{item.emoji}</span>
                                            <span className="flow-name">{item.name}</span>
                                            <span className="flow-duration">{item.duration}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flow-timeline">
                                <h4>Your Timeline</h4>
                                {eventData.eventFlow.length === 0 ? (
                                    <div className="flow-empty">
                                        <p>Click items above to add them to your timeline</p>
                                    </div>
                                ) : (
                                    <div className="timeline-items">
                                        {eventData.eventFlow.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                className="timeline-item glass-card"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="timeline-number">{index + 1}</div>
                                                <span className="timeline-emoji">{item.emoji}</span>
                                                <div className="timeline-info">
                                                    <span className="timeline-name">{item.name}</span>
                                                    <span className="timeline-duration">{item.duration}</span>
                                                </div>
                                                <button
                                                    className="timeline-remove"
                                                    onClick={() => toggleEventFlow(item)}
                                                >
                                                    ×
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )

            case 4:
                return (
                    <div className="step-content">
                        <h3>Confirmation</h3>

                        <div className="confirmation-summary glass-card">
                            <div className="summary-section">
                                <h4><Calendar size={18} /> Event Details</h4>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="label">Type</span>
                                        <span className="value">{eventTypes.find(t => t.value === eventData.eventType)?.label || 'Not selected'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Date</span>
                                        <span className="value">{eventData.date || 'Not selected'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Time</span>
                                        <span className="value">{eventData.time || 'Not selected'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Guests</span>
                                        <span className="value">{eventData.guestCount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="summary-section">
                                <h4><ChefHat size={18} /> Selected Menus</h4>
                                {eventData.menuPreferences.length > 0 ? (
                                    <ul className="summary-list">
                                        {eventData.menuPreferences.map(id => {
                                            const menu = menuOptions.find(m => m.id === id)
                                            return (
                                                <li key={id}>{menu?.name} - ${menu?.price}/person</li>
                                            )
                                        })}
                                    </ul>
                                ) : (
                                    <p className="no-selection">No menus selected</p>
                                )}
                            </div>

                            <div className="summary-section">
                                <h4><Clock size={18} /> Event Timeline</h4>
                                {eventData.eventFlow.length > 0 ? (
                                    <div className="summary-timeline">
                                        {eventData.eventFlow.map((item, index) => (
                                            <span key={item.id} className="summary-flow-item">
                                                {item.emoji} {item.name}
                                                {index < eventData.eventFlow.length - 1 && ' → '}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-selection">No timeline created</p>
                                )}
                            </div>

                            <div className="summary-actions">
                                <button className="btn btn-secondary">
                                    <FileText size={18} />
                                    Save as Draft
                                </button>
                                <button className="btn btn-primary">
                                    <Download size={18} />
                                    Export PDF
                                </button>
                            </div>
                        </div>

                        <div className="final-actions">
                            <button className="btn btn-accent btn-lg submit-btn">
                                <CheckCircle size={20} />
                                Submit Reservation Request
                            </button>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="corporate-page page">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="page-badge">
                        <Building2 size={14} />
                        Corporate Events
                    </span>
                    <h1 className="heading-display heading-2">
                        Plan Your <span className="text-gradient-gold">Corporate Event</span>
                    </h1>
                    <p className="page-subtitle">
                        From annual dinners to business meetings, let us help you create unforgettable experiences.
                    </p>
                </motion.div>

                {/* Stepper */}
                <motion.div
                    className="stepper"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
                        >
                            <div className="step-circle">
                                {currentStep > step.id ? (
                                    <CheckCircle size={20} />
                                ) : (
                                    <step.icon size={20} />
                                )}
                            </div>
                            <span className="step-title">{step.title}</span>
                            {index < steps.length - 1 && <div className="step-line" />}
                        </div>
                    ))}
                </motion.div>

                {/* Step Content */}
                <motion.div
                    className="step-container glass-card"
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderStep()}

                    {/* Navigation */}
                    <div className="step-navigation">
                        <button
                            className="btn btn-secondary"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                        >
                            Back
                        </button>
                        {currentStep < 4 && (
                            <button className="btn btn-primary" onClick={nextStep}>
                                Continue
                                <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default CorporateEvents
