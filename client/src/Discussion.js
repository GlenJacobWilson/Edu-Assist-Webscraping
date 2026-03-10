import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Discussion() {
  const [questions, setQuestions] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [posting, setPosting] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  const fetchForum = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/forum');
      setQuestions(res.data);
    } catch {}
  };

  useEffect(() => { if (!token) navigate('/'); fetchForum(); }, [navigate, token]);

  const handlePostQuestion = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setPosting(true);
    try {
      await axios.post('http://127.0.0.1:8000/forum/question', { title: newTitle, content: newContent }, { headers: { Authorization: `Bearer ${token}` } });
      setNewTitle(''); setNewContent(''); fetchForum();
    } catch { alert('Failed to post question'); }
    finally { setPosting(false); }
  };

  const handlePostAnswer = async (qId) => {
    if (!newAnswer.trim()) return;
    try {
      await axios.post(`http://127.0.0.1:8000/forum/question/${qId}/answer`, { content: newAnswer }, { headers: { Authorization: `Bearer ${token}` } });
      setNewAnswer(''); fetchForum();
    } catch { alert('Failed to post answer'); }
  };

  const handleVote = async (qId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/forum/question/${qId}/vote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchForum();
    } catch {}
  };

  const handleDelete = async (qId) => {
    if (!window.confirm('Delete this question and all its answers?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/forum/question/${qId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchForum();
    } catch { alert('Delete failed.'); }
  };

  const inputStyle = { width: '100%', padding: '0.85rem 1rem', marginBottom: 0 };

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo"><i className="fas fa-graduation-cap" /><span>EduAssist</span></div>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.2rem', background: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 'var(--r-sm)', fontWeight: 600, fontSize: '0.88rem', fontFamily: 'var(--font)', cursor: 'pointer' }}>
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </button>
        </div>
      </nav>

      <div style={{ marginTop: 72, background: 'var(--bg)', minHeight: 'calc(100vh - 72px)' }}>
        <div className="container">

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.3rem' }}>
                <i className="fas fa-comments" style={{ color: 'var(--primary)', marginRight: '0.6rem' }} /> Student Forum
              </h1>
              <p style={{ color: 'var(--gray)' }}>{questions.length} discussion threads</p>
            </div>
            {isAdmin && (
              <span style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid #fca5a5', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                <i className="fas fa-shield-alt" style={{ marginRight: '0.4rem' }} /> Admin Mode
              </span>
            )}
          </div>

          {/* Post Question Card */}
          <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
            <div className="card-header">
              <h3><i className="fas fa-plus-circle" /> Ask a Question</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <input type="text" placeholder="Question title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} style={inputStyle} />
              <textarea placeholder="Describe your question in detail..." value={newContent} onChange={e => setNewContent(e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
              <button onClick={handlePostQuestion} disabled={posting} style={{ padding: '0.85rem', background: 'var(--primary)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-sm)', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font)', cursor: posting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}>
                {posting ? <><i className="fas fa-circle-notch fa-spin" /> Posting...</> : <><i className="fas fa-paper-plane" /> Post Question</>}
              </button>
            </div>
          </div>

          {/* Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
                <i className="fas fa-comments" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }} />
                No questions yet. Be the first to ask!
              </div>
            ) : questions.map((q, idx) => (
              <div key={q.id} className="card" style={{ animationDelay: `${idx * 0.05}s`, position: 'relative' }}>
                {isAdmin && (
                  <button onClick={() => handleDelete(q.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid #fca5a5', borderRadius: 'var(--r-sm)', padding: '0.35rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <i className="fas fa-trash" /> Delete
                  </button>
                )}

                <div style={{ marginRight: isAdmin ? 90 : 0 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.3rem' }}>{q.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gray)' }}>
                    <i className="fas fa-user" style={{ marginRight: '0.3rem' }} />{q.user_name}
                    <span style={{ margin: '0 0.5rem' }}>·</span>
                    <i className="fas fa-clock" style={{ marginRight: '0.3rem' }} />{q.timestamp}
                  </p>
                </div>

                <p style={{ marginTop: '1rem', color: 'var(--dark)', lineHeight: 1.7, fontSize: '0.95rem' }}>{q.content}</p>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--light-gray)' }}>
                  <button onClick={() => handleVote(q.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', background: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font)', transition: 'var(--transition)' }}>
                    <i className="fas fa-thumbs-up" /> {q.votes} Votes
                  </button>
                  <button onClick={() => setActiveQuestionId(activeQuestionId === q.id ? null : q.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', background: activeQuestionId === q.id ? 'var(--primary)' : 'var(--bg)', color: activeQuestionId === q.id ? 'var(--white)' : 'var(--gray)', border: '1px solid var(--light-gray)', borderRadius: '20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font)', transition: 'var(--transition)' }}>
                    <i className="fas fa-comment-dots" /> {q.answers.length} Answers
                  </button>
                </div>

                {activeQuestionId === q.id && (
                  <div style={{ marginTop: '1.2rem', background: 'var(--bg)', border: '1px solid var(--light-gray)', borderRadius: 'var(--r-md)', padding: '1.2rem' }}>
                    {q.answers.length > 0 ? q.answers.map(a => (
                      <div key={a.id} style={{ borderBottom: '1px solid var(--light-gray)', paddingBottom: '0.9rem', marginBottom: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{a.user_name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>{a.timestamp}</span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--dark)', fontSize: '0.92rem', lineHeight: 1.6 }}>{a.content}</p>
                      </div>
                    )) : <p style={{ color: 'var(--gray)', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1rem' }}>No answers yet.</p>}

                    <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.8rem' }}>
                      <input type="text" placeholder="Write an answer..." value={newAnswer} onChange={e => setNewAnswer(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handlePostAnswer(q.id); }} style={{ flex: 1, padding: '0.75rem 1rem' }} />
                      <button onClick={() => handlePostAnswer(q.id)} style={{ padding: '0.75rem 1.2rem', background: 'var(--primary)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-sm)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap', transition: 'var(--transition)' }}>
                        Reply <i className="fas fa-paper-plane" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Discussion;
