import { useState } from 'react'
import { getOrCreateUser, getUserSessions, saveSession } from '../api/client'

export default function AuthPortal({ onAuth }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'guest'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.'))
      return setError('Please enter a valid email address.')
    if (!password)
      return setError('Please enter your password.')

    setLoading(true)
    try {
      const res = await getOrCreateUser(cleanEmail, password)
      if (res && res.error) {
        setError(res.error)
        setLoading(false)
        return
      }

      const userName = res?.name || cleanEmail.split('@')[0]
      const sessions = await getUserSessions(cleanEmail)
      onAuth({
        authenticated: true,
        guestUser: false,
        userEmail: cleanEmail,
        userName: userName,
        sessions: sessions || {}
      })
    } catch {
      setError('Connection error. Continuing locally.')
      onAuth({
        authenticated: true,
        guestUser: false,
        userEmail: cleanEmail,
        userName: cleanEmail.split('@')[0],
        sessions: {}
      })
    } finally {
      setLoading(false)
    }
  }

  function handleGuest() {
    onAuth({
      authenticated: true,
      guestUser: true,
      userEmail: null,
      userName: 'Guest',
      sessions: {}
    })
  }

  return (
    <div className="auth-overlay">
      <div className="auth-title">Crack My DSA</div>
      <div className="auth-subtitle">LeetCode Company Interview Assistant</div>

      <div className="auth-card">
        <h3>Connection Portal</h3>

        <div className="auth-tab-row">
          <button
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError('') }}
          >
            Sign In / Sign Up
          </button>
          <button
            className={`auth-tab ${mode === 'guest' ? 'active' : ''}`}
            onClick={() => { setMode('guest'); setError('') }}
          >
            Continue as Guest
          </button>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn}>
            <div className="auth-field">
              <label>Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(prev => !prev)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ marginTop: '0.25rem' }}
            >
              {loading ? 'Connecting…' : 'Connect Account'}
            </button>
          </form>
        ) : (
          <>
            <div className="auth-info">
              You can query the question database, but your chat sessions won&apos;t be saved permanently.
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button className="btn btn-primary" onClick={handleGuest}>
              Enter as Guest
            </button>
          </>
        )}
      </div>
    </div>
  )
}
