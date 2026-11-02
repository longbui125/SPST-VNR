(function (root) {
  'use strict';
  const KEY = 'su-dang.progress.v1';
  const uid = () => root.crypto?.randomUUID?.() || `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  function profile(name = 'Người học') {
    return { id: uid(), name: name.trim().slice(0, 40) || 'Người học', createdAt: new Date().toISOString(), answers: {}, bookmarks: [], learned: [], readerPage: 35, cursors: {}, lastChapter: 'c1', lastTab: 'overview' };
  }
  function reset(p) {
    return { ...p, answers: {}, bookmarks: [], learned: [], readerPage: 35, cursors: {}, lastChapter: 'c1', lastTab: 'overview' };
  }
  function fresh() { const p = profile(); return { version: 1, active: p.id, profiles: [p] }; }
  function cleanProfile(input, chapters) {
    if (!input || typeof input !== 'object' || typeof input.name !== 'string' || !input.name.trim() || input.name.length > 40 || !input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers)) throw new Error('Hồ sơ không đúng định dạng.');
    const questions = new Map(chapters.flatMap(c => c.questions.map(q => [q.id, q])));
    const nodeIds = new Set(chapters.flatMap(c => c.mindmap.branches.flatMap(b => [b.id, ...b.children.map((n, i) => `${b.id}-${i}`)])));
    const p = profile(input.name);
    if (typeof input.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(input.id)) p.id = input.id;
    if (typeof input.createdAt === 'string' && Number.isFinite(Date.parse(input.createdAt))) p.createdAt = input.createdAt;
    for (const [id, entry] of Object.entries(input.answers)) {
      if (!questions.has(id)) continue;
      if (!entry || !Number.isInteger(entry.selected) || entry.selected < 0 || entry.selected > 3 || !Number.isInteger(entry.attempts) || entry.attempts < 1 || entry.attempts > 100000) throw new Error('Có câu trả lời không hợp lệ trong tệp tiến độ.');
      p.answers[id] = { selected: entry.selected, correct: entry.selected === questions.get(id).answer, attempts: entry.attempts, at: typeof entry.at === 'string' ? entry.at.slice(0, 40) : '' };
    }
    p.bookmarks = [...new Set(Array.isArray(input.bookmarks) ? input.bookmarks.filter(id => questions.has(id)) : [])];
    p.learned = [...new Set(Array.isArray(input.learned) ? input.learned.filter(id => nodeIds.has(id)) : [])];
    if (Number.isInteger(input.readerPage) && input.readerPage >= 1 && input.readerPage <= 440) p.readerPage = input.readerPage;
    if (chapters.some(c => c.id === input.lastChapter)) p.lastChapter = input.lastChapter;
    if (['overview','quiz','map','reader'].includes(input.lastTab)) p.lastTab = input.lastTab;
    if (input.cursors && typeof input.cursors === 'object') for (const c of chapters) if (c.questions.some(q => q.id === input.cursors[c.id])) p.cursors[c.id] = input.cursors[c.id];
    return p;
  }
  function load(storage, chapters) {
    let raw;
    try {
      raw = storage.getItem(KEY);
      if (!raw) return { state: fresh(), warning: '' };
      const data = JSON.parse(raw);
      if (data.version !== 1 || !Array.isArray(data.profiles) || data.profiles.length < 1 || data.profiles.length > 20) throw new Error('Unsupported progress');
      const profiles = data.profiles.map(p => cleanProfile(p, chapters));
      if (new Set(profiles.map(p => p.id)).size !== profiles.length) throw new Error('Duplicate profiles');
      return { state: { version: 1, active: profiles.some(p => p.id === data.active) ? data.active : profiles[0].id, profiles }, warning: '' };
    } catch {
      if (raw) try { storage.setItem(KEY + '.unreadable-backup', raw); } catch {}
      return { state: fresh(), warning: raw ? 'Dữ liệu cũ không đọc được. Đã thử giữ bản sao trong trình duyệt; hãy nhập tệp sao lưu nếu bạn có.' : 'Trình duyệt không cho lưu dữ liệu. Bạn vẫn có thể học và xuất tiến độ.' };
    }
  }
  function save(storage, state) { try { storage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; } }
  function record(p, question, selected) {
    if (!Number.isInteger(selected) || selected < 0 || selected > 3) throw new Error('Invalid choice');
    const previous = p.answers[question.id];
    p.answers[question.id] = { selected, correct: selected === question.answer, attempts: (previous?.attempts || 0) + 1, at: new Date().toISOString() };
    return p.answers[question.id];
  }
  function stats(p, questions) {
    let answered = 0, correct = 0, attempts = 0;
    for (const q of questions) { const a = p.answers[q.id]; if (a) { answered++; if (a.correct) correct++; attempts += a.attempts; } }
    return { total: questions.length, answered, correct, wrong: answered - correct, attempts, percent: questions.length ? Math.round(correct / questions.length * 100) : 0 };
  }
  function importProfile(raw, chapters) {
    const data = JSON.parse(raw);
    if (data.app !== 'su-dang' || data.version !== 1) throw new Error('Tệp này không phải bản sao lưu tiến độ Sử Đảng.');
    const p = cleanProfile(data.profile, chapters);
    p.id = uid();
    return p;
  }
  const api = { KEY, profile, reset, fresh, load, save, record, stats, importProfile, cleanProfile };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SuDangProgress = api;
})(typeof window !== 'undefined' ? window : globalThis);
