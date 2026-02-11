import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // We will add styles next

function App() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connect to your FastAPI backend
    axios.get('http://127.0.0.1:8000/notifications')
      .then(response => {
        setAnnouncements(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>🔔 KTU Notifications</h1>
        <p>Real-time updates from the official portal</p>
      </header>

      {loading ? (
        <div className="loading">Loading announcements...</div>
      ) : (
        <div className="grid">
          {announcements.map((item) => (
            <div key={item.id} className="card">
              <div className="card-header">
                <span className="date">{item.date}</span>
                {/* Highlight "Exam" or "Result" in title for quick scanning */}
                {item.title.toLowerCase().includes('exam') && <span className="tag exam">Exam</span>}
                {item.title.toLowerCase().includes('result') && <span className="tag result">Result</span>}
              </div>
              
              <h2 className="title">{item.title}</h2>
              
              {/* Handle the messy HTML content safely */}
              {item.message && (
                <div 
                  className="message-content"
                  dangerouslySetInnerHTML={{ __html: item.message }} 
                />
              )}

              {/* Download Links Section */}
              {item.files.length > 0 && (
                <div className="files-section">
                  <h4>Attachments:</h4>
                  <div className="file-list">
                    {item.files.map((file, index) => (
                      <a 
                        key={index}
                        href={`http://127.0.0.1:8000/download/${encodeURIComponent(file.id)}`}
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
          ))}
        </div>
      )}
    </div>
  );
}

export default App;