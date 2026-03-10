import { useState } from "react";
import { api } from "../utils/api";

export default function AITools() {
  const [noteMode, setNoteMode] = useState("summarize");
  const [noteText, setNoteText] = useState("");
  const [noteResult, setNoteResult] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  const runNotes = async () => {
    if (!noteText.trim()) return;
    setNoteLoading(true); setNoteResult("");
    try {
      const res = await api.summarizeNotes(noteText, noteMode);
      setNoteResult(res.result);
    } catch(e) {
      setNoteResult(`❌ ${e.message}\n\nMake sure ANTHROPIC_API_KEY is set in your backend .env file.`);
    }
    setNoteLoading(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🤖 AI Study Tools</h1>
        <p className="page-subtitle">Powered by Claude — summarize notes, generate exam questions, and create flashcards.</p>
      </div>

      <div className="tool-card">
        <h3>✨ Smart Notes Processor</h3>
        <p className="desc">Paste your study material or chapter text and let AI help you prepare smarter.</p>
        <div className="mode-tabs">
          {[
            {k:"summarize",label:"📋 Summarize"},
            {k:"questions",label:"❓ Exam Questions"},
            {k:"flashcards",label:"🃏 Flashcards"},
          ].map(m=>(
            <button key={m.k} className={`mode-tab ${noteMode===m.k?"active":""}`} onClick={()=>setNoteMode(m.k)}>{m.label}</button>
          ))}
        </div>
        <textarea
          className="form-input" rows={8} value={noteText}
          onChange={e=>setNoteText(e.target.value)}
          placeholder="Paste your notes, textbook content, or study material here…"
          style={{resize:"vertical",fontFamily:"inherit"}}
        />
        <p style={{fontSize:"0.78rem",color:"var(--gray)",marginBottom:"0.3rem"}}>
          {noteText.length} characters · Max 4000 chars processed
        </p>
        <button className="btn-ai" onClick={runNotes} disabled={noteLoading||!noteText.trim()}>
          {noteLoading ? <><span className="loading-spinner" style={{width:"16px",height:"16px",borderWidth:"2px"}} /> Processing…</> : `✨ ${noteMode==="summarize"?"Summarize":noteMode==="questions"?"Generate Questions":"Make Flashcards"}`}
        </button>
        {noteResult && <div className="ai-result-box">{noteResult}</div>}
      </div>

      <div className="tool-card">
        <h3>💡 How AI Features Work</h3>
        <p className="desc">These features use the Claude AI API on the backend.</p>
        <div style={{background:"var(--bg)",borderRadius:"var(--r-md)",padding:"1.2rem",fontSize:"0.88rem",lineHeight:"1.9",color:"var(--dark)"}}>
          <p>📌 <strong>Summarize</strong> — Condenses long notes into topic-wise bullet points for quick revision.</p>
          <p>📌 <strong>Exam Questions</strong> — Generates 8 likely exam questions with model answers based on your notes.</p>
          <p>📌 <strong>Flashcards</strong> — Creates 10 Q&A flashcard pairs for active recall practice.</p>
          <p>📌 <strong>Ask About Notice</strong> — Available on each KTU notification card in the Dashboard. Ask specific questions about any announcement.</p>
          <p style={{marginTop:"0.8rem",color:"var(--gray)",fontSize:"0.82rem"}}>
            ⚙️ To enable AI: set <code style={{background:"var(--primary-bg)",padding:"0.1rem 0.4rem",borderRadius:"4px"}}>ANTHROPIC_API_KEY=your_key</code> in your backend environment.
          </p>
        </div>
      </div>
    </div>
  );
}
