import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import GPACalculator from './GPACalculator';
import Discussion from './Discussion';
import Login from './Login';
import Register from './Register';
import './App.css';

// ─── STAT CHIP ───────────────────────────────────────────────────────────────
function StatChip({ icon, value, label, color = 'var(--cyan)' }) {
  return (
    <div style={{
      background: `rgba(${color === 'var(--cyan)' ? '0,212,255' : '139,92,246'}, 0.08)`,
      border: `1px solid rgba(${color === 'var(--cyan)' ? '0,212,255' : '139,92,246'}, 0.25)`,
      borderRadius: 'var(--radius-md)', padding: '12px 18px', textAlign: 'center',
      minWidth: 90
    }}>
      <div style={{ fontSize: '1.1rem', marginBottom: 2 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1, textShadow: `0 0 20px ${color}66` }}>{value}</div>
      <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', marginTop: 4, fontFamily: 'var(--font-display)' }}>{label}</div>
    </div>
  );
}

// ─── NAV BUTTON ──────────────────────────────────────────────────────────────
function NavBtn({ onClick, icon, label, accent = '#8b5cf6' }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `rgba(${accent === '#8b5cf6' ? '139,92,246' : '0,212,255'}, 0.2)` : `rgba(${accent === '#8b5cf6' ? '139,92,246' : '0,212,255'}, 0.1)`,
        border: `1px solid ${hovered ? accent : `${accent}55`}`,
        borderRadius: 'var(--radius-md)', padding: '10px 16px',
        color: 'var(--white)', cursor: 'pointer', fontWeight: 600,
        fontFamily: 'var(--font-body)', fontSize: '0.85rem',
        transition: 'var(--transition)', display: 'flex', alignItems: 'center', gap: 7,
        boxShadow: hovered ? `0 0 16px ${accent}44` : 'none',
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
    >
      <span>{icon}</span> {label}
    </button>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const userName = localStorage.getItem('user_name') || 'Student';
  const token = localStorage.getItem('token');
  const semester = localStorage.getItem('semester') || 'S6';

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getDaysLeft = () => {
    const examDates = {
      "S1": "2026-03-15", "S2": "2026-06-10", "S3": "2026-04-20",
      "S4": "2026-04-25", "S5": "2026-04-24", "S6": "2026-04-25",
      "S7": "2026-04-15", "S8": "2026-04-20"
    };
    const diff = new Date(examDates[semester] || "2026-05-20") - new Date();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  useEffect(() => {
    if (!token) { navigate('/'); return; }

    const fetchData = async () => {
      try {
        const ktuRes = await axios.get('http://127.0.0.1:8000/notifications');
        setAnnouncements(Array.isArray(ktuRes.data) ? ktuRes.data : []);
        try {
          const pinRes = await axios.get('http://127.0.0.1:8000/pins', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPinnedIds(pinRes.data);
        } catch {}
      } catch {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, token]);

  const togglePin = async (id) => {
    const isPinned = pinnedIds.includes(id);
    setPinnedIds(isPinned ? pinnedIds.filter(p => p !== id) : [...pinnedIds, id]);
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      isPinned ? await axios.delete(`http://127.0.0.1:8000/pin/${id}`, cfg)
                : await axios.post(`http://127.0.0.1:8000/pin/${id}`, {}, cfg);
    } catch {
      setPinnedIds(isPinned ? [...pinnedIds, id] : pinnedIds.filter(p => p !== id));
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const safe = Array.isArray(announcements) ? announcements : [];
  const sorted = [...safe].sort((a, b) => {
    const ap = pinnedIds.includes(a.id), bp = pinnedIds.includes(b.id);
    return ap === bp ? 0 : ap ? -1 : 1;
  });
  const urgentAlerts = safe.filter(i => i.is_urgent);

  return (
    <div className="container">
      {/* ── HEADER ── */}
      <header className="dashboard-header">
        <div className="welcome-section">
          <p style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            ● SYSTEM ONLINE · {semester}
          </p>
          <h1>{getGreeting()}, {userName.split(' ')[0]}.</h1>
          <p className="subtitle">Your personalized academic intelligence feed.</p>
        </div>

        <div className="header-actions">
          <StatChip icon="📅" value={getDaysLeft()} label="Days Left" color="var(--cyan)" />
          <StatChip icon="📌" value={pinnedIds.length} label="Pinned" color="var(--violet)" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <NavBtn onClick={() => navigate('/discussion')} icon="🗣️" label="Forum" accent="#8b5cf6" />
            <NavBtn onClick={() => navigate('/gpa')} icon="📊" label="GPA Manager" accent="#00d4ff" />
          </div>

          <button onClick={handleLogout} className="logout-btn" style={{ alignSelf: 'stretch' }}>
            ⏻ Logout
          </button>
        </div>
      </header>

      {/* ── URGENT ALERTS ── */}
      {urgentAlerts.length > 0 && (
        <div className="alert-section" style={{
          background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.3)',
          borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24, backdropFilter: 'blur(12px)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #f43f5e, transparent)' }} />
          <h3 style={{ color: '#fb7185', margin: '0 0 14px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            <span style={{ fontSize: '1.2rem', animation: 'pulse-urgent 2s infinite' }}>🔔</span>
            Action Required · {urgentAlerts.length} Urgent
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {urgentAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} style={{
                display: 'flex', alignItems: 'baseline', gap: 12,
                padding: '8px 12px', background: 'rgba(244,63,94,0.06)',
                borderRadius: 8, border: '1px solid rgba(244,63,94,0.12)'
              }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#fb7185', whiteSpace: 'nowrap' }}>{alert.date}</span>
                <span style={{ fontSize: '0.88rem', color: '#fecdd3' }}>{alert.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FEED ── */}
      {loading ? (
        <div className="loading">⟳ Synchronizing data stream...</div>
      ) : (
        <div className="grid">
          {sorted.map((item, idx) => {
            const isPinned = pinnedIds.includes(item.id);
            const hasMsg = item.message && item.message.replace(/<[^>]*>/g, '').trim().length > 0;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`card ${isPinned ? 'pinned-card' : ''}`}
                style={{
                  animationDelay: `${idx * 0.04}s`,
                  borderLeftColor: item.is_urgent ? 'rgba(244,63,94,0.6)' : isPinned ? 'rgba(245,158,11,0.6)' : undefined
                }}
              >
                {/* Card top bar */}
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="date">{item.date}</span>
                    {item.is_urgent && <span className="tag urgent">⚡ Urgent</span>}
                    {item.title.toLowerCase().includes('exam') && <span className="tag exam">Exam</span>}
                    {item.title.toLowerCase().includes('result') && <span className="tag result">Result</span>}
                    {isPinned && <span style={{ fontSize: '0.72rem', color: 'var(--amber)', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>📌 PINNED</span>}
                  </div>
                  <button onClick={() => togglePin(item.id)} className="star-btn">
                    {isPinned ? '★ Unpin' : '☆ Pin'}
                  </button>
                </div>

                {/* Title */}
                <h2 className="title">{item.title}</h2>

                {/* AI Summary */}
                <div style={{
                  background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.22)',
                  borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 14
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <span style={{ fontSize: '1rem' }}>✨</span>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-display)', letterSpacing: '2px', textTransform: 'uppercase', color: '#a78bfa', fontWeight: 600 }}>
                      AI Summary
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.65, color: 'rgba(240,244,255,0.85)' }}>
                    {item.summary || item.title}
                  </p>
                </div>

                {/* Full notice toggle */}
                {hasMsg && (
                  <div style={{ marginBottom: 14 }}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--cyan)', fontSize: '0.85rem', fontWeight: 600,
                        fontFamily: 'var(--font-body)', padding: '4px 0',
                        display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'var(--transition)'
                      }}
                    >
                      <span style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▶</span>
                      {isExpanded ? 'Collapse Notice' : 'Read Full Notice'}
                    </button>
                    {isExpanded && (
                      <div
                        className="message-content"
                        dangerouslySetInnerHTML={{ __html: item.message }}
                        style={{ marginTop: 10 }}
                      />
                    )}
                  </div>
                )}

                {/* Files */}
                {item.files.length > 0 && (
                  <div className="files-section">
                    <div className="file-list">
                      {item.files.map((file, i) => (
                        <a
                          key={i}
                          href={`http://127.0.0.1:8000/download?file_id=${encodeURIComponent(file.id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download-btn"
                        >
                          📄 {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '2px' }}>
              NO DATA STREAM AVAILABLE
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── APP ROUTER ───────────────────────────────────────────────────────────────
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
