import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';

const COMMON_TAGS = ['S1','S2','S3','S4','S5','S6','S7','S8','CSE','ECE','MECH','EEE','CIVIL','IT','DBMS','OS','Networks','DSA','Algorithms','Compiler','Exam','Results','Attendance','Backlog'];

function QuestionModal({ q, user, onClose, onAnswer, onMarkBest, onVote, onToggleSolved }) {
  const { showNotification } = useToast();
  const [text, setText] = useState('');
  const isOwner = q.actual_user === user?.name || q.user_name === user?.name;
  const sorted  = [...(q.answers||[])].sort((a,b)=>(b.is_best?1:0)-(a.is_best?1:0));

  const submit = async () => {
    if (!text.trim()) { showNotification('Write an answer first','error'); return; }
    await onAnswer(q.id, text); setText('');
  };

  return (
    <div className="forum-modal" onClick={e=>e.target.classList.contains('forum-modal')&&onClose()}>
      <div className="forum-modal-box">
        <div className="forum-modal-header">
          <h2 style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
            <i className="fas fa-question-circle" style={{color:'var(--primary)'}}></i> Question
            {q.is_solved && <span className="solved-badge"><i className="fas fa-check-circle"></i> Solved</span>}
          </h2>
          <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="forum-modal-body">
          <div style={{marginBottom:'1.8rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.8rem',marginBottom:'0.8rem'}}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(q.user_name)}&background=${q.is_anonymous?'8b5cf6':'2563eb'}&color=fff`} alt="u" style={{width:'40px',height:'40px',borderRadius:'50%'}} />
              <div>
                <div style={{fontWeight:600,color:'var(--dark)'}}>{q.user_name}</div>
                <div style={{fontSize:'0.78rem',color:'var(--gray)'}}>{q.timestamp}</div>
              </div>
              {q.is_anonymous && <span className="anon-badge"><i className="fas fa-user-secret"></i> Anonymous</span>}
            </div>
            <h2 style={{fontSize:'1.4rem',fontWeight:700,color:'var(--dark)',marginBottom:'0.8rem'}}>{q.title}</h2>
            <p style={{color:'var(--gray)',lineHeight:1.8,marginBottom:'0.8rem'}}>{q.content}</p>
            {q.tags?.filter(Boolean).length>0 && <div style={{marginBottom:'1rem'}}>{q.tags.filter(Boolean).map(t=><span key={t} className="tag-chip">{t}</span>)}</div>}
            <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
              <span style={{cursor:'pointer',color:'var(--primary)',fontWeight:600,fontSize:'0.88rem'}} onClick={()=>onVote(q.id)}>
                <i className="fas fa-thumbs-up" style={{marginRight:'0.3rem'}}></i>{q.votes} votes
              </span>
              <span style={{color:'var(--gray)',fontSize:'0.88rem'}}><i className="fas fa-reply" style={{marginRight:'0.3rem'}}></i>{q.answers?.length||0} answers</span>
              {isOwner && (
                <button onClick={()=>onToggleSolved(q.id)} style={{padding:'0.3rem 0.9rem',background:q.is_solved?'var(--success-bg)':'var(--primary-bg)',color:q.is_solved?'var(--success)':'var(--primary)',border:`1px solid ${q.is_solved?'var(--success)':'var(--primary)'}`,borderRadius:'var(--r-sm)',fontWeight:600,fontSize:'0.8rem',cursor:'pointer'}}>
                  {q.is_solved?'✓ Mark Unsolved':'Mark as Solved'}
                </button>
              )}
            </div>
          </div>

          <h3 style={{fontSize:'1.1rem',fontWeight:700,color:'var(--dark)',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <i className="fas fa-comments" style={{color:'var(--primary)'}}></i> {sorted.length} Answer{sorted.length!==1?'s':''}
          </h3>

          {sorted.map(a=>(
            <div key={a.id} className={`answer-card${a.is_best?' best':''}`}>
              {a.is_best && <div className="best-tag"><i className="fas fa-check-circle"></i> Best Answer</div>}
              <div className="answer-header">
                <div style={{display:'flex',alignItems:'center',gap:'0.7rem'}}>
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(a.user_name)}&background=10b981&color=fff`} alt="u" style={{width:'34px',height:'34px',borderRadius:'50%'}} />
                  <div><div style={{fontWeight:600,fontSize:'0.88rem',color:'var(--dark)'}}>{a.user_name}</div><div style={{fontSize:'0.75rem',color:'var(--gray)'}}>{a.timestamp}</div></div>
                </div>
                {isOwner && !a.is_best && (
                  <button className="mark-best-btn" onClick={()=>onMarkBest(a.id)}>
                    <i className="fas fa-check"></i> Mark Best
                  </button>
                )}
              </div>
              <p style={{color:'var(--gray)',lineHeight:1.75,marginTop:'0.6rem'}}>{a.content}</p>
            </div>
          ))}

          {sorted.length===0 && <p style={{color:'var(--gray)',textAlign:'center',padding:'1rem',fontSize:'0.88rem'}}>No answers yet. Be the first to help!</p>}

          <div style={{marginTop:'1.8rem',borderTop:'2px solid var(--light-gray)',paddingTop:'1.5rem'}}>
            <h3 style={{fontSize:'1.05rem',fontWeight:700,marginBottom:'0.8rem',color:'var(--dark)'}}>Your Answer</h3>
            <textarea className="answer-textarea" placeholder="Share your knowledge…" value={text} onChange={e=>setText(e.target.value)} />
            <button className="btn-post-answer" onClick={submit}><i className="fas fa-paper-plane"></i> Post Answer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewQuestionModal({ onClose, onSubmit }) {
  const { showNotification } = useToast();
  const [form, setForm]       = useState({title:'',content:'',is_anonymous:false,tags:[]});
  const [tagInput, setTagInput] = useState('');
  const set = f => e => setForm(p=>({...p,[f]:e.target.type==='checkbox'?e.target.checked:e.target.value}));
  const addTag    = t => { const tag=t.trim(); if(tag&&!form.tags.includes(tag)&&form.tags.length<6) setForm(p=>({...p,tags:[...p.tags,tag]})); setTagInput(''); };
  const removeTag = t => setForm(p=>({...p,tags:p.tags.filter(x=>x!==t)}));

  const submit = async e => {
    e.preventDefault();
    if (!form.title||!form.content) { showNotification('Fill all required fields','error'); return; }
    await onSubmit(form); onClose();
  };

  return (
    <div className="forum-modal" onClick={e=>e.target.classList.contains('forum-modal')&&onClose()}>
      <div className="forum-modal-box" style={{maxWidth:'660px'}}>
        <div className="forum-modal-header">
          <h2><i className="fas fa-plus"></i> Ask a Question</h2>
          <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="forum-modal-body">
          <form onSubmit={submit}>
            <div className="form-group">
              <label><i className="fas fa-heading"></i> Question Title *</label>
              <input type="text" placeholder="What's your question?" value={form.title} onChange={set('title')} required />
            </div>
            <div className="form-group">
              <label><i className="fas fa-align-left"></i> Details *</label>
              <textarea rows={4} value={form.content} onChange={set('content')} placeholder="Describe your question in detail…" required style={{padding:'0.75rem',border:'1.5px solid var(--light-gray)',borderRadius:'var(--r-sm)',fontFamily:'var(--font)',fontSize:'0.88rem',resize:'vertical',width:'100%'}} />
            </div>
            <div className="form-group">
              <label><i className="fas fa-tags"></i> Tags (up to 6)</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem',marginBottom:'0.5rem'}}>
                {form.tags.map(t=><span key={t} className="tag-chip">{t} <button type="button" onClick={()=>removeTag(t)} style={{background:'none',border:'none',cursor:'pointer',color:'inherit',padding:'0 0 0 0.2rem',fontSize:'0.8rem'}}>×</button></span>)}
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem',marginBottom:'0.5rem'}}>
                {COMMON_TAGS.filter(t=>!form.tags.includes(t)).slice(0,12).map(t=>(
                  <button type="button" key={t} onClick={()=>addTag(t)} style={{padding:'0.2rem 0.65rem',background:'var(--bg)',border:'1px solid var(--light-gray)',borderRadius:'20px',fontSize:'0.75rem',cursor:'pointer',color:'var(--gray)',fontWeight:600}}>{t}</button>
                ))}
              </div>
              <div style={{display:'flex',gap:'0.5rem'}}>
                <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addTag(tagInput);}}} placeholder="Custom tag…" style={{flex:1,padding:'0.55rem',border:'1.5px solid var(--light-gray)',borderRadius:'var(--r-sm)',fontSize:'0.88rem'}} />
                <button type="button" onClick={()=>addTag(tagInput)} style={{padding:'0.55rem 1rem',background:'var(--primary-bg)',color:'var(--primary)',border:'1px solid var(--primary)',borderRadius:'var(--r-sm)',cursor:'pointer',fontWeight:600}}>Add</button>
              </div>
            </div>
            <div className="checkbox-inline">
              <input type="checkbox" id="anon" checked={form.is_anonymous} onChange={set('is_anonymous')} />
              <label htmlFor="anon"><i className="fas fa-user-secret" style={{marginRight:'0.3rem',color:'#7c3aed'}}></i>Post <strong>anonymously</strong></label>
            </div>
            <button type="submit" className="btn-submit" style={{marginTop:'1rem'}}>
              <i className="fas fa-paper-plane"></i> {form.is_anonymous?'Post Anonymously':'Post Question'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Forum() {
  const { user }             = useAuth();
  const { showNotification } = useToast();
  const { dark, toggle }     = useTheme();
  const navigate             = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [sort, setSort]           = useState('latest');
  const [search, setSearch]       = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [selected, setSelected]   = useState(null);
  const [showNew, setShowNew]     = useState(false);

  const load = async () => { setLoading(true); try{setQuestions(await api.getForum());}catch{setQuestions([]);} setLoading(false); };
  useEffect(()=>{load();},[]);

  const handleVote         = async id => { try{ await api.voteQuestion(id); setQuestions(qs=>qs.map(q=>q.id===id?{...q,votes:q.votes+1}:q)); if(selected?.id===id)setSelected(s=>({...s,votes:s.votes+1})); }catch{showNotification('Login required','error');} };
  const handleToggleSolved = async id => { try{ const r=await api.toggleSolved(id); setQuestions(qs=>qs.map(q=>q.id===id?{...q,is_solved:r.is_solved}:q)); if(selected?.id===id)setSelected(s=>({...s,is_solved:r.is_solved})); }catch(err){showNotification(err.message,'error');} };
  const handlePostQuestion = async form => { try{await api.postQuestion(form);showNotification('Question posted! 🎉','success');await load();}catch(err){showNotification(err.message||'Login required','error');} };
  const handleAnswer       = async (qId,content) => { try{await api.postAnswer(qId,{content});showNotification('Answer posted!','success');const updated=await api.getForum();setQuestions(updated);const q=updated.find(q=>q.id===qId);if(q)setSelected(q);}catch(err){showNotification(err.message||'Login required','error');} };
  const handleMarkBest     = async aid => { try{await api.markBest(aid);showNotification('✓ Best answer marked!','success');const updated=await api.getForum();setQuestions(updated);const q=updated.find(q=>q.answers?.some(a=>a.id===aid));if(q)setSelected(q);}catch(err){showNotification(err.message,'error');} };
  const handleDelete       = async id => { if(!window.confirm('Delete?'))return;try{await api.deleteQuestion(id);showNotification('Deleted','info');setQuestions(qs=>qs.filter(q=>q.id!==id));}catch(err){showNotification(err.message,'error');} };

  let displayed = [...questions];
  if (search)              displayed = displayed.filter(q=>(q.title+q.content).toLowerCase().includes(search.toLowerCase()));
  if (tagFilter)           displayed = displayed.filter(q=>q.tags?.includes(tagFilter));
  if (filter==='mine')     displayed = displayed.filter(q=>q.actual_user===user?.name);
  if (filter==='unsolved') displayed = displayed.filter(q=>!q.is_solved);
  if (filter==='solved')   displayed = displayed.filter(q=>q.is_solved);
  if (filter==='anonymous')displayed = displayed.filter(q=>q.is_anonymous);
  if (sort==='most-voted')      displayed.sort((a,b)=>b.votes-a.votes);
  else if (sort==='most-answered') displayed.sort((a,b)=>(b.answers?.length||0)-(a.answers?.length||0));

  const allTags = [...new Set(questions.flatMap(q=>q.tags||[]).filter(Boolean))].slice(0,20);

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
        <div className="page-header">
          <h1><i className="fas fa-comments"></i> Discussion Forum</h1>
          <p>Ask anonymously, tag your subject, get answers from fellow KTU students</p>
          <button className="btn-primary-action" onClick={()=>setShowNew(true)}><i className="fas fa-plus"></i> Ask a Question</button>
        </div>

        <div className="forum-stats-bar">
          <div className="forum-stat"><i className="fas fa-comment-dots" style={{fontSize:'2rem',color:'var(--primary)'}}></i><div><h3>{questions.length}</h3><p>Questions</p></div></div>
          <div className="forum-stat"><i className="fas fa-check-circle" style={{fontSize:'2rem',color:'var(--success)'}}></i><div><h3>{questions.filter(q=>q.is_solved).length}</h3><p>Solved</p></div></div>
          <div className="forum-stat"><i className="fas fa-user-secret" style={{fontSize:'2rem',color:'#7c3aed'}}></i><div><h3>{questions.filter(q=>q.is_anonymous).length}</h3><p>Anonymous</p></div></div>
          <div className="forum-stat"><i className="fas fa-reply" style={{fontSize:'2rem',color:'var(--accent)'}}></i><div><h3>{questions.reduce((s,q)=>s+(q.answers?.length||0),0)}</h3><p>Answers</p></div></div>
        </div>

        {allTags.length>0 && (
          <div style={{marginBottom:'1.5rem'}}>
            <div style={{fontSize:'0.82rem',fontWeight:700,color:'var(--gray)',marginBottom:'0.6rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Browse by Tag</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
              <button onClick={()=>setTagFilter('')} className={`filter-btn${!tagFilter?' active':''}`} style={{fontSize:'0.8rem',padding:'0.35rem 0.85rem'}}>All</button>
              {allTags.map(t=><button key={t} onClick={()=>setTagFilter(tagFilter===t?'':t)} className={`filter-btn${tagFilter===t?' active':''}`} style={{fontSize:'0.8rem',padding:'0.35rem 0.85rem'}}>{t}</button>)}
            </div>
          </div>
        )}

        <div className="forum-controls">
          <div className="search-wrap"><i className="fas fa-search"></i><input placeholder="Search questions…" value={search} onChange={e=>setSearch(e.target.value)} /></div>
          <div className="filter-group">
            {[['all','All'],['mine','Mine'],['unsolved','Unsolved'],['solved','Solved ✓'],['anonymous','Anonymous']].map(([k,l])=>(
              <button key={k} className={`filter-btn${filter===k?' active':''}`} onClick={()=>setFilter(k)}>{l}</button>
            ))}
          </div>
          <select className="sort-select" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="latest">Latest</option>
            <option value="most-voted">Most Voted</option>
            <option value="most-answered">Most Answered</option>
          </select>
        </div>

        {loading ? (
          <div className="loading"><i className="fas fa-circle-notch fa-spin" style={{marginRight:'0.5rem'}}></i>Loading…</div>
        ) : displayed.length===0 ? (
          <div className="empty-state"><i className="fas fa-comments"></i><p>No questions found. Ask the first one!</p></div>
        ) : (
          <div className="questions-list">
            {displayed.map(q=>{
              const isOwner = q.actual_user===user?.name;
              const hasBest = q.answers?.some(a=>a.is_best);
              return (
                <div key={q.id} className={`question-card${isOwner?' my-q':''}`}>
                  <div className="q-header">
                    <div className="q-user">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(q.user_name)}&background=${q.is_anonymous?'8b5cf6':'2563eb'}&color=fff`} alt="u" />
                      <div><h4>{q.user_name}</h4><span>{q.timestamp}</span></div>
                      {q.is_anonymous && <span className="anon-badge"><i className="fas fa-user-secret"></i> Anon</span>}
                      {q.is_solved   && <span className="solved-badge"><i className="fas fa-check-circle"></i> Solved</span>}
                      {isOwner && <span style={{fontSize:'0.72rem',background:'var(--primary-bg)',color:'var(--primary)',padding:'0.15rem 0.6rem',borderRadius:'20px',fontWeight:700}}>Your Q</span>}
                    </div>
                    {user?.is_admin && <button className="btn-delete" onClick={()=>handleDelete(q.id)}><i className="fas fa-trash"></i></button>}
                  </div>
                  <div className="q-title" onClick={()=>setSelected(q)}>{q.title}</div>
                  <p className="q-preview">{(q.content||'').slice(0,140)}{q.content?.length>140?'…':''}</p>
                  {q.tags?.filter(Boolean).length>0 && (
                    <div style={{marginBottom:'0.6rem'}}>{q.tags.filter(Boolean).map(t=><span key={t} className="tag-chip" style={{cursor:'pointer'}} onClick={()=>setTagFilter(t)}>{t}</span>)}</div>
                  )}
                  <div className="q-stats">
                    <span style={{cursor:'pointer'}} onClick={()=>handleVote(q.id)}><i className="fas fa-thumbs-up"></i>{q.votes}</span>
                    <span className={q.answers?.length?'answered-label':''}><i className="fas fa-reply"></i>{q.answers?.length||0} answers</span>
                    {hasBest && <span className="best-label"><i className="fas fa-check-circle"></i> Best answer</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && <QuestionModal q={selected} user={user} onClose={()=>setSelected(null)} onVote={handleVote} onAnswer={handleAnswer} onMarkBest={handleMarkBest} onToggleSolved={handleToggleSolved} />}
      {showNew   && <NewQuestionModal onClose={()=>setShowNew(false)} onSubmit={handlePostQuestion} />}
    </>
  );
}
