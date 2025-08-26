/**
 * 颜色处理工具模块
 * 包含颜色转换、距离计算、调色板管理等功能
 */

import { CONFIG } from '../config.js';

// 颜色距离计算缓存
const colorDistanceCache = new Map();

// Wplace官方64色调色板
export const WPLACE_PALETTE = [
    // 免费颜色 (32色)
    { name: '黑色', color: '#000000', isPremium: false, category: 'grayscale' },
    { name: '深灰', color: '#3c3c3c', isPremium: false, category: 'grayscale' },
    { name: '灰色', color: '#787878', isPremium: false, category: 'grayscale' },
    { name: '浅灰', color: '#d2d2d2', isPremium: false, category: 'grayscale' },
    { name: '白色', color: '#ffffff', isPremium: false, category: 'grayscale' },
    
    { name: '深红', color: '#600018', isPremium: false, category: 'reds' },
    { name: '红色', color: '#ed1c24', isPremium: false, category: 'reds' },
    { name: '橙色', color: '#ff7f27', isPremium: false, category: 'oranges' },
    { name: '金色', color: '#f6aa09', isPremium: false, category: 'yellows' },
    { name: '黄色', color: '#f9dd3b', isPremium: false, category: 'yellows' },
    { name: '浅黄', color: '#fffabc', isPremium: false, category: 'yellows' },
    
    { name: '深绿', color: '#0eb968', isPremium: false, category: 'greens' },
    { name: '绿色', color: '#13e67b', isPremium: false, category: 'greens' },
    { name: '浅绿', color: '#87ff5e', isPremium: false, category: 'greens' },
    
    { name: '深青', color: '#0c816e', isPremium: false, category: 'cyans' },
    { name: '青色', color: '#10aea6', isPremium: false, category: 'cyans' },
    { name: '浅青', color: '#13e1be', isPremium: false, category: 'cyans' },
    
    { name: '深蓝', color: '#28509e', isPremium: false, category: 'blues' },
    { name: '蓝色', color: '#4093e4', isPremium: false, category: 'blues' },
    { name: '青蓝', color: '#60f7f2', isPremium: false, category: 'blues' },
    
    { name: '靛蓝', color: '#6b50f6', isPremium: false, category: 'purples' },
    { name: '浅靛', color: '#99b1fb', isPremium: false, category: 'purples' },
    { name: '深紫', color: '#780c99', isPremium: false, category: 'purples' },
    { name: '紫色', color: '#aa38b9', isPremium: false, category: 'purples' },
    { name: '浅紫', color: '#e09ff9', isPremium: false, category: 'purples' },
    
    { name: '深粉', color: '#cb007a', isPremium: false, category: 'pinks' },
    { name: '粉色', color: '#ec1f80', isPremium: false, category: 'pinks' },
    { name: '浅粉', color: '#f38da9', isPremium: false, category: 'pinks' },
    
    { name: '深棕', color: '#684634', isPremium: false, category: 'browns' },
    { name: '棕色', color: '#95682a', isPremium: false, category: 'browns' },
    { name: '米色', color: '#f8b277', isPremium: false, category: 'browns' },
    
    // 付费颜色 (32色)
    { name: '中灰', color: '#aaaaaa', isPremium: true, category: 'grayscale' },
    { name: '暗红', color: '#a50e1e', isPremium: true, category: 'reds' },
    { name: '浅红', color: '#fa8072', isPremium: true, category: 'reds' },
    { name: '深橙', color: '#e45c1a', isPremium: true, category: 'oranges' },
    { name: '浅黄褐', color: '#d6b594', isPremium: true, category: 'browns' },
    
    { name: '深金', color: '#9c8431', isPremium: true, category: 'yellows' },
    { name: '金黄', color: '#c5ad31', isPremium: true, category: 'yellows' },
    { name: '浅金', color: '#e8d45f', isPremium: true, category: 'yellows' },
    
    { name: '深橄榄', color: '#4a6b3a', isPremium: true, category: 'greens' },
    { name: '橄榄', color: '#5a944a', isPremium: true, category: 'greens' },
    { name: '浅橄榄', color: '#84c573', isPremium: true, category: 'greens' },
    
    { name: '深蓝绿', color: '#0f799f', isPremium: true, category: 'cyans' },
    { name: '浅蓝绿', color: '#bbfaf2', isPremium: true, category: 'cyans' },
    { name: '浅天蓝', color: '#7dc7ff', isPremium: true, category: 'blues' },
    
    { name: '深靛青', color: '#4d31b8', isPremium: true, category: 'purples' },
    { name: '深石板蓝', color: '#4a4284', isPremium: true, category: 'purples' },
    { name: '石板蓝', color: '#7a71c4', isPremium: true, category: 'purples' },
    { name: '浅石板蓝', color: '#b5aef1', isPremium: true, category: 'purples' },
    
    { name: '浅棕', color: '#dba463', isPremium: true, category: 'browns' },
    { name: '深米', color: '#d18051', isPremium: true, category: 'browns' },
    { name: '浅米', color: '#ffc5a5', isPremium: true, category: 'browns' },
    
    { name: '深桃', color: '#9b5249', isPremium: true, category: 'pinks' },
    { name: '桃色', color: '#d18078', isPremium: true, category: 'pinks' },
    { name: '浅桃', color: '#fab6a4', isPremium: true, category: 'pinks' },
    
    { name: '深茶', color: '#7b6352', isPremium: true, category: 'browns' },
    { name: '茶色', color: '#9c846b', isPremium: true, category: 'browns' },
    
    { name: '深石板', color: '#333941', isPremium: true, category: 'grayscale' },
    { name: '石板', color: '#6d758d', isPremium: true, category: 'grayscale' },
    { name: '浅石板', color: '#b3b9d1', isPremium: true, category: 'grayscale' },
    
    { name: '深石', color: '#6d643f', isPremium: true, category: 'browns' },
    { name: '石色', color: '#948c6b', isPremium: true, category: 'browns' },
    { name: '浅石', color: '#cdc59e', isPremium: true, category: 'browns' },
    
    // 透明色
    { name: '透明', color: 'transparent', isTransparent: true, isPremium: false, category: 'special' }
];

