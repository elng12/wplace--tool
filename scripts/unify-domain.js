/*
  Unify domain from https://wplace.vercel.app to https://wplacetool.app
  Targets:
  - All HTML files under locale dirs and at root (hreflang alternates, JSON-LD, links)
  - sitemap.xml (urlset and xhtml:link alternates)
  Skips node_modules if present.
*/
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FROM = 'https://wplace.vercel.app';
const TO = 'https://wplacetool.app';

const includeDirs = ['.', 'zh','tr','ko','ja','es','fr','de','pt','mi','gn'];

function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const p = path.join(abs, entry.name);
    const rel = path.relative(ROOT, p);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
      out.push(...walk(rel));
    } else if (entry.isFile()) {
      if (rel.endsWith('.html') || rel === 'sitemap.xml') out.push(rel);
    }
  }
  return out;
}

function replaceInFile(rel) {
  const abs = path.join(ROOT, rel);
  const src = fs.readFileSync(abs, 'utf8');
  if (!src.includes(FROM)) return false;
  const replaced = src.split(FROM).join(TO);
  if (replaced !== src) {
    fs.writeFileSync(abs, replaced, 'utf8');
    console.log('[domain]', rel);
    return true;
  }
  return false;
}

function run() {
  const files = new Set();
  for (const d of includeDirs) for (const f of walk(d)) files.add(f);
  let changed = 0;
  for (const f of files) if (replaceInFile(f)) changed++;
  console.log(`Done. Files changed: ${changed}/${files.size}`);
}

run();
