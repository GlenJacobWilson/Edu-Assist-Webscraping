import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';

// ── Todo Widget ───────────────────────────────────────────
function TodoWidget() {
  const [todos, setTodos] = useState(() => { try { return JSON.parse(localStorage.getItem('todos'))||[]; } catch { return []; }});
  const [input, setInput] = useState('');
  useEffect(() => { localStorage.setItem('todos',JSON.stringify(todos)); },[todos]);
  const add = () => { if (!input.trim()) return; setTodos(t=>[...t,{id:Date.now(),text:input.trim(),done:false}]); setInput(''); };
  const toggle = id => setTodos(t=>t.map(x=>x.id===id?{...x,done:!x.done}:x));
  const del  = id => setTodos(t=>t.filter(x=>x.id!==id));
  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.2rem',paddingBottom:'1rem',borderBottom:'2px solid var(--light-gray)'}}>
        <h3 style={{fontWeight:700,color:'var(--dark)',display:'flex',alignItems:'center',gap:'0.5rem'}}><i className="fas fa-check-square" style={{color:'var(--primary)'}}></i> My Tasks</h3>
        <span style={{fontSize:'0.82rem',color:'var(--gray)'}}>{todos.filter(t=>t.done).length}/{todos.length} done</span>
      </div>
      {todos.length===0 && <p style={{color:'var(--gray)',fontSize:'0.88rem',textAlign:'center',padding:'1rem 0'}}>No tasks yet. Add your first one below!</p>}
      {todos.map(t=>(
        <div key={t.id} className={`todo-item${t.done?' done-todo':''}`}>
          <input type="checkbox" className="todo-check" checked={t.done} onChange={()=>toggle(t.id)} />
          <span className="todo-text">{t.text}</span>
          <button className="todo-del" onClick={()=>del(t.id)}><i className="fas fa-times"></i></button>
        </div>
      ))}
      <div className="add-todo-row">
        <input className="add-todo-input" placeholder="Add a task…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} />
        <button className="add-todo-btn" onClick={add}><i className="fas fa-plus"></i></button>
      </div>
    </div>
  );
}

// ── Backlog Tracker ───────────────────────────────────────
function BacklogTracker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [backlogs, setBacklogs] = useState(() => { try { return JSON.parse(localStorage.getItem('backlogs'))||[]; } catch { return []; }});
  const [form, setForm] = useState({subject:'',semester:user?.semester||'S6'});
  useEffect(()=>{ localStorage.setItem('backlogs',JSON.stringify(backlogs)); },[backlogs]);
  const add = () => {
    if (!form.subject.trim()) return;
    setBacklogs(b=>[...b,{id:Date.now(),...form}]);
    setForm(f=>({...f,subject:''}));
  };
  const resolve = id => setBacklogs(b=>b.filter(x=>x.id!==id));
  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.2rem',paddingBottom:'1rem',borderBottom:'2px solid var(--light-gray)'}}>
        <h3 style={{fontWeight:700,color:'var(--dark)',display:'flex',alignItems:'center',gap:'0.5rem'}}><i className="fas fa-exclamation-circle" style={{color:'var(--danger)'}}></i> Backlog Tracker</h3>
        {backlogs.length>0 && <span className="tag urgent">{backlogs.length} subject{backlogs.length!==1?'s':''}</span>}
      </div>
      {backlogs.length===0 ? (
        <p style={{color:'var(--gray)',fontSize:'0.88rem',textAlign:'center',padding:'0.5rem 0 1rem'}}>No backlogs tracked. Add subjects you need to clear.</p>
      ) : backlogs.map(b=>(
        <div key={b.id} className="backlog-item">
          <i className="fas fa-book" style={{color:'var(--danger)',fontSize:'1.1rem'}}></i>
          <div style={{flex:1}}>
            <div className="backlog-subject">{b.subject}</div>
            <div className="backlog-sem">{b.semester}</div>
          </div>
          <button onClick={()=>navigate('/materials')} style={{background:'var(--primary-bg)',color:'var(--primary)',border:'1px solid var(--primary)',borderRadius:'var(--r-sm)',padding:'0.3rem 0.75rem',cursor:'pointer',fontSize:'0.78rem',fontWeight:600,marginRight:'0.5rem'}}>
            <i className="fas fa-book-open"></i> QP
          </button>
          <button className="btn-resolve" onClick={()=>resolve(b.id)}>✓ Cleared</button>
        </div>
      ))}
      <div style={{display:'flex',gap:'0.6rem',marginTop:'0.8rem'}}>
        <select value={form.semester} onChange={e=>setForm(f=>({...f,semester:e.target.value}))} style={{padding:'0.6rem',border:'1.5px solid var(--light-gray)',borderRadius:'var(--r-sm)',fontSize:'0.88rem',background:'var(--white)',color:'var(--dark)'}}>
          {['S1','S2','S3','S4','S5','S6','S7','S8'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Subject name with backlog…" style={{flex:1,padding:'0.6rem',border:'1.5px solid var(--light-gray)',borderRadius:'var(--r-sm)',fontSize:'0.88rem'}} />
        <button onClick={add} style={{padding:'0.6rem 1rem',background:'var(--danger)',color:'#fff',border:'none',borderRadius:'var(--r-sm)',cursor:'pointer',fontWeight:600}}>
          <i className="fas fa-plus"></i>
        </button>
      </div>
    </div>
  );
}

