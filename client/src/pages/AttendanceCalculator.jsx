import { useState } from "react";

const SEMS = ["S1","S2","S3","S4","S5","S6","S7","S8"];
const KTU_MIN = 75;

function calcInsight(pct, total, held) {
  if (pct >= KTU_MIN) {
    const canMiss = Math.floor(total - (KTU_MIN / 100) * held);
    return { type:"safe", msg: `✅ You can miss up to ${canMiss} more class${canMiss!==1?"es":""} and stay above 75%.` };
  } else {
    const need = Math.ceil((KTU_MIN * held - 100 * total) / (100 - KTU_MIN));
    return { type:"danger", msg: `🚨 You need to attend ${need} consecutive class${need!==1?"es":""} to reach 75%.` };
  }
}

export default function AttendanceCalculator() {
  const [subjects, setSubjects] = useState([
    { name:"", held:"", attended:"" }
  ]);

  const update = (i, f, v) => setSubjects(s => s.map((x,idx) => idx===i ? {...x,[f]:v} : x));
  const addRow = () => setSubjects(s => [...s, {name:"",held:"",attended:""}]);
  const removeRow = i => setSubjects(s => s.filter((_,idx)=>idx!==i));

  const rows = subjects.map(s => {
    const held = parseInt(s.held)||0, att = parseInt(s.attended)||0;
    const pct = held > 0 ? Math.round((att/held)*100) : null;
    return { ...s, held, attended:att, pct };
  });

  const totalHeld = rows.reduce((a,r)=>a+r.held,0);
  const totalAtt  = rows.reduce((a,r)=>a+r.attended,0);
  const overallPct = totalHeld > 0 ? Math.round((totalAtt/totalHeld)*100) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📊 Attendance Risk Calculator</h1>
        <p className="page-subtitle">Track your KTU attendance and know exactly how many classes you can miss.</p>
      </div>

      {/* Overall summary */}
      {totalHeld > 0 && (
        <div className="att-overall">
          <div className="att-overall-card">
            <div className="big-num" style={{color: overallPct>=75?"var(--success)":"var(--danger)"}}>{overallPct}%</div>
            <p>Overall Attendance</p>
          </div>
          <div className="att-overall-card">
            <div className="big-num" style={{color:"var(--primary)"}}>{totalAtt}</div>
            <p>Total Classes Attended</p>
          </div>
          <div className="att-overall-card">
            <div className="big-num" style={{color:"var(--gray)"}}>{totalHeld}</div>
            <p>Total Classes Held</p>
          </div>
          <div className="att-overall-card">
            <div className="big-num" style={{color:"var(--accent)"}}>{totalHeld - totalAtt}</div>
            <p>Classes Missed</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Subject-wise Breakdown</h3>
          <button className="btn btn-primary btn-sm" onClick={addRow}>+ Add Subject</button>
        </div>

        {rows.map((r, i) => (
          <div key={i}>
            <div className="att-subject-row">
              <input value={r.name} onChange={e=>update(i,"name",e.target.value)}
                placeholder="Subject name (e.g. DBMS)" className="form-input" />
              <input value={r.held===0?"":r.held} onChange={e=>update(i,"held",e.target.value)}
                placeholder="Held" type="number" min="0" className="form-input" />
              <input value={r.attended===0?"":r.attended} onChange={e=>update(i,"attended",e.target.value)}
                placeholder="Attended" type="number" min="0" className="form-input" />
              <div className="att-result">
                {r.pct !== null ? (
                  <span className={r.pct>=75?"att-safe":r.pct>=60?"att-warning":"att-danger"}>
                    {r.pct}%
                  </span>
                ) : <span className="att-warning">—</span>}
                {rows.length > 1 && (
                  <button onClick={()=>removeRow(i)} style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:"1rem"}}>×</button>
                )}
              </div>
            </div>
            {r.pct !== null && r.held > 0 && (() => {
              const ins = calcInsight(r.pct, r.attended, r.held);
              return <div className={`att-insight ${ins.type}`}>{ins.msg}</div>;
            })()}
          </div>
        ))}
      </div>

      <div className="card" style={{marginTop:"1.5rem"}}>
        <h3 className="card-title" style={{marginBottom:"1rem"}}>📋 KTU Attendance Rules</h3>
        <ul style={{color:"var(--gray)",fontSize:"0.9rem",lineHeight:"2",paddingLeft:"1.2rem"}}>
          <li>Minimum 75% attendance required in each subject to be eligible for semester exams.</li>
          <li>Students with 60–74% may apply for condonation with a valid reason.</li>
          <li>Below 60% — attendance shortage cannot be condoned; you are not eligible to write the exam.</li>
          <li>Medical leave may be considered separately by the college at their discretion.</li>
        </ul>
      </div>
    </div>
  );
}
