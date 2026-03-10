import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API = 'http://127.0.0.1:8000';

function Discussion() {
  const [questions, setQuestions]       = useState([]);
  const [newTitle, setNewTitle]         = useState('');
  const [newContent, setNewContent]     = useState('');
  const [activeId, setActiveId]         = useState(null);
  const [answers, setAnswers]           = useState({});   // { qId: text }
  const [loading, setLoading]           = useState(true);
  const [posting, setPosting]           = useState(false);
  const navigate = useNavigate();

  const token   = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  const me      = localStorage.getItem('user_name') || '';

  const fetchForum = async () => {
    try {
      const res = await axios.get(`${API}/forum`);
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchForum();
  }, [navigate, token]);

  const postQuestion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setPosting(true);
    try {
      await axios.post(`${API}/forum/question`,
        { title: newTitle, content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTitle(''); setNewContent('');
      fetchForum();
    } catch { alert('Failed to post question.'); }
    setPosting(false);
  };

  const postAnswer = async (qId) => {
    const text = (answers[qId] || '').trim();
    if (!text) return;
    try {
      await axios.post(`${API}/forum/question/${qId}/answer`,
        { content: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnswers(a => ({ ...a, [qId]: '' }));
      fetchForum();
    } catch { alert('Failed to post answer.'); }
  };

  const handleVote = async (qId) => {
    try {
      await axios.post(`${API}/forum/question/${qId}/vote`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchForum();
    } catch {}
  };

  const handleDelete = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await axios.delete(`${API}/forum/question/${qId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchForum();
    } catch { alert('Delete failed. Admin only.'); }
  };

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo"><i className="fas fa-graduation-cap" /><span>EduAssist</span></div>
          <div className="nav-right">
            <button className="nav-back-btn" onClick={() => navigate('/dashboard')}>
              <i className="fas fa-arrow-left" /> Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="page-wrap">
        <div className="page-inner">

          {/* Page header */}
          <div className="page-header-card" style={{ marginBottom:'1.4rem' }}>
            <div>
              <h1 style={{ fontSize:'1.45rem', fontWeight:700, marginBottom:'0.25rem' }}>
                <i className="fas fa-comments" style={{ marginRight:'0.6rem' }} />
                Student Forum
                {isAdmin && <span className="admin-badge">ADMIN</span>}
              </h1>
              <p style={{ opacity:0.8, fontSize:'0.85rem' }}>Ask questions, share knowledge, help your peers</p>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', padding:'0.8rem 1.2rem', borderRadius:'var(--r-md)', textAlign:'center', border:'1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize:'1.8rem', fontWeight:800, lineHeight:1 }}>{questions.length}</div>
              <div style={{ fontSize:'0.72rem', opacity:0.8, marginTop:'0.2rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>Questions</div>
            </div>
          </div>

          {/* Ask a question */}
          <div className="forum-ask">
            <h3><i className="fas fa-plus-circle" /> Ask a Question</h3>
            <input
              className="forum-input"
              type="text"
              placeholder="Question title…"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <textarea
              className="forum-input"
              rows={3}
              placeholder="Add more details about your question…"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
            />
            <button className="btn-post" onClick={postQuestion} disabled={posting}>
              {posting
                ? <><i className="fas fa-circle-notch fa-spin" /> Posting…</>
                : <><i className="fas fa-paper-plane" /> Post Question</>
              }
            </button>
          </div>

          {/* Questions feed */}
          {loading ? (
            <div className="loading"><div className="spinner" />Loading forum…</div>
          ) : questions.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-comments" />
              <p>No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            questions.map(q => (
              <div key={q.id} className="q-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h2>{q.title}</h2>
                    <p className="q-meta">
                      Posted by <strong>{q.user_name}</strong> &nbsp;·&nbsp; {q.timestamp}
                    </p>
                  </div>
                  {isAdmin && (
                    <button className="admin-del" onClick={() => handleDelete(q.id)}>
                      <i className="fas fa-trash" /> Delete
                    </button>
                  )}
                </div>

                <p className="q-body">{q.content}</p>

                <div className="q-actions">
                  <button className="vote-btn" onClick={() => handleVote(q.id)}>
                    <i className="fas fa-thumbs-up" /> {q.votes} Votes
                  </button>
                  <button className="reply-btn" onClick={() => setActiveId(activeId === q.id ? null : q.id)}>
                    <i className="fas fa-comment-dots" /> {q.answers?.length || 0} Answers
                    {q.answers?.length > 0 && <i className={`fas fa-chevron-${activeId === q.id ? 'up' : 'down'}`} style={{ marginLeft:'0.3rem', fontSize:'0.7rem' }} />}
                  </button>
                </div>

                {activeId === q.id && (
                  <div className="answers-panel">
                    {q.answers?.length > 0 ? (
                      q.answers.map(a => (
                        <div key={a.id} className="answer-item">
                          <div>
                            <span className="ans-user">{a.user_name}</span>
                            <span className="ans-time">{a.timestamp}</span>
                          </div>
                          <p>{a.content}</p>
                        </div>
                      ))
                    ) : (
                      <p style={{ color:'var(--gray)', fontSize:'0.85rem', fontStyle:'italic' }}>No answers yet.</p>
                    )}

                    <div className="reply-row">
                      <input
                        type="text"
                        className="reply-input"
                        placeholder="Write your answer…"
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && postAnswer(q.id)}
                      />
                      <button className="reply-submit" onClick={() => postAnswer(q.id)}>
                        <i className="fas fa-paper-plane" /> Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Discussion;
