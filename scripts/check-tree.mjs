#!/usr/bin/env node
// Fails when the checkout holds a file outside the plugin's file list, a symbolic link or a binary file.
import { readdirSync, readFileSync, lstatSync } from 'node:fs';
import { join, relative } from 'node:path';

const ALLOWED = new Set([
  '.claude-plugin/marketplace.json', '.claude-plugin/plugin.json', '.codex-plugin/plugin.json', '.mcp.json',
  '.github/workflows/validate.yml', 'scripts/check-tree.mjs',
  'LICENSE', 'LICENSE-CONTENT', 'README.md',
  'skills/start/SKILL.md', 'skills/start/references/create.md', 'skills/start/references/project-note.md', 'skills/start/agents/openai.yaml',
  'skills/qfactory-patterns/SKILL.md', 'skills/qfactory-patterns/references/done-sheet.md',
  'skills/qfactory-patterns/references/example-weekly-digest.md', 'skills/qfactory-patterns/agents/openai.yaml',
]);
const problems = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (e === '.git') continue;
    const p = join(dir, e), rel = relative('.', p).split('\\').join('/'), st = lstatSync(p);
    if (st.isSymbolicLink()) problems.push(`${rel}  symbolic link`);
    else if (st.isDirectory()) walk(p);
    else if (!ALLOWED.has(rel)) problems.push(`${rel}  not in the file list`);
    else if (readFileSync(p).includes(0)) problems.push(`${rel}  binary file`);
  }
})('.');
for (const f of ALLOWED) { try { lstatSync(f); } catch { problems.push(`${f}  missing`); } }
if (problems.length) { console.error(problems.sort().join('\n')); process.exit(1); }
console.log(`check-tree: PASS (${ALLOWED.size} files)`);
