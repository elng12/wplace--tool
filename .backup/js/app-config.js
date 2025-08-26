/**
 * Wplace Pixel Art Converter - 统一配置文件
 * 集中管理所有应用配置、常量和工具函数
 */

// 应用配置
export const CONFIG = {
    // 文件上传设置
    MAX_FILE_SIZE: 4 * 1024 * 1024, // 4MB
    SUPPORTED_FORMATS: ['image/png', 'image/jpeg', 'image/jpg'],
    
    // 像素化设置
    DEFAULT_PIXEL_SIZE: 8,
    MIN_PIXEL_SIZE: 1,
    MAX_PIXEL_SIZE: 32,
    
    // 性能设置
    DEBOUNCE_DELAY: 200, // 滑块防抖延迟
    NOTIFICATION_TIMEOUT: 3000,
    BATCH_DELAY: 100,
    WORKER_THRESHOLD: 1000000, // 超过100万像素时使用Worker
    CHUNK_SIZE: 1000, // 分块处理的大小
    
    // UI设置
    TOAST_POSITION: 'top-center',
    PROGRESS_ANIMATION_DURATION: 300,
    PREVIEW_MAX_SIZE: 150, // 预览图最大尺寸

    // 性能监控阈值
    PERFORMANCE_THRESHOLDS: {
        SLOW: 5000,    // 5秒
        VERY_SLOW: 10000 // 10秒
    },
    
    // 缓存设置
    COLOR_CACHE_MAX_SIZE: 1000, // 颜色距离缓存最大数量
    
    // 验证设置
    MIN_IMAGE_SIZE: 1, // 最小图像尺寸
    MAX_IMAGE_DIMENSION: 32767, // 最大图像尺寸（canvas限制）
    
    // 错误恢复设置
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    
    // 调色板设置
    PALETTE_COLORS_COUNT: 64,
    FREE_COLORS_COUNT: 32,
    PREMIUM_COLORS_COUNT: 32,
    
    // 工作线程设置
    WORKER_TIMEOUT: 30000, // 30秒超时
    WORKER_INIT_TIMEOUT: 10000 // 10秒初始化超时
};

// Wplace 64色调色板 (官方颜色)
export const WPLACE_PALETTE = [
    // 免费颜色 (0-31)
    '#FFFFFF', '#E4E4E4', '#888888', '#222222', '#FFA7D1', '#E50000',
    '#E59500', '#A06A42', '#E5D900', '#94E044', '#02BE01', '#00D3DD',
    '#0083C7', '#0000EA', '#CF6EE4', '#820080', '#000000', '#434343',
    '#6D001A', '#BF4F36', '#FF6A00', '#FFD635', '#FFF8B8', '#006A4E',
    '#8BBE6A', '#C2FFAE', '#94B3FF', '#76428A', '#AC3232', '#D0743C',
    '#FF8717', '#FFAAA5',
    
    // 付费颜色 (32-63) 
    '#FFE135', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#CCFF90',
    '#00A368', '#00CCC0', '#009EAA', '#51E9F4', '#3690EA', '#6A5CFF',
    '#B44AC0', '#FF3881', '#FF99AA', '#FFAEB9', '#FF5650', '#FF9A00',
    '#D2B48C', '#FFFA00', '#CDEB8B', '#6EFF00', '#B4E6E0', '#00BFFF',
    '#4690E7', '#B19CD9', '#FF007F', '#FFCC99', '#FFA500', '#E5C29F',
    '#FFFF7F', '#CDEB8B'
];

// 错误类型
export const ERROR_TYPES = {
    FILE_INVALID: 'FILE_INVALID',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    PROCESSING_FAILED: 'PROCESSING_FAILED',
    NETWORK_ERROR: 'NETWORK_ERROR'
};

// 通知类型
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error', 
    WARNING: 'warning',
    INFO: 'info'
};

// 性能级别定义
export const PERFORMANCE_LEVELS = {
    ULTRA_HIGH: 'ultra-high',
    HIGH: 'high', 
    MEDIUM: 'medium',
    NORMAL: 'normal',
    FAST: 'fast'
};

// 错误代码定义
export const ERROR_CODES = {
    // 文件相关错误
    INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    FILE_CORRUPTED: 'FILE_CORRUPTED',
    
    // 处理相关错误
    MEMORY_ERROR: 'MEMORY_ERROR',
    PROCESSING_TIMEOUT: 'PROCESSING_TIMEOUT',
    WORKER_ERROR: 'WORKER_ERROR',
    
    // 图像相关错误
    INVALID_IMAGE_DATA: 'INVALID_IMAGE_DATA',
    IMAGE_TOO_SMALL: 'IMAGE_TOO_SMALL',
    IMAGE_LOAD_FAILED: 'IMAGE_LOAD_FAILED',
    
    // 网络相关错误
    NETWORK_ERROR: 'NETWORK_ERROR',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND'
};

// 通知类型定义
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// 缩放方法定义
export const SCALING_METHODS = {
    NEAREST: 'nearest',
    BILINEAR: 'bilinear', 
    LANCZOS: 'lanczos'
};

// 下载格式定义
export const DOWNLOAD_FORMATS = {
    PNG: 'png',
    JPEG: 'jpeg'
};


// 工具函数
export class Utils {
    // DOM选择器简化
    static $(id) {
        return document.getElementById(id);
    }
    
