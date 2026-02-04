import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Reservations from './pages/Reservations'
import PrivateEvents from './pages/PrivateEvents'
import AdminLayout from './pages/admin/AdminLayout'
import MenuManager from './pages/admin/MenuManager'
import StaffDashboard from './pages/StaffDashboard'
import AdminLogin from './pages/admin/Login'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="menu" element={<Menu />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="private-events" element={<PrivateEvents />} />
                <Route path="staff" element={<StaffDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<div style={{ padding: '20px' }}><h2>Welcome to Admin Dashboard</h2><p>Select an option from the sidebar.</p></div>} />
                <Route path="dashboard" element={<div style={{ padding: '20px' }}><h2>Dashboard Overview</h2><p>Statistics and quick actions will go here.</p></div>} />
                <Route path="menu" element={<MenuManager />} />
                <Route path="reservations" element={<StaffDashboard />} />
                <Route path="staff" element={<div style={{ padding: '20px' }}><h2>Staff Management</h2><p>Coming soon...</p></div>} />
                <Route path="settings" element={<div style={{ padding: '20px' }}><h2>Settings</h2><p>System configuration...</p></div>} />
            </Route>
        </Routes>
    )
}

export default App
