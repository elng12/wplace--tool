/**
 * Wplace Pixel Art Converter - 安全增强模块
 * 包含XSS防护、输入验证、错误恢复等安全功能
 */

// 输入验证和净化
export class InputSanitizer {
    // HTML内容净化，防止XSS
    static sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // URL净化
    static sanitizeURL(url) {
        try {
            const parsed = new URL(url);
            // 只允许http和https协议
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return null;
            }
            return parsed.toString();
        } catch {
            return null;
        }
    }
    
    // 文件名净化
    static sanitizeFileName(filename) {
        // 移除危险字符
        return filename
            .replace(/[<>:"/\\|?*]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 255); // 限制长度
    }
    
    // 数值验证
    static validateNumber(value, min = -Infinity, max = Infinity) {
        const num = Number(value);
        if (isNaN(num)) return null;
        return Math.max(min, Math.min(max, num));
    }
}

// 速率限制器
export class RateLimiter {
    constructor(maxRequests = 10, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }
    
    isAllowed(key) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        // 获取或创建请求记录
        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }
        
        const userRequests = this.requests.get(key);
        
        // 清理过期请求
        const validRequests = userRequests.filter(time => time > windowStart);
        this.requests.set(key, validRequests);
        
        // 检查是否超过限制
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        
        // 记录新请求
        validRequests.push(now);
        return true;
    }
    
    getRemainingRequests(key) {
        const requests = this.requests.get(key) || [];
        const windowStart = Date.now() - this.windowMs;
        const validRequests = requests.filter(time => time > windowStart);
        return Math.max(0, this.maxRequests - validRequests.length);
    }
}

// 内存监控和保护
export class MemoryGuard {
    constructor() {
        this.memoryThreshold = this.getMemoryThreshold();
        this.canvases = new Set();
        this.cleanup = this.cleanup.bind(this);
        
        // 监听页面卸载事件
        window.addEventListener('beforeunload', this.cleanup);
        window.addEventListener('unload', this.cleanup);
    }
    
    getMemoryThreshold() {
        // 尝试获取设备内存信息
        if ('memory' in performance) {
            const deviceMemory = performance.memory.jsHeapSizeLimit;
            return Math.min(deviceMemory * 0.8, 100 * 1024 * 1024); // 最多100MB
        }
        return 50 * 1024 * 1024; // 默认50MB
    }
    
    checkMemoryUsage() {
        if ('memory' in performance) {
            const used = performance.memory.usedJSHeapSize;
            const limit = performance.memory.jsHeapSizeLimit;
            const usage = used / limit;
            
            if (usage > 0.9) {
                console.warn('⚠️ 内存使用率过高:', Math.round(usage * 100) + '%');
                this.forceCleanup();
                return false;
            }
        }
        return true;
    }
    
    registerCanvas(canvas) {
        this.canvases.add(canvas);
    }
    
    unregisterCanvas(canvas) {
        this.canvases.delete(canvas);
    }
    
    forceCleanup() {
        // 清理所有注册的canvas
        this.canvases.forEach(canvas => {
            if (canvas && canvas.getContext) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        });
        
        // 手动触发垃圾回收（如果支持）
        if (window.gc) {
            window.gc();
        }
    }
    
    cleanup() {
        this.forceCleanup();
        this.canvases.clear();
    }
}

