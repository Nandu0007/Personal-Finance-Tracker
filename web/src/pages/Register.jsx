import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, name, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-bg">
        <span className="auth-blob one" />
        <span className="auth-blob two" />
      </div>
      <div className="auth-card fade-in">
        <h2 style={{marginBottom: 4}}>Create your account</h2>
        <div className="subtitle">Join the Finance Tracker</div>
        <form onSubmit={onSubmit} className="form">
          <label>Email
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
          </label>
          <label>Name
            <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
          </label>
          <label>Password
            <div className="input-with-addon">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Choose a strong password" />
              <button type="button" className="input-addon" onClick={()=>setShowPassword(s=>!s)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="accent" disabled={loading}>{loading ? 'Registering…' : 'Register'}</button>
        </form>
        <p style={{marginTop:12}}>Have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}