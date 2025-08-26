/**
 * 验证工具模块
 * 包含各种数据验证和格式检查功能
 */

import { CONFIG, ERROR_CODES } from '../config.js';
import { FileUploadError, ImageProcessingError } from '../core/errorHandler.js';

/**
 * 文件类型验证器
 */
export class FileValidator {
    /**
     * 验证文件类型
     */
    static validateFileType(file) {
        if (!file) {
            throw new FileUploadError('未选择文件', ERROR_CODES.INVALID_FILE_FORMAT);
        }

        // MIME类型检查
        if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
            throw new FileUploadError(
                `不支持的文件类型: ${file.type}`, 
                ERROR_CODES.INVALID_FILE_FORMAT,
                { 
                    fileType: file.type, 
                    fileName: file.name,
                    supportedTypes: CONFIG.SUPPORTED_FORMATS
                }
            );
        }

        return true;
    }

    /**
     * 验证文件大小
     */
    static validateFileSize(file) {
        if (!file) {
            throw new FileUploadError('未选择文件', ERROR_CODES.INVALID_FILE_FORMAT);
        }

        if (file.size > CONFIG.MAX_FILE_SIZE) {
            throw new FileUploadError(
                `文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB (最大${(CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB)`,
                ERROR_CODES.FILE_TOO_LARGE,
                {
                    fileSize: file.size,
                    maxSize: CONFIG.MAX_FILE_SIZE,
                    fileName: file.name
                }
            );
        }

        if (file.size === 0) {
            throw new FileUploadError(
                '文件为空',
                ERROR_CODES.FILE_CORRUPTED,
                { fileName: file.name }
            );
        }

        return true;
    }

    /**
     * 验证文件签名（魔数检查）
     */
    static async validateFileSignature(file) {
        const buffer = await file.slice(0, 12).arrayBuffer();
        const bytes = new Uint8Array(buffer);

        // PNG签名: 89 50 4E 47 0D 0A 1A 0A
        const isPNG = bytes.length >= 8 && 
            bytes[0] === 0x89 && bytes[1] === 0x50 && 
            bytes[2] === 0x4E && bytes[3] === 0x47 &&
            bytes[4] === 0x0D && bytes[5] === 0x0A &&
            bytes[6] === 0x1A && bytes[7] === 0x0A;

        // JPEG签名: FF D8 FF
        const isJPEG = bytes.length >= 3 && 
            bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;

        if (!isPNG && !isJPEG) {
            throw new FileUploadError(
                '文件格式验证失败，可能是损坏的图像文件',
                ERROR_CODES.FILE_CORRUPTED,
                { 
                    fileName: file.name,
                    detectedSignature: Array.from(bytes.slice(0, 8)).map(b => b.toString(16)).join(' ')
                }
            );
        }

        return { isPNG, isJPEG };
    }

    /**
     * 综合文件验证
     */
    static async validateFile(file) {
        this.validateFileType(file);
        this.validateFileSize(file);
        await this.validateFileSignature(file);
        return true;
    }

    /**
     * 获取文件信息
     */
    static getFileInfo(file) {
        return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            sizeInMB: (file.size / 1024 / 1024).toFixed(2)
        };
    }
}

/**
 * 图像数据验证器
 */
