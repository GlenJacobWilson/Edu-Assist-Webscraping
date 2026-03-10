import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API = 'http://127.0.0.1:8000';

const SEMS  = ['S1','S2','S3','S4','S5','S6','S7','S8'];
const DEPTS = ['CSE','ECE','EEE','MECH','CIVIL','IT'];
const TYPES = [
  { key:'notes',     label:'Notes',      icon:'fa-sticky-note' },
  { key:'qpapers',   label:'Question Papers', icon:'fa-file-alt' },
  { key:'textbooks', label:'Textbooks',  icon:'fa-book' },
];

function StudyMaterials() {
  const navigate     = useNavigate();
  const [semester, setSemester]   = useState(localStorage.getItem('semester') || 'S6');
  const [dept, setDept]           = useState(localStorage.getItem('department') || 'CSE');
  const [type, setType]           = useState('notes');
  const [subjects, setSubjects]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [dlLoading, setDlLoading] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true); setSelected(null); setDownloads([]);
    try {
      const r = await axios.get(`${API}/materials`, { params: { semester, branch: dept, type } });
      setSubjects(Array.isArray(r.data) ? r.data : []);
    } catch { setSubjects([]); }
    setLoading(false);
  };

  useEffect(() => { fetchSubjects(); }, [semester, dept, type]);

  const fetchDownloads = async (subj) => {
    setSelected(subj); setDlLoading(true);
    try {
      const r = await axios.get(`${API}/materials/subject`, { params: { url: subj.url } });
      setDownloads(Array.isArray(r.data) ? r.data : []);
    } catch { setDownloads([]); }
    setDlLoading(false);
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo"><i className="fas fa-graduation-cap" /><span>EduAssist</span></div>
          <button className="nav-back-btn" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-arrow-left" /> Dashboard
          </button>
        </div>
      </nav>

      <div className="page-wrap">
        <div className="page-inner">

          <div className="page-header-card" style={{ marginBottom:'1.4rem' }}>
            <div>
              <h1><i className="fas fa-book" style={{ marginRight:'0.6rem' }} />Study Materials</h1>
              <p style={{ opacity:0.8, fontSize:'0.85rem', marginTop:'0.25rem' }}>Download notes, question papers and textbooks from KTU Notes</p>
            </div>
          </div>

          {/* Controls */}
          <div className="mat-controls">
            <div className="mat-group">
              <label>Semester</label>
              <select className="mat-select" value={semester} onChange={e => setSemester(e.target.value)}>
                {SEMS.map(s => <option key={s} value={s}>Semester {s.slice(1)}</option>)}
              </select>
            </div>
            <div className="mat-group">
              <label>Branch</label>
              <select className="mat-select" value={dept} onChange={e => setDept(e.target.value)}>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="mat-group">
              <label>Type</label>
              <div className="mat-tabs">
                {TYPES.map(t => (
                  <button key={t.key} className={`mat-tab${type === t.key ? ' active' : ''}`} onClick={() => setType(t.key)}>
                    <i className={`fas ${t.icon}`} /> {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subjects grid */}
          {loading ? (
            <div className="loading"><div className="spinner" />Loading subjects…</div>
          ) : subjects.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-folder-open" />
              <p>No materials found for {semester} · {dept}. Try a different combination.</p>
            </div>
          ) : (
            <div className="subjects-grid">
              {subjects.map((s, i) => (
                <div key={i} className={`subj-card${selected?.name === s.name ? ' sel' : ''}`}
                  onClick={() => fetchDownloads(s)}>
                  <div className="subj-icon"><i className={`fas ${TYPES.find(t=>t.key===type)?.icon || 'fa-book'}`} /></div>
                  <div className="subj-info">
                    <h4>{s.name || s.subject || `Subject ${i+1}`}</h4>
                    <span>{s.count ? `${s.count} files` : 'Click to load'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Downloads */}
          {selected && (
            <div className="dl-box">
              <h3>
                <i className="fas fa-folder-open" style={{ color:'var(--primary)' }} />
                {selected.name || selected.subject} — Files
              </h3>
              {dlLoading ? (
                <div className="loading"><div className="spinner" />Loading files…</div>
              ) : downloads.length === 0 ? (
                <div className="empty-state" style={{ padding:'2rem' }}>
                  <i className="fas fa-file" style={{ fontSize:'1.8rem' }} />
                  <p style={{ marginTop:'0.5rem' }}>No files available for this subject.</p>
                </div>
              ) : (
                downloads.map((f, i) => (
                  <div key={i} className="dl-item">
                    <div className="dl-name">
                      <i className="fas fa-file-pdf" />
                      {f.name || f.title || `File ${i+1}`}
                    </div>
                    <div className="dl-actions">
                      {f.url && (
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="btn-view">
                          <i className="fas fa-eye" /> View
                        </a>
                      )}
                      {f.download_url && (
                        <a href={f.download_url} target="_blank" rel="noopener noreferrer" className="btn-dl">
                          <i className="fas fa-download" /> Download
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudyMaterials;
