import { useState, useEffect } from 'react';

const STORE = 'edu_todos';
const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; } };
const save = (t) => localStorage.setItem(STORE, JSON.stringify(t));

export default function TodoList() {
  const [todos, setTodos] = useState(load);
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [showDone, setShowDone] = useState(false);

  useEffect(() => save(todos), [todos]);

  const add = () => {
    if (!text.trim()) return;
    const next = [{ id: Date.now(), text: text.trim(), done: false, due: due || null, from: 'manual' }, ...todos];
    setTodos(next);
    setText(''); setDue('');
  };

  const toggle = id => setTodos(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const del    = id => setTodos(t => t.filter(x => x.id !== id));

  const pending = todos.filter(t => !t.done);
  const done    = todos.filter(t => t.done);

  const isOverdue = (due) => due && new Date(due) < new Date() && !due.includes(':');

  return (
    <div className="todo-widget">
      <div className="todo-header">
        <h3><i className="fas fa-check-square"></i> My Tasks</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {done.length > 0 && (
            <button
              onClick={() => setShowDone(s => !s)}
              style={{ background: 'none', border: 'none', color: 'var(--gray)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {showDone ? 'Hide' : `+${done.length} done`}
            </button>
          )}
          <span style={{ background: 'var(--primary-bg)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
            {pending.length} pending
          </span>
        </div>
      </div>

      {/* Add row */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          className="todo-add-row"
          style={{ flex: '2', minWidth: '150px', padding: '0.65rem 0.9rem', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--input-bg)', color: 'var(--dark)', fontSize: '0.9rem' }}
          placeholder="Add a task…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <input
          type="date"
          style={{ padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--input-bg)', color: 'var(--gray)', fontSize: '0.85rem' }}
          value={due}
          onChange={e => setDue(e.target.value)}
        />
        <button className="todo-add-btn" onClick={add}>
          <i className="fas fa-plus"></i> Add
        </button>
      </div>

      {/* Pending tasks */}
      {pending.length === 0 ? (
        <p style={{ color: 'var(--gray)', fontSize: '0.88rem', textAlign: 'center', padding: '1rem 0' }}>
          🎉 All caught up!
        </p>
      ) : (
        pending.map(t => (
          <div className="todo-item" key={t.id}>
            <input type="checkbox" className="todo-check" checked={t.done} onChange={() => toggle(t.id)} />
            <div style={{ flex: 1 }}>
              <div className={`todo-text${t.done ? ' done' : ''}`}>{t.text}</div>
              {t.due && (
                <div className={`todo-due${isOverdue(t.due) ? ' overdue' : ''}`}>
                  <i className="fas fa-calendar-alt" style={{ marginRight: '0.3rem' }}></i>
                  {t.due} {isOverdue(t.due) && '⚠️ Overdue'}
                </div>
              )}
              {t.from === 'notification' && (
                <div style={{ fontSize: '0.72rem', color: 'var(--gray)' }}>
                  <i className="fas fa-bell" style={{ marginRight: '0.3rem' }}></i>From notification
                </div>
              )}
            </div>
            <button className="todo-del" onClick={() => del(t.id)} title="Delete">
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))
      )}

      {/* Done tasks */}
      {showDone && done.map(t => (
        <div className="todo-item" key={t.id} style={{ opacity: 0.6 }}>
          <input type="checkbox" className="todo-check" checked={t.done} onChange={() => toggle(t.id)} />
          <div className="todo-text done" style={{ flex: 1 }}>{t.text}</div>
          <button className="todo-del" onClick={() => del(t.id)}><i className="fas fa-trash"></i></button>
        </div>
      ))}
    </div>
  );
}

// Export a helper so announcement cards can add todos
export function addNotificationTodo(notification) {
  const existing = JSON.parse(localStorage.getItem(STORE) || '[]');
  const alreadyAdded = existing.some(t => t.notifId === notification.id);
  if (alreadyAdded) return false;
  const todos = [{
    id: Date.now(),
    text: `📋 ${notification.title}`,
    done: false,
    due: null,
    from: 'notification',
    notifId: notification.id,
  }, ...existing];
  localStorage.setItem(STORE, JSON.stringify(todos));
  return true;
}
