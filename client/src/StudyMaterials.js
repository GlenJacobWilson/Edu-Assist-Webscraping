import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

const SEMESTERS = ['S1','S2','S3','S4','S5','S6','S7','S8'];

const BRANCHES = [
  { key:'CSE',   label:'Computer Science',    short:'CSE',   icon:'fas fa-laptop-code',  color:'#2563eb', bg:'rgba(37,99,235,0.1)'  },
  { key:'ECE',   label:'Electronics & Comm.', short:'ECE',   icon:'fas fa-microchip',    color:'#8b5cf6', bg:'rgba(139,92,246,0.1)' },
  { key:'MECH',  label:'Mechanical',          short:'MECH',  icon:'fas fa-cogs',         color:'#f59e0b', bg:'rgba(245,158,11,0.1)' },
  { key:'CIVIL', label:'Civil',               short:'CIVIL', icon:'fas fa-hard-hat',     color:'#10b981', bg:'rgba(16,185,129,0.1)' },
  { key:'IT',    label:'Information Tech.',   short:'IT',    icon:'fas fa-server',       color:'#06b6d4', bg:'rgba(6,182,212,0.1)'  },
  { key:'EEE',   label:'Electrical',          short:'EEE',   icon:'fas fa-bolt',         color:'#ef4444', bg:'rgba(239,68,68,0.1)'  },
];

const DEPT_TO_BRANCH = {
  CS:'CSE', CSE:'CSE', EC:'ECE', ECE:'ECE',
  ME:'MECH', MECH:'MECH', CE:'CIVIL', CIVIL:'CIVIL',
  IT:'IT', EE:'EEE', EEE:'EEE',
};

