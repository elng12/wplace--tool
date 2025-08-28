/**
 * 安全的日志记录系统
 * 在生产环境中自动禁用日志输出
 */
class Logger {
    constructor() {
        // 检测是否为开发环境
        this.isDevelopment = this.detectDevelopmentMode();
    }

    detectDevelopmentMode() {
        // 检测开发环境的多种方法
        return (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '' ||
            window.location.protocol === 'file:' ||
            localStorage.getItem('debug') === 'true'
        );
    }

    log(...args) {
        if (this.isDevelopment) {
            console.log(...args);
        }
    }

    warn(...args) {
        if (this.isDevelopment) {
            console.warn(...args);
        }
    }

    error(...args) {
        // 错误总是需要记录，即使在生产环境
        console.error(...args);
    }

    debug(...args) {
        if (this.isDevelopment) {
            console.debug(...args);
        }
    }

    info(...args) {
        if (this.isDevelopment) {
            console.info(...args);
        }
    }
}

// 创建全局Logger实例
const logger = new Logger();

// 导出到window对象供其他脚本使用
window.logger = logger;