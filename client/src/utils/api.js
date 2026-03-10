const BASE = 'http://127.0.0.1:8000';

const tok = () => localStorage.getItem('token');

const authH = (json = false) => {
  const h = {};
  const t = tok();
  if (t) h['Authorization'] = `Bearer ${t}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

const handleRes = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

export const api = {
  // ── Auth ──────────────────────────────────────────
  login: async (email, password) => {
    const fd = new FormData();
    fd.append('username', email);
    fd.append('password', password);
    return handleRes(await fetch(`${BASE}/login`, { method: 'POST', body: fd }));
  },

  register: async (data) =>
    handleRes(await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })),

  getMe: async () =>
    handleRes(await fetch(`${BASE}/me`, { headers: authH() })),

  // ── Notifications ─────────────────────────────────
  getNotifications: async () => {
    try {
      return handleRes(await fetch(`${BASE}/notifications`));
    } catch { return []; }
  },

  downloadUrl: (fileId) => `${BASE}/download?file_id=${encodeURIComponent(fileId)}`,

  // ── Pins ──────────────────────────────────────────
  getPins: async () => {
    try {
      return handleRes(await fetch(`${BASE}/pins`, { headers: authH() }));
    } catch { return []; }
  },
  pin:   async (id) => handleRes(await fetch(`${BASE}/pin/${id}`,   { method: 'POST',   headers: authH() })),
  unpin: async (id) => handleRes(await fetch(`${BASE}/pin/${id}`,   { method: 'DELETE', headers: authH() })),

  // ── Forum ─────────────────────────────────────────
  getForum: async () => {
    try { return handleRes(await fetch(`${BASE}/forum`)); }
    catch { return []; }
  },
  postQuestion:  async (d)     => handleRes(await fetch(`${BASE}/forum/question`, { method:'POST', headers:authH(true), body:JSON.stringify(d) })),
  postAnswer:    async (id, d) => handleRes(await fetch(`${BASE}/forum/question/${id}/answer`, { method:'POST', headers:authH(true), body:JSON.stringify(d) })),
  voteQuestion:  async (id)    => handleRes(await fetch(`${BASE}/forum/question/${id}/vote`, { method:'POST', headers:authH() })),
  deleteQuestion:async (id)    => handleRes(await fetch(`${BASE}/forum/question/${id}`, { method:'DELETE', headers:authH() })),

  // ── Study Materials ───────────────────────────────
  getMaterials:        async (sem, branch, type) => handleRes(await fetch(`${BASE}/materials?semester=${sem}&branch=${branch}&type=${type}`)),
  getMaterialDownloads:async (url) => handleRes(await fetch(`${BASE}/materials/subject?url=${encodeURIComponent(url)}`)),
};
