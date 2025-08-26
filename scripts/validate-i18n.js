#!/usr/bin/env node
// Validate lang/*.json files: JSON syntax + key coverage vs en.json
const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, '..', 'lang');
const baseLocale = 'en.json';

function readJSON(fp) {
  try {
    const txt = fs.readFileSync(fp, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    throw new Error(`${fp}: ${e.message}`);
  }
}

function walkKeys(obj, prefix = '', out = new Set()) {
  Object.entries(obj).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      walkKeys(v, key, out);
    } else {
      out.add(key);
    }
  });
  return out;
}

function main() {
  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
  if (!files.includes(baseLocale)) {
    console.error(`Missing ${baseLocale} in lang/`);
    process.exit(1);
  }
  const base = readJSON(path.join(langDir, baseLocale));
  const baseKeys = new Set(Object.keys(base));

  let hasError = false;

  files.forEach(f => {
    const full = path.join(langDir, f);
    try {
      const data = readJSON(full);
      const keys = new Set(Object.keys(data));

      // Syntax OK
      console.log(`✓ ${f}: JSON parsed (${keys.size} keys)`);

      // Coverage
      const missing = [];
      baseKeys.forEach(k => { if (!keys.has(k)) missing.push(k); });
      if (missing.length) {
        hasError = true;
        console.log(`  └─ Missing ${missing.length} keys vs ${baseLocale}`);
        if (missing.length <= 20) {
          missing.forEach(k => console.log(`     - ${k}`));
        } else {
          console.log('     - Too many to list (showing first 20):');
          missing.slice(0, 20).forEach(k => console.log(`       - ${k}`));
        }
      }
    } catch (e) {
      hasError = true;
      console.error(`✗ ${f}: ${e.message}`);
    }
  });

  if (hasError) {
    console.error('\nValidation completed with issues.');
    process.exit(2);
  } else {
    console.log('\nAll i18n files look good.');
  }
}

if (require.main === module) {
  main();
}

