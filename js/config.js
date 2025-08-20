/**
 * 配置管理模块
 * 集中管理应用程序的所有配置和设置
 */

export const CONFIG = {
    // 文件上传设置
    MAX_FILE_SIZE: 4 * 1024 * 1024, // 4MB
    SUPPORTED_FORMATS: ['image/png', 'image/jpeg', 'image/jpg'],
    
    // 像素化设置
    DEFAULT_PIXEL_SIZE: 8,
    MIN_PIXEL_SIZE: 1,
    MAX_PIXEL_SIZE: 32,
    
    // 性能设置
    WORKER_THRESHOLD: 1000000, // 超过100万像素时使用Worker
    CHUNK_SIZE: 1000, // 分块处理的大小
    
    // UI设置
    PREVIEW_MAX_SIZE: 150, // 预览图最大尺寸
    DEBOUNCE_DELAY: 200, // 滑块防抖延迟
    NOTIFICATION_TIMEOUT: 3000, // 通知显示时间
    
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