import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await axios.post('http://127.0.0.1:8000/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_name', response.data.user_name);
      if (response.data.semester) localStorage.setItem('semester', response.data.semester);
      localStorage.setItem('is_admin', response.data.is_admin);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed. Check credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Decorative orbs */}
      <div style={{
        position: 'fixed', top: '15%', left: '8%', width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed', bottom: '20%', right: '10%', width: 250, height: 250,
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%', maxWidth: 420,
        animation: 'fadeInUp 0.5s ease both'
      }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(0,212,255,0.4)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '2rem',
            boxShadow: '0 0 30px rgba(0,212,255,0.2)'
          }}>🎓</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #f0f4ff 0%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '2px',
            marginBottom: 6
          }}>NEURAL ACADEMY</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'var(--font-display)', fontWeight: 400 }}>KTU Student Portal</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 36 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            color: 'var(--cyan)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: 28,
            fontWeight: 600
          }}>Access Terminal</h2>

          {error && (
            <div style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.35)',
              color: '#fb7185',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 20,
              fontSize: '0.88rem',
              fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="student@ktu.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '13px 16px',
                  fontSize: '0.95rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(4,6,15,0.7)',
                  color: 'var(--white)', fontFamily: 'var(--font-body)',
                  outline: 'none', transition: 'var(--transition)',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '13px 16px',
                  fontSize: '0.95rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(4,6,15,0.7)',
                  color: 'var(--white)', fontFamily: 'var(--font-body)',
                  outline: 'none', transition: 'var(--transition)',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                padding: '14px',
                background: loading ? 'rgba(0,212,255,0.1)' : 'linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(139,92,246,0.2) 100%)',
                border: '1px solid rgba(0,212,255,0.4)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--cyan)',
                fontSize: '0.9rem',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.boxShadow = '0 0 24px rgba(0,212,255,0.35)'; e.target.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.3) 0%, rgba(139,92,246,0.3) 100%)'; } }}
              onMouseLeave={e => { e.target.style.boxShadow = 'none'; e.target.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(139,92,246,0.2) 100%)'; }}
            >
              {loading ? '⟳ Authenticating...' : '→ Initialize Session'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>New student? </span>
            <Link to="/register" style={{
              color: 'var(--cyan)',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.85rem',
              letterSpacing: '0.5px'
            }}>
              Create Access ID →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
