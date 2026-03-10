import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';

function QuestionModal({ q, user, onClose, onAnswer, onMarkBest, onVote }) {
  const [text, setText] = useState('');
  const { showNotification } = useToast();
  const isOwner = q.user_name === user?.name;
  const sorted = [...(q.answers || [])].sort((a, b) => (b.is_best ? 1 : 0) - (a.is_best ? 1 : 0));

  const submit = async () => {
    if (!text.trim()) { showNotification('Write an answer first', 'error'); return; }
    await onAnswer(q.id, text);
    setText('');
  };

  return (
    <div className="forum-modal" onClick={e => e.target.classList.contains('forum-modal') && onClose()}>
      <div className="forum-modal-box">
        <div className="forum-modal-header">
          <h2><i className="fas fa-question-circle"></i> Question Details</h2>
          <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="forum-modal-body">
          <div style={{ marginBottom:'1.8rem' }}>
            <div className="q-user" style={{ marginBottom:'1rem' }}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(q.user_name)}&background=2563eb&color=fff`} alt="u" />
              <div><h4>{q.user_name}</h4><span style={{ fontSize:'0.8rem', color:'var(--gray)' }}>{q.timestamp}</span></div>
            </div>
            <h2 style={{ fontSize:'1.6rem', fontWeight:700, color:'var(--dark)', marginBottom:'1rem' }}>{q.title}</h2>
            <p style={{ color:'var(--gray)', lineHeight:1.8, marginBottom:'1rem' }}>{q.content}</p>
            <div className="q-stats">
              <span style={{ cursor:'pointer' }} onClick={() => onVote(q.id)}>
                <i className="fas fa-thumbs-up"></i> {q.votes} votes
              </span>
              <span><i className="fas fa-reply"></i> {q.answers?.length || 0} answers</span>
            </div>
          </div>

          <h3 style={{ fontSize:'1.2rem', fontWeight:700, marginBottom:'1.2rem', color:'var(--dark)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <i className="fas fa-comments" style={{ color:'var(--primary)' }}></i> {q.answers?.length || 0} Answers
          </h3>

          {sorted.map(a => (
            <div key={a.id} className={`answer-card${a.is_best ? ' best' : ''}`}>
              {a.is_best && <div className="best-tag"><i className="fas fa-check-circle"></i> Best Answer</div>}
              <div className="answer-header">
                <div className="q-user">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(a.user_name)}&background=10b981&color=fff`} alt="u" />
                  <div><h4>{a.user_name}</h4><span style={{ fontSize:'0.8rem', color:'var(--gray)' }}>{a.timestamp}</span></div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                  <div className="vote-group">
                    <button className="vote-btn"><i className="fas fa-thumbs-up"></i></button>
                    <span className="vote-count">{a.votes || 0}</span>
                    <button className="vote-btn"><i className="fas fa-thumbs-down"></i></button>
                  </div>
                  {isOwner && !a.is_best && (
                    <button className="mark-best-btn" onClick={() => onMarkBest(q.id, a.id)}>
                      <i className="fas fa-check"></i> Mark Best
                    </button>
                  )}
                </div>
              </div>
              <p style={{ color:'var(--gray)', lineHeight:1.7, marginTop:'0.5rem' }}>{a.content}</p>
            </div>
          ))}

          <div style={{ marginTop:'1.8rem', borderTop:'2px solid var(--light-gray)', paddingTop:'1.5rem' }}>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'0.8rem', color:'var(--dark)' }}>Your Answer</h3>
            <textarea
              className="answer-textarea"
              placeholder="Write your answer here…"
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button className="btn-post-answer" onClick={submit}>
              <i className="fas fa-paper-plane"></i> Post Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewQuestionModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title:'', content:'' });
  const { showNotification } = useToast();
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.title || !form.content) { showNotification('Fill all fields', 'error'); return; }
    await onSubmit(form);
    onClose();
  };

  return (
    <div className="forum-modal" onClick={e => e.target.classList.contains('forum-modal') && onClose()}>
      <div className="forum-modal-box" style={{ maxWidth:'640px' }}>
        <div className="forum-modal-header">
          <h2><i className="fas fa-plus"></i> Ask a Question</h2>
          <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="forum-modal-body">
          <form onSubmit={submit}>
            <div className="form-group">
              <label><i className="fas fa-heading"></i> Question Title</label>
              <input type="text" placeholder="What's your question?" value={form.title} onChange={set('title')} required />
            </div>
            <div className="form-group">
              <label><i className="fas fa-align-left"></i> Details</label>
              <textarea rows="6" placeholder="Describe your question in detail…" value={form.content} onChange={set('content')} required style={{ padding:'0.75rem', border:'1.5px solid var(--light-gray)', borderRadius:'var(--r-sm)', fontFamily:'var(--font)', fontSize:'0.93rem', resize:'vertical', width:'100%' }} />
            </div>
            <button type="submit" className="btn-submit" style={{ marginTop:'0.5rem' }}>
              <i className="fas fa-paper-plane"></i> Post Question
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Forum() {
  const { user } = useAuth();
  const { showNotification } = useToast();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setQuestions(await api.getForum()); }
    catch { setQuestions([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleVote = async id => {
    try {
      await api.voteQuestion(id);
      setQuestions(qs => qs.map(q => q.id === id ? { ...q, votes: q.votes + 1 } : q));
      if (selected?.id === id) setSelected(s => ({ ...s, votes: s.votes + 1 }));
    } catch { showNotification('Login required to vote', 'error'); }
  };

  const handlePostQuestion = async form => {
    try {
      await api.postQuestion({ title: form.title, content: form.content });
      showNotification('Question posted!', 'success');
      await load();
    } catch (err) { showNotification(err.message || 'Login required', 'error'); }
  };

  const handleAnswer = async (qId, content) => {
    try {
      await api.postAnswer(qId, { content });
      showNotification('Answer posted!', 'success');
      await load();
      const updated = await api.getForum();
      const q = updated.find(q => q.id === qId);
      if (q) setSelected(q);
    } catch (err) { showNotification(err.message || 'Login required', 'error'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.deleteQuestion(id);
      showNotification('Question deleted', 'info');
      setQuestions(qs => qs.filter(q => q.id !== id));
    } catch (err) { showNotification(err.message, 'error'); }
  };

  const handleMarkBest = (qId, answerId) => {
    setQuestions(qs => qs.map(q => q.id === qId ? { ...q, answers: q.answers.map(a => ({ ...a, is_best: a.id === answerId })) } : q));
    setSelected(s => s ? { ...s, answers: s.answers.map(a => ({ ...a, is_best: a.id === answerId })) } : s);
    showNotification('Marked as best answer!', 'success');
  };

  let displayed = [...questions];
  if (search) displayed = displayed.filter(q => q.title.toLowerCase().includes(search.toLowerCase()) || q.content.toLowerCase().includes(search.toLowerCase()));
  if (filter === 'mine') displayed = displayed.filter(q => q.user_name === user?.name);
  if (sort === 'most-answered') displayed.sort((a, b) => (b.answers?.length || 0) - (a.answers?.length || 0));
  else if (sort === 'most-voted') displayed.sort((a, b) => b.votes - a.votes);
  else if (sort === 'unanswered') displayed = displayed.filter(q => !q.answers?.length);

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <a href="/dashboard" className="logo" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>
            <i className="fas fa-graduation-cap"></i><span>EduAssist</span>
          </a>
          <div className="user-profile" onClick={() => navigate('/dashboard')} title="Dashboard">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'S')}&background=2563eb&color=fff`} alt="u" />
            <span>{user?.name}</span>
          </div>
        </div>
      </nav>

      <div className="page-container" style={{ marginTop:'72px' }}>
        <div className="page-header">
          <h1><i className="fas fa-comments"></i> Discussion Forum</h1>
          <p>Ask questions, share knowledge, help fellow KTU students</p>
          <button className="btn-primary-action" onClick={() => setShowNew(true)}>
            <i className="fas fa-plus"></i> Ask a Question
          </button>
        </div>

        <div className="forum-stats-bar">
          <div className="forum-stat"><i className="fas fa-comment-dots"></i><div><h3>{questions.length}</h3><p>Total Questions</p></div></div>
          <div className="forum-stat"><i className="fas fa-check-circle"></i><div><h3>{questions.filter(q => q.answers?.length).length}</h3><p>Answered</p></div></div>
          <div className="forum-stat"><i className="fas fa-thumbs-up"></i><div><h3>{questions.reduce((s, q) => s + q.votes, 0)}</h3><p>Total Votes</p></div></div>
          <div className="forum-stat"><i className="fas fa-reply"></i><div><h3>{questions.reduce((s, q) => s + (q.answers?.length || 0), 0)}</h3><p>Total Answers</p></div></div>
        </div>

        <div className="forum-controls">
          <div className="search-wrap">
            <i className="fas fa-search"></i>
            <input placeholder="Search questions…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-group">
            <button className={`filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All Questions</button>
            <button className={`filter-btn${filter === 'mine' ? ' active' : ''}`} onClick={() => setFilter('mine')}>My Questions</button>
          </div>
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="latest">Latest</option>
            <option value="most-voted">Most Voted</option>
            <option value="most-answered">Most Answered</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>

        {loading ? (
          <div className="loading"><i className="fas fa-circle-notch fa-spin" style={{ marginRight:'0.5rem' }}></i>Loading…</div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-comments"></i>
            <p>No questions found. {filter === 'mine' ? 'Post your first question!' : 'Be the first to ask!'}</p>
          </div>
        ) : (
          <div className="questions-list">
            {displayed.map(q => {
              const isOwner = q.user_name === user?.name;
              const hasBest = q.answers?.some(a => a.is_best);
              return (
                <div key={q.id} className={`question-card${isOwner ? ' my-q' : ''}`}>
                  {isOwner && <div className="mine-badge"><i className="fas fa-user"></i> Your Question</div>}
                  <div className="q-header">
                    <div className="q-user">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(q.user_name)}&background=2563eb&color=fff`} alt="u" />
                      <div><h4>{q.user_name}</h4><span>{q.timestamp}</span></div>
                    </div>
                    {user?.is_admin && (
                      <button className="btn-delete" onClick={() => handleDelete(q.id)}>
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    )}
                  </div>
                  <div className="q-title" onClick={() => setSelected(q)}>{q.title}</div>
                  <p className="q-preview">{(q.content || '').slice(0, 150)}{q.content?.length > 150 ? '…' : ''}</p>
                  <div className="q-stats">
                    <span style={{ cursor:'pointer' }} onClick={() => handleVote(q.id)}>
                      <i className="fas fa-thumbs-up"></i> {q.votes} votes
                    </span>
                    <span className={q.answers?.length ? 'answered-label' : ''}>
                      <i className="fas fa-reply"></i> {q.answers?.length || 0} answers
                    </span>
                    {hasBest && <span className="best-label"><i className="fas fa-check-circle"></i> Best answer</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <QuestionModal
          q={selected} user={user}
          onClose={() => setSelected(null)}
          onVote={handleVote}
          onAnswer={handleAnswer}
          onMarkBest={handleMarkBest}
        />
      )}
      {showNew && (
        <NewQuestionModal
          onClose={() => setShowNew(false)}
          onSubmit={handlePostQuestion}
        />
      )}
    </>
  );
}