export class ImageValidator {
    /**
     * 验证ImageData对象
     */
    static validateImageData(imageData) {
        if (!imageData) {
            throw new ImageProcessingError(
                '图像数据为空',
                ERROR_CODES.INVALID_IMAGE_DATA
            );
        }

        if (typeof imageData !== 'object') {
            throw new ImageProcessingError(
                '图像数据类型错误',
                ERROR_CODES.INVALID_IMAGE_DATA,
                { actualType: typeof imageData }
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

        if (!(imageData.data instanceof Uint8ClampedArray)) {
            throw new ImageProcessingError(
                '图像数据格式错误',
                ERROR_CODES.INVALID_IMAGE_DATA,
                { dataType: imageData.data?.constructor?.name }
            );
        }

        return true;
    }

    /**
     * 验证图像尺寸
     */
    static validateImageDimensions(imageData) {
        this.validateImageData(imageData);

        if (imageData.width < CONFIG.MIN_IMAGE_SIZE || imageData.height < CONFIG.MIN_IMAGE_SIZE) {
            throw new ImageProcessingError(
                `图像尺寸过小 (${imageData.width}x${imageData.height})`,
                ERROR_CODES.IMAGE_TOO_SMALL,
                {
                    width: imageData.width,
                    height: imageData.height,
                    minSize: CONFIG.MIN_IMAGE_SIZE
                }
            );
        }

        if (imageData.width > CONFIG.MAX_IMAGE_DIMENSION || imageData.height > CONFIG.MAX_IMAGE_DIMENSION) {
            throw new ImageProcessingError(
                `图像尺寸过大 (${imageData.width}x${imageData.height})`,
                ERROR_CODES.MEMORY_ERROR,
                {
                    width: imageData.width,
                    height: imageData.height,
                    maxDimension: CONFIG.MAX_IMAGE_DIMENSION
                }
            );
        }

        return true;
    }

    /**
     * 验证图像内存使用
     */
    static validateImageMemoryUsage(imageData, pixelSize = 1) {
        this.validateImageData(imageData);

        const imageMemory = imageData.width * imageData.height * 4; // RGBA
        const processedCols = Math.ceil(imageData.width / pixelSize);
        const processedRows = Math.ceil(imageData.height / pixelSize);
        const processedMemory = processedCols * processedRows * 100; // 预估每个像素处理开销

        // 检查是否可能导致内存问题（简单启发式检查）
        const estimatedMemoryUsage = imageMemory + processedMemory;
        const memoryLimit = 100 * 1024 * 1024; // 100MB启发式限制

        if (estimatedMemoryUsage > memoryLimit) {
            throw new ImageProcessingError(
                '图像过大，可能导致内存不足',
                ERROR_CODES.MEMORY_ERROR,
                {
                    imageSize: `${imageData.width}x${imageData.height}`,
                    estimatedMemoryMB: (estimatedMemoryUsage / 1024 / 1024).toFixed(2),
                    pixelSize: pixelSize
                }
            );
        }

        return true;
    }

    /**
     * 验证像素尺寸
     */
    static validatePixelSize(pixelSize, imageData = null) {
        if (!Number.isInteger(pixelSize)) {
            throw new ImageProcessingError(
                '像素尺寸必须是整数',
                ERROR_CODES.INVALID_IMAGE_DATA,
                { pixelSize: pixelSize }
            );
        }

        if (pixelSize < CONFIG.MIN_PIXEL_SIZE || pixelSize > CONFIG.MAX_PIXEL_SIZE) {
            throw new ImageProcessingError(
                `像素尺寸超出范围 (${CONFIG.MIN_PIXEL_SIZE}-${CONFIG.MAX_PIXEL_SIZE})`,
                ERROR_CODES.INVALID_IMAGE_DATA,
                { 
                    pixelSize: pixelSize,
                    minPixelSize: CONFIG.MIN_PIXEL_SIZE,
                    maxPixelSize: CONFIG.MAX_PIXEL_SIZE
                }
            );
        }

        // 如果提供了图像数据，验证像素尺寸的合理性
        if (imageData) {
            const cols = Math.floor(imageData.width / pixelSize);
            const rows = Math.floor(imageData.height / pixelSize);

            if (cols < 1 || rows < 1) {
                throw new ImageProcessingError(
                    `像素尺寸过大，导致图像无法处理 (${cols}x${rows} 块)`,
                    ERROR_CODES.INVALID_IMAGE_DATA,
                    {
                        pixelSize: pixelSize,
                        resultingCols: cols,
                        resultingRows: rows,
                        imageSize: `${imageData.width}x${imageData.height}`
                    }
                );
            }
        }

        return true;
    }

    /**
     * 获取图像处理性能评估
     */
    static assessProcessingComplexity(imageData, pixelSize) {
        this.validateImageData(imageData);
        this.validatePixelSize(pixelSize, imageData);

        const totalPixels = imageData.width * imageData.height;
        const processedCols = Math.floor(imageData.width / pixelSize);
        const processedRows = Math.floor(imageData.height / pixelSize);
        const processedPixels = processedCols * processedRows;

        const complexity = {
            originalPixels: totalPixels,
            processedPixels: processedPixels,
            reductionRatio: totalPixels / processedPixels,
            estimatedProcessingTime: this.estimateProcessingTime(totalPixels, pixelSize),
            memoryUsage: this.estimateMemoryUsage(imageData),
            recommendUseWorker: totalPixels > CONFIG.WORKER_THRESHOLD || pixelSize <= 2,
            performanceLevel: this.getPerformanceLevel(pixelSize)
        };

        return complexity;
    }

    /**
     * 估算处理时间（毫秒）
     */
    static estimateProcessingTime(totalPixels, pixelSize) {
        // 基于经验的估算公式
        const baseTimePerPixel = pixelSize <= 2 ? 0.01 : pixelSize <= 4 ? 0.005 : 0.002;
        const estimatedTime = totalPixels * baseTimePerPixel;

        return Math.max(100, Math.min(30000, estimatedTime)); // 100ms到30s之间
    }

    /**
     * 估算内存使用（字节）
     */
    static estimateMemoryUsage(imageData) {
        const imageMemory = imageData.width * imageData.height * 4; // 原始图像
        const canvasMemory = imageMemory * 2; // Canvas相关内存
        const processingMemory = imageMemory * 0.5; // 处理过程临时内存

        return imageMemory + canvasMemory + processingMemory;
    }

    /**
     * 获取性能级别
     */
    static getPerformanceLevel(pixelSize) {
        if (pixelSize <= 2) return 'ultra-high';
        if (pixelSize <= 4) return 'high';
        if (pixelSize <= 8) return 'medium';
        return 'normal';
    }
}

/**
 * 输入参数验证器
 */
export class ParameterValidator {
    /**
     * 验证缩放方法
     */
    static validateScalingMethod(method) {
        const validMethods = ['nearest', 'bilinear', 'lanczos'];
        if (!validMethods.includes(method)) {
            throw new Error(`无效的缩放方法: ${method}。支持的方法: ${validMethods.join(', ')}`);
        }
        return true;
    }

    /**
     * 验证颜色值
     */
    static validateColor(color) {
        if (typeof color === 'string') {
            // 十六进制颜色验证
            if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) && color !== 'transparent') {
                throw new Error(`无效的颜色格式: ${color}`);
            }
        } else if (typeof color === 'object') {
            // RGB对象验证
            if (!color.hasOwnProperty('r') || !color.hasOwnProperty('g') || !color.hasOwnProperty('b')) {
                throw new Error('RGB颜色对象必须包含r、g、b属性');
            }
            
            const { r, g, b } = color;
            if (![r, g, b].every(val => Number.isInteger(val) && val >= 0 && val <= 255)) {
                throw new Error('RGB颜色值必须是0-255之间的整数');
            }
        } else {
            throw new Error('颜色必须是十六进制字符串或RGB对象');
        }

        return true;
    }

