import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  useEffect(() => {
    const remembered = localStorage.getItem('rememberEmail')
    if (remembered) {
      setEmail(remembered)
      setRemember(true)
    }
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      if (remember) localStorage.setItem('rememberEmail', email)
      else localStorage.removeItem('rememberEmail')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
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
        <h2 style={{marginBottom: 4}}>Welcome back</h2>
        <div className="subtitle">Sign in to continue</div>
        <form onSubmit={onSubmit} className="form">
          <label>Email
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
          </label>
          <label>Password
            <div className="input-with-addon">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Your password" />
              <button type="button" className="input-addon" onClick={()=>setShowPassword(s=>!s)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </label>
          <div className="form-row">
            <label style={{display:'flex', alignItems:'center', gap:8}}><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} /> Remember me</label>
            <a className="link-soft" href="#">Forgot password?</a>
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="accent" disabled={loading}>{loading ? <span className="spinner" /> : 'Login'}</button>
        </form>
        <p style={{marginTop:12}}>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  )
}