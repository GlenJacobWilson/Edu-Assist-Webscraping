import { useState, useEffect } from "react";

const GRADES = {
  "S":10,"A+":9,"A":8.5,"B+":8,"B":7.5,"C+":7,"C":6.5,"D":6,"F":0,"-":null
};
const DEFAULT_CREDITS = 4;

function sgpa(subjects) {
  const valid = subjects.filter(s => GRADES[s.grade] !== null && GRADES[s.grade] !== undefined && s.credits > 0);
  if (!valid.length) return null;
  const totalPoints = valid.reduce((a,s) => a + GRADES[s.grade] * Number(s.credits), 0);
  const totalCredits = valid.reduce((a,s) => a + Number(s.credits), 0);
  return totalCredits ? (totalPoints / totalCredits).toFixed(2) : null;
}

function gradeLabel(gpa) {
  if (gpa >= 9)   return { label:"Outstanding", color:"var(--success)" };
  if (gpa >= 8)   return { label:"Excellent",   color:"#10b981" };
  if (gpa >= 7)   return { label:"Very Good",   color:"var(--primary)" };
  if (gpa >= 6)   return { label:"Good",         color:"var(--accent)" };
  if (gpa >= 5)   return { label:"Average",      color:"var(--gray)" };
  return { label:"Needs Improvement", color:"var(--danger)" };
}

const defaultSem = () => Array.from({length:5}, (_,i) => ({name:`Subject ${i+1}`, grade:"-", credits:DEFAULT_CREDITS}));

export default function ResultTracker() {
  const [sems, setSems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("resultTracker")) || [Array.from({length:5},(_,i)=>({name:`Subject ${i+1}`,grade:"-",credits:DEFAULT_CREDITS}))]; }
    catch { return [defaultSem()]; }
  });
  const [activeSem, setActiveSem] = useState(0);

  useEffect(() => { localStorage.setItem("resultTracker", JSON.stringify(sems)); }, [sems]);

  const updateSubj = (semI, subI, field, val) => {
    setSems(s => s.map((sem, si) => si !== semI ? sem : sem.map((sub, ji) => ji !== subI ? sub : {...sub, [field]: val})));
  };
  const addSubject = semI => setSems(s => s.map((sem,si)=>si!==semI?sem:[...sem,{name:`Subject ${sem.length+1}`,grade:"-",credits:DEFAULT_CREDITS}]));
  const removeSubject = (semI, subI) => setSems(s => s.map((sem,si)=>si!==semI?sem:sem.filter((_,ji)=>ji!==subI)));
  const addSemester = () => { setSems(s=>[...s,defaultSem()]); setActiveSem(sems.length); };

  // CGPA
  const sgpas = sems.map(s => parseFloat(sgpa(s))).filter(Boolean);
  const cgpa = sgpas.length ? (sgpas.reduce((a,b)=>a+b,0)/sgpas.length).toFixed(2) : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📝 Result Tracker</h1>
        <p className="page-subtitle">Track your KTU grades using the official 10-point grading system.</p>
      </div>

      {cgpa && (
        <div className="cgpa-summary-box">
          <p style={{color:"var(--gray)",fontSize:"0.9rem",marginBottom:"0.3rem"}}>Cumulative GPA (CGPA)</p>
          <div className="cgpa-big">{cgpa}</div>
          <div style={{marginTop:"0.6rem"}}>
            <span className="grade-badge" style={{background:gradeLabel(cgpa).color+"22",color:gradeLabel(cgpa).color,fontSize:"1rem",padding:"0.4rem 1.2rem"}}>
              {gradeLabel(cgpa).label}
            </span>
          </div>
          <p style={{color:"var(--gray)",fontSize:"0.82rem",marginTop:"0.5rem"}}>Based on {sgpas.length} semester{sgpas.length!==1?"s":""}</p>
        </div>
      )}

      {/* Semester tabs */}
      <div className="mode-tabs" style={{marginBottom:"1.5rem",flexWrap:"wrap"}}>
        {sems.map((_,i)=>(
          <button key={i} className={`mode-tab ${activeSem===i?"active":""}`} onClick={()=>setActiveSem(i)}>
            S{i+1}
          </button>
        ))}
        <button className="mode-tab" onClick={addSemester} style={{borderStyle:"dashed"}}>+ Add Sem</button>
      </div>

      {sems[activeSem] && (() => {
        const semSgpa = sgpa(sems[activeSem]);
        return (
          <div className="result-sem-card">
            <div className="result-sem-header">
              <div>
                <h3 style={{fontWeight:700,color:"var(--dark)",fontSize:"1.15rem"}}>Semester {activeSem+1}</h3>
                {semSgpa && <p style={{color:"var(--gray)",fontSize:"0.85rem",marginTop:"0.2rem"}}>{gradeLabel(semSgpa).label}</p>}
              </div>
              <div style={{textAlign:"right"}}>
                <div className="sgpa-display">{semSgpa || "—"}</div>
                <p style={{color:"var(--gray)",fontSize:"0.78rem"}}>SGPA</p>
              </div>
            </div>

            {sems[activeSem].map((sub,si)=>(
              <div key={si} className="result-subject-row">
                <input value={sub.name} onChange={e=>updateSubj(activeSem,si,"name",e.target.value)} className="form-input" placeholder="Subject name" />
                <input value={sub.credits} onChange={e=>updateSubj(activeSem,si,"credits",e.target.value)} type="number" min="1" max="5" className="form-input" style={{textAlign:"center"}} placeholder="Credits" />
                <select value={sub.grade} onChange={e=>updateSubj(activeSem,si,"grade",e.target.value)} className="grade-select">
                  {Object.keys(GRADES).map(g=><option key={g} value={g}>{g}{GRADES[g]!==null?` (${GRADES[g]})`:""}</option>)}
                </select>
                {sems[activeSem].length > 1 && (
                  <button onClick={()=>removeSubject(activeSem,si)} style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:"1.1rem"}}>×</button>
                )}
              </div>
            ))}
            <button className="btn btn-outline btn-sm" onClick={()=>addSubject(activeSem)} style={{marginTop:"0.8rem"}}>+ Add Subject</button>
          </div>
        );
      })()}
    </div>
  );
}
