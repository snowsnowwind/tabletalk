import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import GuestSelection from './pages/GuestSelection'
import Discover from './pages/Discover'
import RestaurantDetail from './pages/RestaurantDetail'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import Reservations from './pages/Reservations'
import CorporateEvents from './pages/CorporateEvents'
import Preferences from './pages/Preferences'
import DietaryOptions from './pages/DietaryOptions'
import StaffDashboard from './pages/StaffDashboard'
import Login from './pages/Login'
import Register from './pages/Register'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import MenuManager from './pages/admin/MenuManager'
import AdminLogin from './pages/admin/Login'

function App() {
    return (
        <CartProvider>
            <Routes>
                {/* Main Guest Routes */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="guest-selection" element={<GuestSelection />} />
                    <Route path="discover" element={<Discover />} />
                    <Route path="restaurant/:id" element={<RestaurantDetail />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="payment-success" element={<PaymentSuccess />} />
                    <Route path="reservations" element={<Reservations />} />
                    <Route path="corporate-events" element={<CorporateEvents />} />
                    <Route path="preferences" element={<Preferences />} />
                    <Route path="dietary-options" element={<DietaryOptions />} />
                    <Route path="staff" element={<StaffDashboard />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<div style={{ padding: '20px', background: '#0a0a0a', color: '#fff' }}><h2>Welcome to Admin Dashboard</h2><p>Select an option from the sidebar.</p></div>} />
                    <Route path="dashboard" element={<div style={{ padding: '20px', background: '#0a0a0a', color: '#fff' }}><h2>Dashboard Overview</h2><p>Statistics and quick actions will go here.</p></div>} />
                    <Route path="menu" element={<MenuManager />} />
                    <Route path="reservations" element={<StaffDashboard />} />
                    <Route path="staff" element={<div style={{ padding: '20px', background: '#0a0a0a', color: '#fff' }}><h2>Staff Management</h2><p>Coming soon...</p></div>} />
                    <Route path="settings" element={<div style={{ padding: '20px', background: '#0a0a0a', color: '#fff' }}><h2>Settings</h2><p>System configuration...</p></div>} />
                </Route>
            </Routes>
        </CartProvider>
    )
}

export default App
