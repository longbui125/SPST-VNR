const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname);
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== root) throw new Error('Build output must stay inside the project.');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);

for (const file of ['index.html', 'on-tap', 'mindmap', 'app.js', 'content.js', 'progress.js', 'map-layout.js', 'journey.js', 'styles.css', 'heritage.css']) {
  fs.cpSync(path.join(root, file), path.join(output, file), { recursive: true });
}
fs.mkdirSync(path.join(output, 'hanh-trinh'));
fs.copyFileSync(path.join(root, 'index.html'), path.join(output, 'hanh-trinh/index.html'));
fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), {
  recursive: true,
  filter: source => path.extname(source).toLowerCase() !== '.pdf'
});
console.log('Static website ready in dist: Hành trình, Ôn tập, Mindmap.');
