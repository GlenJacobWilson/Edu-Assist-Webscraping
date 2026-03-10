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
    } catch (err) {
      console.error("Failed to load forum", err);
    }
  };

  useEffect(() => {
    if (!token) navigate('/');
    fetchForum();
  }, [navigate, token]);

  const handlePostQuestion = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setPosting(true);
    try {
      await axios.post('http://127.0.0.1:8000/forum/question',
        { title: newTitle, content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTitle(''); setNewContent('');
      fetchForum();
    } catch { alert("Failed to post question"); }
    finally { setPosting(false); }
  };

  const handlePostAnswer = async (qId) => {
    if (!newAnswer.trim()) return;
    try {
      await axios.post(`http://127.0.0.1:8000/forum/question/${qId}/answer`,
        { content: newAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewAnswer(''); fetchForum();
    } catch { alert("Failed to post answer"); }
  };

  const handleVote = async (qId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/forum/question/${qId}/vote`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchForum();
    } catch {}
  };

  const handleDelete = async (qId) => {
    if (!window.confirm("Delete this question and all its answers?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/forum/question/${qId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchForum();
    } catch { alert("Delete failed."); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    fontSize: '0.92rem', borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(4,6,15,0.7)', color: 'var(--white)',
    fontFamily: 'var(--font-body)', outline: 'none',
    transition: 'var(--transition)',
  };

  return (
    <div className="container">
      {/* ── HEADER ── */}
      <header className="dashboard-header" style={{ marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            ● COMMUNITY NETWORK
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, background: 'linear-gradient(135deg, #f0f4ff, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '1px' }}>
            Student Forum
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.83rem', marginTop: 4 }}>
            {questions.length} threads · Ask, answer, connect.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAdmin && (
            <div style={{
              background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.4)',
              color: '#fb7185', padding: '6px 14px', borderRadius: 'var(--radius-sm)',
              fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-display)',
              letterSpacing: '1.5px', textTransform: 'uppercase'
            }}>⚙ Admin Mode</div>
          )}
          <button onClick={() => navigate('/dashboard')} className="logout-btn" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', borderColor: 'rgba(139,92,246,0.4)' }}>
            ← Dashboard
          </button>
        </div>
      </header>

      {/* ── POST QUESTION ── */}
      <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(139,92,246,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>💬</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#a78bfa', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
            Post a Question
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            placeholder="Question title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
          />
          <textarea
            placeholder="Describe your problem in detail..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
          />
          <button
            onClick={handlePostQuestion}
            disabled={posting}
            style={{
              padding: '12px', background: posting ? 'rgba(139,92,246,0.1)' : 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(0,212,255,0.15))',
              border: '1px solid rgba(139,92,246,0.4)', borderRadius: 'var(--radius-sm)',
              color: '#a78bfa', fontWeight: 700, fontFamily: 'var(--font-display)',
              fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase',
              cursor: posting ? 'not-allowed' : 'pointer', transition: 'var(--transition)',
            }}
            onMouseEnter={e => { if (!posting) e.target.style.boxShadow = '0 0 20px rgba(139,92,246,0.3)'; }}
            onMouseLeave={e => e.target.style.boxShadow = 'none'}
          >
            {posting ? '⟳ Posting...' : '→ Submit Question'}
          </button>
        </div>
      </div>

      {/* ── QUESTIONS FEED ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', letterSpacing: '2px' }}>
            NO THREADS YET · BE THE FIRST
          </div>
        ) : (
          questions.map((q, idx) => (
            <div key={q.id} className="card" style={{ animationDelay: `${idx * 0.05}s`, position: 'relative' }}>
              {/* Admin delete */}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(q.id)}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'rgba(244,63,94,0.1)', color: '#fb7185',
                    border: '1px solid rgba(244,63,94,0.35)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    padding: '5px 10px', fontSize: '0.78rem', fontWeight: 700,
                    fontFamily: 'var(--font-body)', transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(244,63,94,0.2)'}
                  onMouseLeave={e => e.target.style.background = 'rgba(244,63,94,0.1)'}
                >
                  🗑 Delete
                </button>
              )}

              <div style={{ marginRight: isAdmin ? 90 : 0 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--white)', margin: '0 0 6px', letterSpacing: '0.3px', lineHeight: 1.4 }}>
                  {q.title}
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', margin: 0 }}>
                  {q.user_name} · {q.timestamp}
                </p>
              </div>

              <p style={{ marginTop: 14, color: 'rgba(240,244,255,0.75)', lineHeight: 1.7, fontSize: '0.92rem' }}>{q.content}</p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                <button
                  onClick={() => handleVote(q.id)}
                  style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--cyan)', cursor: 'pointer', padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600, transition: 'var(--transition)', fontFamily: 'var(--font-body)' }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(0,212,255,0.15)'; e.target.style.boxShadow = '0 0 12px rgba(0,212,255,0.25)'; }}
                  onMouseLeave={e => { e.target.style.background = 'rgba(0,212,255,0.07)'; e.target.style.boxShadow = 'none'; }}
                >
                  👍 {q.votes} Votes
                </button>
                <button
                  onClick={() => setActiveQuestionId(activeQuestionId === q.id ? null : q.id)}
                  style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', cursor: 'pointer', padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600, transition: 'var(--transition)', fontFamily: 'var(--font-body)' }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(139,92,246,0.15)'; e.target.style.boxShadow = '0 0 12px rgba(139,92,246,0.25)'; }}
                  onMouseLeave={e => { e.target.style.background = 'rgba(139,92,246,0.07)'; e.target.style.boxShadow = 'none'; }}
                >
                  💬 {q.answers.length} Answers
                </button>
              </div>

              {/* Answers panel */}
              {activeQuestionId === q.id && (
                <div style={{ marginTop: 18, background: 'rgba(4,6,15,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)', padding: 18 }}>
                  {q.answers.length > 0 ? q.answers.map(a => (
                    <div key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--cyan)' }}>{a.user_name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{a.timestamp}</span>
                      </div>
                      <p style={{ margin: 0, color: 'rgba(240,244,255,0.75)', fontSize: '0.9rem', lineHeight: 1.6 }}>{a.content}</p>
                    </div>
                  )) : (
                    <p style={{ textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.88rem' }}>No answers yet. Be the first to reply.</p>
                  )}

                  {/* Reply input */}
                  <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handlePostAnswer(q.id); }}
                    />
                    <button
                      onClick={() => handlePostAnswer(q.id)}
                      style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.35)', color: 'var(--cyan)', padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'var(--transition)', whiteSpace: 'nowrap' }}
                    >
                      Reply →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Discussion;
