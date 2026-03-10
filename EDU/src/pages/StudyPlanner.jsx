import { useState, useEffect } from "react";

const subjectsByBranch = {
  CSE: ["Data Structures","Algorithms","Operating Systems","DBMS","Computer Networks","Software Engineering","Compiler Design","Machine Learning"],
  ECE: ["Signals & Systems","Digital Electronics","VLSI Design","Microprocessors","Communication Theory","Control Systems"],
  ME: ["Engineering Mechanics","Thermodynamics","Fluid Mechanics","Manufacturing Processes","Machine Design"],
  CE: ["Structural Analysis","Concrete Structures","Geotechnical Engineering","Transportation Engineering","Fluid Mechanics"],
};

function generatePlan(subject, topics, days) {
  const plan = [];
  const perDay = Math.ceil(topics.length / Math.max(days, 1));
  for (let d = 0; d < days; d++) {
    const start = d * perDay;
    const dayTopics = topics.slice(start, start + perDay);
    const date = new Date(); date.setDate(date.getDate() + d);
    plan.push({
      day: d + 1,
      date: date.toLocaleDateString("en-IN",{weekday:"short",month:"short",day:"numeric"}),
      topics: dayTopics.length ? dayTopics : ["Revision"],
      tasks: dayTopics.length ? [`Study: ${dayTopics.join(", ")}`, "Solve 5 practice questions", "Review notes"] : ["Full revision","Practice previous year papers"],
      hours: dayTopics.length ? 3 : 2,
      done: false,
    });
  }
  return plan;
}

