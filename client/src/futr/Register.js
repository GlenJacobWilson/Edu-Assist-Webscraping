import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

const InputField = ({ label, type = 'text', placeholder, required, onChange }) => (
  <div>
    <label style={{
      display: 'block', fontSize: '0.72rem', color: 'var(--muted)',
      letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8,
      fontFamily: 'var(--font-display)'
    }}>{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
      style={{
        width: '100%', padding: '12px 16px',
        fontSize: '0.92rem', borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(4,6,15,0.7)',
        color: 'var(--white)', fontFamily: 'var(--font-body)',
        outline: 'none', transition: 'var(--transition)',
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)'; }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
    />
  </div>
);

function Register() {
  const [formData, setFormData] = useState({
    email: '', password: '', full_name: '', semester: 'S1', department: 'CS'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/register', formData);
      alert('Registration Successful! Please Login.');
      navigate('/');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    width: '100%', padding: '12px 16px',
    fontSize: '0.92rem', borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(4,6,15,0.7)',
    color: 'var(--white)', fontFamily: 'var(--font-body)',
    outline: 'none', transition: 'var(--transition)', cursor: 'pointer'
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px', position: 'relative', zIndex: 1
    }}>
      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeInUp 0.5s ease both' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(0,212,255,0.2))',
            border: '1px solid rgba(139,92,246,0.4)',
            borderRadius: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.8rem',
            boxShadow: '0 0 30px rgba(139,92,246,0.2)'
          }}>🚀</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900,
            background: 'linear-gradient(135deg, #f0f4ff 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', letterSpacing: '2px', marginBottom: 6
          }}>CREATE ACCOUNT</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
            KTU Student Registration
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InputField label="Full Name" placeholder="Your full name" required
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />

            <InputField label="Email Address" type="email" placeholder="student@ktu.edu.in" required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

            <InputField label="Password" type="password" placeholder="••••••••" required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  style={selectStyle}
                >
                  {['S1','S2','S3','S4','S5','S6','S7','S8'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                  Department
                </label>
                <input
                  type="text"
                  placeholder="CS / EC / ME..."
                  required
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={selectStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8, padding: '14px',
                background: loading ? 'rgba(139,92,246,0.1)' : 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(0,212,255,0.15) 100%)',
                border: '1px solid rgba(139,92,246,0.4)',
                borderRadius: 'var(--radius-sm)',
                color: '#a78bfa', fontSize: '0.88rem',
                fontWeight: 700, fontFamily: 'var(--font-display)',
                letterSpacing: '2px', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => { if (!loading) e.target.style.boxShadow = '0 0 24px rgba(139,92,246,0.35)'; }}
              onMouseLeave={e => { e.target.style.boxShadow = 'none'; }}
            >
              {loading ? '⟳ Processing...' : '→ Register Account'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18 }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Already enrolled? </span>
            <Link to="/" style={{ color: 'var(--violet)', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}>
              Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
