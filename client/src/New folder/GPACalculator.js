import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './App.css'; 

function GPACalculator() {
  const navigate = useNavigate();
  
  // KTU Grading Scale (2019 Scheme)
  const gradePoints = { "S": 10, "A+": 9, "A": 8.5, "B+": 8, "B": 7.5, "C+": 7, "C": 6.5, "D": 6, "P": 5.5, "F": 0 };
  
  // State for current calculation
  const [semester, setSemester] = useState('S1');
  const [subjects, setSubjects] = useState([{ id: 1, credit: 3, grade: 'S' }]);
  const [sgpa, setSgpa] = useState(null);
  
  // State for Saved History (for the Chart)
  const [history, setHistory] = useState([]);

  // Load history on start
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('gpa_history')) || [];
    setHistory(saved);
  }, []);

  // Add a new subject row
  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now(), credit: 3, grade: 'S' }]);
  };

  // Remove a subject row
  const removeSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  // Handle Input Changes
  const handleChange = (id, field, value) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Calculate Logic
  const calculateSGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach(sub => {
      const points = gradePoints[sub.grade];
      const credit = parseFloat(sub.credit);
      totalPoints += (points * credit);
      totalCredits += credit;
    });

    const result = (totalPoints / totalCredits).toFixed(2);
    setSgpa(result);

    // Save to History
    const newEntry = { name: semester, gpa: result };
    
    // Check if semester already exists, update it, otherwise add new
    const existingIndex = history.findIndex(h => h.name === semester);
    let updatedHistory;
    if (existingIndex >= 0) {
      updatedHistory = [...history];
      updatedHistory[existingIndex] = newEntry;
    } else {
      updatedHistory = [...history, newEntry];
      // Sort history (S1, S2, S3...)
      updatedHistory.sort((a, b) => a.name.localeCompare(b.name));
    }

    setHistory(updatedHistory);
    localStorage.setItem('gpa_history', JSON.stringify(updatedHistory));
  };

  return (
    <div className="container">
      <header className="header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1>🎓 GPA Manager</h1>
        <button onClick={() => navigate('/dashboard')} className="download-btn" style={{background:'#555'}}>Back to Dashboard</button>
      </header>

      <div className="grid">
        {/* LEFT COLUMN: CALCULATOR */}
        <div className="card">
          <h2 className="title">Calculate SGPA</h2>
          
          <div style={{marginBottom:'15px'}}>
            <label>Semester: </label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} style={{padding:'5px', marginLeft:'10px'}}>
              {['S1','S2','S3','S4','S5','S6','S7','S8'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <table style={{width:'100%', marginBottom:'15px'}}>
            <thead>
              <tr style={{textAlign:'left'}}>
                <th>Subject</th>
                <th>Credit</th>
                <th>Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, index) => (
                <tr key={sub.id}>
                  <td>Subject {index + 1}</td>
                  <td>
                    <select value={sub.credit} onChange={(e) => handleChange(sub.id, 'credit', e.target.value)} style={{width:'50px'}}>
                      <option value="4">4</option>
                      <option value="3">3</option>
                      <option value="2">2</option>
                      <option value="1">1</option>
                    </select>
                  </td>
                  <td>
                    <select value={sub.grade} onChange={(e) => handleChange(sub.id, 'grade', e.target.value)}>
                      {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => removeSubject(sub.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>✖</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addSubject} className="download-btn" style={{background:'#eee', color:'#333', marginRight:'10px'}}>+ Add Subject</button>
          <button onClick={calculateSGPA} className="download-btn">Calculate & Save</button>

          {sgpa && (
            <div style={{marginTop:'20px', padding:'15px', background:'#e3f2fd', borderRadius:'10px', textAlign:'center'}}>
              <h3>Your SGPA: <span style={{fontSize:'2rem', color:'#1976d2'}}>{sgpa}</span></h3>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PROGRESS CHART */}
        <div className="card">
          <h2 className="title">Academic Performance</h2>
          {history.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={history}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="gpa" fill="#8884d8" radius={[10, 10, 0, 0]}>
                    {history.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.gpa >= 8.0 ? '#4caf50' : entry.gpa >= 6.0 ? '#ff9800' : '#f44336'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p style={{textAlign:'center', fontSize:'0.9rem', color:'#666'}}>
                *Green: Excellent (&gt;8) | Orange: Good (&gt;6) | Red: Needs Improvement
              </p>
            </div>
          ) : (
            <div style={{textAlign:'center', padding:'50px', color:'#999'}}>
              <p>No data yet.</p>
              <p>Calculate your SGPA to see your growth chart here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GPACalculator;