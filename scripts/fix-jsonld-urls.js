/*
 Normalize JSON-LD URLs to use https://wplacetool.app and absolute URLs.
 - Updates fields like url, image, logo.url, downloadUrl, contentUrl, @id
 - Updates potentialAction.target.urlTemplate
 - Leaves external sameAs links untouched
*/
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const HOST = 'https://wplacetool.app';

const localeDirs = ['.', 'zh','tr','ko','ja','es','fr','de','pt','mi','gn'];

function listHtml(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = path.join(abs, e.name);
    const rel = path.relative(ROOT, p);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.git')) continue;
      files.push(...listHtml(rel));
    } else if (e.isFile() && rel.endsWith('.html')) {
      files.push(rel);
    }
  }
  return files;
}

function absoluteUrl(val, relFile) {
  if (!val || typeof val !== 'string') return val;
  if (/^https?:\/\//i.test(val)) {
    return val.replace(/^https?:\/\/wplace\.vercel\.app/i, HOST);
  }
  if (val.startsWith('//')) return 'https:' + val;
  if (val.startsWith('/')) return HOST + val;
  // relative to file dir → convert to root path approximation
  const dir = '/' + path.dirname(relFile).replace(/\\/g, '/');
  const joined = (dir === '/' ? '' : dir) + '/' + val;
  return HOST + joined.replace(/\/+/g, '/');
}

function normalizeJsonLd(node, relFile) {
  if (Array.isArray(node)) return node.map(n => normalizeJsonLd(n, relFile));
  if (node && typeof node === 'object') {
    const keysToAbs = ['url','image','contentUrl','downloadUrl','@id'];
    for (const k of keysToAbs) if (k in node) node[k] = absoluteUrl(node[k], relFile);
    if (node.logo && typeof node.logo === 'object' && node.logo.url) {
      node.logo.url = absoluteUrl(node.logo.url, relFile);
    }
    if (node.publisher && typeof node.publisher === 'object') {
      if (node.publisher.url) node.publisher.url = absoluteUrl(node.publisher.url, relFile);
      if (node.publisher.logo && node.publisher.logo.url) {
        node.publisher.logo.url = absoluteUrl(node.publisher.logo.url, relFile);
      }
    }
    if (node.potentialAction && typeof node.potentialAction === 'object') {
      const pa = node.potentialAction;
      if (pa.target && typeof pa.target === 'object') {
        if (pa.target.urlTemplate) pa.target.urlTemplate = absoluteUrl(pa.target.urlTemplate, relFile);
      }
    }
    // Recurse
    for (const [k, v] of Object.entries(node)) {
      if (k === 'sameAs') continue; // external
      if (v && typeof v === 'object') node[k] = normalizeJsonLd(v, relFile);
    }
  }
  return node;
}

function processFile(rel) {
  const abs = path.join(ROOT, rel);
  let src = fs.readFileSync(abs, 'utf8');
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let changed = false;
  src = src.replace(re, (m, jsonRaw) => {
    const raw = jsonRaw.trim();
    if (!raw) return m;
    try {
      const parsed = JSON.parse(raw);
      const norm = normalizeJsonLd(parsed, rel);
      const pretty = JSON.stringify(norm, null, 2);
      changed = true;
      return m.replace(jsonRaw, '\n' + pretty + '\n');
    } catch (e) {
      return m; // skip invalid JSON-LD
    }
  });
  if (changed) {
    fs.writeFileSync(abs, src, 'utf8');
    console.log('[jsonld]', rel);
  }
  return changed;
}

function run() {
  const files = new Set();
  for (const d of localeDirs) for (const f of listHtml(d)) files.add(f);
  let changed = 0;
  for (const f of files) if (processFile(f)) changed++;
  console.log(`Done. JSON-LD updated: ${changed}/${files.size}`);
}

run();
