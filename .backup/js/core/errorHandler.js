/**
 * 错误处理模块
 * 统一管理所有错误类型和错误处理逻辑
 */

import { ERROR_CODES, NOTIFICATION_TYPES } from '../config.js';

// 自定义错误类
export class WplaceError extends Error {
    constructor(message, code, context = {}, suggestions = []) {
        super(message);
        this.name = 'WplaceError';
        this.code = code;
        this.context = context;
        this.suggestions = suggestions;
        this.timestamp = new Date().toISOString();
    }
}

// 图像处理错误
export class ImageProcessingError extends WplaceError {
    constructor(message, code, imageInfo = {}, suggestions = []) {
        super(message, code, { type: 'image_processing', ...imageInfo }, suggestions);
        this.name = 'ImageProcessingError';
    }
}

// 文件上传错误
export class FileUploadError extends WplaceError {
    constructor(message, code, fileInfo = {}, suggestions = []) {
        super(message, code, { type: 'file_upload', ...fileInfo }, suggestions);
        this.name = 'FileUploadError';
    }
}

// 内存错误
export class MemoryError extends WplaceError {
    constructor(message, memoryInfo = {}, suggestions = []) {
        super(message, ERROR_CODES.MEMORY_ERROR, { type: 'memory', ...memoryInfo }, suggestions);
        this.name = 'MemoryError';
    }
}

// Worker错误
export class WorkerError extends WplaceError {
    constructor(message, workerInfo = {}, suggestions = []) {
        super(message, ERROR_CODES.WORKER_ERROR, { type: 'worker', ...workerInfo }, suggestions);
        this.name = 'WorkerError';
    }
}

// 用户友好的错误消息映射
export const USER_FRIENDLY_MESSAGES = {
    [ERROR_CODES.INVALID_FILE_FORMAT]: {
        zh: '文件格式不支持。请上传 PNG 或 JPG 格式的图片。',
        en: 'Unsupported file format. Please upload PNG or JPG images.'
    },
    [ERROR_CODES.FILE_TOO_LARGE]: {
        zh: '文件太大。请上传小于 4MB 的图片。',
        en: 'File too large. Please upload images smaller than 4MB.'
    },
    [ERROR_CODES.FILE_CORRUPTED]: {
        zh: '文件已损坏。请尝试其他图片。',
        en: 'File is corrupted. Please try another image.'
    },
    [ERROR_CODES.MEMORY_ERROR]: {
        zh: '内存不足。请尝试较小的图片或降低像素精度。',
        en: 'Not enough memory. Try a smaller image or lower pixel precision.'
    },
    [ERROR_CODES.PROCESSING_TIMEOUT]: {
        zh: '处理超时。请尝试较小的图片。',
        en: 'Processing timeout. Please try a smaller image.'
    },
    [ERROR_CODES.WORKER_ERROR]: {
        zh: '处理失败，正在使用备用方法。',
        en: 'Processing failed, using fallback method.'
    },
    [ERROR_CODES.INVALID_IMAGE_DATA]: {
        zh: '图像数据无效。请重新上传图片。',
        en: 'Invalid image data. Please re-upload the image.'
    },
    [ERROR_CODES.IMAGE_TOO_SMALL]: {
        zh: '图片太小，无法处理。请上传更大的图片。',
        en: 'Image too small to process. Please upload a larger image.'
    },
    [ERROR_CODES.IMAGE_LOAD_FAILED]: {
        zh: '图片加载失败。请检查文件格式和完整性。',
        en: 'Image loading failed. Please check file format and integrity.'
    },
    [ERROR_CODES.NETWORK_ERROR]: {
        zh: '网络连接问题。请检查网络连接后重试。',
        en: 'Network connection issue. Please check your connection and retry.'
    },
    [ERROR_CODES.RESOURCE_NOT_FOUND]: {
        zh: '资源未找到。请刷新页面重试。',
        en: 'Resource not found. Please refresh the page and retry.'
    }
};

