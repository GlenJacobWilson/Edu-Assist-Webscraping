import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './App.css';

const GRADE_POINTS = { "S":10,"A+":9,"A":8.5,"B+":8,"B":7.5,"C+":7,"C":6.5,"D":6,"P":5.5,"F":0 };

const getColor = (v) => {
  const n = parseFloat(v);
  if (n >= 8.5) return '#10b981';
  if (n >= 7)   return '#2563eb';
  if (n >= 6)   return '#f59e0b';
  return '#ef4444';
};

const getGrade = (v) => {
  const n = parseFloat(v);
  if (n >= 9)   return 'Outstanding (O)';
  if (n >= 8)   return 'Excellent (A+)';
  if (n >= 7)   return 'Very Good (A)';
  if (n >= 6)   return 'Good (B+)';
  if (n >= 5.5) return 'Above Average (B)';
  if (n >= 5)   return 'Average (C)';
  return 'Pass (P)';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = parseFloat(payload[0].value);
    return (
      <div style={{ background: 'var(--white)', border: '1px solid var(--light-gray)', borderRadius: 'var(--r-md)', padding: '0.8rem 1.2rem', boxShadow: 'var(--shadow-md)' }}>
        <p style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: '0.2rem' }}>{label}</p>
        <p style={{ fontWeight: 800, fontSize: '1.4rem', color: getColor(val) }}>{val}</p>
        <p style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>{getGrade(val)}</p>
      </div>
    );
  }
  return null;
};

