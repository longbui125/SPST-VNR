const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
assert.equal(config.framework, null);
assert.equal(config.outputDirectory, 'dist');
assert.equal(config.buildCommand, 'node build.cjs');
assert.equal(config.installCommand, '');
execFileSync(process.execPath, [path.join(root, 'build.cjs')]);

for (const page of ['index.html', 'hanh-trinh/index.html', 'on-tap/index.html', 'mindmap/index.html']) {
  const html = fs.readFileSync(path.join(output, page), 'utf8');
  for (const [, value] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(?:https?:|#)/.test(value)) continue;
    const url = new URL(value, 'https://example.test/' + page);
    const target = path.join(output, decodeURIComponent(url.pathname));
    assert(fs.existsSync(target), `${page}: missing ${value}`);
    if (fs.statSync(target).isDirectory()) assert(fs.existsSync(path.join(target, 'index.html')), value);
  }
  assert(!/OCR|href="\/giao-trinh\//.test(html), page);
}
for (const file of ['server.cjs', 'source-pages.js', 'tests', 'data', 'research', 'assets/giao-trinh-2021.pdf', 'giao-trinh']) {
  assert(!fs.existsSync(path.join(output, file)), `${file} must not be published`);
}
assert.equal(fs.readFileSync(path.join(output, 'index.html'), 'utf8'), fs.readFileSync(path.join(output, 'hanh-trinh/index.html'), 'utf8'));
assert(fs.existsSync(path.join(output, 'assets/vendor/three.core.js')));
console.log('PASS: static routes, local assets and Vercel settings; internal source material excluded from deployment.');
