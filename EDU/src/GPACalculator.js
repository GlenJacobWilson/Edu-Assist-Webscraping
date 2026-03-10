import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './App.css';

const gradePoints = { S:10, 'A+':9, A:8.5, 'B+':8, B:7.5, 'C+':7, C:6.5, D:6, P:5.5, F:0 };
const SEMS = ['S1','S2','S3','S4','S5','S6','S7','S8'];

function gradeLabel(g) {
  if (g >= 9) return { label:'Outstanding', color:'#059669' };
  if (g >= 8) return { label:'Excellent', color:'#2563eb' };
  if (g >= 7) return { label:'Very Good', color:'#7c3aed' };
  if (g >= 6) return { label:'Good', color:'#d97706' };
  if (g >= 5) return { label:'Pass', color:'#64748b' };
  return { label:'Fail', color:'#dc2626' };
}

function GPACalculator() {
  const navigate = useNavigate();
  const [semester, setSemester]   = useState('S1');
  const [subjects, setSubjects]   = useState([{ id:1, name:'', credit:'3', grade:'S' }]);
  const [sgpa, setSgpa]           = useState(null);
  const [history, setHistory]     = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('gpa_history') || '[]');
    setHistory(saved);
  }, []);

  const addSubject = () => setSubjects(s => [...s, { id:Date.now(), name:'', credit:'3', grade:'S' }]);
  const delSubject = id => setSubjects(s => s.filter(x => x.id !== id));
  const upd = (id, f, v) => setSubjects(s => s.map(x => x.id === id ? { ...x, [f]: v } : x));

  const calculate = () => {
    let pts = 0, creds = 0;
    subjects.forEach(s => {
      pts   += gradePoints[s.grade] * parseFloat(s.credit);
      creds += parseFloat(s.credit);
    });
    const result = parseFloat((pts / creds).toFixed(2));
    setSgpa(result);

    const entry = { name: semester, gpa: result };
    const idx   = history.findIndex(h => h.name === semester);
    let upd2 = idx >= 0
      ? history.map((h,i) => i === idx ? entry : h)
      : [...history, entry].sort((a,b) => a.name.localeCompare(b.name));
    setHistory(upd2);
    localStorage.setItem('gpa_history', JSON.stringify(upd2));
  };

  const cgpa = history.length > 0
    ? (history.reduce((s,h) => s + parseFloat(h.gpa), 0) / history.length).toFixed(2)
    : null;

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo"><i className="fas fa-graduation-cap" /><span>EduAssist</span></div>
          <button className="nav-back-btn" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-arrow-left" /> Dashboard
          </button>
        </div>
      </nav>

      <div className="page-wrap">
        <div className="page-inner">

          {/* Header */}
          <div className="page-header-card">
            <div>
              <h1><i className="fas fa-calculator" style={{ marginRight:'0.6rem' }} />GPA Manager</h1>
              <p style={{ opacity:0.8, fontSize:'0.85rem', marginTop:'0.25rem' }}>KTU 2019 grading scheme — calculate & track your SGPA / CGPA</p>
            </div>
            {cgpa && (
              <div style={{ background:'rgba(255,255,255,0.15)', padding:'1rem 1.5rem', borderRadius:'var(--r-lg)', textAlign:'center', border:'1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize:'2.2rem', fontWeight:900, lineHeight:1 }}>{cgpa}</div>
                <div style={{ fontSize:'0.72rem', opacity:0.8, marginTop:'0.2rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>CGPA</div>
              </div>
            )}
          </div>

          <div className="grid">
            {/* ── Calculator ── */}
            <div className="card">
              <h3 className="title" style={{ fontSize:'1rem', marginBottom:'1.2rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <i className="fas fa-sliders-h" style={{ color:'var(--primary)' }} /> Calculate SGPA
              </h3>

              <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', marginBottom:'1.2rem' }}>
                <label style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--dark)', whiteSpace:'nowrap' }}>Semester</label>
                <select value={semester} onChange={e => setSemester(e.target.value)}
                  style={{ padding:'0.5rem 0.7rem', borderRadius:'var(--r-sm)', border:'1.5px solid var(--light-gray)', fontFamily:'var(--font)', fontSize:'0.88rem' }}>
                  {SEMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <table className="gpa-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th style={{ width:'70px' }}>Credits</th>
                    <th style={{ width:'80px' }}>Grade</th>
                    <th style={{ width:'30px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s, i) => (
                    <tr key={s.id}>
                      <td>
                        <input type="text" placeholder={`Subject ${i+1}`} value={s.name}
                          onChange={e => upd(s.id,'name',e.target.value)}
                          style={{ width:'100%', padding:'0.42rem 0.6rem', border:'1.5px solid var(--light-gray)', borderRadius:'var(--r-sm)', fontSize:'0.82rem' }} />
                      </td>
                      <td>
                        <select value={s.credit} onChange={e => upd(s.id,'credit',e.target.value)}>
                          {['1','2','3','4'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td>
                        <select value={s.grade} onChange={e => upd(s.id,'grade',e.target.value)}>
                          {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </td>
                      <td><button className="del-btn" onClick={() => delSubject(s.id)}><i className="fas fa-times" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display:'flex', gap:'0.7rem', marginTop:'0.5rem' }}>
                <button onClick={addSubject}
                  style={{ flex:1, padding:'0.6rem', background:'var(--bg)', border:'1.5px dashed var(--light-gray)', borderRadius:'var(--r-sm)', color:'var(--gray)', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', transition:'var(--transition)' }}>
                  <i className="fas fa-plus" /> Add Subject
                </button>
                <button onClick={calculate}
                  style={{ flex:1, padding:'0.6rem', background:'var(--primary)', color:'#fff', border:'none', borderRadius:'var(--r-sm)', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', transition:'var(--transition)' }}>
                  <i className="fas fa-calculator" /> Calculate
                </button>
              </div>

              {sgpa !== null && (
                <div className="sgpa-result">
                  <h3>SGPA — {semester}</h3>
                  <div className="sgpa-val">{sgpa}</div>
                  <div style={{ marginTop:'0.5rem', fontSize:'0.85rem', fontWeight:600, color: gradeLabel(sgpa).color }}>
                    {gradeLabel(sgpa).label}
                  </div>
                </div>
              )}
            </div>

            {/* ── Chart ── */}
            <div className="card">
              <h3 className="title" style={{ fontSize:'1rem', marginBottom:'1.2rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <i className="fas fa-chart-bar" style={{ color:'var(--primary)' }} /> Academic Performance
              </h3>
              {history.length > 0 ? (
                <>
                  <div style={{ width:'100%', height:260 }}>
                    <ResponsiveContainer>
                      <BarChart data={history} barSize={32}>
                        <XAxis dataKey="name" tick={{ fontFamily:'Poppins', fontSize:12 }} />
                        <YAxis domain={[0,10]} tick={{ fontFamily:'Poppins', fontSize:11 }} />
                        <Tooltip
                          formatter={v => [v, 'SGPA']}
                          contentStyle={{ fontFamily:'Poppins', fontSize:'0.85rem', borderRadius:'8px', border:'1px solid #e2e8f0' }}
                        />
                        <Bar dataKey="gpa" radius={[8,8,0,0]}>
                          {history.map((e,i) => (
                            <Cell key={i} fill={e.gpa >= 8 ? '#10b981' : e.gpa >= 6 ? '#f59e0b' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display:'flex', gap:'1.2rem', justifyContent:'center', marginTop:'0.9rem', fontSize:'0.75rem', color:'var(--gray)', fontWeight:600 }}>
                    <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#10b981', marginRight:4 }} />≥ 8.0 Excellent</span>
                    <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#f59e0b', marginRight:4 }} />≥ 6.0 Good</span>
                    <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#ef4444', marginRight:4 }} />Below 6</span>
                  </div>
                  <button onClick={() => { setHistory([]); localStorage.removeItem('gpa_history'); setSgpa(null); }}
                    style={{ display:'block', margin:'1rem auto 0', padding:'0.4rem 1rem', background:'none', border:'1px solid var(--light-gray)', borderRadius:'var(--r-sm)', color:'var(--gray)', fontSize:'0.8rem', cursor:'pointer' }}>
                    <i className="fas fa-trash" /> Clear history
                  </button>
                </>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-chart-bar" />
                  <p>No data yet. Calculate your SGPA to see your growth chart here.</p>
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
