import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import GPACalculator from './GPACalculator';
import Discussion from './Discussion';
import Login from './Login';
import Register from './Register';
import './App.css';

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const userName = localStorage.getItem('user_name') || 'Student';
  const token = localStorage.getItem('token');

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDaysLeft = () => {
    const semester = localStorage.getItem('semester') || 'S6';
    const dates = { S1:'2026-03-15',S2:'2026-06-10',S3:'2026-04-20',S4:'2026-04-25',S5:'2026-04-24',S6:'2026-04-25',S7:'2026-04-15',S8:'2026-04-20' };
    const diff = new Date(dates[semester] || '2026-05-20') - new Date();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    const load = async () => {
      try {
        const r = await axios.get('http://127.0.0.1:8000/notifications');
        setAnnouncements(Array.isArray(r.data) ? r.data : []);
        try {
          const p = await axios.get('http://127.0.0.1:8000/pins', { headers: { Authorization: `Bearer ${token}` } });
          setPinnedIds(p.data);
        } catch {}
      } catch { setAnnouncements([]); }
      finally { setLoading(false); }
    };
    load();
  }, [navigate, token]);

  const togglePin = async (id) => {
    const was = pinnedIds.includes(id);
    setPinnedIds(was ? pinnedIds.filter(p => p !== id) : [...pinnedIds, id]);
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      was ? await axios.delete(`http://127.0.0.1:8000/pin/${id}`, cfg)
          : await axios.post(`http://127.0.0.1:8000/pin/${id}`, {}, cfg);
    } catch {
      setPinnedIds(was ? [...pinnedIds, id] : pinnedIds.filter(p => p !== id));
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const safe = Array.isArray(announcements) ? announcements : [];
  const sorted = [...safe].sort((a, b) => {
    const ap = pinnedIds.includes(a.id), bp = pinnedIds.includes(b.id);
    return ap === bp ? 0 : ap ? -1 : 1;
  });
  const urgent = safe.filter(i => i.is_urgent);

  return (
    <div>
      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <i className="fas fa-graduation-cap" />
            <span>EduAssist</span>
          </div>
          <div className="user-profile">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563eb&color=fff`} alt="avatar" />
            <span>{userName}</span>
          </div>
        </div>
      </nav>

      {/* ── LAYOUT ── */}
      <div className="dashboard-container">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Student Portal</h3>
            <span className="portal-badge">View Only</span>
          </div>
          <ul className="sidebar-menu">
            <li className="active"><i className="fas fa-home" /><span>Overview</span></li>
            <li onClick={() => navigate('/gpa')}><i className="fas fa-calculator" /><span>GPA Manager</span></li>
            <li onClick={() => navigate('/discussion')}><i className="fas fa-comments" /><span>Forum</span></li>
            <li><i className="fas fa-bell" /><span>Notifications</span>
              {urgent.length > 0 && <span className="badge">{urgent.length}</span>}
            </li>
            <li><i className="fas fa-calendar" /><span>Timetable</span></li>
            <li><i className="fas fa-cog" /><span>Settings</span></li>
            <li onClick={handleLogout}><i className="fas fa-sign-out-alt" /><span>Logout</span></li>
          </ul>
        </aside>

        {/* ── MAIN ── */}
        <main className="dashboard-main">

          {/* Welcome */}
          <section className="welcome-section">
            <div className="welcome-text">
              <h1>{getGreeting()}, {userName.split(' ')[0]}! 👋</h1>
              <p>View your academic information and download study materials</p>
            </div>
            <div>
              <span className="info-badge">
                <i className="fas fa-info-circle" /> Student View Portal
              </span>
            </div>
          </section>

          {/* Stats */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><i className="fas fa-book-open" /></div>
              <div className="stat-info"><h3>{safe.length}</h3><p>Announcements</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><i className="fas fa-clock" /></div>
              <div className="stat-info"><h3>{getDaysLeft()}</h3><p>Days to Exam</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple"><i className="fas fa-thumbtack" /></div>
              <div className="stat-info"><h3>{pinnedIds.length}</h3><p>Pinned Items</p></div>
            </div>
            <div className="stat-card clickable" onClick={() => navigate('/gpa')} title="Open GPA Manager">
              <div className="stat-icon green"><i className="fas fa-calculator" /></div>
              <div className="stat-info">
                <h3>GPA</h3>
                <p>Academic Score</p>
                <small>Click to Calculate</small>
              </div>
            </div>
          </section>

          {/* Urgent alert */}
          {urgent.length > 0 && (
            <div className="alert-section">
              <h3 style={{ color: '#991b1b', fontSize: '1rem', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-exclamation-triangle" /> Action Required — {urgent.length} Urgent Notice{urgent.length > 1 ? 's' : ''}
              </h3>
              <ul style={{ paddingLeft: '1.2rem', color: '#b91c1c', fontSize: '0.9rem' }}>
                {urgent.slice(0, 3).map(a => (
                  <li key={a.id} style={{ marginBottom: '0.4rem' }}>
                    <strong>{a.date}:</strong> {a.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Forum + GPA quick-access row */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/discussion')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', background: 'var(--primary)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-md)', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'var(--font)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'none'; }}>
              <i className="fas fa-comments" /> Student Forum
            </button>
            <button onClick={() => navigate('/gpa')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', background: 'var(--white)', color: 'var(--primary)', border: '2px solid var(--primary)', borderRadius: 'var(--r-md)', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'var(--font)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-bg)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.transform = 'none'; }}>
              <i className="fas fa-chart-bar" /> GPA Manager
            </button>
          </div>

          {/* Announcements */}
          {loading ? (
            <div className="loading"><i className="fas fa-circle-notch fa-spin" style={{ marginRight: '0.5rem' }} />Loading announcements...</div>
          ) : (
            <div className="grid">
              {sorted.map((item, idx) => {
                const isPinned = pinnedIds.includes(item.id);
                const hasMsg = item.message && item.message.replace(/<[^>]*>/g,'').trim().length > 0;
                const isOpen = expandedId === item.id;
                return (
                  <div key={item.id} className={`card ${isPinned ? 'pinned-card' : ''}`} style={{ animationDelay: `${idx * 0.04}s` }}>
                    <div className="card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span className="date">{item.date}</span>
                        {item.is_urgent && <span className="tag urgent">Urgent</span>}
                        {item.title.toLowerCase().includes('exam') && <span className="tag exam">Exam</span>}
                        {item.title.toLowerCase().includes('result') && <span className="tag result">Result</span>}
                      </div>
                      <button onClick={() => togglePin(item.id)} className="star-btn">
                        {isPinned ? '★ Pinned' : '☆ Pin'}
                      </button>
                    </div>

                    <h3 className="title">{isPinned && '📌 '}{item.title}</h3>

                    {/* AI Summary */}
                    <div style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)', borderLeft: '4px solid var(--primary)', borderRadius: 'var(--r-sm)', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span>✨</span>
                        <strong style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Summary</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--dark)', lineHeight: 1.6 }}>{item.summary || item.title}</p>
                    </div>

                    {hasMsg && (
                      <div style={{ marginBottom: '1rem' }}>
                        <button
                          onClick={() => setExpandedId(isOpen ? null : item.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', padding: '0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: '0.75rem' }} />
                          {isOpen ? 'Collapse' : 'Read Full Notice'}
                        </button>
                        {isOpen && <div className="message-content" dangerouslySetInnerHTML={{ __html: item.message }} style={{ marginTop: '0.8rem' }} />}
                      </div>
                    )}

                    {item.files.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {item.files.map((f, i) => (
                          <a key={i} href={`http://127.0.0.1:8000/download?file_id=${encodeURIComponent(f.id)}`} target="_blank" rel="noopener noreferrer" className="download-btn" style={{ width: 'auto' }}>
                            <i className="fas fa-download" /> {f.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {sorted.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block', opacity: 0.4 }} />
                  No announcements available.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── APP ROUTER ────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gpa" element={<GPACalculator />} />
        <Route path="/discussion" element={<Discussion />} />
      </Routes>
    </Router>
  );
}

export default App;
