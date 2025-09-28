import './App.css'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { useTheme } from './ThemeContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Budgets from './pages/Budgets.jsx'
import Transactions from './pages/Transactions.jsx'
import Reports from './pages/Reports.jsx'

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function NavBar() {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggle } = useTheme()
  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/dashboard" className="brand">Finance Tracker</Link>
        {isAuthenticated && (
          <>
            <Link to="/budgets">Budgets</Link>
            <Link to="/transactions">Transactions</Link>
            <Link to="/reports">Reports</Link>
          </>
        )}
      </div>
      <div className="nav-right">
        {!isAuthenticated ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <span className="user">{user?.email}</span>
            <button className="logout" onClick={logout}>Logout</button>
          </>
        )}
        <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <div className="container">
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/budgets" element={<RequireAuth><Budgets /></RequireAuth>} />
        <Route path="/transactions" element={<RequireAuth><Transactions /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}
