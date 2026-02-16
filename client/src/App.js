import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import GPACalculator from './GPACalculator';

// Import the Login and Register pages
import Login from './Login';
import Register from './Register';
import './App.css'; 

// --- 1. THE PERSONALIZED DASHBOARD COMPONENT ---
function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedIds, setPinnedIds] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Get user name and token
  const userName = localStorage.getItem('user_name') || 'Student';
  const token = localStorage.getItem('token');

  // --- GREETING LOGIC ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // --- SMART EXAM COUNTDOWN ---
  const getDaysLeft = () => {
    const semester = localStorage.getItem('semester') || 'S6'; 
    
    // Define Exam Dates for 2026
    const examDates = {
      "S1": "2026-03-15",
      "S2": "2026-06-10",
      "S3": "2026-04-20",
      "S4": "2026-04-25",
      "S5": "2026-04-24",
      "S6": "2026-04-25",
      "S7": "2026-04-15",
      "S8": "2026-04-20"
    };

    const today = new Date();
    const targetDate = new Date(examDates[semester] || "2026-05-20"); 
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return diffDays > 0 ? diffDays : 0; 
  };

  // --- FETCH DATA ---
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch KTU Data
        const ktuRes = await axios.get('http://127.0.0.1:8000/notifications');
        
        // --- SAFETY CHECK START ---
        if (Array.isArray(ktuRes.data)) {
            setAnnouncements(ktuRes.data);
        } else {
            console.error("Backend returned an error:", ktuRes.data);
            setAnnouncements([]); // Set empty list so app doesn't crash
        }
        // --- SAFETY CHECK END ---
        
        // 2. Fetch My Pinned IDs
        try {
          const pinRes = await axios.get('http://127.0.0.1:8000/pins', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPinnedIds(pinRes.data);
        } catch (pinError) {
          console.warn("Could not fetch pins:", pinError);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAnnouncements([]); // Safety fallback
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  // --- HANDLE PIN CLICK ---
  const togglePin = async (id) => {
    const isPinned = pinnedIds.includes(id);
    
    // Optimistic Update
    if (isPinned) {
      setPinnedIds(pinnedIds.filter(pid => pid !== id)); 
    } else {
      setPinnedIds([...pinnedIds, id]); 
    }

    // Send to Backend
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isPinned) {
        await axios.delete(`http://127.0.0.1:8000/pin/${id}`, config);
      } else {
        await axios.post(`http://127.0.0.1:8000/pin/${id}`, {}, config);
      }
    } catch (err) {
      console.error("Pinning failed:", err);
      if (isPinned) setPinnedIds([...pinnedIds, id]);
      else setPinnedIds(pinnedIds.filter(pid => pid !== id));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // --- SORTING ---
  // We use "Array.isArray" to be 100% sure it's a list before sorting
  const safeAnnouncements = Array.isArray(announcements) ? announcements : [];

  const sortedAnnouncements = [...safeAnnouncements].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id);
    const bPinned = pinnedIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <div className="container">
      {/* IMPROVED HEADER */}
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>{getGreeting()}, {userName}.</h1>
          <p className="subtitle">Here is your academic overview.</p>
        </div>
        
        <div className="header-actions">
          <div className="countdown-card">
            <span className="count-number">{getDaysLeft()}</span>
            <span className="count-label">Days to Exam</span>
          </div>
          
          <button onClick={() => navigate('/gpa')} className="gpa-btn">
             📊 GPA Manager
          </button>
          
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading">Loading announcements...</div>
      ) : (
        <div className="grid">
          {sortedAnnouncements.map((item) => {
            const isPinned = pinnedIds.includes(item.id);
            // CHECK IF MESSAGE IS ACTUALLY EMPTY
            const hasMessage = item.message && item.message.replace(/<[^>]*>?/gm, '').trim().length > 0;

            return (
              <div key={item.id} className={`card ${isPinned ? 'pinned-card' : ''}`}>
                <div className="card-header">
                  <span className="date">{item.date}</span>
                  
                  <div style={{display:'flex', gap:'10px'}}>
                     {item.title.toLowerCase().includes('exam') && <span className="tag exam">Exam</span>}
                     {item.title.toLowerCase().includes('result') && <span className="tag result">Result</span>}
                     
                     <button onClick={() => togglePin(item.id)} className="star-btn">
                       {isPinned ? '★ Pinned' : '☆ Pin'}
                     </button>
                  </div>
                </div>
                
                <h2 className="title">
                  {isPinned && <span style={{marginRight:'8px'}}>📌</span>}
                  {item.title}
                </h2>
                
                {/* AI SUMMARY SECTION */}
                <div className="summary-box" style={{background:'#f8f9fa', padding:'12px', borderRadius:'8px', marginBottom:'15px', borderLeft:'4px solid #6c5ce7'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px'}}>
                        <span style={{fontSize:'1.2rem'}}>✨</span>
                        <strong style={{color:'#6c5ce7', fontSize:'0.85rem', letterSpacing:'0.5px'}}>AI SMART SUMMARY</strong>
                    </div>
                    <p style={{margin:'0', fontSize:'0.95rem', lineHeight:'1.5', color:'#2d3436'}}>
                        {item.summary || item.title} 
                    </p>
                </div>

                {/* READ FULL NOTICE */}
                {hasMessage && (
                  <details style={{marginBottom:'15px'}}>
                    <summary style={{cursor:'pointer', color:'#0984e3', fontSize:'0.9rem', fontWeight:'600', padding:'5px 0'}}>
                      Read Full Notice
                    </summary>
                    <div className="message-content" dangerouslySetInnerHTML={{ __html: item.message }} style={{marginTop:'10px', fontSize:'0.9rem', color:'#666'}} />
                  </details>
                )}

                {item.files.length > 0 && (
                  <div className="files-section">
                    <div className="file-list">
                      {item.files.map((file, index) => (
                        <a 
                          key={index}
                          href={`http://127.0.0.1:8000/download?file_id=${encodeURIComponent(file.id)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="download-btn"
                        >
                          📄 {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- MAIN ROUTER ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gpa" element={<GPACalculator />} />
      </Routes>
    </Router>
  );
}

export default App;