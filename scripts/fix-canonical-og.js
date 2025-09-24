/*
  Batch-fix canonical, og:url, and og:image across localized HTML files.
  - Canonical/og:url: enforce https://wplacetool.app + path
  - og:image: enforce https://wplacetool.app/screenshots/desktop-wide.png (if currently vercel.app or relative)
  Only modifies tags if present; if canonical missing, adds one near <title>.
*/
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CANON_HOST = 'https://wplacetool.app';
const IMAGE_URL = `${CANON_HOST}/screenshots/desktop-wide.png`;

const localeDirs = [
  'zh','tr','ko','ja','es','fr','de','pt','mi','gn'
];

function listHtmlFiles(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = path.join(abs, e.name);
    if (e.isDirectory()) {
      files.push(...listHtmlFiles(path.join(dir, e.name)));
    } else if (e.isFile() && e.name.endsWith('.html')) {
      files.push(path.join(dir, e.name));
    }
  }
  return files;
}

function toFinalUrl(fileRel) {
  // Normalize Windows backslashes to URL path
  let urlPath = '/' + fileRel.replace(/\\/g, '/');
  if (urlPath.endsWith('/index.html')) {
    urlPath = urlPath.slice(0, -'/index.html'.length) + '/';
  } else if (urlPath.endsWith('.html')) {
    // keep filename for non-index pages
  }
  return CANON_HOST + urlPath;
}

function fixHead(html, fileRel) {
  const finalUrl = toFinalUrl(fileRel);

  let out = html;

  // Fix canonical (wrong concatenations like /zhhttps://...)
  const canonicalRe = /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i;
  const hasCanonical = canonicalRe.test(out);
  if (hasCanonical) {
    out = out.replace(canonicalRe, `<link rel="canonical" href="${finalUrl}" />`);
  } else {
    // insert after <title> if exists, else in <head>
    if (/<title[^>]*>.*?<\/title>/i.test(out)) {
      out = out.replace(/(<title[^>]*>.*?<\/title>)/i, `$1\n  <link rel="canonical" href="${finalUrl}" />`);
    } else if (/<head[^>]*>/i.test(out)) {
      out = out.replace(/<head[^>]*>/i, match => `${match}\n  <link rel="canonical" href="${finalUrl}" />`);
    }
  }

  // Fix og:url
  const ogUrlRe = /<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/i;
  if (ogUrlRe.test(out)) {
    out = out.replace(ogUrlRe, `<meta property="og:url" content="${finalUrl}">`);
  }

  // Fix og:image if points to vercel.app or not absolute
  const ogImgRe = /<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']\s*\/?>/i;
  out = out.replace(ogImgRe, (m, img) => {
    const needs = !/^https?:\/\//i.test(img) || /vercel\.app/i.test(img);
    return needs ? `<meta property="og:image" content="${IMAGE_URL}">` : m;
  });

  // Fix twitter:image similarly
  const twImgRe = /<meta\s+name=["']twitter:image["']\s+content=["']([^"']*)["']\s*\/?>/i;
  out = out.replace(twImgRe, (m, img) => {
    const needs = !/^https?:\/\//i.test(img) || /vercel\.app/i.test(img);
    return needs ? `<meta name="twitter:image" content="${IMAGE_URL}">` : m;
  });

  return out;
}

function run() {
  const targets = [];
  for (const dir of localeDirs) {
    targets.push(...listHtmlFiles(dir));
  }
  // Also include root non-locale pages (about/blog/privacy/terms)
  const rootCandidates = ['about.html','blog.html','privacy.html','terms.html'];
  for (const f of rootCandidates) if (fs.existsSync(path.join(ROOT, f))) targets.push(f);

  let changed = 0;
  for (const rel of targets) {
    const abs = path.join(ROOT, rel);
    const src = fs.readFileSync(abs, 'utf8');
    const out = fixHead(src, rel);
    if (out !== src) {
      fs.writeFileSync(abs, out, 'utf8');
      changed++;
      console.log('[fixed]', rel);
    }
  }
  console.log(`Done. Files changed: ${changed}/${targets.length}`);
}

run();
