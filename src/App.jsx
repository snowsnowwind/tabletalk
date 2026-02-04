import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Reservations from './pages/Reservations'
import PrivateEvents from './pages/PrivateEvents'
import StaffDashboard from './pages/StaffDashboard'

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
        </Routes>
    )
}

export default App