// 错误建议映射
export const ERROR_SUGGESTIONS = {
    [ERROR_CODES.INVALID_FILE_FORMAT]: {
        zh: [
            '确保文件扩展名为 .png、.jpg 或 .jpeg',
            '尝试使用图片编辑软件重新保存为 PNG 格式',
            '检查文件是否确实是图片文件'
        ],
        en: [
            'Ensure file extension is .png, .jpg, or .jpeg',
            'Try re-saving as PNG format using image editing software',
            'Check if the file is actually an image file'
        ]
    },
    [ERROR_CODES.FILE_TOO_LARGE]: {
        zh: [
            '使用图片压缩工具减小文件大小',
            '降低图片分辨率',
            '选择较小尺寸的图片'
        ],
        en: [
            'Use image compression tools to reduce file size',
            'Reduce image resolution',
            'Choose a smaller sized image'
        ]
    },
    [ERROR_CODES.MEMORY_ERROR]: {
        zh: [
            '选择分辨率更低的图片',
            '增大像素尺寸设置',
            '关闭其他浏览器标签页释放内存'
        ],
        en: [
            'Choose a lower resolution image',
            'Increase pixel size setting',
            'Close other browser tabs to free memory'
        ]
    },
    [ERROR_CODES.PROCESSING_TIMEOUT]: {
        zh: [
            '尝试更小的图片',
            '增大像素尺寸',
            '重新上传图片'
        ],
        en: [
            'Try a smaller image',
            'Increase pixel size',
            'Re-upload the image'
        ]
    }
};

// 错误处理器类
export class ErrorHandler {
    constructor(language = 'zh') {
        this.language = language;
        this.errorHistory = [];
        this.maxHistorySize = 50;
    }

    // 设置语言
    setLanguage(language) {
        this.language = language;
    }

    // 处理错误
    handleError(error, context = {}) {
        // 记录错误历史
        this.logError(error, context);

        // 获取用户友好的错误消息
        const userMessage = this.getUserFriendlyMessage(error);
        
        // 获取建议
        const suggestions = this.getSuggestions(error);

        // 确定通知类型
        const notificationType = this.getNotificationType(error);

        return {
            message: userMessage,
            suggestions: suggestions,
            type: notificationType,
            error: error,
            context: context
        };
    }

    // 记录错误
    logError(error, context) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                code: error.code,
                stack: error.stack
            },
            context: context
        };

        this.errorHistory.push(errorEntry);

        // 保持历史记录大小
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }

        // 控制台日志
        console.error('Wplace Error:', errorEntry);
    }

    // 获取用户友好消息
    getUserFriendlyMessage(error) {
        if (error.code && USER_FRIENDLY_MESSAGES[error.code]) {
            return USER_FRIENDLY_MESSAGES[error.code][this.language] || 
                   USER_FRIENDLY_MESSAGES[error.code]['zh'];
        }
        
        // 回退到原始错误消息
        return error.message || '发生了未知错误';
    }

    // 获取错误建议
    getSuggestions(error) {
        if (error.suggestions && error.suggestions.length > 0) {
            return error.suggestions;
        }

        if (error.code && ERROR_SUGGESTIONS[error.code]) {
            return ERROR_SUGGESTIONS[error.code][this.language] || 
                   ERROR_SUGGESTIONS[error.code]['zh'] || [];
        }

        return [];
    }

    // 确定通知类型
    getNotificationType(error) {
        if (error.code === ERROR_CODES.WORKER_ERROR || 
            error.code === ERROR_CODES.PROCESSING_TIMEOUT) {
            return NOTIFICATION_TYPES.WARNING;
        }

        if (error.code === ERROR_CODES.MEMORY_ERROR) {
            return NOTIFICATION_TYPES.WARNING;
        }

        return NOTIFICATION_TYPES.ERROR;
    }

    // 获取错误历史
    getErrorHistory() {
        return this.errorHistory;
    }

    // 清除错误历史
    clearErrorHistory() {
        this.errorHistory = [];
    }

    // 检查是否为可恢复错误
    isRecoverableError(error) {
        const recoverableCodes = [
            ERROR_CODES.WORKER_ERROR,
            ERROR_CODES.PROCESSING_TIMEOUT,
            ERROR_CODES.MEMORY_ERROR
        ];

        return recoverableCodes.includes(error.code);
    }

    // 获取恢复建议
    getRecoveryActions(error) {
        const recoveryActions = {
            [ERROR_CODES.WORKER_ERROR]: () => ({
                action: 'fallback_to_main_thread',
                message: this.language === 'zh' ? '切换到主线程处理' : 'Switch to main thread processing'
            }),
            [ERROR_CODES.MEMORY_ERROR]: () => ({
                action: 'reduce_quality',
                message: this.language === 'zh' ? '降低处理质量' : 'Reduce processing quality'
            }),
            [ERROR_CODES.PROCESSING_TIMEOUT]: () => ({
                action: 'retry_with_chunks',
                message: this.language === 'zh' ? '分块重试处理' : 'Retry with chunked processing'
            })
        };

        return recoveryActions[error.code] ? recoveryActions[error.code]() : null;
    }
}