function StudyMaterials() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Defaults from localStorage (set during login)
  const storedSem  = localStorage.getItem('semester')   || 'S6';
  const storedDept = localStorage.getItem('department') || '';
  const initBranch = DEPT_TO_BRANCH[storedDept?.toUpperCase()] || 'CSE';

  const [semester, setSemester]   = useState(storedSem);
  const [branch, setBranch]       = useState(initBranch);
  const [tab, setTab]             = useState('notes');  // 'notes' | 'qp'

  const [subjects, setSubjects]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const [selected, setSelected]   = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [detailLoad, setDetailLoad] = useState(false);

  useEffect(() => { if (!token) navigate('/'); }, [token, navigate]);

  // Also try to pull fresh user profile from /me to get department
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.semester) setSemester(res.data.semester);
        if (res.data.department) {
          const br = DEPT_TO_BRANCH[res.data.department.toUpperCase()];
          if (br) setBranch(br);
          localStorage.setItem('department', res.data.department);
        }
      } catch {}
    };
    if (token) fetchMe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError('');
    setSubjects([]);
    setSelected(null);
    setDownloads([]);
    try {
      const res = await axios.get('http://127.0.0.1:8000/materials', {
        params: { semester, branch, type: tab },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Could not fetch from ktunotes.in. Check your backend is running.');
    } finally {
      setLoading(false);
    }
  }, [semester, branch, tab, token]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const openSubject = async (sub) => {
    if (selected?.url === sub.url) { setSelected(null); return; }
    setSelected(sub);
    setDownloads([]);
    setDetailLoad(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/materials/subject', {
        params: { url: sub.url },
        headers: { Authorization: `Bearer ${token}` },
      });
      setDownloads(res.data.downloads || []);
    } catch {
      setDownloads([]);
    } finally {
      setDetailLoad(false);
    }
  };

  const activeBranch = BRANCHES.find(b => b.key === branch) || BRANCHES[0];

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo"><i className="fas fa-graduation-cap" /><span>EduAssist</span></div>
          <button onClick={() => navigate('/dashboard')} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 1.2rem', background:'var(--primary-bg)', color:'var(--primary)', border:'1px solid rgba(37,99,235,0.3)', borderRadius:'var(--r-sm)', fontWeight:600, fontSize:'0.88rem', fontFamily:'var(--font)', cursor:'pointer' }}>
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </button>
        </div>
      </nav>

      <div style={{ marginTop:72, background:'var(--bg)', minHeight:'calc(100vh - 72px)' }}>
        <div className="container" style={{ maxWidth:1100 }}>

          {/* PAGE HEADER */}
          <div style={{ marginBottom:'1.8rem' }}>
            <h1 style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--dark)', marginBottom:'0.3rem' }}>
              <i className="fas fa-book" style={{ color:'var(--primary)', marginRight:'0.6rem' }} />
              Study Materials
            </h1>
            <p style={{ color:'var(--gray)' }}>
              KTU 2019 Scheme — sourced from{' '}
              <a href="https://www.ktunotes.in" target="_blank" rel="noopener noreferrer" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>ktunotes.in</a>
            </p>
          </div>

          {/* STEP 1 — SEMESTER */}
          <div className="card" style={{ marginBottom:'1.2rem', padding:'1.2rem 1.6rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.2rem', flexWrap:'wrap' }}>
              <span style={{ fontSize:'0.88rem', fontWeight:700, color:'var(--dark)', minWidth:90 }}>
                <i className="fas fa-layer-group" style={{ color:'var(--primary)', marginRight:'0.4rem' }} /> Semester
              </span>
              <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                {SEMESTERS.map(s => (
                  <button key={s} onClick={() => setSemester(s)} style={{
                    padding:'0.45rem 0.95rem', borderRadius:8,
                    fontWeight:700, fontSize:'0.85rem', fontFamily:'var(--font)',
                    cursor:'pointer', border:'1.5px solid', transition:'var(--transition)',
                    borderColor: semester === s ? 'var(--primary)' : 'var(--light-gray)',
                    background:  semester === s ? 'var(--primary)' : 'var(--white)',
                    color:       semester === s ? '#fff' : 'var(--gray)',
                    boxShadow:   semester === s ? 'var(--shadow-sm)' : 'none',
                  }}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2 — BRANCH (hidden for S1/S2 — common) */}
          {!['S1','S2'].includes(semester) && (
            <div className="card" style={{ marginBottom:'1.2rem', padding:'1.2rem 1.6rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1.2rem', flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.88rem', fontWeight:700, color:'var(--dark)', minWidth:90 }}>
                  <i className="fas fa-building" style={{ color:'var(--primary)', marginRight:'0.4rem' }} /> Branch
                </span>
                <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                  {BRANCHES.map(b => {
                    const active = branch === b.key;
                    return (
                      <button key={b.key} onClick={() => setBranch(b.key)} style={{
                        display:'flex', alignItems:'center', gap:'0.5rem',
                        padding:'0.55rem 1.1rem', borderRadius:'var(--r-sm)',
                        fontWeight:600, fontSize:'0.88rem', fontFamily:'var(--font)',
                        cursor:'pointer', border:'1.5px solid', transition:'var(--transition)',
                        borderColor: active ? b.color : 'var(--light-gray)',
                        background:  active ? b.bg    : 'var(--white)',
                        color:       active ? b.color : 'var(--gray)',
                        boxShadow:   active ? 'var(--shadow-sm)' : 'none',
                      }}>
                        <i className={b.icon} style={{ fontSize:'0.85rem' }} />
                        {b.short}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — TAB (Notes / QP) */}
          <div style={{ display:'flex', gap:'0', marginBottom:'1.5rem', background:'var(--white)', border:'1.5px solid var(--light-gray)', borderRadius:'var(--r-md)', padding:'4px', width:'fit-content', boxShadow:'var(--shadow-sm)' }}>
            {[
              { key:'notes', label:'Notes',                  icon:'fas fa-book-open'  },
              { key:'qp',    label:'Previous Year Questions', icon:'fas fa-file-alt'  },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display:'flex', alignItems:'center', gap:'0.5rem',
                padding:'0.65rem 1.5rem', borderRadius:8,
                fontWeight:600, fontSize:'0.9rem', fontFamily:'var(--font)',
                cursor:'pointer', border:'none', transition:'var(--transition)',
                background: tab === t.key ? 'var(--primary)' : 'transparent',
                color:      tab === t.key ? '#fff' : 'var(--gray)',
                boxShadow:  tab === t.key ? 'var(--shadow-sm)' : 'none',
              }}>
                <i className={t.icon} /> {t.label}
              </button>
            ))}
          </div>

          {/* RESULTS */}
          <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap:'1.5rem', alignItems:'start' }}>

            {/* Subject list */}
            <div>
              {/* Section heading */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.7rem' }}>
                  <div style={{ width:36, height:36, borderRadius:8, background: activeBranch.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className={activeBranch.icon} style={{ color: activeBranch.color, fontSize:'1rem' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--dark)' }}>
                      {tab === 'notes' ? 'Notes' : 'Previous Year Questions'} · {semester} {['S1','S2'].includes(semester) ? '(Common)' : activeBranch.label}
                    </div>
                    {!loading && subjects.length > 0 && (
                      <div style={{ fontSize:'0.78rem', color:'var(--gray)' }}>{subjects.length} subjects found</div>
                    )}
                  </div>
                </div>
                <button onClick={fetchSubjects} title="Refresh" style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--white)', border:'1px solid var(--light-gray)', borderRadius:8, cursor:'pointer', color:'var(--gray)', transition:'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.color='var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--light-gray)'; e.currentTarget.style.color='var(--gray)'; }}>
                  <i className="fas fa-redo" style={{ fontSize:'0.8rem' }} />
                </button>
              </div>

              {/* States */}
              {loading ? (
                <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
                  <i className="fas fa-circle-notch fa-spin" style={{ fontSize:'2rem', color:'var(--primary)', display:'block', marginBottom:'1rem' }} />
                  <p style={{ color:'var(--gray)', fontWeight:500 }}>Fetching from ktunotes.in...</p>
                  <p style={{ color:'var(--gray)', fontSize:'0.82rem', marginTop:'0.3rem' }}>This may take a few seconds</p>
                </div>
              ) : error ? (
                <div className="card" style={{ borderLeft:'4px solid var(--danger)', background:'#fef2f2', textAlign:'center', padding:'2rem' }}>
                  <i className="fas fa-exclamation-triangle" style={{ color:'var(--danger)', fontSize:'1.5rem', display:'block', marginBottom:'0.8rem' }} />
                  <p style={{ color:'#b91c1c', fontWeight:600, marginBottom:'1rem' }}>{error}</p>
                  <button onClick={fetchSubjects} style={{ padding:'0.55rem 1.2rem', background:'var(--primary)', color:'#fff', border:'none', borderRadius:'var(--r-sm)', fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' }}>
                    <i className="fas fa-redo" style={{ marginRight:'0.4rem' }} /> Retry
                  </button>
                </div>
              ) : subjects.length === 0 ? (
                <div className="card" style={{ textAlign:'center', padding:'3rem', color:'var(--gray)' }}>
                  <i className="fas fa-folder-open" style={{ fontSize:'2.5rem', opacity:0.3, display:'block', marginBottom:'1rem' }} />
                  <p style={{ fontWeight:600 }}>No subjects found</p>
                  <p style={{ fontSize:'0.88rem', marginTop:'0.3rem' }}>
                    Try a different semester/branch, or{' '}
                    <a href={`https://www.ktunotes.in/ktu-${semester.toLowerCase()}-${branch.toLowerCase()}-notes-2019-scheme/`} target="_blank" rel="noopener noreferrer" style={{ color:'var(--primary)', fontWeight:600 }}>
                      open ktunotes.in directly
                    </a>
                  </p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {subjects.map((sub, idx) => {
                    const isActive = selected?.url === sub.url;
                    return (
                      <button key={sub.url} onClick={() => openSubject(sub)} style={{
                        display:'flex', alignItems:'center', gap:'0.9rem',
                        padding:'0.95rem 1.2rem', width:'100%', textAlign:'left',
                        background: isActive ? activeBranch.bg : 'var(--white)',
                        border:`1.5px solid ${isActive ? activeBranch.color : 'var(--light-gray)'}`,
                        borderRadius:'var(--r-md)', cursor:'pointer', fontFamily:'var(--font)',
                        transition:'var(--transition)',
                        animation:'fadeInUp 0.3s ease both',
                        animationDelay:`${idx * 0.025}s`,
                      }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor=activeBranch.color; e.currentTarget.style.background=activeBranch.bg; }}}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor='var(--light-gray)'; e.currentTarget.style.background='var(--white)'; }}}
                      >
                        {/* Index number */}
                        <div style={{ width:32, height:32, borderRadius:8, background: isActive ? activeBranch.color : 'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'0.82rem', fontWeight:700, color: isActive ? '#fff' : 'var(--gray)', transition:'var(--transition)' }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:'0.92rem', color:'var(--dark)', lineHeight:1.4 }}>{sub.name}</div>
                          {sub.code && (
                            <div style={{ fontSize:'0.73rem', fontWeight:700, color: activeBranch.color, marginTop:'0.15rem' }}>
                              <i className="fas fa-tag" style={{ marginRight:'0.3rem', opacity:0.7 }} />{sub.code}
                            </div>
                          )}
                        </div>
                        <i className={`fas fa-chevron-${isActive ? 'left' : 'right'}`} style={{ color:'var(--gray)', fontSize:'0.75rem', flexShrink:0 }} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Downloads side panel */}
            {selected && (
              <div style={{ position:'sticky', top:90 }}>
                <div className="card" style={{ borderTop:`4px solid ${activeBranch.color}`, padding:'1.4rem' }}>
                  {/* Header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
                    <div style={{ flex:1, marginRight:'0.8rem' }}>
                      <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', color: activeBranch.color, marginBottom:'0.3rem' }}>
                        {tab === 'notes' ? '📚 Notes' : '📄 Question Papers'}
                      </div>
                      <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--dark)', lineHeight:1.5 }}>{selected.name}</h3>
                      {selected.code && (
                        <span style={{ display:'inline-block', marginTop:'0.3rem', background: activeBranch.bg, color: activeBranch.color, padding:'0.15rem 0.6rem', borderRadius:4, fontSize:'0.75rem', fontWeight:700 }}>
                          {selected.code}
                        </span>
                      )}
                    </div>
                    <button onClick={() => { setSelected(null); setDownloads([]); }} style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', border:'1px solid var(--light-gray)', borderRadius:6, cursor:'pointer', color:'var(--gray)', flexShrink:0 }}>
                      <i className="fas fa-times" style={{ fontSize:'0.8rem' }} />
                    </button>
                  </div>

                  <div style={{ height:1, background:'var(--light-gray)', marginBottom:'1rem' }} />

                  {detailLoad ? (
                    <div style={{ textAlign:'center', padding:'2rem', color:'var(--gray)' }}>
                      <i className="fas fa-circle-notch fa-spin" style={{ fontSize:'1.4rem', color: activeBranch.color, display:'block', marginBottom:'0.8rem' }} />
                      <p style={{ fontSize:'0.88rem' }}>Loading download links...</p>
                    </div>
                  ) : downloads.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--gray)' }}>
                      <i className="fas fa-inbox" style={{ fontSize:'2rem', opacity:0.25, display:'block', marginBottom:'0.8rem' }} />
                      <p style={{ fontWeight:600, fontSize:'0.9rem' }}>No direct links found</p>
                      <p style={{ fontSize:'0.82rem', marginTop:'0.3rem', marginBottom:'1rem' }}>The files may be embedded differently</p>
                      <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1.1rem', background:'var(--primary-bg)', color:'var(--primary)', border:'1px solid rgba(37,99,235,0.25)', borderRadius:'var(--r-sm)', fontSize:'0.85rem', fontWeight:600, textDecoration:'none' }}>
                        <i className="fas fa-external-link-alt" /> Open on ktunotes.in
                      </a>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize:'0.8rem', color:'var(--gray)', fontWeight:500, marginBottom:'0.9rem' }}>
                        {downloads.length} file{downloads.length !== 1 ? 's' : ''} available
                      </p>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                        {downloads.map((dl, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.8rem', padding:'0.85rem 1rem', background:'var(--bg)', border:'1px solid var(--light-gray)', borderRadius:'var(--r-md)' }}>
                            <div style={{ width:36, height:36, background:'rgba(239,68,68,0.08)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <i className="fas fa-file-pdf" style={{ color:'#dc2626', fontSize:'1rem' }} />
                            </div>
                            <span style={{ flex:1, fontSize:'0.88rem', fontWeight:600, color:'var(--dark)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {dl.label}
                            </span>
                            <div style={{ display:'flex', gap:'0.4rem', flexShrink:0 }}>
                              <a href={dl.gdrive_url} target="_blank" rel="noopener noreferrer" title="Preview" style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--white)', border:'1px solid var(--light-gray)', borderRadius:6, color:'var(--gray)', textDecoration:'none', transition:'var(--transition)', fontSize:'0.85rem' }}
                                onMouseEnter={e => { e.currentTarget.style.background='var(--primary-bg)'; e.currentTarget.style.color='var(--primary)'; e.currentTarget.style.borderColor='rgba(37,99,235,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background='var(--white)'; e.currentTarget.style.color='var(--gray)'; e.currentTarget.style.borderColor='var(--light-gray)'; }}>
                                <i className="fas fa-eye" />
                              </a>
                              <a href={dl.direct_url} target="_blank" rel="noopener noreferrer" title="Download" style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--primary)', borderRadius:6, color:'#fff', textDecoration:'none', fontSize:'0.85rem', transition:'var(--transition)', border:'none' }}
                                onMouseEnter={e => e.currentTarget.style.background='var(--primary-dark)'}
                                onMouseLeave={e => e.currentTarget.style.background='var(--primary)'}>
                                <i className="fas fa-download" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop:'1rem', paddingTop:'0.8rem', borderTop:'1px solid var(--light-gray)', textAlign:'center' }}>
                        <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:'0.8rem', color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>
                          <i className="fas fa-external-link-alt" style={{ marginRight:'0.3rem' }} /> View on ktunotes.in
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div style={{ marginTop:'2rem', padding:'0.9rem 1.4rem', background:'var(--primary-bg)', border:'1px solid rgba(37,99,235,0.12)', borderRadius:'var(--r-md)', display:'flex', alignItems:'center', gap:'0.7rem' }}>
            <i className="fas fa-info-circle" style={{ color:'var(--primary)', flexShrink:0 }} />
            <p style={{ color:'var(--primary)', fontSize:'0.82rem', margin:0 }}>
              Files are hosted on Google Drive by ktunotes.in contributors. EduAssist does not store any files.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default StudyMaterials;
