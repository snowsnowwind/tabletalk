import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react'
import apiService from '../../services/api'
import './Login.css'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const response = await apiService.login(email, password)
            if (response.access_token) {
                // Get user info to check role
                const user = await apiService.getCurrentUser()
                if (user.role === 'admin' || user.role === 'corporate') {
                    navigate('/admin/dashboard')
                } else {
                    setError('Access denied. Admin privileges required.')
                    apiService.logout()
                }
            }
        } catch (err) {
            console.error("Login verify error:", err)
            setError(err.message || 'Login failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="admin-login-container">
            <div className="admin-login-bg"></div>
            <motion.div
                className="admin-login-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="admin-login-header">
                    <div className="admin-logo">
                        <span>MP</span>
                    </div>
                    <h2>Admin Portal</h2>
                    <p>Table Talk Management System</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    {error && (
                        <motion.div
                            className="error-message"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <User size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-login"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="admin-login-footer">
                    <p>Protected System. Authorized Access Only.</p>
                </div>
            </motion.div>
        </div>
    )
}
