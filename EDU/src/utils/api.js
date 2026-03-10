const BASE = 'http://127.0.0.1:8000';
const tok = () => localStorage.getItem('token');
const authH = (json=false) => {
  const h = {}; const t = tok();
  if (t) h['Authorization'] = `Bearer ${t}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
};
const ok = async res => {
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.detail||`HTTP ${res.status}`); }
  return res.json();
};

export const api = {
  // Auth
  login: async (email,pw) => { const fd=new FormData(); fd.append('username',email); fd.append('password',pw); return ok(await fetch(`${BASE}/login`,{method:'POST',body:fd})); },
  register: async d => ok(await fetch(`${BASE}/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})),
  getMe: async () => ok(await fetch(`${BASE}/me`,{headers:authH()})),
  // Notifications
  getNotifications: async () => { try{return ok(await fetch(`${BASE}/notifications`))}catch{return[]} },
  downloadUrl: id => `${BASE}/download?file_id=${encodeURIComponent(id)}`,
  // Pins
  getPins:  async () => { try{return ok(await fetch(`${BASE}/pins`,{headers:authH()}))}catch{return[]} },
  pin:      async id => ok(await fetch(`${BASE}/pin/${id}`,{method:'POST',headers:authH()})),
  unpin:    async id => ok(await fetch(`${BASE}/pin/${id}`,{method:'DELETE',headers:authH()})),
  // Forum
  getForum:       async ()    => { try{return ok(await fetch(`${BASE}/forum`))}catch{return[]} },
  postQuestion:   async d     => ok(await fetch(`${BASE}/forum/question`,{method:'POST',headers:authH(true),body:JSON.stringify(d)})),
  postAnswer:     async (id,d)=> ok(await fetch(`${BASE}/forum/question/${id}/answer`,{method:'POST',headers:authH(true),body:JSON.stringify(d)})),
  voteQuestion:   async id    => ok(await fetch(`${BASE}/forum/question/${id}/vote`,{method:'POST',headers:authH()})),
  toggleSolved:   async id    => ok(await fetch(`${BASE}/forum/question/${id}/solve`,{method:'POST',headers:authH()})),
  markBest:       async aid   => ok(await fetch(`${BASE}/forum/answer/${aid}/best`,{method:'POST',headers:authH()})),
  deleteQuestion: async id    => ok(await fetch(`${BASE}/forum/question/${id}`,{method:'DELETE',headers:authH()})),
  // Leaderboard
  getLeaderboard: async () => { try{return ok(await fetch(`${BASE}/leaderboard`))}catch{return[]} },
  // Study Groups
  getStudyGroups:   async (sem)   => { try{return ok(await fetch(`${BASE}/studygroups${sem?`?semester=${sem}`:''}`))}catch{return[]} },
  createStudyGroup: async d       => ok(await fetch(`${BASE}/studygroups`,{method:'POST',headers:authH(true),body:JSON.stringify(d)})),
  joinStudyGroup:   async id      => ok(await fetch(`${BASE}/studygroups/${id}/join`,{method:'POST'})),
  deleteStudyGroup: async id      => ok(await fetch(`${BASE}/studygroups/${id}`,{method:'DELETE',headers:authH()})),
  // Subscriptions
  getSubscription: async ()  => { try{return ok(await fetch(`${BASE}/subscribe`,{headers:authH()}))}catch{return{}} },
  subscribe:       async d   => ok(await fetch(`${BASE}/subscribe`,{method:'POST',headers:authH(true),body:JSON.stringify(d)})),
  // AI
  askAboutNotice: async (notice_text, question) => ok(await fetch(`${BASE}/ai/ask-notice`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({notice_text,question})})),
  summarizeNotes: async (text, mode)            => ok(await fetch(`${BASE}/ai/summarize`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,mode})})),
  // Materials
  getMaterials:        async (sem,branch,type) => ok(await fetch(`${BASE}/materials?semester=${sem}&branch=${branch}&type=${type}`)),
  getMaterialDownloads:async url               => ok(await fetch(`${BASE}/materials/subject?url=${encodeURIComponent(url)}`)),
};
