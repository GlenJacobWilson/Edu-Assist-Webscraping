import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const getGrade = (cgpa) => {
  const g = parseFloat(cgpa);
  if (g >= 9.0)  return { label: 'Outstanding (O)',     color: '#7c3aed' };
  if (g >= 8.5)  return { label: 'Excellent (A+)',      color: '#2563eb' };
  if (g >= 8.0)  return { label: 'Very Good (A)',       color: '#0891b2' };
  if (g >= 7.0)  return { label: 'Good (B+)',           color: '#10b981' };
  if (g >= 6.0)  return { label: 'Above Average (B)',   color: '#f59e0b' };
  if (g >= 5.5)  return { label: 'Average (C)',         color: '#ef4444' };
  return              { label: 'Pass (P)',               color: '#6b7280' };
};

export default function GPACalculator() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gpas, setGpas] = useState(() => {
    const saved = localStorage.getItem('savedGPA');
    return saved ? JSON.parse(saved) : Array(8).fill('');
  });
  const [result, setResult] = useState(() => {
    const c = localStorage.getItem('calculatedCGPA');
    return c ? parseFloat(c) : null;
  });

  const updateGpa = (i, val) => {
    const next = [...gpas];
    next[i] = val;
    setGpas(next);
    localStorage.setItem('savedGPA', JSON.stringify(next));
  };

  const calculate = () => {
    let total = 0, count = 0;
    gpas.forEach(v => {
      const f = parseFloat(v);
      if (!isNaN(f) && f >= 0 && f <= 10) { total += f; count++; }
    });
    if (!count) return;
    const cgpa = parseFloat((total / count).toFixed(2));
    setResult(cgpa);
    localStorage.setItem('calculatedCGPA', String(cgpa));
  };

  const reset = () => {
    setGpas(Array(8).fill(''));
    setResult(null);
    localStorage.removeItem('savedGPA');
    localStorage.removeItem('calculatedCGPA');
  };

  const grade = result !== null ? getGrade(result) : null;

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <a href="/dashboard" className="logo" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>
            <i className="fas fa-graduation-cap"></i><span>EduAssist</span>
          </a>
          <div className="user-profile" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'S')}&background=2563eb&color=fff`} alt="avatar" />
            <span>{user?.name}</span>
          </div>
        </div>
      </nav>

      <div style={{ marginTop:'72px', padding:'2.5rem 2rem', maxWidth:'860px', margin:'72px auto 0' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'none', border:'none', color:'var(--primary)', fontWeight:600, cursor:'pointer', marginBottom:'1.5rem', fontSize:'0.95rem' }}
        >
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>

        <div className="card" style={{ marginBottom:'2rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', borderBottom:'2px solid var(--light-gray)', paddingBottom:'1rem' }}>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--dark)', display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <i className="fas fa-calculator" style={{ color:'var(--primary)' }}></i> GPA Manager
            </h2>
            <button
              onClick={reset}
              style={{ background:'none', border:'1.5px solid var(--accent)', color:'var(--accent)', padding:'0.4rem 1rem', borderRadius:'var(--r-sm)', fontWeight:600, cursor:'pointer', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'0.4rem' }}
            >
              <i className="fas fa-redo"></i> Reset
            </button>
          </div>

          <p style={{ color:'var(--gray)', marginBottom:'1.8rem', fontSize:'0.93rem' }}>
            Enter your semester-wise GPA (0–10) to calculate cumulative CGPA.
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'1.8rem' }}>
            {gpas.map((val, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                <label style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--dark)' }}>
                  Semester {i + 1} GPA
                </label>
                <input
                  type="number" min="0" max="10" step="0.01" placeholder="0.00"
                  value={val}
                  onChange={e => updateGpa(i, e.target.value)}
                  style={{ padding:'0.7rem', border:'1.5px solid var(--light-gray)', borderRadius:'var(--r-sm)', fontSize:'1rem', textAlign:'center' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--light-gray)'}
                />
              </div>
            ))}
          </div>

          <button
            onClick={calculate}
            style={{ width:'100%', padding:'0.95rem', background:'var(--primary)', color:'var(--white)', border:'none', borderRadius:'var(--r-md)', fontSize:'1.05rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
          >
            <i className="fas fa-calculator"></i> Calculate CGPA
          </button>

          {result !== null && grade && (
            <div style={{ marginTop:'2rem', background:'linear-gradient(135deg,rgba(37,99,235,0.06) 0%,rgba(139,92,246,0.06) 100%)', border:'1px solid rgba(37,99,235,0.15)', borderRadius:'var(--r-lg)', padding:'2rem', textAlign:'center' }}>
              <p style={{ color:'var(--gray)', marginBottom:'0.5rem', fontSize:'0.95rem' }}>Your Cumulative CGPA</p>
              <div style={{ fontSize:'4.5rem', fontWeight:900, color:grade.color, lineHeight:1 }}>{result}</div>
              <div style={{ marginTop:'0.8rem', fontSize:'1.2rem', fontWeight:700, color:'var(--dark)' }}>
                {grade.label}
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
