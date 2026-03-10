import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', semester: 'S1', department: 'CS' });
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
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '0.85rem 1rem' };
  const labelStyle = { display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--dark)', marginBottom: '0.5rem' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary-bg)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.6rem', color: 'var(--primary)' }}>
            <i className="fas fa-graduation-cap" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>EduAssist</h1>
          <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>KTU Student Registration</p>
        </div>

        <div className="card" style={{ padding: '2.2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.3rem' }}>Create Account</h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.8rem' }}>Fill in your details to get started</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}><i className="fas fa-user" style={{ color: 'var(--primary)', marginRight: '0.4rem' }} /> Full Name</label>
              <input type="text" placeholder="Your full name" required style={inputStyle}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
            </div>

            <div>
              <label style={labelStyle}><i className="fas fa-envelope" style={{ color: 'var(--primary)', marginRight: '0.4rem' }} /> Email Address</label>
              <input type="email" placeholder="student@ktu.edu.in" required style={inputStyle}
                onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div>
              <label style={labelStyle}><i className="fas fa-lock" style={{ color: 'var(--primary)', marginRight: '0.4rem' }} /> Password</label>
              <input type="password" placeholder="Create a password" required style={inputStyle}
                onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><i className="fas fa-layer-group" style={{ color: 'var(--primary)', marginRight: '0.4rem' }} /> Semester</label>
                <select value={formData.semester} style={{ ...inputStyle, padding: '0.85rem 1rem' }}
                  onChange={e => setFormData({ ...formData, semester: e.target.value })}>
                  {['S1','S2','S3','S4','S5','S6','S7','S8'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}><i className="fas fa-building" style={{ color: 'var(--primary)', marginRight: '0.4rem' }} /> Department</label>
                <input type="text" placeholder="CS / EC / ME" required style={inputStyle}
                  onChange={e => setFormData({ ...formData, department: e.target.value })} />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: '0.5rem', padding: '0.95rem',
                background: loading ? '#93c5fd' : 'var(--primary)',
                color: 'var(--white)', border: 'none',
                borderRadius: 'var(--r-sm)', fontSize: '1rem', fontWeight: 700,
                fontFamily: 'var(--font)', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {loading
                ? <><i className="fas fa-circle-notch fa-spin" /> Creating account...</>
                : <><i className="fas fa-user-plus" /> Create Account</>}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--gray)', fontSize: '0.9rem', borderTop: '1px solid var(--light-gray)', paddingTop: '1.2rem' }}>
            Already have an account?{' '}
            <Link to="/" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