    // 安全的元素显示/隐藏
    static showElement(id) {
        const el = this.$(id);
        if (el) el.classList.remove('hidden');
    }
    
    static hideElement(id) {
        const el = this.$(id);
        if (el) el.classList.add('hidden');
    }
    
    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 文件验证
    static validateFile(file) {
        const errors = [];
        
        if (!file) {
            errors.push('没有选择文件');
            return { valid: false, errors };
        }
        
        if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
            errors.push('不支持的文件格式，请使用 PNG 或 JPG');
        }
        
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            errors.push(`文件过大，最大支持 ${(CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB`);
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    // 颜色距离计算 (优化版)
    static getClosestColor(r, g, b) {
        let minDistance = Infinity;
        let closestColor = WPLACE_PALETTE[0];
        
        for (const color of WPLACE_PALETTE) {
            const hex = color.slice(1);
            const pr = parseInt(hex.slice(0, 2), 16);
            const pg = parseInt(hex.slice(2, 4), 16);
            const pb = parseInt(hex.slice(4, 6), 16);
            
            // 使用加权欧氏距离，考虑人眼对不同颜色的敏感度
            const distance = Math.sqrt(
                2 * Math.pow(r - pr, 2) + 
                4 * Math.pow(g - pg, 2) + 
                3 * Math.pow(b - pb, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = color;
            }
        }
        
        return closestColor;
    }
    
    // 安全的DOM内容设置 (防止XSS)
    static setTextContent(elementId, text) {
        const element = this.$(elementId);
        if (element) {
            element.textContent = String(text);
        }
    }
    
    // 格式化文件大小
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 生成唯一ID
    static generateId() {
        return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    }
}

// 错误处理类
export class ErrorHandler {
    static handle(error, context = '') {
        console.error(`[${context}] 错误:`, error);
        
        // 根据错误类型返回用户友好的消息
        if (error.name === 'QuotaExceededError') {
            return '存储空间不足，请清理浏览器缓存后重试';
        }
        
        if (error.message?.includes('Network')) {
            return '网络连接问题，请检查网络后重试';
        }
        
        if (error.message?.includes('Memory')) {
            return '内存不足，请尝试处理更小的图片';
        }
        
        return error.message || '处理过程中发生未知错误';
    }
}

// 性能监控类
export class PerformanceMonitor {
    static measurements = new Map();
    
    static start(name) {
        this.measurements.set(name, {
            start: performance.now(),
            end: null,
            duration: null
        });
    }
    
    static end(name) {
        const measurement = this.measurements.get(name);
        if (measurement) {
            measurement.end = performance.now();
            measurement.duration = measurement.end - measurement.start;
            console.log(`⚡ [${name}] 耗时: ${measurement.duration.toFixed(2)}ms`);
            return measurement.duration;
        }
        return 0;
    }
    
    static getAll() {
        const results = {};
        for (const [name, data] of this.measurements) {
            if (data.duration !== null) {
                results[name] = data.duration;
            }
        }
        return results;
    }
}

// 获取基于像素尺寸的性能设置
export function getPerformanceSettings(pixelSize) {
    if (pixelSize <= 2) {
        return {
            level: PERFORMANCE_LEVELS.ULTRA_HIGH,
            debounceDelay: 500,
            previewDelay: 250,
            useWorker: true,
            enableDithering: false // 对于超高精度模式禁用抖动以提高性能
        };
    } else if (pixelSize <= 4) {
        return {
            level: PERFORMANCE_LEVELS.HIGH,
            debounceDelay: 300,
            previewDelay: 150,
            useWorker: true,
            enableDithering: true
        };
    } else if (pixelSize <= 8) {
        return {
            level: PERFORMANCE_LEVELS.MEDIUM,
            debounceDelay: 200,
            previewDelay: 100,
            useWorker: false,
            enableDithering: true
        };
    } else {
        return {
            level: PERFORMANCE_LEVELS.NORMAL,
            debounceDelay: 100,
            previewDelay: 50,
            useWorker: false,
            enableDithering: true
        };
    }
}

// 根据图像大小决定是否使用Worker
export function shouldUseWorker(imageData, pixelSize) {
    const imageSize = imageData.width * imageData.height;
    const totalPixels = Math.floor(imageData.width / pixelSize) * Math.floor(imageData.height / pixelSize);
    
    return imageSize > CONFIG.WORKER_THRESHOLD || 
           totalPixels > 50000 || 
           pixelSize <= 2;
}

// 验证文件是否符合要求
export function validateFileConfig(file) {
    return {
        validSize: file.size <= CONFIG.MAX_FILE_SIZE,
        validType: CONFIG.SUPPORTED_FORMATS.includes(file.type),
        maxSize: CONFIG.MAX_FILE_SIZE,
        supportedFormats: CONFIG.SUPPORTED_FORMATS
    };
}

// 验证图像尺寸是否在合理范围内
export function validateImageDimensions(width, height) {
    return {
        valid: width >= CONFIG.MIN_IMAGE_SIZE && 
               height >= CONFIG.MIN_IMAGE_SIZE &&
               width <= CONFIG.MAX_IMAGE_DIMENSION &&
               height <= CONFIG.MAX_IMAGE_DIMENSION,
        minSize: CONFIG.MIN_IMAGE_SIZE,
        maxDimension: CONFIG.MAX_IMAGE_DIMENSION
    };
}
