/**
 * 增强的错误处理系统 - Wplace Paint Tool
 * 提供统一的错误管理、用户友好的错误消息和调试信息
 */

class EnhancedErrorHandler {
    constructor() {
        this.errorQueue = [];
        this.maxErrorHistory = 50;
        this.errorCallbacks = new Set();
        
        // 绑定全局错误处理器
        this.bindGlobalErrorHandlers();
    }
    
    // 绑定全局错误处理器
    bindGlobalErrorHandlers() {
        // 处理未捕获的JavaScript错误
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                error: event.error,
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });
        
        // 处理Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                error: event.reason,
                message: event.reason?.message || '未处理的Promise拒绝',
                stack: event.reason?.stack
            });
        });
        
        // 处理资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target && event.target !== window) {
                const source = event.target.src || event.target.href;
                
                // 过滤掉外部服务的预期错误
                const ignoredDomains = [
                    'googlesyndication.com',
                    'adtrafficquality.google',
                    'google.com/recaptcha',
                    'googletagmanager.com'
                ];
                
                const shouldIgnore = ignoredDomains.some(domain => 
                    source && source.includes(domain)
                );
                
                if (!shouldIgnore) {
                    this.handleError({
                        type: 'resource',
                        element: event.target.tagName,
                        source: source,
                        message: `资源加载失败: ${event.target.tagName}`
                    });
                } else {
                    // 对于外部服务，仅在开发模式下输出简化信息
                    if (this.isDevMode()) {
                        window.logger?.log(`🌐 外部服务连接失败（正常）: ${source}`);
                    }
                }
            }
        }, true);
    }
    
    // 处理错误
    handleError(errorInfo) {
        const timestamp = new Date().toISOString();
        const errorEntry = {
            ...errorInfo,
            timestamp,
            id: this.generateErrorId(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // 添加到错误队列
        this.addToQueue(errorEntry);
        
        // 通知所有回调
        this.notifyCallbacks(errorEntry);
        
        // 控制台输出（开发模式）
        if (this.isDevMode()) {
            console.group(`❌ 错误 [${errorEntry.id}]`);
            window.logger?.error('消息:', errorEntry.message);
            window.logger?.error('类型:', errorEntry.type);
            window.logger?.error('时间:', errorEntry.timestamp);
            if (errorEntry.stack) {
                window.logger?.error('堆栈:', errorEntry.stack);
            }
            window.logger?.error('详细信息:', errorEntry);
            console.groupEnd();
        }
    }
    
    // 应用程序错误处理（用于主动调用）
    reportError(error, context = {}) {
        let errorInfo = {
            type: 'application',
            message: '未知错误',
            context
        };
        
        if (error instanceof Error) {
            errorInfo.message = error.message;
            errorInfo.error = error;
            errorInfo.stack = error.stack;
        } else if (typeof error === 'string') {
            errorInfo.message = error;
        } else {
            errorInfo.message = '未知类型错误';
            errorInfo.error = error;
        }
        
        this.handleError(errorInfo);
    }
    
    // 网络错误处理
    reportNetworkError(response, context = {}) {
        this.handleError({
            type: 'network',
            message: `网络请求失败: ${response.status} ${response.statusText}`,
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            context
        });
    }
    
    // 文件处理错误
    reportFileError(file, errorMessage, context = {}) {
        this.handleError({
            type: 'file',
            message: `文件处理错误: ${errorMessage}`,
            filename: file.name,
            fileSize: file.size,
            fileType: file.type,
            context
        });
    }
    
    // 图像处理错误
    reportImageError(errorMessage, imageInfo = {}, context = {}) {
        this.handleError({
            type: 'image',
            message: `图像处理错误: ${errorMessage}`,
            imageInfo,
            context
        });
    }
    
    // 获取用户友好的错误消息
    getUserFriendlyMessage(errorEntry) {
        switch (errorEntry.type) {
            case 'file':
                if (errorEntry.message.includes('大小')) {
                    return '文件过大，请选择较小的文件（建议小于4MB）';
                }
                if (errorEntry.message.includes('格式') || errorEntry.message.includes('类型')) {
                    return '不支持的文件格式，请使用 PNG、JPG 或 SVG 文件';
                }
                return '文件处理失败，请尝试其他文件';
                
            case 'image':
                return '图像处理失败，请检查图像是否损坏或尝试其他图像';
                
            case 'network':
                if (errorEntry.status >= 500) {
                    return '服务器暂时不可用，请稍后再试';
                } else if (errorEntry.status === 404) {
                    return '请求的资源不存在';
                } else if (errorEntry.status >= 400) {
                    return '请求出现问题，请检查输入并重试';
                }
                return '网络连接出现问题，请检查网络后重试';
                
            case 'resource':
                return '资源加载失败，请刷新页面重试';
                
            case 'javascript':
            case 'promise':
                return '程序出现异常，请刷新页面重试';
                
            default:
                return '出现未知错误，请刷新页面重试';
        }
    }
    
    // 显示用户友好的错误通知
    showUserError(errorEntry, options = {}) {
        const message = this.getUserFriendlyMessage(errorEntry);
        const toastType = this.getToastType(errorEntry);
        
        // 如果存在 showToast 函数，使用它
        if (typeof showToast === 'function') {
            showToast(message, toastType);
        } else {
            // 后备方案：简单的alert
            window.logger?.error('错误:', message);
            if (options.showAlert) {
                alert(`错误: ${message}`);
            }
        }
    }
    
    // 获取Toast类型
    getToastType(errorEntry) {
        switch (errorEntry.type) {
            case 'network':
                return 'warning';
            case 'file':
            case 'image':
                return 'info';
            default:
                return 'error';
        }
    }
    
    // 添加错误回调
    onError(callback) {
        if (typeof callback === 'function') {
            this.errorCallbacks.add(callback);
        }
    }
    
    // 移除错误回调
    offError(callback) {
        this.errorCallbacks.delete(callback);
    }
    
    // 通知所有回调
    notifyCallbacks(errorEntry) {
        this.errorCallbacks.forEach(callback => {
            try {
                callback(errorEntry);
            } catch (err) {
                window.logger?.error('错误回调执行失败:', err);
            }
        });
    }
    
    // 生成错误ID
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // 添加到错误队列
    addToQueue(errorEntry) {
        this.errorQueue.unshift(errorEntry);
        
        // 限制队列大小
        if (this.errorQueue.length > this.maxErrorHistory) {
            this.errorQueue = this.errorQueue.slice(0, this.maxErrorHistory);
        }
    }
    
    // 检测是否为开发模式
    isDevMode() {
        return window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:' ||
               localStorage.getItem('debug') === 'true';
    }
    
    // 获取错误历史
    getErrorHistory() {
        return [...this.errorQueue];
    }
    
    // 清空错误历史
    clearErrorHistory() {
        this.errorQueue = [];
    }
    
    // 获取错误统计
    getErrorStats() {
        const stats = {};
        
        this.errorQueue.forEach(error => {
            const type = error.type;
            stats[type] = (stats[type] || 0) + 1;
        });
        
        return {
            total: this.errorQueue.length,
            byType: stats,
            latest: this.errorQueue[0] || null
        };
    }
    
    // 导出错误日志（用于调试）
    exportErrorLog() {
        const log = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errors: this.errorQueue
        };
        
        const blob = new Blob([JSON.stringify(log, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-log-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 创建全局实例
const globalErrorHandler = new EnhancedErrorHandler();

// 导出便利函数
window.reportError = globalErrorHandler.reportError.bind(globalErrorHandler);
window.reportNetworkError = globalErrorHandler.reportNetworkError.bind(globalErrorHandler);
window.reportFileError = globalErrorHandler.reportFileError.bind(globalErrorHandler);
window.reportImageError = globalErrorHandler.reportImageError.bind(globalErrorHandler);

// 自动显示用户错误的便利函数
window.showUserError = (error, context = {}) => {
    globalErrorHandler.reportError(error, context);
    globalErrorHandler.showUserError(globalErrorHandler.errorQueue[0]);
};

// 导出错误处理器实例（用于高级用法）
window.errorHandler = globalErrorHandler;

window.logger?.log('✅ 增强的错误处理系统已初始化');