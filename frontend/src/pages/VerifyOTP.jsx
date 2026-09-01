/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const emailParam = searchParams.get('email') || user?.email || ''
    setEmail(emailParam)
  }, [searchParams, user])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
    setOtp(newOtp)
    const lastFilledIndex = Math.min(pasted.length, 5)
    const nextInput = document.getElementById(`otp-${lastFilledIndex}`)
    if (nextInput) nextInput.focus()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const otpString = otp.join('')

    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: otpString })
      if (res.data.success) {
        setSuccess('Email verified successfully! Redirecting...')
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setError(res.data.error || 'Verification failed')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/auth/resend-otp', { email })
      if (res.data.success) {
        setSuccess('New OTP sent to your email')
        setCountdown(60)
      } else {
        setError(res.data.error || 'Failed to resend OTP')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not connect to server')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '24px'
    }}>
      <form onSubmit={handleVerify} style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '40px', width: '100%', maxWidth: '440px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '1.5rem'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>
            Verify Your Email
          </h2>
          <p style={{ fontSize: '.85rem', color: 'var(--text-3)' }}>
            Enter the 6-digit code sent to<br />
            <strong style={{ color: 'var(--text)' }}>{email || 'your email'}</strong>
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px 14px',
            borderRadius: 'var(--radius-xs)', fontSize: '.85rem', marginBottom: '16px', textAlign: 'center'
          }}>{error}</div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '10px 14px',
            borderRadius: 'var(--radius-xs)', fontSize: '.85rem', marginBottom: '16px', textAlign: 'center'
          }}>{success}</div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
              style={{
                width: '50px', height: '56px', textAlign: 'center',
                fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--ff-mono)',
                borderRadius: 'var(--radius-xs)',
                border: '2px solid var(--border)', background: 'var(--bg-2)',
                color: 'var(--text)', outline: 'none', transition: 'all .3s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginBottom: '16px' }}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        <div style={{ textAlign: 'center' }}>
          {countdown > 0 ? (
            <p style={{ fontSize: '.85rem', color: 'var(--text-3)' }}>
              Resend code in {countdown}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              style={{
                background: 'none', border: 'none', color: 'var(--accent)',
                fontWeight: 600, fontSize: '.85rem', cursor: 'pointer',
                fontFamily: 'var(--ff)', padding: 0
              }}
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '.85rem', color: 'var(--text-3)', marginTop: '16px' }}>
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Back to Login</Link>
        </p>
      </form>
    </div>
  )
}