    /**
     * 验证布尔值参数
     */
    static validateBoolean(value, paramName) {
        if (typeof value !== 'boolean') {
            throw new Error(`${paramName} 必须是布尔值`);
        }
        return true;
    }

    /**
     * 验证数值范围
     */
    static validateRange(value, min, max, paramName) {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error(`${paramName} 必须是数字`);
        }

        if (value < min || value > max) {
            throw new Error(`${paramName} 必须在 ${min}-${max} 范围内`);
        }

        return true;
    }

    /**
     * 验证对象结构
     */
    static validateObjectStructure(obj, requiredProps, objectName = '对象') {
        if (!obj || typeof obj !== 'object') {
            throw new Error(`${objectName} 必须是对象`);
        }

        for (const prop of requiredProps) {
            if (!obj.hasOwnProperty(prop)) {
                throw new Error(`${objectName} 缺少必需属性: ${prop}`);
            }
        }

        return true;
    }
}

/**
 * 性能验证器
 */
export class PerformanceValidator {
    /**
     * 检查是否应该显示性能警告
     */
    static shouldShowPerformanceWarning(imageData, pixelSize) {
        const complexity = ImageValidator.assessProcessingComplexity(imageData, pixelSize);
        
        return complexity.estimatedProcessingTime > CONFIG.PERFORMANCE_THRESHOLDS.SLOW ||
               complexity.originalPixels > CONFIG.WORKER_THRESHOLD ||
               complexity.memoryUsage > 50 * 1024 * 1024; // 50MB
    }

    /**
     * 生成性能警告消息
     */
    static getPerformanceWarning(imageData, pixelSize) {
        const complexity = ImageValidator.assessProcessingComplexity(imageData, pixelSize);
        
        let warnings = [];

        if (complexity.estimatedProcessingTime > CONFIG.PERFORMANCE_THRESHOLDS.VERY_SLOW) {
            warnings.push('处理时间可能超过10秒');
        } else if (complexity.estimatedProcessingTime > CONFIG.PERFORMANCE_THRESHOLDS.SLOW) {
            warnings.push('处理时间可能需要5-10秒');
        }

        if (complexity.memoryUsage > 100 * 1024 * 1024) {
            warnings.push('内存使用量较高，可能影响系统性能');
        }

        if (complexity.processedPixels > 100000) {
            warnings.push('像素数量很大，建议增大像素尺寸以提高性能');
        }

        return warnings;
    }

    /**
     * 检查浏览器兼容性
     */
    static checkBrowserCompatibility() {
        const issues = [];

        // 检查Web Workers支持
        if (typeof Worker === 'undefined') {
            issues.push('浏览器不支持Web Workers，性能可能受影响');
        }

        // 检查Canvas支持
        if (!document.createElement('canvas').getContext) {
            issues.push('浏览器不支持Canvas，无法处理图像');
        }

        // 检查File API支持
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            issues.push('浏览器不完全支持File API');
        }

        return issues;
    }
}

/**
 * 通用验证工具函数
 */
export const ValidationUtils = {
    /**
     * 批量验证
     */
    batchValidate(validations) {
        const errors = [];

        for (const validation of validations) {
            try {
                validation.validator(...validation.args);
            } catch (error) {
                errors.push({
                    name: validation.name,
                    error: error.message
                });
            }
        }

        if (errors.length > 0) {
            throw new Error(`验证失败: ${errors.map(e => `${e.name}: ${e.error}`).join('; ')}`);
        }

        return true;
    },

    /**
     * 安全执行验证
     */
    safeValidate(validator, ...args) {
        try {
            return { success: true, result: validator(...args) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// 导出常用的验证函数
export const validateFile = FileValidator.validateFile.bind(FileValidator);
export const validateImageData = ImageValidator.validateImageData.bind(ImageValidator);
export const validatePixelSize = ImageValidator.validatePixelSize.bind(ImageValidator);
export const assessProcessingComplexity = ImageValidator.assessProcessingComplexity.bind(ImageValidator);