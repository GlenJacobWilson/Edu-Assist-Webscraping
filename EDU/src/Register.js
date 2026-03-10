import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Register() {
  const [form, setForm] = useState({ email:'', password:'', full_name:'', semester:'S1', department:'CS' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/register', form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <i className="fas fa-user-plus" />
          <h2>Create Account</h2>
          <p>Join EduAssist — KTU Student Portal</p>
        </div>

        {error && <div className="auth-err" style={{ marginBottom:'0.9rem' }}><i className="fas fa-exclamation-circle" /> {error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div style={{ position:'relative' }}>
            <i className="fas fa-user" style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)', color:'var(--gray)', fontSize:'0.85rem' }} />
            <input className="auth-input" type="text" placeholder="Full name" required onChange={set('full_name')} style={{ paddingLeft:'2.5rem' }} />
          </div>
          <div style={{ position:'relative' }}>
            <i className="fas fa-envelope" style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)', color:'var(--gray)', fontSize:'0.85rem' }} />
            <input className="auth-input" type="email" placeholder="Email address" required onChange={set('email')} style={{ paddingLeft:'2.5rem' }} />
          </div>
          <div style={{ position:'relative' }}>
            <i className="fas fa-lock" style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)', color:'var(--gray)', fontSize:'0.85rem' }} />
            <input className="auth-input" type="password" placeholder="Create a password" required onChange={set('password')} style={{ paddingLeft:'2.5rem' }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.7rem' }}>
            <div>
              <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--gray)', display:'block', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.4px' }}>Semester</label>
              <select className="auth-input" onChange={set('semester')} style={{ padding:'0.65rem 0.8rem', width:'100%' }}>
                {['S1','S2','S3','S4','S5','S6','S7','S8'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--gray)', display:'block', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.4px' }}>Department</label>
              <select className="auth-input" onChange={set('department')} style={{ padding:'0.65rem 0.8rem', width:'100%' }}>
                {['CSE','ECE','EEE','MECH','CIVIL','IT','BT'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading} style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
            {loading
              ? <><i className="fas fa-circle-notch fa-spin" /> Creating account…</>
              : <><i className="fas fa-user-plus" /> Create Account</>
            }
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
