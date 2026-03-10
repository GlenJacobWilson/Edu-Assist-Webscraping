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
      const res = await axios.post('http://127.0.0.1:8000/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user_name', res.data.user_name);
      if (res.data.semester) localStorage.setItem('semester', res.data.semester);
      localStorage.setItem('is_admin', res.data.is_admin);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      {/* Centered login card — same style as dashboard cards */}
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--primary-bg)', border: '2px solid var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', fontSize: '1.8rem', color: 'var(--primary)'
          }}>
            <i className="fas fa-graduation-cap" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>
            EduAssist
          </h1>
          <p style={{ color: 'var(--gray)', fontSize: '0.95rem' }}>KTU Student Portal</p>
        </div>

        <div className="card" style={{ padding: '2.2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.3rem' }}>Welcome back 👋</h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.8rem' }}>Sign in to access your dashboard</p>

          {error && (
            <div style={{
              background: 'var(--danger-bg)', border: '1px solid #fca5a5',
              borderLeft: '4px solid var(--danger)',
              color: '#b91c1c', padding: '0.85rem 1rem',
              borderRadius: 'var(--r-sm)', marginBottom: '1.4rem',
              fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--dark)', marginBottom: '0.5rem' }}>
                <i className="fas fa-envelope" style={{ color: 'var(--primary)', marginRight: '0.4rem' }} /> Email Address
              </label>
              <input
                type="email" placeholder="student@ktu.edu.in"
                value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '0.85rem 1rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--dark)', marginBottom: '0.5rem' }}>
                <i className="fas fa-lock" style={{ color: 'var(--primary)', marginRight: '0.4rem' }} /> Password
              </label>
              <input
                type="password" placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', padding: '0.85rem 1rem' }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: '0.5rem', padding: '0.95rem',
                background: loading ? '#93c5fd' : 'var(--primary)',
                color: 'var(--white)', border: 'none',
                borderRadius: 'var(--r-sm)', fontSize: '1rem',
                fontWeight: 700, fontFamily: 'var(--font)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: loading ? 'none' : 'var(--shadow-md)'
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-dark)'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--primary)'; }}
            >
              {loading
                ? <><i className="fas fa-circle-notch fa-spin" /> Signing in...</>
                : <><i className="fas fa-sign-in-alt" /> Sign In</>
              }
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--gray)', fontSize: '0.9rem', borderTop: '1px solid var(--light-gray)', paddingTop: '1.2rem' }}>
            New student?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray)', fontSize: '0.8rem' }}>
          <i className="fas fa-shield-alt" style={{ marginRight: '0.3rem' }} /> Secure · View-only student portal
        </p>
      </div>
    </div>
  );
}

export default Login;