export default function StudyPlanner() {
  const [step, setStep] = useState("setup"); // setup | plan
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [days, setDays] = useState(7);
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState("");
  const [plan, setPlan] = useState(() => {
    try { return JSON.parse(localStorage.getItem("studyPlan")) || null; } catch { return null; }
  });
  const [planMeta, setPlanMeta] = useState(() => {
    try { return JSON.parse(localStorage.getItem("studyPlanMeta")) || {}; } catch { return {}; }
  });
  const [branch, setBranch] = useState("CSE");

  useEffect(() => {
    if (plan) { localStorage.setItem("studyPlan", JSON.stringify(plan)); }
    if (planMeta) { localStorage.setItem("studyPlanMeta", JSON.stringify(planMeta)); }
  }, [plan, planMeta]);

  useEffect(() => { if (plan) setStep("plan"); }, []);

  const addTopic = () => {
    if (topicInput.trim()) { setTopics(t=>[...t, topicInput.trim()]); setTopicInput(""); }
  };
  const removeTopic = i => setTopics(t => t.filter((_,idx)=>idx!==i));

  const generate = () => {
    const sub = subject === "custom" ? customSubject : subject;
    if (!sub || topics.length === 0) return alert("Please enter a subject and at least one topic.");
    const p = generatePlan(sub, topics, parseInt(days));
    setPlan(p);
    setPlanMeta({ subject: sub, days: parseInt(days), created: new Date().toLocaleDateString() });
    setStep("plan");
  };

  const toggleDone = i => setPlan(p => p.map((d,idx) => idx===i ? {...d, done:!d.done} : d));

  const doneDays = plan ? plan.filter(d=>d.done).length : 0;
  const progress = plan ? Math.round((doneDays / plan.length) * 100) : 0;

  if (step === "plan" && plan) return (
    <div className="page-container">
      <div className="page-header" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"1rem"}}>
        <div>
          <h1 className="page-title">📅 Study Plan — {planMeta.subject}</h1>
          <p className="page-subtitle">Created {planMeta.created} · {plan.length} days · {doneDays} completed</p>
        </div>
        <button className="btn btn-outline" onClick={()=>{setPlan(null);setPlanMeta({});setStep("setup");localStorage.removeItem("studyPlan");}}>
          New Plan
        </button>
      </div>

      <div style={{marginBottom:"1.5rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.85rem",color:"var(--gray)",marginBottom:"0.4rem"}}>
          <span>Progress</span><span>{progress}%</span>
        </div>
        <div className="planner-progress"><div className="planner-progress-bar" style={{width:`${progress}%`}} /></div>
      </div>

      {plan.map((d, i) => {
        const isToday = i === plan.findIndex(x => !x.done);
        return (
          <div key={i} className={`planner-day-card ${isToday?"today":""} ${d.done?"done":""}`}>
            <div className="planner-day-header">
              <div style={{display:"flex",alignItems:"center",gap:"0.8rem"}}>
                <input type="checkbox" checked={d.done} onChange={()=>toggleDone(i)}
                  style={{width:"18px",height:"18px",cursor:"pointer",accentColor:"var(--primary)"}} />
                <div>
                  <div className="day-label">Day {d.day} — {d.date}</div>
                  <div style={{fontSize:"0.78rem",color:"var(--gray)"}}>{d.hours}h estimated</div>
                </div>
              </div>
              {isToday && !d.done && <span className="tag urgent" style={{fontSize:"0.72rem"}}>TODAY</span>}
              {d.done && <span className="solved-badge">✓ Done</span>}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",marginBottom:"0.6rem"}}>
              {d.topics.map((t,ti)=><span key={ti} className={`topic-chip ${d.done?"done-chip":""}`}>{t}</span>)}
            </div>
            <ul style={{paddingLeft:"1.2rem",color:"var(--gray)",fontSize:"0.83rem",lineHeight:"1.9"}}>
              {d.tasks.map((t,ti)=><li key={ti}>{t}</li>)}
            </ul>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📅 Study Planner</h1>
        <p className="page-subtitle">Generate a smart day-by-day study schedule for any KTU subject.</p>
      </div>

      <div className="card">
        <h3 className="card-title" style={{marginBottom:"1.3rem"}}>Create Your Plan</h3>
        <div className="form-group">
          <label>Branch</label>
          <select className="form-input" value={branch} onChange={e=>{setBranch(e.target.value);setSubject("");}}>
            {Object.keys(subjectsByBranch).map(b=><option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Subject</label>
          <select className="form-input" value={subject} onChange={e=>setSubject(e.target.value)}>
            <option value="">— Select subject —</option>
            {subjectsByBranch[branch].map(s=><option key={s} value={s}>{s}</option>)}
            <option value="custom">Custom subject…</option>
          </select>
        </div>
        {subject === "custom" && (
          <div className="form-group">
            <label>Custom Subject Name</label>
            <input className="form-input" value={customSubject} onChange={e=>setCustomSubject(e.target.value)} placeholder="Enter subject name" />
          </div>
        )}
        <div className="form-group">
          <label>Days until exam: <strong>{days}</strong></label>
          <input type="range" min="3" max="30" value={days} onChange={e=>setDays(e.target.value)}
            style={{width:"100%",accentColor:"var(--primary)",marginTop:"0.4rem"}} />
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.78rem",color:"var(--gray)"}}>
            <span>3 days</span><span>30 days</span>
          </div>
        </div>
        <div className="form-group">
          <label>Topics / Modules to Cover</label>
          <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.5rem"}}>
            <input className="form-input" value={topicInput} onChange={e=>setTopicInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addTopic()} placeholder="Type a topic and press Enter" />
            <button className="btn btn-primary" onClick={addTopic}>Add</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
            {topics.map((t,i)=>(
              <span key={i} className="topic-chip">
                {t}
                <button className="topic-chip-del" onClick={()=>removeTopic(i)}>×</button>
              </span>
            ))}
          </div>
          {topics.length === 0 && <p style={{color:"var(--gray)",fontSize:"0.82rem",marginTop:"0.4rem"}}>Add at least one topic or module name.</p>}
        </div>
        <button className="btn btn-primary" onClick={generate} style={{width:"100%",padding:"0.9rem"}}>
          🗓️ Generate Study Plan
        </button>
      </div>
    </div>
  );
}