// 错误恢复系统
export class ErrorRecovery {
    constructor() {
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.backoffDelay = 1000; // 1秒
        
        // 设置全局错误处理
        this.setupGlobalErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        // 捕获未处理的Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise rejection:', event.reason);
            this.handleGlobalError(event.reason, 'unhandledrejection');
            event.preventDefault(); // 防止在控制台显示错误
        });
        
        // 捕获全局错误
        window.addEventListener('error', (event) => {
            console.error('全局错误:', event.error);
            this.handleGlobalError(event.error, 'global');
        });
    }
    
    handleGlobalError(error, context) {
        // 根据错误类型进行分类处理
        if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
            this.showRecoveryNotification('资源加载失败，正在尝试重新加载...', () => {
                location.reload();
            });
            return;
        }
        
        if (error?.name === 'QuotaExceededError') {
            this.showRecoveryNotification('存储空间不足，请清理浏览器缓存', () => {
                this.clearBrowserCache();
            });
            return;
        }
        
        // 通用错误处理
        this.showRecoveryNotification('应用发生错误，点击重试', () => {
            location.reload();
        });
    }
    
    async retry(operation, context = 'operation') {
        const attempts = this.retryAttempts.get(context) || 0;
        
        if (attempts >= this.maxRetries) {
            throw new Error(`${context} 重试次数已达上限 (${this.maxRetries})`);
        }
        
        try {
            const result = await operation();
            this.retryAttempts.delete(context); // 成功后清除重试记录
            return result;
        } catch (error) {
            this.retryAttempts.set(context, attempts + 1);
            
            // 指数退避延迟
            const delay = this.backoffDelay * Math.pow(2, attempts);
            console.warn(`⚠️ ${context} 第${attempts + 1}次重试，${delay}ms后重试:`, error);
            
            await this.sleep(delay);
            return this.retry(operation, context);
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showRecoveryNotification(message, action) {
        // 创建恢复通知
        const notification = document.createElement('div');
        notification.className = `
            fixed top-4 left-1/2 transform -translate-x-1/2 z-50
            bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg
            flex items-center space-x-3
        `.trim();
        
        notification.innerHTML = `
            <span class="flex-1">${InputSanitizer.sanitizeHTML(message)}</span>
            <button class="bg-red-700 hover:bg-red-800 px-3 py-1 rounded transition-colors">
                重试
            </button>
        `;
        
        const button = notification.querySelector('button');
        button.addEventListener('click', () => {
            notification.remove();
            if (action) action();
        });
        
        document.body.appendChild(notification);
        
        // 10秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
    
    clearBrowserCache() {
        try {
            // 清理localStorage
            localStorage.clear();
            // 清理sessionStorage
            sessionStorage.clear();
            // 提示用户手动清理
            alert('请手动清理浏览器缓存：\n1. 按 Ctrl+Shift+Delete\n2. 选择"清除缓存的图片和文件"\n3. 点击"清除数据"');
        } catch (error) {
            console.error('清理缓存失败:', error);
        }
    }
}

// CSP (内容安全策略) 辅助
export class CSPHelper {
    static createSafeElement(tagName, attributes = {}, textContent = '') {
        const element = document.createElement(tagName);
        
        // 安全地设置属性
        Object.entries(attributes).forEach(([key, value]) => {
            if (this.isSafeAttribute(key)) {
                element.setAttribute(key, String(value));
            }
        });
        
        // 安全地设置文本内容
        if (textContent) {
            element.textContent = String(textContent);
        }
        
        return element;
    }
    
    static isSafeAttribute(attr) {
        // 黑名单：危险的属性
        const dangerousAttrs = [
            'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus',
            'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup'
        ];
        
        return !dangerousAttrs.includes(attr.toLowerCase());
    }
    
    static createSafeURL(url, allowedDomains = []) {
        try {
            const parsed = new URL(url);
            
            // 检查协议
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return null;
            }
            
            // 检查域名白名单
            if (allowedDomains.length > 0) {
                const isAllowed = allowedDomains.some(domain => 
                    parsed.hostname === domain || 
                    parsed.hostname.endsWith('.' + domain)
                );
                
                if (!isAllowed) {
                    return null;
                }
            }
            
            return parsed.toString();
        } catch {
            return null;
        }
    }
}

// 特权操作验证
export class PrivilegedOperations {
    static async requestFileSystemAccess() {
        // 检查是否支持文件系统API
        if ('showOpenFilePicker' in window) {
            try {
                return await window.showOpenFilePicker({
                    multiple: true,
                    types: [{
                        description: 'Image files',
                        accept: {
                            'image/*': ['.png', '.jpg', '.jpeg']
                        }
                    }]
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('文件系统访问失败:', error);
                }
                return null;
            }
        }
        return null;
    }
    
    static async requestPersistentStorage() {
        if ('storage' in navigator && 'persist' in navigator.storage) {
            try {
                const persistent = await navigator.storage.persist();
                console.log('持久存储请求结果:', persistent);
                return persistent;
            } catch (error) {
                console.error('持久存储请求失败:', error);
                return false;
            }
        }
        return false;
    }
    
    static async getStorageEstimate() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                console.log('存储空间估算:', estimate);
                return estimate;
            } catch (error) {
                console.error('获取存储空间信息失败:', error);
                return null;
            }
        }
        return null;
    }
}

// 导出统一的安全管理器
export class SecurityManager {
    constructor() {
        this.sanitizer = InputSanitizer;
        this.rateLimiter = new RateLimiter(20, 60000); // 每分钟最多20次操作
        this.memoryGuard = new MemoryGuard();
        this.errorRecovery = new ErrorRecovery();
        this.cspHelper = CSPHelper;
        this.privilegedOps = PrivilegedOperations;
    }
    
    // 统一的安全检查
    checkSecurity(operation, userKey = 'default') {
        // 速率限制检查
        if (!this.rateLimiter.isAllowed(userKey)) {
            throw new Error('操作过于频繁，请稍后重试');
        }
        
        // 内存使用检查
        if (!this.memoryGuard.checkMemoryUsage()) {
            throw new Error('内存使用过高，请刷新页面或使用更小的图片');
        }
        
        return true;
    }
    
    // 安全的异步操作执行
    async safeExecute(operation, context = 'operation') {
        try {
            this.checkSecurity(operation, context);
            return await this.errorRecovery.retry(operation, context);
        } catch (error) {
            console.error(`安全执行失败 [${context}]:`, error);
            throw error;
        }
    }
}