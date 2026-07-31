import { useEffect, useMemo, useState } from 'react'
import {
    AlertCircle,
    Calendar,
    Clock,
    Heart,
    LogIn,
    LogOut,
    MapPin,
    Phone,
    Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api'
import './Preferences.css'

function Preferences() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [reservations, setReservations] = useState([])
    const [restaurants, setRestaurants] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [cancellingId, setCancellingId] = useState(null)

    useEffect(() => {
        let active = true

        const loadAccount = async () => {
            try {
                const currentUser = await apiService.getCurrentUser()
                const [userReservations, availableRestaurants] = await Promise.all([
                    apiService.getMyReservations(),
                    apiService.getRestaurants(),
                ])

                if (!active) return
                setUser(currentUser)
                setReservations(userReservations)
                setRestaurants(availableRestaurants)
            } catch (loadError) {
                if (!active) return
                if (!apiService.token) {
                    setUser(null)
                } else {
                    setError(loadError.message || 'Could not load your account.')
                }
            } finally {
                if (active) setIsLoading(false)
            }
        }

        loadAccount()

        return () => {
            active = false
        }
    }, [])

    const restaurantNames = useMemo(
        () => new Map(restaurants.map((restaurant) => [restaurant.id, restaurant.name])),
        [restaurants],
    )

    const dietary = user?.preferences?.dietary || {}
    const dietaryTags = [
        ...(dietary.dietary_restrictions || []),
        ...(dietary.allergies || []).map((allergy) => `${allergy} Allergy`),
    ]

    const handleLogout = () => {
        apiService.logout()
        navigate('/')
    }

    const handleCancel = async (reservationId) => {
        if (!window.confirm('Cancel this reservation?')) return

        setCancellingId(reservationId)
        setError('')
        try {
            await apiService.cancelReservation(reservationId)
            setReservations((current) => current.map((reservation) => (
                reservation.id === reservationId
                    ? { ...reservation, status: 'cancelled' }
                    : reservation
            )))
        } catch (cancelError) {
            setError(cancelError.message || 'Could not cancel this reservation.')
        } finally {
            setCancellingId(null)
        }
    }

    if (isLoading) {
        return <div className="account-state">Loading your account...</div>
    }

    if (!user) {
        return (
            <div className="account-page">
                <div className="account-login-card">
                    <LogIn size={42} />
                    <h1>Your TableTalk Account</h1>
                    <p>Sign in to see your profile, dietary options, and reservation history.</p>
                    <div className="account-login-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/login', { state: { from: '/preferences' } })}
                        >
                            Sign In
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => navigate('/register', { state: { from: '/preferences' } })}
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="account-page">
            <div className="account-container">
                <section className="account-profile-card">
                    <div className="account-avatar">
                        {user.name.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="account-profile-copy">
                        <span className="account-role">{user.role} account</span>
                        <h1>{user.name}</h1>
                        <p>{user.email}</p>
                        <p className="account-phone">
                            <Phone size={15} />
                            {user.phone || 'No phone number saved'}
                        </p>
                    </div>
                    <button className="account-logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        Exit Account
                    </button>
                </section>

                {error && (
                    <p className="account-error" role="alert">
                        <AlertCircle size={18} />
                        {error}
                    </p>
                )}

                <section className="account-dietary-card">
                    <div className="account-section-heading">
                        <div>
                            <span>Saved to PostgreSQL</span>
                            <h2>Dietary Options</h2>
                        </div>
                        <button
                            className="btn btn-outline"
                            onClick={() => navigate('/dietary-options')}
                        >
                            <Heart size={17} />
                            Edit Dietary Options
                        </button>
                    </div>

                    {dietaryTags.length > 0 ? (
                        <div className="account-tags">
                            {dietaryTags.map((tag) => <span key={tag}>{tag}</span>)}
                        </div>
                    ) : (
                        <p className="account-empty-copy">No dietary options saved yet.</p>
                    )}

                    {dietary.notes && (
                        <p className="account-dietary-notes">
                            <strong>Other notes:</strong> {dietary.notes}
                        </p>
                    )}
                </section>

                <section className="account-reservations">
                    <div className="account-section-heading">
                        <div>
                            <span>Connected to the backend</span>
                            <h2>My Reservations</h2>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/reservations')}
                        >
                            New Reservation
                        </button>
                    </div>

                    {reservations.length === 0 ? (
                        <div className="account-empty">
                            <Calendar size={38} />
                            <h3>No reservations yet</h3>
                            <p>Bookings made while signed in will appear here.</p>
                        </div>
                    ) : (
                        <div className="account-reservation-list">
                            {reservations.map((reservation) => (
                                <article className="account-reservation-card" key={reservation.id}>
                                    <div className="account-reservation-main">
                                        <div>
                                            <span className="account-code">
                                                #{reservation.confirmation_code}
                                            </span>
                                            <h3>
                                                {restaurantNames.get(reservation.restaurant_id)
                                                    || `Restaurant ${reservation.restaurant_id}`}
                                            </h3>
                                        </div>
                                        <span className={`account-status status-${reservation.status}`}>
                                            {reservation.status.replaceAll('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="account-reservation-details">
                                        <span>
                                            <Calendar size={16} />
                                            {new Date(reservation.date).toLocaleDateString()}
                                        </span>
                                        <span>
                                            <Clock size={16} />
                                            {reservation.time}
                                        </span>
                                        <span>
                                            <Users size={16} />
                                            {reservation.guests} guests
                                        </span>
                                        <span>
                                            <MapPin size={16} />
                                            {reservation.table_number
                                                ? `Table ${reservation.table_number}`
                                                : 'Table not assigned'}
                                        </span>
                                    </div>

                                    {reservation.special_requests && (
                                        <p className="account-request">
                                            <strong>Request:</strong> {reservation.special_requests}
                                        </p>
                                    )}

                                    {['pending', 'confirmed'].includes(reservation.status) && (
                                        <button
                                            className="account-cancel"
                                            onClick={() => handleCancel(reservation.id)}
                                            disabled={cancellingId === reservation.id}
                                        >
                                            {cancellingId === reservation.id
                                                ? 'Cancelling...'
                                                : 'Cancel Reservation'}
                                        </button>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default Preferences
