import { useState, useRef, useEffect } from 'react';

const STORAGE_KEY = 'anthropic_api_key';

export default function AIChatModal({ notification, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem(STORAGE_KEY));
  const [tempKey, setTempKey] = useState('');
  const msgEndRef = useRef(null);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const saveKey = () => {
    if (!tempKey.trim()) return;
    localStorage.setItem(STORAGE_KEY, tempKey.trim());
    setApiKey(tempKey.trim());
    setShowKeyInput(false);
  };

  const systemPrompt = `You are a helpful assistant for KTU (Kerala Technological University) students.
A student has a question about the following official KTU notification:

TITLE: ${notification.title}
DATE: ${notification.date}
SUMMARY: ${notification.summary || 'No summary available'}
FULL CONTENT: ${notification.message ? notification.message.replace(/<[^>]*>/g, '') : 'Not available'}

Answer the student's questions about this notification clearly and concisely. 
If the answer isn't in the notification, say so honestly.
Be helpful, friendly, and specific to KTU context.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!apiKey) { setShowKeyInput(true); return; }

    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system: systemPrompt,
          messages: history,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.content?.[0]?.text || 'No response received.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error: ${err.message}. ${err.message.includes('401') ? 'Please check your API key.' : ''}`,
      }]);
    }
    setLoading(false);
  };

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const QUICK = [
    'What is the deadline for this?',
    'Who is this notification for?',
    'What action do I need to take?',
    'Is this relevant to S6 CSE students?',
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box wide ai-chat-modal">
        <div className="modal-header-bar">
          <h2>
            <span>✨</span> Ask AI About This Notice
          </h2>
          <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>

        <div className="modal-body">
          {/* Context box */}
          <div className="ai-chat-context">
            <strong style={{ color: 'var(--primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📋 Notification Context
            </strong>
            <br />
            <strong>{notification.title}</strong>
            {notification.summary && <><br />{notification.summary}</>}
          </div>

          {/* API Key setup */}
          {showKeyInput && (
            <div className="ai-key-notice">
              <p style={{ marginBottom: '0.6rem', fontWeight: 600 }}>
                <i className="fas fa-key" style={{ marginRight: '0.4rem', color: 'var(--accent)' }}></i>
                Enter your Anthropic API key to use AI chat
              </p>
              <p style={{ fontSize: '0.82rem', marginBottom: '0.8rem', color: 'var(--gray)' }}>
                Get your key from <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>console.anthropic.com</a>. 
                Stored locally in your browser only.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={tempKey}
                  onChange={e => setTempKey(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--input-bg)', color: 'var(--dark)' }}
                  onKeyDown={e => e.key === 'Enter' && saveKey()}
                />
                <button
                  onClick={saveKey}
                  style={{ padding: '0.6rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--r-sm)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save
                </button>
                {apiKey && (
                  <button
                    onClick={() => setShowKeyInput(false)}
                    style={{ padding: '0.6rem 1rem', background: 'var(--bg)', color: 'var(--gray)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick questions */}
          {messages.length === 0 && !showKeyInput && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--gray)', marginBottom: '0.6rem', fontWeight: 600 }}>
                Quick questions:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {QUICK.map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    style={{
                      padding: '0.4rem 0.85rem',
                      background: 'var(--primary-bg)', color: 'var(--primary)',
                      border: '1px solid rgba(37,99,235,0.2)', borderRadius: '20px',
                      fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="ai-messages">
            {messages.length === 0 && !showKeyInput && (
              <div style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem', fontSize: '0.9rem' }}>
                <i className="fas fa-robot" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.8rem', opacity: 0.4 }}></i>
                Ask anything about this notification
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>{m.content}</div>
            ))}
            {loading && <div className="ai-msg assistant loading"><i className="fas fa-circle-notch fa-spin" style={{ marginRight: '0.5rem' }}></i>Thinking…</div>}
            <div ref={msgEndRef} />
          </div>

          {/* Input */}
          {!showKeyInput && (
            <>
              <div className="ai-input-row">
                <input
                  className="ai-input"
                  placeholder="Ask a question about this notice…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                />
                <button className="ai-send-btn" onClick={send} disabled={loading || !input.trim()}>
                  <i className="fas fa-paper-plane"></i> Send
                </button>
              </div>
              <button
                onClick={() => setShowKeyInput(true)}
                style={{ background: 'none', border: 'none', color: 'var(--gray)', fontSize: '0.78rem', cursor: 'pointer', marginTop: '0.5rem' }}
              >
                <i className="fas fa-key" style={{ marginRight: '0.3rem' }}></i>
                {apiKey ? 'Change API key' : 'Set API key'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
