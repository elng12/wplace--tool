/**
 * PWA图标生成器 - 自动生成所需的图标文件
 */
const fs = require('fs');
const path = require('path');

// 使用Canvas API生成图标（需要canvas包，但这里我们用简单的方法）
function generateIconSVG(size) {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" ry="${size * 0.2}" fill="url(#bg-gradient)"/>
  <text x="${size/2}" y="${size/2 + size * 0.1}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" fill="white">W</text>
</svg>`;
    return svg;
}

// 创建icons目录
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// 需要生成的尺寸
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// 生成SVG图标
sizes.forEach(size => {
    const svg = generateIconSVG(size);
    const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
    fs.writeFileSync(filename, svg);
    window.logger?.log(`生成 ${filename}`);
});

// 生成favicon.ico的SVG版本
const faviconSvg = generateIconSVG(32);
fs.writeFileSync(path.join(__dirname, 'favicon.svg'), faviconSvg);
window.logger?.log('生成 favicon.svg');

// 创建快捷方式图标
const shortcutIcons = [
    { name: 'shortcut-converter.svg', letter: 'C', color1: '#3b82f6', color2: '#1d4ed8' },
    { name: 'shortcut-colors.svg', letter: '🎨', color1: '#8b5cf6', color2: '#7c3aed' },
    { name: 'shortcut-blog.svg', letter: 'B', color1: '#ef4444', color2: '#dc2626' }
];

shortcutIcons.forEach(icon => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient-${icon.name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${icon.color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${icon.color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="19" ry="19" fill="url(#bg-gradient-${icon.name})"/>
  <text x="48" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white">${icon.letter}</text>
</svg>`;
    
    const filename = path.join(iconsDir, icon.name);
    fs.writeFileSync(filename, svg);
    window.logger?.log(`生成 ${filename}`);
});

window.logger?.log('\n✅ 所有图标生成完成！');
window.logger?.log('\n📝 注意: 生成的是SVG格式图标。对于PWA最佳兼容性，建议将SVG转换为PNG格式。');
window.logger?.log('可以使用在线工具或imagemagick转换：');
window.logger?.log('例如：convert icon-192x192.svg icon-192x192.png');