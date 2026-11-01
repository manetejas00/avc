import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
// Retain only bundles reachable from each of the last five deployed entry pages.
// Traversing entry graphs avoids retaining older archives indefinitely.
const revisions = execFileSync('git', ['log', '-5', '--format=%H', '--', 'dist/index.html'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
let retained = 0;
mkdirSync('dist/assets', { recursive: true });
for (const revision of revisions) {
  const read = file => execFileSync('git', ['show', `${revision}:${file}`], { encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 });
  const html = read('dist/index.html');
  const pending = [...html.matchAll(/["']\/assets\/([A-Za-z0-9_-]+\.(?:js|css))["']/g)].map(match => `dist/assets/${match[1]}`);
  const visited = new Set();
  while (pending.length) {
    const file = pending.pop();
    if (visited.has(file)) continue;
    visited.add(file);
    const source = read(file);
    if (!existsSync(file)) { writeFileSync(file, source); retained++; }
    for (const match of source.matchAll(/["'`]((?:\.\/|\/?assets\/)[A-Za-z0-9_-]+\.(?:js|css))["'`]/g)) {
      const dependency = match[1].startsWith('./') ? path.posix.join(path.posix.dirname(file), match[1]) : `dist/${match[1].replace(/^\//, '')}`;
      pending.push(dependency);
    }
  }
}
console.log(`Retained ${retained} recent deployment assets for existing browser tabs.`);