// 全局错误处理器实例
export const globalErrorHandler = new ErrorHandler();

// 便捷函数：创建特定类型的错误
export function createFileUploadError(message, fileInfo = {}) {
    return new FileUploadError(
        message,
        ERROR_CODES.INVALID_FILE_FORMAT,
        fileInfo,
        ERROR_SUGGESTIONS[ERROR_CODES.INVALID_FILE_FORMAT]['zh']
    );
}

export function createMemoryError(memoryInfo = {}) {
    return new MemoryError(
        '内存不足，无法处理当前图像',
        memoryInfo,
        ERROR_SUGGESTIONS[ERROR_CODES.MEMORY_ERROR]['zh']
    );
}

export function createProcessingTimeoutError(processingInfo = {}) {
    return new WplaceError(
        '图像处理超时',
        ERROR_CODES.PROCESSING_TIMEOUT,
        processingInfo,
        ERROR_SUGGESTIONS[ERROR_CODES.PROCESSING_TIMEOUT]['zh']
    );
}

// 错误验证函数
export function validateImageData(imageData) {
    if (!imageData) {
        throw new ImageProcessingError(
            '图像数据为空',
            ERROR_CODES.INVALID_IMAGE_DATA,
            { imageData: null }
        );
    }

    if (!imageData.data || !imageData.width || !imageData.height) {
        throw new ImageProcessingError(
            '图像数据不完整',
            ERROR_CODES.INVALID_IMAGE_DATA,
            { 
                hasData: !!imageData.data,
                width: imageData.width,
                height: imageData.height
            }
        );
    }

    if (imageData.width < 1 || imageData.height < 1) {
        throw new ImageProcessingError(
            '图像尺寸过小',
            ERROR_CODES.IMAGE_TOO_SMALL,
            {
                width: imageData.width,
                height: imageData.height
            }
        );
    }

    return true;
}

export function validateFile(file) {
    if (!file) {
        throw new FileUploadError(
            '未选择文件',
            ERROR_CODES.INVALID_FILE_FORMAT
        );
    }

    // 简单的文件验证
    const isValidType = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
    const isValidSize = file.size <= 4 * 1024 * 1024; // 4MB
    
    if (!isValidType) {
        throw new FileUploadError(
            `不支持的文件类型: ${file.type}`,
            ERROR_CODES.INVALID_FILE_FORMAT,
            { 
                fileType: file.type,
                fileName: file.name,
                supportedFormats: ['image/png', 'image/jpeg', 'image/jpg']
            }
        );
    }

    if (!isValidSize) {
        throw new FileUploadError(
            `文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
            ERROR_CODES.FILE_TOO_LARGE,
            {
                fileSize: file.size,
                fileName: file.name,
                maxSize: 4 * 1024 * 1024
            }
        );
    }

    return true;
}