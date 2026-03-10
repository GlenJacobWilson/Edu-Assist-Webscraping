import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
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
      localStorage.setItem('token',     res.data.access_token);
      localStorage.setItem('user_name', res.data.user_name);
      if (res.data.semester)  localStorage.setItem('semester',  res.data.semester);
      if (res.data.is_admin !== undefined) localStorage.setItem('is_admin', res.data.is_admin);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <i className="fas fa-graduation-cap" />
          <h2>EduAssist</h2>
          <p>KTU Student Portal — Sign in to continue</p>
        </div>

        {error && <div className="auth-err"><i className="fas fa-exclamation-circle" /> {error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div style={{ position:'relative' }}>
            <i className="fas fa-envelope" style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)', color:'var(--gray)', fontSize:'0.85rem' }} />
            <input
              className="auth-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ paddingLeft:'2.5rem' }}
            />
          </div>
          <div style={{ position:'relative' }}>
            <i className="fas fa-lock" style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)', color:'var(--gray)', fontSize:'0.85rem' }} />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ paddingLeft:'2.5rem' }}
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <><i className="fas fa-circle-notch fa-spin" /> Signing in…</>
              : <><i className="fas fa-sign-in-alt" /> Sign In</>
            }
          </button>
        </form>

        <p className="auth-footer">
          New student? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
