/*
  SEO Regression Check
  - Validate canonical, og:url, og:image, twitter:image across pages
  - Validate hreflang alternates use the canonical host
  - Validate sitemap.xml uses canonical host and no vercel.app remnants
  Outputs a summary and writes tests/seo-regression-report.txt
*/
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const HOST = 'wplacetool.app';
const CANON = 'https://' + HOST;

const localeDirs = ['zh','tr','ko','ja','es','fr','de','pt','mi','gn'];
const rootPages = ['index.html','about.html','blog.html','privacy.html','terms.html'];

function listHtml() {
  const files = new Set();
  for (const p of rootPages) if (fs.existsSync(path.join(ROOT, p))) files.add(p);
  for (const d of localeDirs) {
    const abs = path.join(ROOT, d);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) {
      if (name.endsWith('.html')) files.add(path.join(d, name));
    }
  }
  return Array.from(files);
}

function get(content, re) {
  const m = content.match(re);
  return m ? m[1] : null;
}

function isHttps(url) { return typeof url === 'string' && url.startsWith('https://'); }
function isHostOk(url) { try { return new URL(url).host === HOST; } catch { return false; } }

function checkPage(rel) {
  const abs = path.join(ROOT, rel);
  const html = fs.readFileSync(abs, 'utf8');
  const issues = [];

  const canonical = get(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i);
  const ogUrl = get(html, /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["'][^>]*>/i);
  const ogImg = get(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["'][^>]*>/i);
  const twImg = get(html, /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["'][^>]*>/i);

  if (!canonical) issues.push('canonical:missing');
  if (!ogUrl) issues.push('og:url:missing');
  if (!ogImg) issues.push('og:image:missing');
  if (!twImg) issues.push('twitter:image:missing');

  if (canonical && (!isHttps(canonical) || !isHostOk(canonical))) issues.push('canonical:invalid-host-or-scheme');
  if (ogUrl && (!isHttps(ogUrl) || !isHostOk(ogUrl))) issues.push('og:url:invalid-host-or-scheme');
  if (ogImg && (!isHttps(ogImg) || !isHostOk(ogImg))) issues.push('og:image:not-absolute-or-host');
  if (twImg && (!isHttps(twImg) || !isHostOk(twImg))) issues.push('twitter:image:not-absolute-or-host');

  // hreflang alternates check (index-like pages more likely to have these)
  const alternates = [...html.matchAll(/<link\s+rel=["']alternate["']\s+hreflang=["'][^"']+["']\s+href=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
  for (const href of alternates) {
    if (!isHttps(href) || !isHostOk(href)) {
      issues.push('hreflang:invalid-host-or-scheme');
      break;
    }
  }

  // quick sanity: no vercel.app remnants
  if (html.includes('wplace.vercel.app')) issues.push('remnant:vercel.app');

  return { rel, issues };
}

function checkSitemap() {
  const f = path.join(ROOT, 'sitemap.xml');
  const issues = [];
  if (!fs.existsSync(f)) return { issues: ['sitemap:missing'] };
  const xml = fs.readFileSync(f, 'utf8');
  if (xml.includes('wplace.vercel.app')) issues.push('sitemap:remnant-vercel');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(m=>m[1]);
  if (locs.some(loc => !isHttps(loc) || !loc.startsWith(CANON))) issues.push('sitemap:loc-invalid-host-or-scheme');
  const xlinks = [...xml.matchAll(/xhtml:link[^>]*href=["']([^"']+)["']/gi)].map(m=>m[1]);
  if (xlinks.some(href => !isHttps(href) || !href.startsWith(CANON))) issues.push('sitemap:xlink-invalid-host-or-scheme');
  return { issues };
}

function run() {
  const pages = listHtml();
  const results = pages.map(checkPage);
  const sitemap = checkSitemap();

  const totalIssues = results.reduce((n, r) => n + r.issues.length, 0) + sitemap.issues.length;
  const summary = {
    pages: pages.length,
    pagesWithIssues: results.filter(r => r.issues.length).length,
    totalIssues,
    sitemapIssues: sitemap.issues,
  };

  const lines = [];
  lines.push(`# SEO Regression Report`);
  lines.push(`Host: ${CANON}`);
  lines.push(`Pages scanned: ${summary.pages}`);
  lines.push(`Pages with issues: ${summary.pagesWithIssues}`);
  lines.push(`Total issues: ${summary.totalIssues}`);
  if (sitemap.issues.length) lines.push(`Sitemap issues: ${sitemap.issues.join(', ')}`);
  lines.push('');
  for (const r of results) {
    if (r.issues.length) lines.push(`${r.rel}: ${r.issues.join(', ')}`);
  }

  const outDir = path.join(ROOT, 'tests');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'seo-regression-report.txt');
  fs.writeFileSync(outFile, lines.join('\n'), 'utf8');

  console.log(JSON.stringify(summary, null, 2));
  console.log(`Report written: tests/seo-regression-report.txt`);
}

run();