// RGB颜色缓存
let paletteRGBCache = null;

/**
 * 十六进制颜色转RGB
 */
export function hexToRgb(hex) {
    if (!hex || hex === 'transparent') return null;
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * RGB颜色转十六进制
 */
export function rgbToHex(r, g, b) {
    const componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * 计算两个颜色之间的距离（感知加权欧几里得距离）
 */
export function calculateColorDistance(color1, color2, useCache = true) {
    if (useCache) {
        const key = `${color1.r},${color1.g},${color1.b}-${color2.r},${color2.g},${color2.b}`;
        
        if (colorDistanceCache.has(key)) {
            return colorDistanceCache.get(key);
        }
        
        const distance = Math.sqrt(
            Math.pow(color1.r - color2.r, 2) * 2 +
            Math.pow(color1.g - color2.g, 2) * 4 +
            Math.pow(color1.b - color2.b, 2) * 3
        );
        
        // 限制缓存大小
        if (colorDistanceCache.size >= CONFIG.COLOR_CACHE_MAX_SIZE) {
            const firstKey = colorDistanceCache.keys().next().value;
            colorDistanceCache.delete(firstKey);
        }
        
        colorDistanceCache.set(key, distance);
        return distance;
    }
    
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) * 2 +
        Math.pow(color1.g - color2.g, 2) * 4 +
        Math.pow(color1.b - color2.b, 2) * 3
    );
}

/**
 * 获取Wplace调色板
 */
export function getWplacePalette() {
    return WPLACE_PALETTE;
}

/**
 * 获取免费颜色
 */
export function getFreeColors() {
    return WPLACE_PALETTE.filter(color => !color.isPremium && !color.isTransparent);
}

/**
 * 获取付费颜色
 */
export function getPremiumColors() {
    return WPLACE_PALETTE.filter(color => color.isPremium);
}

/**
 * 根据分类获取颜色
 */
export function getColorsByCategory(category) {
    return WPLACE_PALETTE.filter(color => color.category === category);
}

/**
 * 初始化调色板RGB缓存
 */
export function initializePaletteRGBCache() {
    if (paletteRGBCache) return paletteRGBCache;
    
    paletteRGBCache = WPLACE_PALETTE.map(color => ({
        ...color,
        rgb: color.isTransparent ? null : hexToRgb(color.color)
    }));
    
    return paletteRGBCache;
}

/**
 * 寻找最接近的调色板颜色
 */
