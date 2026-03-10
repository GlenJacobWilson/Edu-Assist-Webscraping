import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';

const SEMS = ['S1','S2','S3','S4','S5','S6','S7','S8'];
const BRANCHES = ['CSE','ECE','EEE','MECH','CIVIL','IT'];

export default function StudyMaterials() {
  const { user } = useAuth();
  const { showNotification } = useToast();
  const navigate = useNavigate();

  const [sem, setSem] = useState(user?.semester || 'S6');
  const [branch, setBranch] = useState(user?.department || 'CSE');
  const [type, setType] = useState('notes');
  const [subjects, setSubjects] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [downloads, setDownloads] = useState(null);
  const [dlLoading, setDlLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setSubsLoading(true); setSelected(null); setDownloads(null);
      try {
        const data = await api.getMaterials(sem, branch, type);
        setSubjects(Array.isArray(data) ? data : []);
      } catch {
        setSubjects([]);
        showNotification('Failed to load subjects', 'error');
      }
      setSubsLoading(false);
    };
    fetch();
  }, [sem, branch, type]);

  const selectSubject = async (sub) => {
    setSelected(sub); setDownloads(null); setDlLoading(true);
    try {
      setDownloads(await api.getMaterialDownloads(sub.url));
    } catch {
      showNotification('Failed to load downloads', 'error');
      setDownloads({ name: sub.name, downloads: [] });
    }
    setDlLoading(false);
  };

  const isS1S2 = sem === 'S1' || sem === 'S2';

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <a href="/dashboard" className="logo" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>
            <i className="fas fa-graduation-cap"></i><span>EduAssist</span>
          </a>
          <div className="user-profile" onClick={() => navigate('/dashboard')}>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'S')}&background=2563eb&color=fff`} alt="u" />
            <span>{user?.name}</span>
          </div>
        </div>
      </nav>

      <div className="page-container" style={{ marginTop:'72px' }}>
        <div className="page-header">
          <h1><i className="fas fa-book-open"></i> Study Materials</h1>
          <p>Notes and previous year question papers from KTU Notes</p>
        </div>

        <div className="materials-controls-bar">
          <div className="controls-row">
            <div className="ctrl-group">
              <label><i className="fas fa-graduation-cap"></i> Semester</label>
              <select className="ctrl-select" value={sem} onChange={e => setSem(e.target.value)}>
                {SEMS.map(s => <option key={s} value={s}>Semester {s.slice(1)}</option>)}
              </select>
            </div>
            <div className="ctrl-group" style={{ visibility: isS1S2 ? 'hidden' : 'visible' }}>
              <label><i className="fas fa-code-branch"></i> Branch</label>
              <select className="ctrl-select" value={branch} onChange={e => setBranch(e.target.value)}>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="ctrl-group">
              <label><i className="fas fa-file-alt"></i> Type</label>
              <div className="type-toggle">
                <button className={`type-tab${type === 'notes' ? ' active' : ''}`} onClick={() => setType('notes')}>
                  <i className="fas fa-sticky-note"></i> Notes
                </button>
                <button className={`type-tab${type === 'qp' ? ' active' : ''}`} onClick={() => setType('qp')}>
                  <i className="fas fa-question-circle"></i> Q. Papers
                </button>
              </div>
            </div>
          </div>
        </div>

        {subsLoading ? (
          <div className="loading"><div className="spinner" style={{ margin:'0 auto 1rem' }}></div>Loading subjects…</div>
        ) : subjects.length === 0 ? (
          <div className="empty-state"><i className="fas fa-folder-open"></i><p>No subjects found for {sem} {isS1S2 ? '(Common)' : branch} {type === 'qp' ? 'Question Papers' : 'Notes'}.</p></div>
        ) : (
          <div className="subjects-grid">
            {subjects.map((s, i) => (
              <div key={s.url || i} className={`subject-card${selected?.url === s.url ? ' selected' : ''}`} onClick={() => selectSubject(s)}>
                <div className="subject-icon"><i className={`fas fa-${type === 'qp' ? 'file-alt' : 'book'}`}></i></div>
                <div className="subject-info"><h4>{s.name}</h4>{s.code && <span>{s.code}</span>}</div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="downloads-box">
            <h3><i className="fas fa-download" style={{ color:'var(--primary)' }}></i> {downloads?.name || selected.name}</h3>
            {dlLoading ? (
              <div className="loading"><div className="spinner" style={{ margin:'0 auto 1rem' }}></div>Fetching links…</div>
            ) : !downloads?.downloads?.length ? (
              <div className="empty-state"><i className="fas fa-folder-open"></i><p>No download links found.</p></div>
            ) : (
              downloads.downloads.map((dl, i) => (
                <div className="dl-item" key={i}>
                  <div className="dl-item-info"><i className="fas fa-file-pdf"></i><span>{dl.label || `Document ${i + 1}`}</span></div>
                  <div className="dl-btns">
                    <a href={dl.gdrive_url} target="_blank" rel="noreferrer" className="btn-preview" onClick={() => showNotification('Opening preview…', 'info')}>
                      <i className="fas fa-eye"></i> Preview
                    </a>
                    <a href={dl.direct_url} target="_blank" rel="noreferrer" className="btn-dl" onClick={() => showNotification('Downloading…', 'success')}>
                      <i className="fas fa-download"></i> Download
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