// ── Alert Subscriptions ───────────────────────────────────
function AlertSettings() {
  const { showNotification } = useToast();
  const [sub, setSub] = useState({whatsapp:'',notify_email:'',urgent_only:true});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(()=>{ api.getSubscription().then(d=>{ if(d) setSub(d); }).catch(()=>{}); },[]);
  const save = async () => {
    setLoading(true);
    try { await api.subscribe(sub); showNotification('Alert preferences saved!','success'); setSaved(true); }
    catch(err) { showNotification(err.message,'error'); }
    setLoading(false);
  };
  return (
    <div className="card">
      <h3 style={{fontWeight:700,color:'var(--dark)',marginBottom:'0.5rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><i className="fas fa-bell" style={{color:'var(--primary)'}}></i> Alert Subscriptions</h3>
      <p style={{color:'var(--gray)',fontSize:'0.88rem',marginBottom:'1.4rem'}}>Get notified when urgent KTU announcements are published. (Requires backend email/SMS integration)</p>

      <div className="sub-panel">
        <h4><i className="fab fa-whatsapp" style={{color:'#25d366'}}></i> WhatsApp Number</h4>
        <p>Enter your WhatsApp number to receive urgent notifications (requires Twilio integration on backend)</p>
        <input type="tel" placeholder="+91 9876543210" value={sub.whatsapp} onChange={e=>setSub(s=>({...s,whatsapp:e.target.value}))} style={{width:'100%',padding:'0.75rem',border:'1.5px solid var(--light-gray)',borderRadius:'var(--r-sm)',fontSize:'0.93rem',marginBottom:'0.5rem'}} />
      </div>

      <div className="sub-panel" style={{marginTop:'1rem'}}>
        <h4><i className="fas fa-envelope" style={{color:'var(--primary)'}}></i> Email Alerts</h4>
        <p>Enter your email to receive KTU notification summaries (requires Resend/SendGrid on backend)</p>
        <input type="email" placeholder="your@email.com" value={sub.notify_email} onChange={e=>setSub(s=>({...s,notify_email:e.target.value}))} style={{width:'100%',padding:'0.75rem',border:'1.5px solid var(--light-gray)',borderRadius:'var(--r-sm)',fontSize:'0.93rem',marginBottom:'0.5rem'}} />
      </div>

      <div className="checkbox-inline" style={{margin:'1rem 0'}}>
        <input type="checkbox" id="urgonly" checked={sub.urgent_only} onChange={e=>setSub(s=>({...s,urgent_only:e.target.checked}))} />
        <label htmlFor="urgonly">Only alert me for <strong>urgent</strong> notifications (recommended)</label>
      </div>

      <button onClick={save} disabled={loading} style={{padding:'0.8rem 2rem',background:'var(--primary)',color:'#fff',border:'none',borderRadius:'var(--r-md)',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.95rem'}}>
        <i className="fas fa-save"></i>{loading?'Saving…':saved?'Saved ✓':'Save Preferences'}
      </button>
    </div>
  );
}

// ── Main Settings Page ────────────────────────────────────
export default function Settings() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <a href="/dashboard" className="logo" onClick={e=>{e.preventDefault();navigate('/dashboard');}}>
            <i className="fas fa-graduation-cap"></i><span>EduAssist</span>
          </a>
          <div style={{display:'flex',gap:'0.7rem',alignItems:'center'}}>
            <button className="theme-toggle" onClick={toggle} title={dark?'Switch to Light':'Switch to Dark'}>
              <i className={`fas fa-${dark?'sun':'moon'}`}></i>
            </button>
            <div className="user-profile" onClick={()=>navigate('/dashboard')}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'S')}&background=2563eb&color=fff`} alt="u" />
              <span>{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div style={{marginTop:'72px',padding:'2rem',maxWidth:'800px',margin:'72px auto 0'}}>
        <button onClick={()=>navigate('/dashboard')} style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'none',border:'none',color:'var(--primary)',fontWeight:600,cursor:'pointer',marginBottom:'1.5rem',fontSize:'0.95rem'}}>
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>

        <div style={{marginBottom:'2rem'}}>
          <h1 style={{fontSize:'1.8rem',fontWeight:800,color:'var(--dark)',marginBottom:'0.4rem',display:'flex',alignItems:'center',gap:'0.7rem'}}>
            <span style={{fontSize:'2rem'}}>⚙️</span> Settings
          </h1>
          <p style={{color:'var(--gray)'}}>Manage your tasks, backlogs, notifications and display preferences.</p>
        </div>

        {/* Dark mode toggle card */}
        <div className="card" style={{marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h3 style={{fontWeight:700,color:'var(--dark)',marginBottom:'0.3rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <i className={`fas fa-${dark?'sun':'moon'}`} style={{color:'var(--accent)'}}></i> {dark?'Light Mode':'Dark Mode'}
            </h3>
            <p style={{color:'var(--gray)',fontSize:'0.88rem'}}>Currently using <strong>{dark?'dark':'light'}</strong> theme. Click to switch.</p>
          </div>
          <button onClick={toggle} style={{padding:'0.7rem 1.6rem',background:dark?'var(--accent)':'var(--dark)',color:'#fff',border:'none',borderRadius:'var(--r-md)',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.9rem',transition:'var(--transition)'}}>
            <i className={`fas fa-${dark?'sun':'moon'}`}></i> Switch to {dark?'Light':'Dark'}
          </button>
        </div>

        {/* Profile card */}
        <div className="card" style={{marginBottom:'1.5rem',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'#fff',border:'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:'1.2rem'}}>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'S')}&background=fff&color=7c3aed&size=64`} alt="u" style={{width:'64px',height:'64px',borderRadius:'50%',border:'3px solid rgba(255,255,255,0.4)'}} />
            <div>
              <div style={{fontSize:'1.3rem',fontWeight:800}}>{user?.name}</div>
              <div style={{opacity:0.85,fontSize:'0.9rem'}}>{user?.college||'KTU Student'}</div>
              <div style={{opacity:0.7,fontSize:'0.82rem',marginTop:'0.2rem'}}>{user?.semester} · {user?.department}</div>
            </div>
          </div>
        </div>

        <TodoWidget />
        <div style={{marginTop:'1.5rem'}}><BacklogTracker /></div>
        <div style={{marginTop:'1.5rem'}}><AlertSettings /></div>

        {/* Danger zone */}
        <div className="card" style={{marginTop:'1.5rem',border:'1px solid var(--danger)',background:'var(--danger-bg)'}}>
          <h3 style={{fontWeight:700,color:'var(--danger)',marginBottom:'0.5rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <i className="fas fa-exclamation-triangle"></i> Danger Zone
          </h3>
          <p style={{color:'var(--gray)',fontSize:'0.88rem',marginBottom:'1rem'}}>Logging out will clear your session. Your data stays saved in the database.</p>
          <button onClick={()=>{logout();navigate('/');}} style={{padding:'0.7rem 1.6rem',background:'var(--danger)',color:'#fff',border:'none',borderRadius:'var(--r-md)',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </>
  );
}
