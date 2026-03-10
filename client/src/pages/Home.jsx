import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';

// ── Registration Modal ────────────────────────────────────
function RegisterModal({ onClose, onSuccess }) {
  const { showNotification } = useToast();
  const [form, setForm] = useState({
    fullName: '', email: '', collegeName: '', branch: '',
    semester: '', password: '', confirmPassword: '', terms: false,
  });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm(p => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      showNotification('Passwords do not match!', 'error'); return;
    }
    if (!form.terms) {
      showNotification('Please accept the terms of service', 'error'); return;
    }
    setLoading(true);
    try {
      await api.register({
        full_name:    form.fullName,
        email:        form.email,
        password:     form.password,
        semester:     form.semester,
        department:   form.branch,
        college_name: form.collegeName,
      });
      showNotification('Account created successfully! Please login.', 'success');
      onSuccess();
    } catch (err) {
      showNotification(err.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header-bar">
          <h2><i className="fas fa-user-plus"></i> Create Your Account</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color:'var(--gray)', fontSize:'0.9rem', marginBottom:'1.5rem' }}>
            Join EduAssist and never miss important KTU updates.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><i className="fas fa-user"></i> Full Name</label>
              <input type="text" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} required />
            </div>
            <div className="form-group">
              <label><i className="fas fa-envelope"></i> Email Address</label>
              <input type="email" placeholder="your.email@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label><i className="fas fa-university"></i> College Name</label>
              <input type="text" placeholder="e.g. Mar Athanasius College of Engineering" value={form.collegeName} onChange={set('collegeName')} required />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label><i className="fas fa-code-branch"></i> Branch</label>
                <select value={form.branch} onChange={set('branch')} required>
                  <option value="">Select branch</option>
                  <option value="CSE">Computer Science</option>
                  <option value="ECE">Electronics &amp; Comm.</option>
                  <option value="EEE">Electrical &amp; Electronics</option>
                  <option value="MECH">Mechanical</option>
                  <option value="CIVIL">Civil</option>
                  <option value="IT">Information Technology</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-graduation-cap"></i> Semester</label>
                <select value={form.semester} onChange={set('semester')} required>
                  <option value="">Select semester</option>
                  {['S1','S2','S3','S4','S5','S6','S7','S8'].map(s => (
                    <option key={s} value={s}>Semester {s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Password</label>
                <input type="password" placeholder="Create password" value={form.password} onChange={set('password')} required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Confirm Password</label>
                <input type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
            </div>
            <div className="form-group" style={{ flexDirection:'row', alignItems:'center', gap:'0.7rem' }}>
              <input
                type="checkbox" id="terms" style={{ width:'18px', height:'18px', flexShrink:0, cursor:'pointer' }}
                checked={form.terms} onChange={set('terms')} required
              />
              <label htmlFor="terms" style={{ fontWeight:400, fontSize:'0.85rem', color:'var(--gray)', cursor:'pointer' }}>
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              <i className="fas fa-user-plus"></i>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(true);

  useEffect(() => {
    api.getNotifications()
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setNotifsLoading(false));
  }, []);

  const urgent = notifications.filter(n => n.is_urgent);
  const topNotifs = notifications.slice(0, 6);

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    navigate('/login');
  };

  return (
    <>
      <Navbar onOpenRegister={() => setShowRegister(true)} />

      <div className="home-wrapper">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-icon">🎓</span>
            <h1>Your KTU <span>Companion</span></h1>
            <p>
              Stay updated with live KTU announcements, AI-summarised notifications,
              study materials, and a student discussion forum — all in one place.
            </p>
            <div className="hero-actions">
              <button className="hero-btn-primary" onClick={() => navigate('/login')}>
                <i className="fas fa-sign-in-alt"></i> Login to Dashboard
              </button>
              <button className="hero-btn-outline" onClick={() => setShowRegister(true)}>
                <i className="fas fa-user-plus"></i> Create Free Account
              </button>
            </div>
          </div>
        </section>

        {/* ── FEATURES BAR ──────────────────────────────────── */}
        <div className="features-bar">
          <div className="features-inner">
            {[
              { icon:'fa-bolt', label:'Live KTU Notifications' },
              { icon:'fa-brain', label:'AI-Powered Summaries' },
              { icon:'fa-thumbtack', label:'Pin Important Notices' },
              { icon:'fa-file-pdf', label:'Download Official PDFs' },
              { icon:'fa-comments', label:'Student Discussion Forum' },
              { icon:'fa-book-open', label:'Study Materials & Notes' },
            ].map(f => (
              <div className="feature-item" key={f.label}>
                <i className={`fas ${f.icon}`}></i>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── LIVE KTU NOTIFICATIONS ────────────────────────── */}
        <section className="live-notifs-section">
          <div className="section-heading">
            <div className="live-badge">
              <span className="live-dot"></span>
              LIVE FROM KTU PORTAL
            </div>
            <h2>Latest KTU Announcements</h2>
            <p>Scraped in real-time from the official KTU website with AI summaries</p>
          </div>

          {notifsLoading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}>
              <div style={{ textAlign:'center', color:'var(--gray)' }}>
                <div className="spinner" style={{ margin:'0 auto 1rem' }}></div>
                <p>Fetching live KTU announcements…</p>
              </div>
            </div>
          ) : topNotifs.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-satellite-dish"></i>
              <p>Could not load KTU announcements. Please check your backend connection.</p>
            </div>
          ) : (
            <>
              {urgent.length > 0 && (
                <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderLeft:'4px solid var(--danger)', borderRadius:'var(--r-lg)', padding:'1rem 1.4rem', marginBottom:'1.5rem', display:'flex', alignItems:'flex-start', gap:'1rem' }}>
                  <i className="fas fa-exclamation-triangle" style={{ color:'var(--danger)', fontSize:'1.3rem', marginTop:'0.1rem', flexShrink:0 }}></i>
                  <div>
                    <strong style={{ color:'#991b1b', fontSize:'0.95rem' }}>
                      {urgent.length} urgent notice{urgent.length > 1 ? 's' : ''} require immediate attention
                    </strong>
                    <p style={{ color:'#b91c1c', fontSize:'0.85rem', marginTop:'0.3rem' }}>
                      Login to your dashboard to view full details and download attachments.
                    </p>
                  </div>
                </div>
              )}

              <div className="notif-preview-grid">
                {topNotifs.map((n, idx) => (
                  <div
                    key={n.id || idx}
                    className={`notif-preview-card${n.is_urgent ? ' urgent-card' : ''}`}
                    style={{ animationDelay:`${idx * 0.06}s`, animation:'fadeInUp 0.4s ease both' }}
                  >
                    <div className="notif-preview-top">
                      <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                        <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--gray)' }}>{n.date}</span>
                        {n.is_urgent && <span className="tag urgent">Urgent</span>}
                        {n.title?.toLowerCase().includes('exam') && <span className="tag exam">Exam</span>}
                        {n.title?.toLowerCase().includes('result') && <span className="tag result">Result</span>}
                      </div>
                      {n.files?.length > 0 && (
                        <span style={{ fontSize:'0.78rem', color:'var(--gray)', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                          <i className="fas fa-paperclip"></i> {n.files.length} file{n.files.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <h3>{n.title}</h3>
                    {n.summary && (
                      <div className="ai-summary-box" style={{ marginBottom:0 }}>
                        <div className="ai-summary-label">
                          <span>✨</span>
                          <strong>AI Summary</strong>
                        </div>
                        <p className="ai-summary-text">{n.summary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="view-all-row">
                <button className="btn-view-all" onClick={() => navigate('/login')}>
                  <i className="fas fa-sign-in-alt"></i> Login to See All Notifications + Download PDFs
                </button>
              </div>
            </>
          )}
        </section>

        {/* ── FEATURES ──────────────────────────────────────── */}
        <div className="about-strip">
          <div className="about-inner">
            {[
              { icon:'🔔', title:'Real-time Alerts', desc:'Get instant notifications from KTU portal with urgency detection and AI-powered summaries.' },
              { icon:'📌', title:'Pin & Organise', desc:'Pin important notices so they always appear at the top of your dashboard.' },
              { icon:'📄', title:'Download PDFs', desc:'Directly download official KTU PDFs and attachments from the dashboard.' },
              { icon:'💬', title:'Student Forum', desc:'Ask questions, share answers, and collaborate with fellow KTU students.' },
              { icon:'📚', title:'Study Materials', desc:'Access notes and previous year question papers from KTU Notes for all semesters.' },
              { icon:'🧮', title:'GPA Calculator', desc:'Track your cumulative GPA across all semesters with persistent storage.' },
            ].map(f => (
              <div className="about-feature" key={f.title}>
                <span className="about-feature-icon">{f.icon}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer className="footer">
          <p>© 2024 EduAssist — Independent Student Support Platform. Not affiliated with KTU.</p>
        </footer>

      </div>

      {/* ── Register Modal ─────────────────────────────────── */}
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </>
  );
}
