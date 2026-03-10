import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';

const SEMS = ['S1','S2','S3','S4','S5','S6','S7','S8'];

function CreateGroupModal({ onClose, onCreated, userSem }) {
  const { showNotification } = useToast();
  const [form, setForm] = useState({ subject:'', semester:userSem||'S6', department:'CSE', mode:'online', location:'', description:'', contact:'' });
  const [loading, setLoading] = useState(false);
  const set = f => e => setForm(p=>({...p,[f]:e.target.value}));

  const submit = async e => {
    e.preventDefault();
    if (!form.subject||!form.contact) { showNotification('Subject and contact are required','error'); return; }
    setLoading(true);
    try { await api.createStudyGroup(form); showNotification('Study group created! 🎉','success'); onCreated(); }
    catch(err) { showNotification(err.message,'error'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div className="modal-header-bar">
          <h2><i className="fas fa-users"></i> Create Study Group</h2>
          <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="modal-body">
          <form onSubmit={submit}>
            <div className="form-group">
              <label><i className="fas fa-book"></i> Subject</label>
              <input type="text" placeholder="e.g. Operating Systems" value={form.subject} onChange={set('subject')} required />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label><i className="fas fa-graduation-cap"></i> Semester</label>
                <select value={form.semester} onChange={set('semester')}>
                  {SEMS.map(s=><option key={s} value={s}>Semester {s.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-code-branch"></i> Department</label>
                <select value={form.department} onChange={set('department')}>
                  {['CSE','ECE','EEE','MECH','CIVIL','IT'].map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label><i className="fas fa-wifi"></i> Mode</label>
              <div style={{display:'flex',gap:'1.5rem',marginTop:'0.3rem'}}>
                {['online','offline'].map(m=>(
                  <label key={m} style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer',fontSize:'0.9rem'}}>
                    <input type="radio" name="mode" value={m} checked={form.mode===m} onChange={set('mode')} style={{accentColor:'var(--primary)'}} />
                    {m.charAt(0).toUpperCase()+m.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            {form.mode==='offline' && (
              <div className="form-group">
                <label><i className="fas fa-map-marker-alt"></i> Location</label>
                <input type="text" placeholder="e.g. College library, Room 204" value={form.location} onChange={set('location')} />
              </div>
            )}
            <div className="form-group">
              <label><i className="fas fa-align-left"></i> Description (optional)</label>
              <textarea rows={2} placeholder="What will you study? When do you meet?" value={form.description} onChange={set('description')} style={{padding:'0.7rem',border:'1.5px solid var(--light-gray)',borderRadius:'var(--r-sm)',width:'100%',fontFamily:'var(--font)',fontSize:'0.88rem',resize:'vertical'}} />
            </div>
            <div className="form-group">
              <label><i className="fas fa-phone"></i> Contact (WhatsApp/email)</label>
              <input type="text" placeholder="WhatsApp number or email to join" value={form.contact} onChange={set('contact')} required />
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              <i className="fas fa-users"></i> {loading?'Creating…':'Create Group'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function StudyGroups() {
  const { user }             = useAuth();
  const { showNotification } = useToast();
  const { dark, toggle }     = useTheme();
  const navigate             = useNavigate();

  const [groups, setGroups]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [semFilter, setSemFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [joined, setJoined] = useState(()=>{ try{return JSON.parse(localStorage.getItem('joined_groups'))||[]}catch{return []}});

  const load = async () => {
    setLoading(true);
    try { setGroups(await api.getStudyGroups(semFilter||null)); } catch { setGroups([]); }
    setLoading(false);
  };
  useEffect(()=>{load();},[semFilter]);

  const join = async (id) => {
    if (joined.includes(id)) { showNotification("Already joined this group",'info'); return; }
    try {
      await api.joinStudyGroup(id);
      const nj = [...joined,id];
      setJoined(nj); localStorage.setItem('joined_groups',JSON.stringify(nj));
      setGroups(gs=>gs.map(g=>g.id===id?{...g,members:(g.members||1)+1}:g));
      showNotification('Joined! Check the contact to connect 🎉','success');
    } catch(err) { showNotification(err.message,'error'); }
  };

  const deleteGroup = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try { await api.deleteStudyGroup(id); setGroups(gs=>gs.filter(g=>g.id!==id)); showNotification('Group deleted','info'); }
    catch(err) { showNotification(err.message,'error'); }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <a href="/dashboard" className="logo" onClick={e=>{e.preventDefault();navigate('/dashboard');}}>
            <i className="fas fa-graduation-cap"></i><span>EduAssist</span>
          </a>
          <div style={{display:'flex',gap:'0.7rem',alignItems:'center'}}>
            <button className="theme-toggle" onClick={toggle}><i className={`fas fa-${dark?'sun':'moon'}`}></i></button>
            <div className="user-profile" onClick={()=>navigate('/dashboard')}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'S')}&background=2563eb&color=fff`} alt="u" />
              <span>{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="page-container" style={{marginTop:'72px'}}>
        <button onClick={()=>navigate('/dashboard')} style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'none',border:'none',color:'var(--primary)',fontWeight:600,cursor:'pointer',marginBottom:'1.5rem',fontSize:'0.95rem'}}>
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>

        <div className="page-header">
          <h1><i className="fas fa-users"></i> Study Group Finder</h1>
          <p>Find or create study groups for your subjects. Connect with fellow KTU students.</p>
          <button className="btn-primary-action" onClick={()=>setShowCreate(true)}><i className="fas fa-plus"></i> Create Study Group</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.8rem'}}>
          <div className="stat-card"><div className="stat-icon blue"><i className="fas fa-users"></i></div><div className="stat-info"><h3>{groups.length}</h3><p>Active Groups</p></div></div>
          <div className="stat-card"><div className="stat-icon green"><i className="fas fa-globe"></i></div><div className="stat-info"><h3>{groups.filter(g=>g.mode==='online').length}</h3><p>Online</p></div></div>
          <div className="stat-card"><div className="stat-icon orange"><i className="fas fa-map-marker-alt"></i></div><div className="stat-info"><h3>{groups.filter(g=>g.mode==='offline').length}</h3><p>Offline</p></div></div>
          <div className="stat-card"><div className="stat-icon purple"><i className="fas fa-user-check"></i></div><div className="stat-info"><h3>{joined.length}</h3><p>Joined</p></div></div>
        </div>

        <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem',flexWrap:'wrap',alignItems:'center'}}>
          <span style={{fontSize:'0.88rem',fontWeight:600,color:'var(--gray)'}}>Semester:</span>
          <button className={`notif-tab${!semFilter?' active':''}`} onClick={()=>setSemFilter('')}>All</button>
          {SEMS.map(s=><button key={s} className={`notif-tab${semFilter===s?' active':''}`} onClick={()=>setSemFilter(s)}>{s}</button>)}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" style={{margin:'0 auto 1rem'}}></div>Loading groups…</div>
        ) : groups.length===0 ? (
          <div className="empty-state">
            <i className="fas fa-users"></i>
            <p>No study groups yet{semFilter?` for ${semFilter}`:''}.{' '}
              <button onClick={()=>setShowCreate(true)} style={{background:'none',border:'none',color:'var(--primary)',fontWeight:600,cursor:'pointer'}}>Create the first one!</button>
            </p>
          </div>
        ) : (
          <div className="sg-grid">
            {groups.map(g=>(
              <div key={g.id} className="sg-card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <span className={`sg-mode-badge ${g.mode==='online'?'sg-online':'sg-offline'}`}>
                    <i className={`fas fa-${g.mode==='online'?'wifi':'map-marker-alt'}`}></i> {g.mode==='online'?'Online':'Offline'}
                  </span>
                  <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                    {joined.includes(g.id) && <span style={{fontSize:'0.75rem',color:'var(--success)',fontWeight:700}}><i className="fas fa-check-circle"></i> Joined</span>}
                    {g.created_by===user?.name && <button onClick={()=>deleteGroup(g.id)} style={{background:'none',border:'none',color:'var(--gray)',cursor:'pointer'}}><i className="fas fa-trash"></i></button>}
                  </div>
                </div>
                <div className="sg-subject">{g.subject}</div>
                <div className="sg-meta">
                  <span><i className="fas fa-graduation-cap"></i> {g.semester}</span>
                  <span><i className="fas fa-code-branch"></i> {g.department}</span>
                  <span><i className="fas fa-users"></i> {g.members||1} member{(g.members||1)!==1?'s':''}</span>
                  {g.location && <span><i className="fas fa-map-marker-alt"></i> {g.location}</span>}
                </div>
                {g.description && <p style={{fontSize:'0.85rem',color:'var(--gray)',marginBottom:'0.8rem',lineHeight:1.6}}>{g.description}</p>}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'0.8rem',borderTop:'1px solid var(--light-gray)'}}>
                  <div style={{fontSize:'0.78rem',color:'var(--gray)'}}><i className="fas fa-user" style={{marginRight:'0.3rem'}}></i>by {g.created_by} · {g.timestamp?.split(' ')[0]}</div>
                  <button className="btn-join" onClick={()=>join(g.id)} disabled={joined.includes(g.id)}>
                    {joined.includes(g.id)?'Joined ✓':`Join → ${g.contact}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateGroupModal onClose={()=>setShowCreate(false)} onCreated={()=>{setShowCreate(false);load();}} userSem={user?.semester} />}
    </>
  );
}
