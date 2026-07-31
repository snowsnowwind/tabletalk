import { useEffect, useState } from 'react'
import { AlertTriangle, Check, Heart, LogIn, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api'
import './DietaryOptions.css'

const dietaryChoices = [
    'Vegetarian',
    'Vegan',
    'Halal',
    'Gluten Free',
    'Lactose Free',
    'No Pork',
    'No Beef',
    'No Seafood',
    'Low Sodium',
]

const allergyChoices = [
    'Peanuts',
    'Tree Nuts',
    'Shellfish',
    'Fish',
    'Eggs',
    'Milk',
    'Soy',
    'Sesame',
]

const emptyPreferences = {
    dietary_restrictions: [],
    allergies: [],
    notes: '',
}

function DietaryOptions() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [preferences, setPreferences] = useState(emptyPreferences)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true

        apiService.getCurrentUser()
            .then((currentUser) => {
                if (!active) return
                const saved = currentUser.preferences?.dietary || {}
                setUser(currentUser)
                setPreferences({
                    dietary_restrictions: saved.dietary_restrictions || [],
                    allergies: saved.allergies || [],
                    notes: saved.notes || '',
                })
            })
            .catch(() => {
                if (active) setUser(null)
            })
            .finally(() => {
                if (active) setIsLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    const toggleChoice = (field, value) => {
        setMessage('')
        setPreferences((current) => ({
            ...current,
            [field]: current[field].includes(value)
                ? current[field].filter((item) => item !== value)
                : [...current[field], value],
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        setMessage('')
        setError('')

        try {
            const updatedUser = await apiService.updateDietaryPreferences({
                ...preferences,
                notes: preferences.notes.trim() || null,
            })
            const saved = updatedUser.preferences?.dietary || emptyPreferences
            setPreferences({
                dietary_restrictions: saved.dietary_restrictions || [],
                allergies: saved.allergies || [],
                notes: saved.notes || '',
            })
            setMessage('Your dietary preferences were saved to your account.')
        } catch (saveError) {
            setError(saveError.message || 'Could not save your dietary preferences.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <div className="dietary-state">Loading dietary preferences...</div>
    }

    if (!user) {
        return (
            <div className="dietary-page">
                <div className="dietary-login-card">
                    <Heart size={42} />
                    <h1>Save Your Dietary Options</h1>
                    <p>Please sign in so your dietary needs can be saved securely to your account.</p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate('/login', { state: { from: '/dietary-options' } })}
                    >
                        <LogIn size={18} />
                        Sign In to Continue
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="dietary-page">
            <div className="dietary-container">
                <header className="dietary-header">
                    <span className="dietary-kicker">Dining Profile</span>
                    <h1>Dietary Options</h1>
                    <p>
                        Signed in as <strong>{user.name}</strong>. Your selections will be saved
                        to your account.
                    </p>
                </header>

                <section className="dietary-card">
                    <h2>Dietary preferences</h2>
                    <p>Select all options that apply to you.</p>
                    <div className="dietary-choice-grid">
                        {dietaryChoices.map((choice) => {
                            const selected = preferences.dietary_restrictions.includes(choice)
                            return (
                                <button
                                    key={choice}
                                    type="button"
                                    className={`dietary-choice ${selected ? 'selected' : ''}`}
                                    onClick={() => toggleChoice('dietary_restrictions', choice)}
                                    aria-pressed={selected}
                                >
                                    {selected && <Check size={16} />}
                                    {choice}
                                </button>
                            )
                        })}
                    </div>
                </section>

                <section className="dietary-card allergy-card">
                    <h2>Food allergies</h2>
                    <p>Select any known allergies.</p>
                    <div className="dietary-warning">
                        <AlertTriangle size={18} />
                        Always confirm serious allergies directly with restaurant staff.
                    </div>
                    <div className="dietary-choice-grid">
                        {allergyChoices.map((choice) => {
                            const selected = preferences.allergies.includes(choice)
                            return (
                                <button
                                    key={choice}
                                    type="button"
                                    className={`dietary-choice ${selected ? 'selected allergy' : ''}`}
                                    onClick={() => toggleChoice('allergies', choice)}
                                    aria-pressed={selected}
                                >
                                    {selected && <Check size={16} />}
                                    {choice}
                                </button>
                            )
                        })}
                    </div>
                </section>

                <section className="dietary-card">
                    <label htmlFor="dietary-notes">Other requirements or notes</label>
                    <textarea
                        id="dietary-notes"
                        value={preferences.notes}
                        maxLength={1000}
                        onChange={(event) => {
                            setMessage('')
                            setPreferences((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }}
                        placeholder="For example: Please avoid cross-contact with peanuts."
                    />
                    <span className="dietary-character-count">
                        {preferences.notes.length}/1000
                    </span>
                </section>

                {message && <p className="dietary-success" role="status">{message}</p>}
                {error && <p className="dietary-error" role="alert">{error}</p>}

                <button
                    type="button"
                    className="btn btn-primary dietary-save"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Dietary Options'}
                </button>
            </div>
        </div>
    )
}

export default DietaryOptions
