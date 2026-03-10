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
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // CHECK IF USER IS ADMIN (Data comes from Login)
  const isAdmin = localStorage.getItem('is_admin') === 'true'; 

  // --- FETCH FORUM DATA ---
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

  // --- ACTIONS ---

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      await axios.post('http://127.0.0.1:8000/forum/question', 
        { title: newTitle, content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTitle('');
      setNewContent('');
      fetchForum();
    } catch (err) { alert("Failed to post question"); }
  };

  const handlePostAnswer = async (qId) => {
    if (!newAnswer.trim()) return;
    try {
      await axios.post(`http://127.0.0.1:8000/forum/question/${qId}/answer`, 
        { content: newAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewAnswer('');
      fetchForum(); 
    } catch (err) { alert("Failed to post answer"); }
  };

  const handleVote = async (qId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/forum/question/${qId}/vote`, {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchForum();
    } catch (err) { console.error("Vote failed"); }
  };

  // --- NEW: DELETE FUNCTION ---
  const handleDelete = async (qId) => {
      if(!window.confirm("Admin: Are you sure you want to delete this question?")) return;
      try {
          await axios.delete(`http://127.0.0.1:8000/forum/question/${qId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          fetchForum(); // Refresh list immediately
      } catch (err) {
          alert("Delete failed. Are you sure you are an admin?");
      }
  };

  return (
    <div className="container">
      <header className="dashboard-header">
        <h1>
            🎓 Student Forum 
            {isAdmin && (
                <span style={{
                    fontSize:'0.8rem', 
                    background:'#e11d48', 
                    color:'white', 
                    padding:'4px 8px', 
                    borderRadius:'12px', 
                    marginLeft:'12px', 
                    verticalAlign:'middle',
                    letterSpacing: '0.5px'
                }}>
                    ADMIN MODE
                </span>
            )}
        </h1>
        <button onClick={() => navigate('/dashboard')} className="logout-btn" style={{background:'#6c5ce7'}}>
          Back to Dashboard
        </button>
      </header>

      {/* --- ASK A QUESTION FORM --- */}
      <div className="card" style={{ marginBottom: '30px', borderLeft: '5px solid #6c5ce7' }}>
        <h3 style={{marginTop:0}}>Ask a Question</h3>
        <input 
            type="text" 
            placeholder="Title..." 
            value={newTitle} 
            onChange={(e) => setNewTitle(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }} 
        />
        <textarea 
            placeholder="Add details..." 
            value={newContent} 
            onChange={(e) => setNewContent(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd', minHeight:'60px' }} 
        />
        <button onClick={handlePostQuestion} className="download-btn" style={{background:'#6c5ce7', width:'100%'}}>
            Post Question
        </button>
      </div>

      {/* --- FEED --- */}
      <div className="feed">
        {questions.length === 0 ? (
            <p style={{textAlign:'center', color:'#888'}}>No questions yet. Be the first!</p>
        ) : (
            questions.map((q) => (
                <div key={q.id} className="card" style={{ marginBottom: '20px', position:'relative' }}>
                    
                    {/* --- ADMIN DELETE BUTTON --- */}
                    {isAdmin && (
                        <button 
                            onClick={() => handleDelete(q.id)}
                            style={{
                                position: 'absolute', top: '15px', right: '15px',
                                background: '#ffebee', color: '#c62828', border: '1px solid #c62828',
                                borderRadius: '5px', cursor: 'pointer', padding: '5px 10px', fontWeight: 'bold',
                                fontSize: '0.8rem'
                            }}
                        >
                            🗑️ Delete
                        </button>
                    )}

                    <div style={{marginRight: isAdmin ? '80px' : '0'}}>
                        <h2 style={{fontSize:'1.3rem', margin:'0 0 5px 0', color:'#2d3436'}}>{q.title}</h2>
                        <p style={{fontSize:'0.9rem', color:'#636e72', margin:0}}>
                            Posted by <strong>{q.user_name}</strong> • {q.timestamp}
                        </p>
                    </div>
                    
                    <p style={{marginTop:'15px', color:'#2d3436', lineHeight:'1.5'}}>{q.content}</p>

                    <div style={{ borderTop:'1px solid #eee', paddingTop:'15px', marginTop:'15px', display:'flex', gap:'15px'}}>
                        <button onClick={() => handleVote(q.id)} style={{background:'none', border:'none', color:'#6c5ce7', cursor:'pointer', fontWeight:'bold'}}>
                             👍 {q.votes} Votes
                        </button>
                        <button 
                            onClick={() => setActiveQuestionId(activeQuestionId === q.id ? null : q.id)}
                            style={{background:'none', border:'none', color:'#0984e3', cursor:'pointer', fontWeight:'bold'}}
                        >
                             💬 {q.answers.length} Answers
                        </button>
                    </div>

                    {/* --- ANSWERS --- */}
                    {activeQuestionId === q.id && (
                        <div style={{ marginTop:'20px', background:'#f8f9fa', padding:'15px', borderRadius:'8px' }}>
                            {q.answers.length > 0 ? (
                                q.answers.map((a) => (
                                    <div key={a.id} style={{ borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'10px' }}>
                                        <div style={{display:'flex', justifyContent:'space-between'}}>
                                            <strong>{a.user_name}</strong>
                                            <span style={{fontSize:'0.8rem', color:'#888'}}>{a.timestamp}</span>
                                        </div>
                                        <p style={{margin:'5px 0 0 0', color:'#444'}}>{a.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p style={{fontStyle:'italic', color:'#888'}}>No answers yet.</p>
                            )}

                            <div style={{ marginTop:'15px', display:'flex', gap:'10px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Write an answer..." 
                                    value={newAnswer} 
                                    onChange={(e) => setNewAnswer(e.target.value)} 
                                    style={{ flex:1, padding:'8px', borderRadius:'5px', border:'1px solid #ddd' }} 
                                />
                                <button onClick={() => handlePostAnswer(q.id)} style={{background:'#0984e3', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>
                                    Reply
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