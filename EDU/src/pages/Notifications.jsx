import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';

// ── Countdown Timer Component ──────────────────────────────
function Countdown({ deadline }) {
  const calc = useCallback(() => {
    const dist = new Date(deadline).getTime() - Date.now();
    if (dist <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(dist / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((dist % (1000 * 60)) / 1000),
    };
  }, [deadline]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  const expired = new Date(deadline).getTime() <= Date.now();

  return (
    <div className="countdown-timer" style={expired ? { opacity: 0.5 } : {}}>
      {[['days','Days'],['hours','Hours'],['minutes','Minutes'],['seconds','Seconds']].map(([k, label]) => (
        <div className="countdown-item" key={k}>
          <span className={`countdown-value ${k}`}>{time[k]}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Notification Card (small list item) ───────────────────
function NotifCard({ n, isUnread, onMarkRead }) {
  const iconMap = {
    exams: { cls: 'exams-icon', icon: 'fa-file-alt' },
    results: { cls: 'results-icon', icon: 'fa-chart-bar' },
    announcements: { cls: 'announcement-icon', icon: 'fa-bullhorn' },
  };
  const tagMap = {
    exams: 'exams-tag', results: 'results-tag', announcements: 'announcement-tag',
  };
  const { cls, icon } = iconMap[n.category] || { cls: 'announcement-icon', icon: 'fa-bullhorn' };

  return (
    <div
      className={`notification-card${isUnread ? ' unread' : ''}`}
      data-category={n.category}
      onClick={() => onMarkRead(n.id)}
    >
      <div className={`notification-icon-lg ${cls}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="notification-content">
        <h3>{n.title}</h3>
        <p>{n.message}</p>
        <div className="notification-footer">
          <span className={`category-tag ${tagMap[n.category] || 'announcement-tag'}`}>
            {n.category?.charAt(0).toUpperCase() + n.category?.slice(1)}
          </span>
          <span className="notification-time"><i className="fas fa-clock"></i> {n.time}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
const IMPORTANT = [
  {
    id: 'imp1', type: 'urgent', deadline: '2024-03-20T23:59:59',
    priority: 'URGENT', priorityCls: '',
    title: 'Semester 6 Exam Registration Deadline',
    desc: 'Last date to register for S6 examinations. Late registration will incur additional fees. Complete your registration immediately.',
    metaDate: 'Deadline: March 20, 2024, 11:59 PM',
    metaPosted: 'Posted: 2 hours ago',
    primaryBtn: { icon: 'fa-external-link-alt', text: 'Register Now' },
  },
  {
    id: 'imp2', type: 'important', deadline: '2024-03-15T10:00:00',
    priority: 'IMPORTANT', priorityCls: 'important-priority',
    title: 'Data Structures Examination',
    desc: 'Series examination for Data Structures will be conducted on March 15, 2024. Download your hall ticket before the exam date.',
    metaDate: 'Exam Date: March 15, 2024, 10:00 AM',
    metaPosted: 'Posted: 5 hours ago',
    primaryBtn: { icon: 'fa-download', text: 'Download Hall Ticket' },
  },
  {
    id: 'imp3', type: 'warning', deadline: '2024-03-12T14:00:00',
    priority: 'ANNOUNCEMENT', priorityCls: 'warning-priority',
    title: 'Semester 5 Results Declaration',
    desc: 'Results for Semester 5 examinations will be published on March 12, 2024 at 2:00 PM. Check the official KTU portal.',
    metaDate: 'Release Date: March 12, 2024, 2:00 PM',
    metaPosted: 'Posted: 1 day ago',
    primaryBtn: { icon: 'fa-external-link-alt', text: 'Visit KTU Portal' },
  },
];

const RECENT_STATIC = [
  { id:'r1', category:'exams', title:'Revised Exam Schedule Released', message:'KTU has released the revised examination schedule for all programs. Download the updated schedule from the official website.', time:'3 hours ago' },
  { id:'r2', category:'announcements', title:'Holiday Notice - University Closed', message:'University will remain closed on March 25, 2024 (Good Friday). Regular classes resume on March 26, 2024.', time:'6 hours ago' },
  { id:'r3', category:'results', title:'Revaluation Results Published', message:'Revaluation results for Semester 5 examinations are now available. Check your results on the KTU portal.', time:'1 day ago' },
];

const ALL_STATIC = [
  { id:'a1', category:'exams', title:'Hall Ticket Download Available', message:'Download your hall tickets for the upcoming semester examinations from the student portal.', time:'2 days ago' },
  { id:'a2', category:'announcements', title:'Academic Calendar Updated', message:'The academic calendar for the current semester has been updated with new exam dates and holiday information.', time:'3 days ago' },
  { id:'a3', category:'results', title:'Semester 4 Results Declared', message:'Results for Semester 4 examinations have been declared. Download your grade cards from the official portal.', time:'5 days ago' },
  { id:'a4', category:'exams', title:'Exam Fee Payment Reminder', message:'Reminder to pay your examination fees before the deadline to avoid late fee charges.', time:'1 week ago' },
  { id:'a5', category:'announcements', title:'Library Timing Changes', message:'Library timings have been extended during examination period. New timings: 7:00 AM to 10:00 PM.', time:'1 week ago' },
];

export default function Notifications() {
  const { showNotification } = useToast();
  const [activeFilter, setActiveFilter] = useState('all');
  const [unread, setUnread] = useState(new Set(['r1','r2','r3']));
  const [liveNotifs, setLiveNotifs] = useState([]);

  useEffect(() => {
    api.getNotifications()
      .then(data => { if (Array.isArray(data)) setLiveNotifs(data); })
      .catch(() => {});
  }, []);

  const markRead = (id) => setUnread(prev => { const s = new Set(prev); s.delete(id); return s; });
  const markAllRead = () => { setUnread(new Set()); showNotification('All notifications marked as read!', 'success'); };

  const filter = (items) =>
    activeFilter === 'all' ? items : items.filter(n => n.category === activeFilter);

  const emailAll = () => {
    showNotification(`Sending ${IMPORTANT.length} important notifications to your email...`, 'success');
    setTimeout(() => showNotification(`${IMPORTANT.length} notifications sent successfully!`, 'success'), 2000);
  };

  // Merge static + live for "All Notifications"
  const allNotifs = [...ALL_STATIC, ...liveNotifs.map(n => ({
    id: `live-${n.id}`,
    category: n.is_urgent ? 'exams' : 'announcements',
    title: n.title,
    message: n.summary || n.message || '',
    time: n.date,
  }))];

  return (
    <>
      <Navbar />
      <div className="notifications-container">

        {/* Header */}
        <div className="notifications-header">
          <h1><i className="fas fa-bell"></i> Notifications Center</h1>
          <p>Stay updated with important KTU announcements and deadlines</p>
        </div>

        {/* ── Important Notifications with Countdown ────────── */}
        <section className="important-notifications-section">
          <div className="section-header-custom">
            <h2><i className="fas fa-exclamation-triangle"></i> Most Important - Action Required</h2>
            <button className="btn-email-all" id="emailAllBtn" onClick={emailAll}>
              <i className="fas fa-envelope"></i> Email All to Me
            </button>
          </div>

          <div className="important-notifications-grid">
            {IMPORTANT.map(item => (
              <div key={item.id} className={`important-notification-card ${item.type}`}>
                <div className={`notification-priority ${item.priorityCls}`}>
                  <i className={`fas fa-${item.type === 'urgent' ? 'fire' : item.type === 'important' ? 'exclamation-circle' : 'info-circle'}`}></i>
                  <span>{item.priority}</span>
                </div>
                <div className="notification-main">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <Countdown deadline={item.deadline} />
                  <div className="notification-meta">
                    <span><i className="fas fa-calendar"></i> {item.metaDate}</span>
                    <span><i className="fas fa-clock"></i> {item.metaPosted}</span>
                  </div>
                  <div className="notification-actions">
                    <button className="btn-action-primary">
                      <i className={`fas ${item.primaryBtn.icon}`}></i> {item.primaryBtn.text}
                    </button>
                    <button
                      className="btn-email-notification"
                      onClick={() => showNotification(`Email notification sent: "${item.title}"`, 'success')}
                    >
                      <i className="fas fa-envelope"></i> Email This to Me
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Filter ────────────────────────────────────────── */}
        <div className="filter-section">
          <div className="filter-tabs">
            {[
              { key:'all', icon:'fa-th-large', label:'All Notifications' },
              { key:'exams', icon:'fa-file-alt', label:'Exams' },
              { key:'results', icon:'fa-chart-bar', label:'Results' },
              { key:'announcements', icon:'fa-bullhorn', label:'Announcements' },
            ].map(t => (
              <button
                key={t.key}
                className={`filter-tab${activeFilter === t.key ? ' active' : ''}`}
                data-filter={t.key}
                onClick={() => setActiveFilter(t.key)}
              >
                <i className={`fas ${t.icon}`}></i> {t.label}
              </button>
            ))}
          </div>
          <button className="mark-all-read" onClick={markAllRead}>
            <i className="fas fa-check-double"></i> Mark All Read
          </button>
        </div>

        {/* ── Recent Notifications ──────────────────────────── */}
        <section className="recent-notifications-section">
          <h2><i className="fas fa-clock"></i> Recent Notifications</h2>
          <div className="notifications-list">
            {filter(RECENT_STATIC).map(n => (
              <NotifCard key={n.id} n={n} isUnread={unread.has(n.id)} onMarkRead={markRead} />
            ))}
          </div>
        </section>

        {/* ── All Notifications ─────────────────────────────── */}
        <section className="all-notifications-section">
          <h2><i className="fas fa-list"></i> All Notifications</h2>
          <div className="notifications-list">
            {filter(allNotifs).map(n => (
              <NotifCard key={n.id} n={n} isUnread={unread.has(n.id)} onMarkRead={markRead} />
            ))}
          </div>
        </section>

      </div>
      <footer className="footer">
        <div className="footer-bottom">
          <p>&copy; 2024 EduAssist - Independent Student Support Platform. Not affiliated with KTU.</p>
        </div>
      </footer>
    </>
  );
}
