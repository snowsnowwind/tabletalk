import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import apiService from '../services/api'
import './Login.css'

function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        try {
            await apiService.login(formData.email, formData.password)
            navigate(location.state?.from || '/guest-selection', { replace: true })
        } catch (loginError) {
            setError(loginError.message || 'Login failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <motion.div
                    className="login-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="login-header">
                        <h1 className="login-title">Welcome Back</h1>
                        <p className="login-subtitle">Sign in to continue to Maxim's</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {error && <p className="login-error" role="alert">{error}</p>}
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    className="input input-with-icon"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input input-with-icon"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-link">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary login-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div className="login-divider">
                            <span>or continue with</span>
                        </div>

                        <div className="social-buttons">
                            <button type="button" className="social-btn">
                                <img src="https://www.google.com/favicon.ico" alt="Google" />
                                Google
                            </button>
                            <button type="button" className="social-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                </svg>
                                GitHub
                            </button>
                        </div>

                        <p className="signup-link">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                className="signup-link-button"
                                onClick={() => navigate('/register', {
                                    state: { from: location.state?.from },
                                })}
                            >
                                Sign up
                            </button>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}

export default Login
