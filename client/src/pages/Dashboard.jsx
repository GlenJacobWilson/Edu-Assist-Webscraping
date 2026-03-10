import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';

// ── Announcement Card (exact screenshot match) ────────────
function AnnouncementCard({ item, isPinned, onTogglePin, idx }) {
  const [expanded, setExpanded] = useState(false);
  const hasMsg = item.message && item.message.replace(/<[^>]*>/g, '').trim().length > 0;

  return (
    <div
      className={`card${isPinned ? ' pinned-card' : ''}`}
      style={{ animationDelay: `${idx * 0.05}s` }}
    >
      {/* ── Header row: date + tags + pin ── */}
      <div className="card-header">
        <div className="card-header-left">
          <span className="date">{item.date}</span>
          {item.is_urgent && <span className="tag urgent">Urgent</span>}
          {item.title?.toLowerCase().includes('exam') && <span className="tag exam">Exam</span>}
          {item.title?.toLowerCase().includes('result') && <span className="tag result">Result</span>}
        </div>
        <button
          className={`pin-btn${isPinned ? ' pinned' : ''}`}
          onClick={() => onTogglePin(item.id)}
          title={isPinned ? 'Unpin' : 'Pin this notification'}
        >
          {isPinned ? '★ Pinned' : '☆ Pin'}
        </button>
      </div>

      {/* ── Title ── */}
      <h3 className="card-title">{isPinned && '📌 '}{item.title}</h3>

      {/* ── AI Summary ── */}
      {item.summary && (
        <div className="ai-summary-box">
          <div className="ai-summary-label">
            <span>✨</span>
            <strong>AI Summary</strong>
          </div>
          <p className="ai-summary-text">{item.summary}</p>
        </div>
      )}

      {/* ── Read Full Notice ── */}
      {hasMsg && (
        <>
          <button className="read-more-btn" onClick={() => setExpanded(o => !o)}>
            <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
            {expanded ? 'Collapse' : 'Read Full Notice'}
          </button>
          {expanded && (
            <div
              className="message-content"
              dangerouslySetInnerHTML={{ __html: item.message }}
            />
          )}
        </>
      )}

      {/* ── Download buttons ── */}
      {item.files?.length > 0 && (
        <div className="files-row">
          {item.files.map((f, i) => (
            <a
              key={i}
              href={api.downloadUrl(f.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="download-btn"
              title={f.name}
            >
              <i className="fas fa-download"></i>
              {f.name?.length > 28 ? f.name.slice(0, 28) + '…' : f.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout, setProfile } = useAuth();
  const { showNotification } = useToast();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [profile, setProfileData] = useState(null);

  const userName = profile?.full_name || user?.name || 'Student';
  const college  = profile?.college_name || user?.college || 'Your College';

  // ── Greeting ─────────────────────────────────────────────
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // ── Days to exam ──────────────────────────────────────────
  const getDaysLeft = () => {
    const sem = profile?.semester || user?.semester || 'S6';
    const dates = {
      S1:'2026-03-15', S2:'2026-06-10', S3:'2026-04-20', S4:'2026-04-25',
      S5:'2026-04-24', S6:'2026-04-25', S7:'2026-04-15', S8:'2026-04-20',
    };
    const diff = new Date(dates[sem] || '2026-05-20') - new Date();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  // ── Load data ─────────────────────────────────────────────
  useEffect(() => {
    if (!user?.token) { navigate('/login'); return; }

    const load = async () => {
      try {
        const [notifs, pins, me] = await Promise.allSettled([
          api.getNotifications(),
          api.getPins(),
          api.getMe(),
        ]);
        if (notifs.status === 'fulfilled') setAnnouncements(Array.isArray(notifs.value) ? notifs.value : []);
        if (pins.status  === 'fulfilled') setPinnedIds(Array.isArray(pins.value) ? pins.value : []);
        if (me.status    === 'fulfilled' && me.value?.full_name) {
          setProfileData(me.value);
          setProfile(me.value);
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  // ── Pin toggle ────────────────────────────────────────────
  const togglePin = async (id) => {
    const was = pinnedIds.includes(id);
    setPinnedIds(was ? pinnedIds.filter(p => p !== id) : [...pinnedIds, id]);
    try {
      was ? await api.unpin(id) : await api.pin(id);
      showNotification(was ? 'Unpinned' : 'Pinned! Will appear at the top.', was ? 'info' : 'success');
    } catch {
      setPinnedIds(was ? [...pinnedIds, id] : pinnedIds.filter(p => p !== id));
      showNotification('Please login to pin notifications', 'error');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // ── Sort: pinned first ────────────────────────────────────
  const sorted = [...announcements].sort((a, b) => {
    const ap = pinnedIds.includes(a.id), bp = pinnedIds.includes(b.id);
    return ap === bp ? 0 : ap ? -1 : 1;
  });
  const urgentCount = announcements.filter(n => n.is_urgent).length;

  return (
    <>
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{ position:'fixed', inset:0, zIndex:998, background:'rgba(0,0,0,0.35)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Navbar ───────────────────────────────────────── */}
      <nav className="navbar">
        <div className="nav-container">
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--dark)', fontSize:'1.2rem', display:'none' }}
              className="hamburger-icon"
            >
              <i className="fas fa-bars"></i>
            </button>
            <a href="/" className="logo" onClick={e => { e.preventDefault(); navigate('/'); }}>
              <i className="fas fa-graduation-cap"></i>
              <span>EduAssist</span>
            </a>
          </div>
          <div className="user-profile" onClick={handleLogout} title="Click to logout">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563eb&color=fff`}
              alt="avatar"
            />
            <span>{userName}</span>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className={`sidebar${sidebarOpen ? ' active' : ''}`}>
          <div className="sidebar-header">
            <h3>Student Portal</h3>
            <span className="portal-badge">View Only</span>
          </div>
          <ul className="sidebar-menu">
            <li className="active">
              <i className="fas fa-home"></i><span>Overview</span>
            </li>
            <li onClick={() => navigate('/gpa')}>
              <i className="fas fa-calculator"></i><span>GPA Manager</span>
            </li>
            <li onClick={() => navigate('/forum')}>
              <i className="fas fa-comments"></i><span>Forum</span>
            </li>
            <li onClick={() => navigate('/materials')}>
              <i className="fas fa-book"></i><span>Study Materials</span>
            </li>
            <li>
              <i className="fas fa-bell"></i><span>Notifications</span>
              {urgentCount > 0 && <span className="badge">{urgentCount}</span>}
            </li>
            <li><i className="fas fa-calendar"></i><span>Timetable</span></li>
            <li><i className="fas fa-cog"></i><span>Settings</span></li>
            <li onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i><span>Logout</span>
            </li>
          </ul>
        </aside>

        {/* ── Main ────────────────────────────────────────── */}
        <main className="dashboard-main">

          {/* Welcome */}
          <section className="welcome-section">
            <div className="welcome-text">
              <h1>{getGreeting()}, {userName.split(' ')[0]}! 👋</h1>
              <p style={{ color:'var(--gray)', fontSize:'0.9rem' }}>
                <i className="fas fa-university" style={{ marginRight:'0.4rem', color:'var(--primary)' }}></i>
                {college}
              </p>
            </div>
            <span className="info-badge">
              <i className="fas fa-info-circle"></i> Student View Portal
            </span>
          </section>

          {/* Stats */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><i className="fas fa-book-open"></i></div>
              <div className="stat-info">
                <h3>{announcements.length}</h3>
                <p>Announcements</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><i className="fas fa-clock"></i></div>
              <div className="stat-info">
                <h3>{getDaysLeft()}</h3>
                <p>Days to Exam</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple"><i className="fas fa-thumbtack"></i></div>
              <div className="stat-info">
                <h3>{pinnedIds.length}</h3>
                <p>Pinned Items</p>
              </div>
            </div>
            <div
              className="stat-card clickable"
              onClick={() => navigate('/gpa')}
              title="Open GPA Manager"
            >
              <div className="stat-icon green"><i className="fas fa-calculator"></i></div>
              <div className="stat-info">
                <h3>GPA</h3>
                <p>Academic Score</p>
                <small>Click to Calculate</small>
              </div>
            </div>
          </section>

          {/* Urgent alert */}
          {urgentCount > 0 && (
            <div className="alert-section">
              <h3 style={{ color:'#991b1b', fontSize:'1rem', fontWeight:700, marginBottom:'0.6rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <i className="fas fa-exclamation-triangle"></i>
                Action Required — {urgentCount} Urgent Notice{urgentCount > 1 ? 's' : ''}
              </h3>
              <ul style={{ paddingLeft:'1.2rem', color:'#b91c1c', fontSize:'0.9rem' }}>
                {announcements.filter(a => a.is_urgent).slice(0, 3).map(a => (
                  <li key={a.id} style={{ marginBottom:'0.3rem' }}>
                    <strong>{a.date}:</strong> {a.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick actions */}
          <div className="quick-actions">
            <button className="qa-btn primary" onClick={() => navigate('/forum')}>
              <i className="fas fa-comments"></i> Student Forum
            </button>
            <button className="qa-btn outline-blue" onClick={() => navigate('/gpa')}>
              <i className="fas fa-chart-bar"></i> GPA Manager
            </button>
            <button className="qa-btn outline-amber" onClick={() => navigate('/materials')}>
              <i className="fas fa-book"></i> Study Materials
            </button>
          </div>

          {/* Section label */}
          <div className="section-label">
            <i className="fas fa-bullhorn"></i>
            KTU Announcements
            {loading && <span style={{ fontSize:'0.8rem', color:'var(--gray)', fontWeight:400 }}> — loading…</span>}
            {!loading && <span style={{ fontSize:'0.8rem', color:'var(--gray)', fontWeight:400 }}> ({sorted.length} notices)</span>}
          </div>

          {/* Announcements */}
          {loading ? (
            <div className="loading">
              <i className="fas fa-circle-notch fa-spin" style={{ marginRight:'0.5rem' }}></i>
              Loading announcements from KTU…
            </div>
          ) : sorted.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <p>No announcements available. Check your backend connection.</p>
            </div>
          ) : (
            <div className="announcements-grid">
              {sorted.map((item, idx) => (
                <AnnouncementCard
                  key={item.id}
                  item={item}
                  isPinned={pinnedIds.includes(item.id)}
                  onTogglePin={togglePin}
                  idx={idx}
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Mobile hamburger CSS fix */}
      <style>{`
        @media (max-width: 968px) {
          .hamburger-icon { display: block !important; }
        }
      `}</style>
    </>
  );
}