function GPACalculator() {
  const navigate = useNavigate();
  const [semester, setSemester] = useState('S1');
  const [subjects, setSubjects] = useState([{ id: 1, credit: 3, grade: 'S' }]);
  const [sgpa, setSgpa] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('gpa_history')) || [];
    setHistory(saved);
  }, []);

  const addSubject = () => setSubjects([...subjects, { id: Date.now(), credit: 3, grade: 'S' }]);
  const removeSubject = (id) => setSubjects(subjects.filter(s => s.id !== id));
  const handleChange = (id, field, val) => setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: val } : s));

  const calculateSGPA = () => {
    let pts = 0, cr = 0;
    subjects.forEach(s => { pts += GRADE_POINTS[s.grade] * parseFloat(s.credit); cr += parseFloat(s.credit); });
    const result = (pts / cr).toFixed(2);
    setSgpa(result);
    const entry = { name: semester, gpa: result };
    const idx = history.findIndex(h => h.name === semester);
    let updated = idx >= 0 ? history.map((h, i) => i === idx ? entry : h) : [...history, entry];
    updated.sort((a, b) => a.name.localeCompare(b.name));
    setHistory(updated);
    localStorage.setItem('gpa_history', JSON.stringify(updated));
  };

  const cgpa = history.length > 0 ? (history.reduce((a, h) => a + parseFloat(h.gpa), 0) / history.length).toFixed(2) : null;

  const selectStyle = { padding: '0.55rem 0.8rem', border: '1.5px solid var(--light-gray)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font)', fontSize: '0.88rem', color: 'var(--dark)', background: 'var(--white)', cursor: 'pointer', outline: 'none' };

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo"><i className="fas fa-graduation-cap" /><span>EduAssist</span></div>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.2rem', background: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 'var(--r-sm)', fontWeight: 600, fontSize: '0.88rem', fontFamily: 'var(--font)', cursor: 'pointer' }}>
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </button>
        </div>
      </nav>

      <div style={{ marginTop: 72, background: 'var(--bg)', minHeight: 'calc(100vh - 72px)' }}>
        <div className="container">

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.3rem' }}>
                <i className="fas fa-calculator" style={{ color: 'var(--primary)', marginRight: '0.6rem' }} /> GPA Manager
              </h1>
              <p style={{ color: 'var(--gray)' }}>KTU 2019 Scheme · Calculate and track your academic performance</p>
            </div>
            {cgpa && (
              <div style={{ background: 'var(--white)', border: '1px solid var(--light-gray)', borderRadius: 'var(--r-lg)', padding: '1rem 1.8rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Cumulative GPA</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: getColor(cgpa), lineHeight: 1 }}>{cgpa}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray)', marginTop: '0.3rem' }}>{getGrade(cgpa)}</div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

            {/* Calculator */}
            <div className="card">
              <div className="card-header">
                <h3><i className="fas fa-calculator" /> Calculate SGPA</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--gray)', fontWeight: 500 }}>Semester:</span>
                  <select value={semester} onChange={e => setSemester(e.target.value)} style={selectStyle}>
                    {['S1','S2','S3','S4','S5','S6','S7','S8'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <p style={{ color: 'var(--gray)', fontSize: '0.88rem', marginBottom: '1.2rem' }}>Enter subject grades to calculate your semester GPA</p>

              {/* Subject rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
                {subjects.map((sub, idx) => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.75rem 1rem', background: 'var(--bg)', borderRadius: 'var(--r-sm)', border: '1px solid var(--light-gray)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray)', fontWeight: 600, minWidth: 60 }}>Subject {idx + 1}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>Credit</span>
                      <select value={sub.credit} onChange={e => handleChange(sub.id, 'credit', e.target.value)} style={{ ...selectStyle, width: 56 }}>
                        {[4,3,2,1].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>Grade</span>
                      <select value={sub.grade} onChange={e => handleChange(sub.id, 'grade', e.target.value)} style={{ ...selectStyle, width: 64 }}>
                        {Object.keys(GRADE_POINTS).map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', minWidth: 28, textAlign: 'right' }}>
                      {(GRADE_POINTS[sub.grade] * sub.credit).toFixed(0)}
                    </span>
                    <button onClick={() => removeSubject(sub.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.9rem', padding: '0 4px', opacity: 0.7 }}>
                      <i className="fas fa-times" />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem' }}>
                <button onClick={addSubject} style={{ flex: 1, padding: '0.75rem', background: 'var(--bg)', color: 'var(--gray)', border: '1.5px dashed var(--light-gray)', borderRadius: 'var(--r-sm)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.88rem', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--light-gray)'; e.currentTarget.style.color = 'var(--gray)'; }}>
                  <i className="fas fa-plus" style={{ marginRight: '0.4rem' }} /> Add Subject
                </button>
                <button onClick={calculateSGPA} style={{ flex: 1, padding: '0.75rem', background: 'var(--primary)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-sm)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.88rem', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'none'; }}>
                  <i className="fas fa-calculator" style={{ marginRight: '0.4rem' }} /> Calculate CGPA
                </button>
              </div>

              {/* Result */}
              {sgpa && (
                <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.04) 100%)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 'var(--r-lg)', padding: '1.8rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '0.6rem' }}>Your SGPA for {semester}:</p>
                  <div style={{ fontSize: '4rem', fontWeight: 900, color: getColor(sgpa), lineHeight: 1, marginBottom: '0.5rem' }}>{sgpa}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)' }}>Grade: {getGrade(sgpa)}</div>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="card">
              <div className="card-header">
                <h3><i className="fas fa-chart-bar" /> Academic Performance</h3>
              </div>
              {history.length > 0 ? (
                <>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={history} barSize={32}>
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0,10]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.05)' }} />
                        <Bar dataKey="gpa" radius={[8,8,0,0]}>
                          {history.map((e, i) => <Cell key={i} fill={getColor(e.gpa)} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                    {[['#10b981','≥8.5 Outstanding'],['#2563eb','≥7.0 Good'],['#f59e0b','≥6.0 Average'],['#ef4444','<6.0 Needs Work']].map(([c,l]) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--gray)' }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{l}
                      </div>
                    ))}
                  </div>
                  {/* Semester list */}
                  <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {history.map(h => (
                      <div key={h.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'var(--bg)', borderRadius: 'var(--r-sm)', border: '1px solid var(--light-gray)' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--dark)' }}>{h.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <div style={{ width: 64, height: 5, background: 'var(--light-gray)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${(parseFloat(h.gpa)/10)*100}%`, height: '100%', background: getColor(h.gpa), borderRadius: 3 }} />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: getColor(h.gpa), minWidth: 36 }}>{h.gpa}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
                  <i className="fas fa-chart-bar" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }} />
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No data yet</p>
                  <p style={{ fontSize: '0.88rem' }}>Calculate your SGPA to see your academic chart here.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default GPACalculator;
