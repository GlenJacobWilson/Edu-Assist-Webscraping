import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';

// ── AI Ask-About-Notice Mini Modal ────────────────────────────────────────────
function AskNoticeModal({ notice, onClose }) {
  const { showNotification } = useToast();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer]     = useState('');
  const [loading, setLoading]   = useState(false);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true); setAnswer('');
    try {
      const noticeText = `${notice.title}\n${notice.summary || ''}\n${(notice.message||'').replace(/<[^>]*>/g,'')}`;
      const res = await api.askAboutNotice(noticeText, question);
      setAnswer(res.answer || '');
    } catch(err) { showNotification(err.message || 'AI unavailable — add ANTHROPIC_API_KEY to backend .env', 'error'); }
    setLoading(false);
  };

  const QUICK = ['What is the last date?', 'Who is this for?', 'What do I need to submit?', 'What action is required?'];

  return (
    <div className="ai-chat-modal" onClick={e=>e.target.classList.contains('ai-chat-modal')&&onClose()}>
      <div className="ai-chat-box">
        <div className="ai-chat-header">
          <h3><span style={{fontSize:'1.2rem'}}>🤖</span> Ask Claude about this notice</h3>
          <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="ai-chat-body">
          <div style={{background:'var(--bg)',borderRadius:'var(--r-sm)',padding:'0.8rem 1rem',marginBottom:'1rem',fontSize:'0.85rem',color:'var(--gray)',lineHeight:1.6,border:'1px solid var(--light-gray)'}}>
            <strong style={{color:'var(--dark)',display:'block',marginBottom:'0.3rem'}}>{notice.title}</strong>
            {notice.summary}
          </div>
          <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.8rem'}}>
            {QUICK.map(q=><button key={q} onClick={()=>setQuestion(q)} style={{padding:'0.3rem 0.75rem',background:'var(--primary-bg)',color:'var(--primary)',border:'1px solid rgba(37,99,235,0.25)',borderRadius:'20px',fontSize:'0.78rem',fontWeight:600,cursor:'pointer'}}>{q}</button>)}
          </div>
          <textarea className="ai-chat-input" rows={2} placeholder="Type your question…" value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),ask())} />
          <button className="btn-ai" onClick={ask} disabled={loading||!question.trim()} style={{marginTop:'0.7rem',background:'linear-gradient(135deg,var(--primary),#7c3aed)'}}>
            {loading ? <><div className="spinner" style={{width:'16px',height:'16px',borderWidth:'2px',margin:'0'}}></div> Thinking…</> : <><i className="fas fa-robot"></i> Ask Claude</>}
          </button>
          {answer && <div className="ai-answer">{answer}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Announcement Card ─────────────────────────────────────────────────────────
function AnnouncementCard({ item, isPinned, onTogglePin, idx }) {
  const [expanded, setExpanded] = useState(false);
  const [askModal, setAskModal] = useState(false);
  const hasMsg = (item.message||'').replace(/<[^>]*>/g,'').trim().length > 0;
  const title = (item.title||'').toLowerCase();
  const cat = item.is_urgent ? 'urgent' : title.includes('exam')||title.includes('hall ticket') ? 'exam' : title.includes('result') ? 'result' : title.includes('register')||title.includes('fee') ? 'register' : 'announce';
  const catColors = { urgent:'var(--danger)', exam:'var(--accent)', result:'var(--success)', register:'#7c3aed', announce:'var(--primary)' };

  return (
    <>
      <div className={`card${isPinned?' pinned-card':''}`} style={{animationDelay:`${idx*0.05}s`,borderLeft:`4px solid ${catColors[cat]}`}}>
        <div className="card-header">
          <div className="card-header-left">
            <span className="date">{item.date}</span>
            {item.is_urgent && <span className="tag urgent">Urgent</span>}
            {cat==='exam'     && <span className="tag exam">Exam</span>}
            {cat==='result'   && <span className="tag result">Result</span>}
            {cat==='register' && <span style={{padding:'0.22rem 0.65rem',borderRadius:'20px',fontSize:'0.7rem',fontWeight:700,background:'rgba(124,58,237,0.1)',color:'#7c3aed'}}>Register</span>}
          </div>
          <button className={`pin-btn${isPinned?' pinned':''}`} onClick={()=>onTogglePin(item.id)}>
            {isPinned ? '★ Pinned' : '☆ Pin'}
          </button>
        </div>
        <h3 className="card-title">{isPinned && '📌 '}{item.title}</h3>
        {item.summary && (
          <div className="ai-summary-box">
            <div className="ai-summary-label"><span>✨</span><strong>AI Summary</strong></div>
            <p className="ai-summary-text">{item.summary}</p>
          </div>
        )}
        {hasMsg && (
          <>
            <button className="read-more-btn" onClick={()=>setExpanded(o=>!o)}>
              <i className={`fas fa-chevron-${expanded?'up':'down'}`}></i> {expanded?'Collapse':'Read Full Notice'}
            </button>
            {expanded && <div className="message-content" dangerouslySetInnerHTML={{__html:item.message}} />}
          </>
        )}
        {item.files?.length > 0 && (
          <div className="files-row">
            {item.files.map((f,i)=>(
              <a key={i} href={api.downloadUrl(f.id)} target="_blank" rel="noopener noreferrer" className="download-btn">
                <i className="fas fa-download"></i>{(f.name?.length>28?f.name.slice(0,28)+'…':f.name)||'Download PDF'}
              </a>
            ))}
          </div>
        )}
        <div style={{marginTop:'0.8rem',paddingTop:'0.8rem',borderTop:'1px solid var(--light-gray)',display:'flex',justifyContent:'flex-end'}}>
          <button className="ai-ask-btn" onClick={()=>setAskModal(true)}>
            <i className="fas fa-robot"></i> Ask Claude
          </button>
        </div>
      </div>
      {askModal && <AskNoticeModal notice={item} onClose={()=>setAskModal(false)} />}
    </>
  );
}

// ── Mini To-Do ────────────────────────────────────────────────────────────────
function MiniTodo() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState(()=>{try{return JSON.parse(localStorage.getItem('todos'))||[]}catch{return[]}});
  const [input, setInput] = useState('');
  useEffect(()=>localStorage.setItem('todos',JSON.stringify(todos)),[todos]);
  const add = ()=>{if(!input.trim())return;setTodos(t=>[...t,{id:Date.now(),text:input.trim(),done:false}]);setInput('');};
  const toggle = id=>setTodos(t=>t.map(x=>x.id===id?{...x,done:!x.done}:x));
  const del  = id=>setTodos(t=>t.filter(x=>x.id!==id));
  const pending = todos.filter(t=>!t.done);
  return (
    <div className="card">
      <div className="card-header">
        <h3 style={{fontSize:'1rem',fontWeight:700,color:'var(--dark)',display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <i className="fas fa-check-square" style={{color:'var(--primary)'}}></i> My Tasks
          {pending.length>0 && <span className="badge" style={{background:'var(--primary)'}}>{pending.length}</span>}
        </h3>
        <button onClick={()=>navigate('/settings')} style={{fontSize:'0.8rem',color:'var(--primary)',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>View All</button>
      </div>
      {todos.slice(0,4).map(t=>(
        <div key={t.id} className={`todo-item${t.done?' done-todo':''}`}>
          <input type="checkbox" className="todo-check" checked={t.done} onChange={()=>toggle(t.id)} />
          <span className="todo-text" style={{fontSize:'0.85rem'}}>{t.text}</span>
          <button className="todo-del" onClick={()=>del(t.id)}><i className="fas fa-times"></i></button>
        </div>
      ))}
      {todos.length>4 && <p style={{fontSize:'0.8rem',color:'var(--gray)',textAlign:'center',marginTop:'0.5rem'}}>+{todos.length-4} more tasks</p>}
      <div className="add-todo-row">
        <input className="add-todo-input" placeholder="Add a task…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} />
        <button className="add-todo-btn" onClick={add}><i className="fas fa-plus"></i></button>
      </div>
    </div>
  );
}

// ── Mini Leaderboard ──────────────────────────────────────────────────────────
function MiniLeaderboard() {
  const [board, setBoard] = useState([]);
  const navigate = useNavigate();
  useEffect(()=>{api.getLeaderboard().then(d=>setBoard(d||[])).catch(()=>{});},[]);
  if (!board.length) return null;
  const medals = ['🥇','🥈','🥉'];
  return (
    <div className="card">
      <div className="card-header">
        <h3 style={{fontSize:'1rem',fontWeight:700,color:'var(--dark)',display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <i className="fas fa-trophy" style={{color:'var(--accent)'}}></i> Top Helpers
        </h3>
        <button onClick={()=>navigate('/forum')} style={{fontSize:'0.8rem',color:'var(--primary)',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Forum</button>
      </div>
      {board.slice(0,5).map((u,i)=>(
        <div key={u.name} className="lb-row" style={{padding:'0.65rem 0.9rem'}}>
          <span className={`lb-rank${i===0?' gold':i===1?' silver':i===2?' bronze':''}`} style={{fontSize:'1.1rem',minWidth:'28px'}}>{medals[i]||`#${i+1}`}</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:'0.88rem',color:'var(--dark)'}}>{u.name}</div>
            <div style={{fontSize:'0.75rem',color:'var(--gray)'}}>{u.semester} · {u.department}</div>
          </div>
          <span style={{fontWeight:700,color:'var(--accent)',fontSize:'0.95rem'}}>{u.points}pts</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout, setProfile } = useAuth();
  const { showNotification } = useToast();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedIds, setPinnedIds]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [profileData, setProfileData]     = useState(null);
  const [filter, setFilter]               = useState('all');
  const [search, setSearch]               = useState('');

  const userName = profileData?.full_name   || user?.name    || 'Student';
  const college  = profileData?.college_name|| user?.college || 'KTU Student';
  const semester = profileData?.semester    || user?.semester || '';

  const getGreeting = () => { const h=new Date().getHours(); return h<12?'Good Morning':h<18?'Good Afternoon':'Good Evening'; };
  const getDaysLeft = () => {
    const dates = {S1:'2026-03-15',S2:'2026-06-10',S3:'2026-04-20',S4:'2026-04-25',S5:'2026-04-24',S6:'2026-04-25',S7:'2026-04-15',S8:'2026-04-20'};
    return Math.max(0, Math.ceil((new Date(dates[semester]||'2026-05-20')-new Date())/86400000));
  };

  useEffect(()=>{
    if (!user?.token) { navigate('/login'); return; }
    const load = async () => {
      const [notifs,pins,me] = await Promise.allSettled([api.getNotifications(),api.getPins(),api.getMe()]);
      if (notifs.status==='fulfilled') setAnnouncements(Array.isArray(notifs.value)?notifs.value:[]);
      if (pins.status==='fulfilled')   setPinnedIds(Array.isArray(pins.value)?pins.value:[]);
      if (me.status==='fulfilled'&&me.value?.full_name) { setProfileData(me.value); setProfile(me.value); }
      setLoading(false);
    };
    load();
  },[]);

  const togglePin = async (id) => {
    const was = pinnedIds.includes(id);
    setPinnedIds(was?pinnedIds.filter(p=>p!==id):[...pinnedIds,id]);
    try {
      was ? await api.unpin(id) : await api.pin(id);
      showNotification(was?'Unpinned':'📌 Pinned!', was?'info':'success');
    } catch { setPinnedIds(was?[...pinnedIds,id]:pinnedIds.filter(p=>p!==id)); showNotification('Login required','error'); }
  };

  let displayed = [...announcements];
  if (search)         displayed = displayed.filter(n=>(n.title||'').toLowerCase().includes(search.toLowerCase()));
  if (filter==='urgent')  displayed = displayed.filter(n=>n.is_urgent);
  if (filter==='exam')    displayed = displayed.filter(n=>(n.title||'').toLowerCase().includes('exam'));
  if (filter==='result')  displayed = displayed.filter(n=>(n.title||'').toLowerCase().includes('result'));
  if (filter==='pinned')  displayed = displayed.filter(n=>pinnedIds.includes(n.id));
  displayed.sort((a,b)=>{const ap=pinnedIds.includes(a.id),bp=pinnedIds.includes(b.id);return ap===bp?0:ap?-1:1;});

  const urgentCount = announcements.filter(n=>n.is_urgent).length;

  const NAV_ITEMS = [
    {icon:'fa-home',        label:'Overview',       path:null,          active:true},
    {icon:'fa-calculator',  label:'GPA Manager',    path:'/gpa'},
    {icon:'fa-chart-bar',   label:'Result Tracker', path:'/results'},
    {icon:'fa-calendar',    label:'Study Planner',  path:'/planner'},
    {icon:'fa-percent',     label:'Attendance',     path:'/attendance'},
    {icon:'fa-comments',    label:'Forum',          path:'/forum'},
    {icon:'fa-users',       label:'Study Groups',   path:'/studygroups'},
    {icon:'fa-book',        label:'Study Materials',path:'/materials'},
    {icon:'fa-magic',       label:'AI Tools',       path:'/ai'},
    {icon:'fa-cog',         label:'Settings',       path:'/settings'},
  ];

  return (
    <>
      {sidebarOpen && <div style={{position:'fixed',inset:0,zIndex:998,background:'rgba(0,0,0,0.35)'}} onClick={()=>setSidebarOpen(false)} />}

      <nav className="navbar">
        <div className="nav-container">
          <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
            <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dark)',fontSize:'1.2rem',padding:'0.3rem'}}>
              <i className="fas fa-bars"></i>
            </button>
            <a href="/" className="logo" onClick={e=>{e.preventDefault();navigate('/');}}>
              <i className="fas fa-graduation-cap"></i><span>EduAssist</span>
            </a>
          </div>
          <div style={{display:'flex',gap:'0.7rem',alignItems:'center'}}>
            <button className="theme-toggle" onClick={toggle} title={dark?'Light mode':'Dark mode'}>
              <i className={`fas fa-${dark?'sun':'moon'}`}></i>
            </button>
            <div className="user-profile" onClick={()=>{logout();navigate('/');}} title="Click to logout">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563eb&color=fff`} alt="avatar" />
              <span>{userName.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className={`sidebar${sidebarOpen?' active':''}`}>
          <div className="sidebar-header">
            <h3>{userName.split(' ')[0]}'s Portal</h3>
            <span className="portal-badge">{semester}</span>
          </div>
          <ul className="sidebar-menu">
            {NAV_ITEMS.map(item=>(
              <li key={item.label} className={item.active?'active':''} onClick={()=>{item.path&&navigate(item.path);setSidebarOpen(false);}}>
                <i className={`fas ${item.icon}`}></i><span>{item.label}</span>
                {item.label==='Overview'&&urgentCount>0&&<span className="badge">{urgentCount}</span>}
              </li>
            ))}
            <li style={{borderTop:'1px solid var(--light-gray)',marginTop:'0.5rem',paddingTop:'0.5rem',color:'var(--danger)',cursor:'pointer'}} onClick={()=>{logout();navigate('/');}}>
              <i className="fas fa-sign-out-alt"></i><span>Logout</span>
            </li>
          </ul>
        </aside>

        <main className="dashboard-main">
          <section className="welcome-section">
            <div className="welcome-text">
              <h1>{getGreeting()}, {userName.split(' ')[0]}! 👋</h1>
              <p><i className="fas fa-university" style={{marginRight:'0.4rem',color:'var(--primary)'}}></i>{college}</p>
            </div>
            <span className="info-badge"><i className="fas fa-check-circle"></i> {semester} · {profileData?.department||user?.department||'KTU'}</span>
          </section>

          <section className="stats-grid">
            <div className="stat-card"><div className="stat-icon blue"><i className="fas fa-bullhorn"></i></div><div className="stat-info"><h3>{announcements.length}</h3><p>Announcements</p></div></div>
            <div className="stat-card"><div className="stat-icon orange"><i className="fas fa-clock"></i></div><div className="stat-info"><h3>{getDaysLeft()}</h3><p>Days to Exam</p></div></div>
            <div className="stat-card"><div className="stat-icon purple"><i className="fas fa-thumbtack"></i></div><div className="stat-info"><h3>{pinnedIds.length}</h3><p>Pinned</p></div></div>
            <div className="stat-card" style={{cursor:'pointer'}} onClick={()=>navigate('/gpa')}><div className="stat-icon green"><i className="fas fa-calculator"></i></div><div className="stat-info"><h3>GPA</h3><p>Calculator ↗</p></div></div>
          </section>

          {urgentCount>0 && (
            <div className="alert-section">
              <h3 style={{color:'#991b1b',fontSize:'1rem',fontWeight:700,marginBottom:'0.6rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <i className="fas fa-exclamation-triangle"></i> {urgentCount} Urgent Notice{urgentCount>1?'s':''} Require Attention
              </h3>
              <ul style={{paddingLeft:'1.2rem',color:'#b91c1c',fontSize:'0.88rem'}}>
                {announcements.filter(a=>a.is_urgent).slice(0,3).map(a=>(
                  <li key={a.id} style={{marginBottom:'0.3rem'}}><strong>{a.date}:</strong> {a.title}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="quick-actions">
            <button className="qa-btn primary"       onClick={()=>navigate('/forum')}><i className="fas fa-comments"></i> Forum</button>
            <button className="qa-btn outline-blue"  onClick={()=>navigate('/results')}><i className="fas fa-chart-bar"></i> Results</button>
            <button className="qa-btn outline-amber" onClick={()=>navigate('/attendance')}><i className="fas fa-percent"></i> Attendance</button>
            <button className="qa-btn outline-green" onClick={()=>navigate('/studygroups')}><i className="fas fa-users"></i> Study Groups</button>
            <button className="qa-btn outline-blue"  onClick={()=>navigate('/ai')} style={{borderColor:'#7c3aed',color:'#7c3aed'}}><i className="fas fa-magic"></i> AI Tools</button>
          </div>

          <div className="dash-inner-grid">
            <div>
              <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.2rem',flexWrap:'wrap',alignItems:'center'}}>
                <div style={{flex:1,minWidth:'180px',position:'relative'}}>
                  <i className="fas fa-search" style={{position:'absolute',left:'0.9rem',top:'50%',transform:'translateY(-50%)',color:'var(--gray)',fontSize:'0.85rem'}}></i>
                  <input placeholder="Search notices…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'0.6rem 0.8rem 0.6rem 2.4rem',border:'1.5px solid var(--light-gray)',borderRadius:'var(--r-md)',fontSize:'0.88rem',background:'var(--white)',color:'var(--dark)'}} />
                </div>
                {['all','urgent','exam','result','pinned'].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{padding:'0.5rem 1rem',borderRadius:'var(--r-sm)',border:'1.5px solid',fontWeight:600,fontSize:'0.82rem',cursor:'pointer',transition:'var(--transition)',background:filter===f?'var(--primary)':'var(--white)',borderColor:filter===f?'var(--primary)':'var(--light-gray)',color:filter===f?'#fff':'var(--gray)',textTransform:'capitalize'}}>
                    {f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>

              <div style={{fontSize:'0.82rem',color:'var(--gray)',marginBottom:'1rem',fontWeight:500}}>
                Showing {displayed.length} of {announcements.length} notices
              </div>

              {loading ? (
                <div className="loading"><i className="fas fa-circle-notch fa-spin" style={{marginRight:'0.5rem'}}></i>Loading KTU announcements…</div>
              ) : displayed.length===0 ? (
                <div className="empty-state"><i className="fas fa-inbox"></i><p>No notices match your filter.</p></div>
              ) : (
                <div className="announcements-grid">
                  {displayed.map((item,idx)=>(
                    <AnnouncementCard key={item.id} item={item} isPinned={pinnedIds.includes(item.id)} onTogglePin={togglePin} idx={idx} />
                  ))}
                </div>
              )}
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'1.2rem'}}>
              <MiniTodo />
              <MiniLeaderboard />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
