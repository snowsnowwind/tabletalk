import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import apiService from '../services/api'
import './Register.css'

function Register() {
    const navigate = useNavigate()
    const location = useLocation()
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    })

    const updateField = (field, value) => {
        setFormData((current) => ({ ...current, [field]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('The passwords do not match.')
            return
        }

        setIsSubmitting(true)
        try {
            await apiService.register(
                formData.email,
                formData.password,
                formData.name,
                formData.phone || null,
            )
            await apiService.login(formData.email, formData.password)
            navigate(location.state?.from || '/preferences', { replace: true })
        } catch (registerError) {
            setError(registerError.message || 'Registration failed.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-header">
                    <span>Create Account</span>
                    <h1>Join TableTalk</h1>
                    <p>Your account stores your bookings and dietary options.</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    {error && <p className="register-error" role="alert">{error}</p>}

                    <label>
                        Full Name
                        <span className="register-input">
                            <User size={18} />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(event) => updateField('name', event.target.value)}
                                required
                                maxLength={100}
                            />
                        </span>
                    </label>

                    <label>
                        Email
                        <span className="register-input">
                            <Mail size={18} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(event) => updateField('email', event.target.value)}
                                required
                            />
                        </span>
                    </label>

                    <label>
                        Phone
                        <span className="register-input">
                            <Phone size={18} />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(event) => updateField('phone', event.target.value)}
                                maxLength={20}
                            />
                        </span>
                    </label>

                    <label>
                        Password
                        <span className="register-input">
                            <Lock size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(event) => updateField('password', event.target.value)}
                                minLength={8}
                                maxLength={128}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((current) => !current)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </span>
                    </label>

                    <label>
                        Confirm Password
                        <span className="register-input">
                            <Lock size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(event) => updateField('confirmPassword', event.target.value)}
                                minLength={8}
                                maxLength={128}
                                required
                            />
                        </span>
                    </label>

                    <button className="btn btn-primary register-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <p className="register-login-link">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/login', {
                                state: { from: location.state?.from },
                            })}
                        >
                            Sign in
                        </button>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Register
