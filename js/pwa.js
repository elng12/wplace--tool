/**
 * PWA功能管理器
 * 处理Service Worker注册、安装提示、更新等
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.swRegistration = null;
        this.updateAvailable = false;
        
        this.init();
    }
    
    async init() {
        window.logger?.log('🚀 初始化PWA功能...');
        
        // 检查PWA支持
        if (!this.isPWASupported()) {
            window.logger?.log('❌ 当前浏览器不支持PWA功能');
            return;
        }
        
        // 注册Service Worker
        await this.registerServiceWorker();
        
        // 监听安装提示事件
        this.setupInstallPrompt();
        
        // 监听应用安装事件
        this.setupAppInstalled();
        
        // 检查是否已安装
        this.checkIfInstalled();
        
        // 设置更新检查
        this.setupUpdateChecker();
        
        // 监听网络状态
        this.setupNetworkMonitoring();
        
        window.logger?.log('✅ PWA功能初始化完成');
    }
    
    // 检查PWA支持
    isPWASupported() {
        // file:// 协议下Service Worker不工作
        if (location.protocol === 'file:') {
            window.logger?.log('📁 检测到file://协议，Service Worker功能已禁用');
            return false;
        }
        
        return 'serviceWorker' in navigator && 
               'PushManager' in window &&
               'Notification' in window;
    }
    
    // 注册Service Worker
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            return;
        }
        
        try {
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            window.logger?.log('✅ Service Worker注册成功:', this.swRegistration.scope);
            
            // 监听Service Worker状态变化
            this.swRegistration.addEventListener('updatefound', () => {
                window.logger?.log('🔄 发现Service Worker更新');
                this.handleServiceWorkerUpdate();
            });
            
            // 检查是否有等待中的Service Worker
            if (this.swRegistration.waiting) {
                this.showUpdateNotification();
            }
            
        } catch (error) {
            window.logger?.error('❌ Service Worker注册失败:', error);
        }
    }
    
    // 处理Service Worker更新
    handleServiceWorkerUpdate() {
        const newWorker = this.swRegistration.installing;
        if (!newWorker) return;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true;
                this.showUpdateNotification();
            }
        });
    }
    
    // 显示更新通知
    showUpdateNotification() {
        const updateBanner = this.createUpdateBanner();
        document.body.appendChild(updateBanner);
        
        // 自动隐藏（可选）
        setTimeout(() => {
            if (updateBanner.parentNode) {
                updateBanner.remove();
            }
        }, 30000);
    }
    
    // 创建更新横幅
    createUpdateBanner() {
        const banner = document.createElement('div');
        banner.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white px-4 py-3 z-50 transform -translate-y-full transition-transform duration-300';
        banner.style.transform = 'translateY(0)';
        
        banner.innerHTML = `
            <div class="flex items-center justify-between max-w-6xl mx-auto">
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>应用有新版本可用</span>
                </div>
                <div class="flex items-center space-x-3">
                    <button onclick="pwaManager.applyUpdate()" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                        立即更新
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        return banner;
    }
    
    // 应用更新
    async applyUpdate() {
        if (!this.swRegistration || !this.swRegistration.waiting) {
            return;
        }
        
        // 告诉等待中的Service Worker接管
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // 监听控制权变化
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
    
    // 设置安装提示
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            window.logger?.log('💾 PWA安装提示事件触发');
            
            // 阻止默认的安装横幅
            e.preventDefault();
            
            // 保存事件引用
            this.deferredPrompt = e;
            
            // 显示自定义安装按钮
            this.showInstallButton();
        });
    }
    
    // 显示安装按钮
    showInstallButton() {
        // 检查是否已经显示安装按钮
        if (document.getElementById('pwa-install-button')) {
            return;
        }
        
        const installButton = document.createElement('button');
        installButton.id = 'pwa-install-button';
        installButton.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors z-40 flex items-center space-x-2';
        installButton.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>安装应用</span>
        `;
        
        installButton.addEventListener('click', () => this.promptInstall());
        document.body.appendChild(installButton);
        
        // 添加进入动画
        setTimeout(() => {
            installButton.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // 提示安装
    async promptInstall() {
        if (!this.deferredPrompt) {
            return;
        }
        
        // 显示安装提示
        this.deferredPrompt.prompt();
        
        // 等待用户响应
        const choiceResult = await this.deferredPrompt.userChoice;
        
        window.logger?.log('用户选择:', choiceResult.outcome);
        
        if (choiceResult.outcome === 'accepted') {
            window.logger?.log('✅ 用户接受安装');
        } else {
            window.logger?.log('❌ 用户拒绝安装');
        }
        
        // 清除引用
        this.deferredPrompt = null;
        
        // 隐藏安装按钮
        this.hideInstallButton();
    }
    
    // 隐藏安装按钮
    hideInstallButton() {
        const button = document.getElementById('pwa-install-button');
        if (button) {
            button.style.transform = 'translateY(100px)';
            setTimeout(() => button.remove(), 300);
        }
    }
    
    // 设置应用已安装监听
    setupAppInstalled() {
        window.addEventListener('appinstalled', () => {
            window.logger?.log('✅ PWA应用已安装');
            this.isInstalled = true;
            this.hideInstallButton();
            
            // 可以在这里显示感谢消息或引导
            this.showWelcomeMessage();
        });
    }
    
    // 显示欢迎消息
    showWelcomeMessage() {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 left-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-y-full transition-transform duration-300';
        toast.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>应用安装成功！现在可以离线使用了。</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    // 检查是否已安装
    checkIfInstalled() {
        // 检查是否在独立模式下运行
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            window.logger?.log('✅ 应用运行在独立模式下');
            return;
        }
        
        // 检查是否从主屏幕启动
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            window.logger?.log('✅ 应用从主屏幕启动');
            return;
        }
        
        window.logger?.log('📱 应用运行在浏览器中');
    }
    
    // 设置更新检查器
    setupUpdateChecker() {
        // 每小时检查一次更新
        setInterval(() => {
            this.checkForUpdates();
        }, 60 * 60 * 1000);
        
        // 页面可见时检查更新
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkForUpdates();
            }
        });
    }
    
    // 检查更新
    async checkForUpdates() {
        if (!this.swRegistration) return;
        
        try {
            await this.swRegistration.update();
            window.logger?.log('🔍 检查更新完成');
        } catch (error) {
            window.logger?.error('❌ 检查更新失败:', error);
        }
    }
    
    // 设置网络监控
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            window.logger?.log('🌐 网络已连接');
            this.showNetworkStatus('online');
        });
        
        window.addEventListener('offline', () => {
            window.logger?.log('📴 网络已断开');
            this.showNetworkStatus('offline');
        });
    }
    
    // 显示网络状态
    showNetworkStatus(status) {
        const isOnline = status === 'online';
        const toast = document.createElement('div');
        toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${isOnline ? 'bg-green-600' : 'bg-red-600'} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300`;
        toast.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${isOnline 
                        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>'
                        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m0 0L18.364 5.636m0 0L5.636 5.636"></path>'
                    }
                </svg>
                <span>${isOnline ? '网络已连接' : '离线模式'}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // 缓存重要资源
    async cacheImportantResources(urls) {
        if (!this.swRegistration) return;
        
        this.swRegistration.active?.postMessage({
            type: 'CACHE_URLS',
            payload: urls
        });
    }
}

// 全局实例
let pwaManager;

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        pwaManager = new PWAManager();
    });
} else {
    pwaManager = new PWAManager();
}

// 导出给全局使用
window.pwaManager = pwaManager;