export function findNearestPaletteColor(targetColor, customPalette = null) {
    const palette = customPalette || initializePaletteRGBCache();
    let minDistance = Infinity;
    let nearestColor = palette[0]; // 默认黑色
    
    for (const paletteColor of palette) {
        if (paletteColor.isTransparent || !paletteColor.rgb) continue;
        
        const distance = calculateColorDistance(targetColor, paletteColor.rgb);
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestColor = paletteColor;
        }
    }
    
    return nearestColor;
}

/**
 * 从图像区域获取平均颜色
 */
export function getAverageColorFromRegion(imageData, startX, startY, width, height) {
    const data = imageData.data;
    const imageWidth = imageData.width;
    let r = 0, g = 0, b = 0, count = 0;
    
    const endX = Math.min(startX + width, imageData.width);
    const endY = Math.min(startY + height, imageData.height);
    
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const index = (y * imageWidth + x) * 4;
            const alpha = data[index + 3];
            
            // 只计算不完全透明的像素
            if (alpha > 0) {
                r += data[index];
                g += data[index + 1];
                b += data[index + 2];
                count++;
            }
        }
    }
    
    if (count === 0) {
        return { r: 0, g: 0, b: 0 }; // 完全透明区域返回黑色
    }
    
    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

/**
 * 带采样的区域平均颜色获取（用于性能优化）
 */
export function getAverageColorFromRegionWithSampling(imageData, startX, startY, width, height, samplingStep = 1) {
    const data = imageData.data;
    const imageWidth = imageData.width;
    let r = 0, g = 0, b = 0, count = 0;
    
    const endX = Math.min(startX + width, imageData.width);
    const endY = Math.min(startY + height, imageData.height);
    
    for (let y = startY; y < endY; y += samplingStep) {
        for (let x = startX; x < endX; x += samplingStep) {
            const index = (y * imageWidth + x) * 4;
            const alpha = data[index + 3];
            
            if (alpha > 0) {
                r += data[index];
                g += data[index + 1];
                b += data[index + 2];
                count++;
            }
        }
    }
    
    if (count === 0) {
        return { r: 0, g: 0, b: 0 };
    }
    
    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

/**
 * 颜色亮度计算（用于对比度检测）
 */
export function getColorBrightness(color) {
    // 使用标准亮度公式
    return (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
}

/**
 * 判断是否为深色
 */
export function isDarkColor(color, threshold = 128) {
    return getColorBrightness(color) < threshold;
}

/**
 * 获取对比色（黑或白）
 */
export function getContrastColor(color) {
    return isDarkColor(color) ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
}

/**
 * 清除颜色距离缓存
 */
export function clearColorCache() {
    colorDistanceCache.clear();
    paletteRGBCache = null;
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
    return {
        colorDistanceCacheSize: colorDistanceCache.size,
        paletteRGBCacheInitialized: !!paletteRGBCache
    };
}

/**
 * 颜色格式验证
 */
export function isValidHexColor(hex) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * RGB值验证
 */
export function isValidRGBColor(r, g, b) {
    return [r, g, b].every(value => 
        Number.isInteger(value) && value >= 0 && value <= 255
    );
}

/**
 * 颜色饱和度计算
 */
export function getColorSaturation(color) {
    const max = Math.max(color.r, color.g, color.b);
    const min = Math.min(color.r, color.g, color.b);
    
    if (max === 0) return 0;
    
    return (max - min) / max;
}

/**
 * 按颜色相似度排序调色板
 */
export function sortPaletteByDistance(targetColor, palette = null) {
    const paletteToSort = palette || initializePaletteRGBCache();
    
    return paletteToSort
        .filter(color => !color.isTransparent && color.rgb)
        .map(color => ({
            ...color,
            distance: calculateColorDistance(targetColor, color.rgb)
        }))
        .sort((a, b) => a.distance - b.distance);
}

/**
 * 获取调色板统计信息
 */
export function getPaletteStats() {
    const freeColors = getFreeColors();
    const premiumColors = getPremiumColors();
    
    const categoriesStats = {};
    WPLACE_PALETTE.forEach(color => {
        if (!color.isTransparent) {
            if (!categoriesStats[color.category]) {
                categoriesStats[color.category] = { free: 0, premium: 0 };
            }
            if (color.isPremium) {
                categoriesStats[color.category].premium++;
            } else {
                categoriesStats[color.category].free++;
            }
        }
    });
    
    return {
        total: WPLACE_PALETTE.length - 1, // 排除透明色
        free: freeColors.length,
        premium: premiumColors.length,
        categories: categoriesStats
    };
}