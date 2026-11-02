const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), context = { window: {} };
for (const file of ['content.js', 'source-pages.js']) vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
const { chapters, source } = context.window.SU_DANG_DATA, pages = context.window.SU_DANG_PAGES;
const normalize = s => s.replace(/\s+/g, ' ').trim();
const ids = new Set(); let count = 0;
assert.equal(chapters.length, 5); assert.equal(pages.length, 440);
for (const chapter of chapters) {
  const sections = new Set(chapter.sections.map(s => s.id));
  for (const q of chapter.questions) {
    assert(!ids.has(q.id)); ids.add(q.id); count++;
    assert.equal(q.options.length, 4); assert.equal(new Set(q.options).size, 4);
    assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    assert(sections.has(q.section)); assert(q.page >= chapter.startPage && q.page <= chapter.endPage);
    assert(normalize(pages[q.page - 1].text).includes(normalize(q.evidence)), q.id);
    for (const extra of q.evidenceExtra || []) assert(normalize(pages[extra.page - 1].text).includes(normalize(extra.evidence)), q.id);
  }
  for (const b of chapter.mindmap.branches) for (const n of [b, ...b.children]) assert(n.page >= chapter.startPage && n.page <= chapter.endPage);
}
assert.equal(count, 215);
for (let i = 1; i <= 440; i++) assert(fs.statSync(path.join(root, 'assets/pages', i + '.png')).size > 0);
const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'assets/giao-trinh-2021.pdf'))).digest('hex');
assert.equal(digest, source.sha256);
console.log('PASS: 215 sourced questions, 5 chapter maps, 440 scans, and original PDF integrity.');
