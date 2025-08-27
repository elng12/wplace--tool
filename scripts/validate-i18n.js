#!/usr/bin/env node
/**
 * 翻译文件验证脚本 - 检查翻译完整性和一致性
 */

const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, '..', 'lang');
const baseLocale = 'en.json';
let totalErrors = 0;
let totalWarnings = 0;

function readJSON(fp) {
  try {
    const txt = fs.readFileSync(fp, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    throw new Error(`${fp}: ${e.message}`);
  }
}

function validateHtmlUsage(baseData) {
  console.log('\n🔍 验证HTML文件中的翻译键使用...');
  
  const htmlFiles = findHtmlFiles(path.join(__dirname, '..'));
  const usedKeys = new Set();
  
  htmlFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(/data-lang="([^"]+)"/g);
      
      if (matches) {
        matches.forEach(match => {
          const key = match.match(/data-lang="([^"]+)"/)[1];
          usedKeys.add(key);
        });
      }
    } catch (e) {
      console.warn(`⚠️ 无法读取 HTML 文件: ${filePath}`);
    }
  });
  
  // 检查HTML中使用但翻译文件中不存在的键
  const baseKeys = Object.keys(baseData);
  const undefinedKeys = Array.from(usedKeys).filter(key => !baseKeys.includes(key));
  
  if (undefinedKeys.length > 0) {
    console.error(`❌ HTML中使用但${baseLocale}中不存在的键: ${undefinedKeys.join(', ')}`);
    totalErrors++;
  }
  
  // 检查翻译文件中存在但HTML中未使用的键  
  const unusedKeys = baseKeys.filter(key => !usedKeys.has(key));
  if (unusedKeys.length > 10) {
    console.warn(`⚠️ ${baseLocale}中存在但HTML中未使用的键: ${unusedKeys.length} 个`);
    totalWarnings++;
  }
  
  console.log(`📊 HTML使用的翻译键: ${usedKeys.size}, 未使用: ${unusedKeys.length}`);
}

function findHtmlFiles(dir) {
  const htmlFiles = [];
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'scripts'].includes(item)) {
        htmlFiles.push(...findHtmlFiles(fullPath));
      } else if (item.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    });
  } catch (e) {
    // 忽略无法访问的目录
  }
  
  return htmlFiles;
}

function main() {
  console.log('🔍 开始验证翻译文件...\n');
  
  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
  if (!files.includes(baseLocale)) {
    console.error(`❌ 缺少基准文件 ${baseLocale} in lang/`);
    process.exit(1);
  }
  
  const base = readJSON(path.join(langDir, baseLocale));
  const baseKeys = new Set(Object.keys(base));

  console.log(`📋 发现语言: ${files.map(f => f.replace('.json', '')).join(', ')}`);
  console.log(`📏 基准语言包含 ${baseKeys.size} 个翻译键\n`);

  let hasError = false;

  files.forEach(f => {
    const full = path.join(langDir, f);
    try {
      const data = readJSON(full);
      const keys = new Set(Object.keys(data));

      // 语法检查通过
      console.log(`✓ ${f}: JSON解析成功 (${keys.size} 个键)`);

      // 覆盖率检查
      const missing = [];
      const extra = [];
      const empty = [];
      
      baseKeys.forEach(k => { 
        if (!keys.has(k)) missing.push(k);
      });
      
      keys.forEach(k => {
        if (!baseKeys.has(k)) extra.push(k);
        if (!data[k] || data[k].trim() === '') empty.push(k);
      });
      
      const coverage = ((keys.size / baseKeys.size) * 100).toFixed(1);
      console.log(`  📊 覆盖率: ${coverage}%`);
      
      if (missing.length) {
        hasError = true;
        totalErrors++;
        console.error(`  ❌ 缺失 ${missing.length} 个键`);
        if (missing.length <= 5) {
          missing.forEach(k => console.log(`     - ${k}`));
        }
      }
      
      if (extra.length) {
        totalWarnings++;
        console.warn(`  ⚠️ 多余 ${extra.length} 个键: ${extra.slice(0, 3).join(', ')}${extra.length > 3 ? '...' : ''}`);
      }
      
      if (empty.length) {
        hasError = true;
        totalErrors++;
        console.error(`  ❌ 空值 ${empty.length} 个键: ${empty.slice(0, 3).join(', ')}${empty.length > 3 ? '...' : ''}`);
      }
      
    } catch (e) {
      hasError = true;
      totalErrors++;
      console.error(`✗ ${f}: ${e.message}`);
    }
  });

  // 验证HTML使用情况
  validateHtmlUsage(base);

  // 输出总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 验证总结');
  console.log('='.repeat(50));
  
  if (hasError || totalErrors > 0) {
    console.error(`❌ 发现 ${totalErrors} 个错误, ${totalWarnings} 个警告`);
    console.error('请修复错误后重试。');
    process.exit(2);
  } else if (totalWarnings > 0) {
    console.warn(`⚠️ 发现 ${totalWarnings} 个警告，但可以继续`);
    console.log('✅ 核心验证通过！');
  } else {
    console.log('✅ 所有翻译文件验证通过！');
  }
}

if (require.main === module) {
  main();
}

