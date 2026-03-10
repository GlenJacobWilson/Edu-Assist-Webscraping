import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './App.css';

const GRADE_POINTS = { "S": 10, "A+": 9, "A": 8.5, "B+": 8, "B": 7.5, "C+": 7, "C": 6.5, "D": 6, "P": 5.5, "F": 0 };

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const val = parseFloat(payload[0].value);
    const color = val >= 8 ? '#10b981' : val >= 6 ? '#f59e0b' : '#f43f5e';
    return (
      <div style={{ background: 'rgba(8,12,26,0.95)', border: `1px solid ${color}55`, borderRadius: 10, padding: '10px 16px', boxShadow: `0 0 20px ${color}33` }}>
        <p style={{ fontFamily: 'var(--font-display)', color, fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>{val}</p>
        <p style={{ color: 'var(--muted)', fontSize: '0.75rem', margin: '4px 0 0', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>SGPA</p>
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
  const [cgpa, setCgpa] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('gpa_history')) || [];
    setHistory(saved);
    if (saved.length > 0) {
      const total = saved.reduce((acc, h) => acc + parseFloat(h.gpa), 0);
      setCgpa((total / saved.length).toFixed(2));
    }
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
    if (updated.length > 0) {
      const total = updated.reduce((acc, h) => acc + parseFloat(h.gpa), 0);
      setCgpa((total / updated.length).toFixed(2));
    }
  };

  const getGradeColor = (val) => {
    const n = parseFloat(val);
    if (n >= 8.5) return '#10b981';
    if (n >= 7) return '#00d4ff';
    if (n >= 6) return '#f59e0b';
    return '#f43f5e';
  };

  const getGradeLabel = (val) => {
    const n = parseFloat(val);
    if (n >= 9) return 'OUTSTANDING';
    if (n >= 8) return 'EXCELLENT';
    if (n >= 7) return 'GOOD';
    if (n >= 6) return 'AVERAGE';
    return 'NEEDS WORK';
  };

  const selectStyle = {
    background: 'rgba(4,6,15,0.7)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--white)', borderRadius: 8, padding: '6px 10px',
    fontFamily: 'var(--font-body)', fontSize: '0.88rem', outline: 'none',
    cursor: 'pointer', transition: 'var(--transition)',
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="dashboard-header" style={{ marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: 'var(--font-display)', marginBottom: 6 }}>● ACADEMIC ANALYTICS</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, background: 'linear-gradient(135deg, #f0f4ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '1px' }}>
            GPA Intelligence
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.83rem', marginTop: 4 }}>KTU 2019 Scheme · Real-time calculation</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {cgpa && (
            <div style={{ textAlign: 'center', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 'var(--radius-md)', padding: '12px 20px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: getGradeColor(cgpa), textShadow: `0 0 20px ${getGradeColor(cgpa)}66` }}>{cgpa}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-display)', marginTop: 2 }}>Cumulative GPA</div>
            </div>
          )}
          <button onClick={() => navigate('/dashboard')} className="logout-btn" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', borderColor: 'rgba(139,92,246,0.4)' }}>
            ← Dashboard
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ── CALCULATOR ── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--cyan)', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
              ⚡ Calculate SGPA
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', letterSpacing: '1px', fontFamily: 'var(--font-display)' }}>SEM</span>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} style={selectStyle}>
                {['S1','S2','S3','S4','S5','S6','S7','S8'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Subject rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {subjects.map((sub, idx) => (
              <div key={sub.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', background: 'rgba(4,6,15,0.5)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', minWidth: 28 }}>#{idx + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '1px', fontFamily: 'var(--font-display)' }}>CR</span>
                  <select value={sub.credit} onChange={(e) => handleChange(sub.id, 'credit', e.target.value)} style={{ ...selectStyle, width: 55 }}>
                    {[4,3,2,1].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '1px', fontFamily: 'var(--font-display)' }}>GR</span>
                  <select value={sub.grade} onChange={(e) => handleChange(sub.id, 'grade', e.target.value)} style={{ ...selectStyle, width: 64 }}>
                    {Object.keys(GRADE_POINTS).map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', minWidth: 28, textAlign: 'right' }}>
                  {(GRADE_POINTS[sub.grade] * sub.credit).toFixed(0)}
                </div>
                <button onClick={() => removeSubject(sub.id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.85rem', padding: 4, opacity: 0.7, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.target.style.opacity = 1}
                  onMouseLeave={e => e.target.style.opacity = 0.7}
                >✕</button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button onClick={addSubject} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'var(--transition)' }}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.color = 'var(--white)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = 'var(--muted)'; }}
            >+ Add Subject</button>
            <button onClick={calculateSGPA} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.15))', border: '1px solid rgba(0,212,255,0.4)', borderRadius: 'var(--radius-sm)', color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '1px', transition: 'var(--transition)' }}
              onMouseEnter={e => e.target.style.boxShadow = '0 0 20px rgba(0,212,255,0.3)'}
              onMouseLeave={e => e.target.style.boxShadow = 'none'}
            >⚡ Calculate</button>
          </div>

          {/* Result */}
          {sgpa && (
            <div style={{ background: `rgba(${getGradeColor(sgpa) === '#10b981' ? '16,185,129' : getGradeColor(sgpa) === '#00d4ff' ? '0,212,255' : getGradeColor(sgpa) === '#f59e0b' ? '245,158,11' : '244,63,94'},0.08)`, border: `1px solid ${getGradeColor(sgpa)}44`, borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center', animation: 'fadeInUp 0.3s ease' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--muted)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>Result · {semester}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, color: getGradeColor(sgpa), textShadow: `0 0 30px ${getGradeColor(sgpa)}88`, lineHeight: 1 }}>{sgpa}</div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '3px', color: getGradeColor(sgpa), fontFamily: 'var(--font-display)', marginTop: 8, fontWeight: 600 }}>{getGradeLabel(sgpa)}</div>
            </div>
          )}
        </div>

        {/* ── CHART ── */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#a78bfa', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 24px' }}>
            📈 Performance Arc
          </h2>

          {history.length > 0 ? (
            <>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={history} barSize={28}>
                    <XAxis dataKey="name" tick={{ fill: 'rgba(180,200,240,0.5)', fontSize: 11, fontFamily: 'var(--font-display)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: 'rgba(180,200,240,0.4)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="gpa" radius={[8, 8, 0, 0]}>
                      {history.map((entry, i) => (
                        <Cell key={i} fill={getGradeColor(entry.gpa)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                {[['#10b981', '≥ 8.5 Outstanding'], ['#00d4ff', '≥ 7.0 Good'], ['#f59e0b', '≥ 6.0 Average'], ['#f43f5e', '< 6.0 Needs Work']].map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--muted)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                    {l}
                  </div>
                ))}
              </div>

              {/* Semester breakdown */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {history.map(h => (
                  <div key={h.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'rgba(4,6,15,0.4)', borderRadius: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', color: 'var(--muted)', letterSpacing: '1px' }}>{h.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${(parseFloat(h.gpa) / 10) * 100}%`, height: '100%', background: getGradeColor(h.gpa), borderRadius: 2 }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: getGradeColor(h.gpa), fontWeight: 700, minWidth: 32 }}>{h.gpa}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16, opacity: 0.4 }}>📊</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>No data yet</p>
              <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Calculate your first SGPA to see your academic arc.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GPACalculator;
