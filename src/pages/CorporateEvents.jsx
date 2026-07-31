import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    User, Calendar, Building, Utensils, Clock,
    Check, ChevronRight, ChevronLeft, MapPin, Users
} from 'lucide-react'
import apiService from '../services/api'
import './CorporateEvents.css'

function CorporateEvents() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        eventType: '',
        date: '',
        time: '',
        guests: 20,
        venue: '',
        venueType: '',
        menuPackage: '',
        specialRequests: ''
    })

    const steps = [
        { id: 1, label: 'Info', icon: User, description: 'Contact Information' },
        { id: 2, label: 'Date & Style', icon: Calendar, description: 'Event Details' },
        { id: 3, label: 'Venue', icon: Building, description: 'Choose Location' },
        { id: 4, label: 'Menu', icon: Utensils, description: 'Select Package' },
        { id: 5, label: 'Timeline', icon: Clock, description: 'Review & Confirm' }
    ]

    const eventTypes = [
        'Company Dinner',
        'Team Building',
        'Client Meeting',
        'Product Launch',
        'Holiday Party',
        'Annual Celebration'
    ]

    const venues = [
        { id: 'main', name: 'Main Dining Hall', capacity: '50-100', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
        { id: 'private', name: 'Private Room A', capacity: '10-20', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400' },
        { id: 'vip', name: 'VIP Suite', capacity: '20-40', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400' },
        { id: 'rooftop', name: 'Rooftop Terrace', capacity: '30-80', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' }
    ]

    const menuPackages = [
        { id: 'standard', name: 'Standard Package', price: 'HK$488/person', description: '8-course set menu' },
        { id: 'premium', name: 'Premium Package', price: 'HK$688/person', description: '10-course set menu with seafood' },
        { id: 'deluxe', name: 'Deluxe Package', price: 'HK$888/person', description: '12-course banquet with premium selections' },
        { id: 'custom', name: 'Custom Menu', price: 'Contact for pricing', description: 'Tailored to your requirements' }
    ]

    const handleNext = async () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1)
        } else {
            const requiredFields = [
                formData.companyName,
                formData.contactName,
                formData.email,
                formData.phone,
                formData.eventType,
                formData.date,
                formData.time,
                formData.venue,
                formData.menuPackage
            ]

            if (requiredFields.some(value => !value)) {
                setSubmitError('Please complete all required event details before confirming.')
                return
            }

            setIsSubmitting(true)
            setSubmitError('')

            try {
                const event = await apiService.createEvent({
                    name: `${formData.companyName} - ${formData.eventType}`,
                    event_type: formData.eventType,
                    description: `${formData.eventType} for ${formData.companyName}`,
                    date: `${formData.date}T00:00:00`,
                    start_time: formData.time,
                    expected_guests: formData.guests,
                    company_name: formData.companyName,
                    contact_name: formData.contactName,
                    contact_email: formData.email,
                    contact_phone: formData.phone,
                    venue_preferences: {
                        venue: formData.venue,
                        menu_package: formData.menuPackage
                    },
                    special_requirements: formData.specialRequests || null
                })

                window.alert(`Corporate event request saved successfully. Event ID: ${event.id}`)
                navigate('/')
            } catch (error) {
                setSubmitError(error.message || 'Failed to save the corporate event request.')
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const updateFormData = (field, value) => {
        setFormData({ ...formData, [field]: value })
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="step-content">
                        <h2 className="step-title">Contact Information</h2>
                        <p className="step-description">Please provide your details for the event booking.</p>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Company Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Your company name"
                                    value={formData.companyName}
                                    onChange={(e) => updateFormData('companyName', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contact Person</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Your full name"
                                    value={formData.contactName}
                                    onChange={(e) => updateFormData('contactName', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="email@company.com"
                                    value={formData.email}
                                    onChange={(e) => updateFormData('email', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="input"
                                    placeholder="+852 XXXX XXXX"
                                    value={formData.phone}
                                    onChange={(e) => updateFormData('phone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="step-content">
                        <h2 className="step-title">Event Details</h2>
                        <p className="step-description">Tell us about your event.</p>

                        <div className="form-group">
                            <label className="form-label">Event Type</label>
                            <div className="option-grid">
                                {eventTypes.map(type => (
                                    <button
                                        key={type}
                                        className={`option-btn ${formData.eventType === type ? 'active' : ''}`}
                                        onClick={() => updateFormData('eventType', type)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Event Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={formData.date}
                                    onChange={(e) => updateFormData('date', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Start Time</label>
                                <select
                                    className="input"
                                    value={formData.time}
                                    onChange={(e) => updateFormData('time', e.target.value)}
                                >
                                    <option value="">Select time</option>
                                    <option value="11:30">11:30 AM</option>
                                    <option value="12:00">12:00 PM</option>
                                    <option value="18:00">6:00 PM</option>
                                    <option value="18:30">6:30 PM</option>
                                    <option value="19:00">7:00 PM</option>
                                    <option value="19:30">7:30 PM</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Number of Guests</label>
                                <div className="guest-input">
                                    <button onClick={() => updateFormData('guests', Math.max(10, formData.guests - 5))}>-</button>
                                    <span>{formData.guests}</span>
                                    <button onClick={() => updateFormData('guests', Math.min(200, formData.guests + 5))}>+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="step-content">
                        <h2 className="step-title">Select Venue</h2>
                        <p className="step-description">Choose the perfect space for your event.</p>

                        <div className="venue-grid">
                            {venues.map(venue => (
                                <div
                                    key={venue.id}
                                    className={`venue-card ${formData.venue === venue.id ? 'active' : ''}`}
                                    onClick={() => updateFormData('venue', venue.id)}
                                >
                                    <div className="venue-image">
                                        <img src={venue.image} alt={venue.name} />
                                        {formData.venue === venue.id && (
                                            <div className="venue-selected">
                                                <Check size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="venue-info">
                                        <h4>{venue.name}</h4>
                                        <p><Users size={14} /> Capacity: {venue.capacity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="step-content">
                        <h2 className="step-title">Select Menu Package</h2>
                        <p className="step-description">Choose a dining package for your guests.</p>

                        <div className="menu-package-grid">
                            {menuPackages.map(pkg => (
                                <div
                                    key={pkg.id}
                                    className={`menu-package-card ${formData.menuPackage === pkg.id ? 'active' : ''}`}
                                    onClick={() => updateFormData('menuPackage', pkg.id)}
                                >
                                    <div className="package-header">
                                        <h4>{pkg.name}</h4>
                                        <span className="package-price">{pkg.price}</span>
                                    </div>
                                    <p className="package-desc">{pkg.description}</p>
                                    {formData.menuPackage === pkg.id && (
                                        <Check size={20} className="package-check" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Special Requests</label>
                            <textarea
                                className="input"
                                placeholder="Dietary requirements, decorations, or other requests..."
                                value={formData.specialRequests}
                                onChange={(e) => updateFormData('specialRequests', e.target.value)}
                            />
                        </div>
                    </div>
                )
            case 5:
                return (
                    <div className="step-content">
                        <h2 className="step-title">Review & Confirm</h2>
                        <p className="step-description">Please review your booking details.</p>

                        <div className="review-card">
                            <div className="review-section">
                                <h4>Contact</h4>
                                <p>{formData.companyName}</p>
                                <p>{formData.contactName}</p>
                                <p>{formData.email}</p>
                            </div>
                            <div className="review-section">
                                <h4>Event</h4>
                                <p>{formData.eventType}</p>
                                <p>{formData.date} at {formData.time}</p>
                                <p>{formData.guests} guests</p>
                            </div>
                            <div className="review-section">
                                <h4>Venue & Menu</h4>
                                <p>{venues.find(v => v.id === formData.venue)?.name}</p>
                                <p>{menuPackages.find(m => m.id === formData.menuPackage)?.name}</p>
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="corporate-events-page">
            <div className="corporate-container">
                {/* Left Sidebar - Step Wizard */}
                <div className="step-sidebar">
                    <h3 className="sidebar-title">Book Corporate Event</h3>
                    <div className="step-list">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`step-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                            >
                                <div className="step-indicator">
                                    {currentStep > step.id ? (
                                        <Check size={16} />
                                    ) : (
                                        <span>{step.id}</span>
                                    )}
                                </div>
                                <div className="step-info">
                                    <span className="step-label">{step.label}</span>
                                    <span className="step-desc">{step.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="step-main">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStepContent()}
                    </motion.div>

                    {/* Navigation Buttons */}
                    <div className="step-navigation">
                        {submitError && (
                            <p className="error-message" role="alert">{submitError}</p>
                        )}
                        {currentStep > 1 && (
                            <button className="btn btn-outline nav-btn" onClick={handlePrevious}>
                                <ChevronLeft size={18} />
                                Previous Step
                            </button>
                        )}
                        <button
                            className="btn btn-primary nav-btn"
                            onClick={handleNext}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : currentStep === 5 ? 'Confirm Booking' : 'Next'}
                            {currentStep < 5 && <ChevronRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CorporateEvents
