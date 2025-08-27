/**
 * 简化版PWA功能管理器 - 用于调试
 */

(function() {
    'use strict';
    
    console.log('🚀 开始加载PWA功能...');
    
    // 检查环境
    if (location.protocol === 'file:') {
        console.log('📁 当前在file://协议下，PWA功能受限');
        return;
    }
    
    // 检查浏览器支持
    if (!('serviceWorker' in navigator)) {
        console.log('❌ 当前浏览器不支持Service Worker');
        return;
    }
    
    console.log('✅ PWA环境检查通过');
    
    // 简单的PWA管理器
    const SimplePWAManager = {
        deferredPrompt: null,
        isInstalled: false,
        
        async init() {
            console.log('🔧 初始化PWA功能...');
            
            try {
                // 注册Service Worker
                await this.registerServiceWorker();
                
                // 监听安装提示
                this.setupInstallPrompt();
                
                // 检查是否已安装
                this.checkIfInstalled();
                
                console.log('✅ PWA功能初始化成功');
            } catch (error) {
                console.error('❌ PWA初始化失败:', error);
            }
        },
        
        async registerServiceWorker() {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker注册成功:', registration.scope);
                return registration;
            } catch (error) {
                console.error('❌ Service Worker注册失败:', error);
                throw error;
            }
        },
        
        setupInstallPrompt() {
            window.addEventListener('beforeinstallprompt', (e) => {
                console.log('💾 PWA安装提示事件');
                e.preventDefault();
                this.deferredPrompt = e;
                this.showInstallButton();
            });
        },
        
        showInstallButton() {
            if (document.getElementById('pwa-install-btn')) return;
            
            const btn = document.createElement('button');
            btn.id = 'pwa-install-btn';
            btn.textContent = '安装应用';
            btn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                z-index: 1000;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            `;
            
            btn.addEventListener('click', () => this.promptInstall());
            document.body.appendChild(btn);
            
            console.log('📱 安装按钮已显示');
        },
        
        async promptInstall() {
            if (!this.deferredPrompt) return;
            
            try {
                this.deferredPrompt.prompt();
                const result = await this.deferredPrompt.userChoice;
                console.log('用户安装选择:', result.outcome);
                
                this.deferredPrompt = null;
                const btn = document.getElementById('pwa-install-btn');
                if (btn) btn.remove();
                
            } catch (error) {
                console.error('安装提示失败:', error);
            }
        },
        
        checkIfInstalled() {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                                window.navigator.standalone === true;
            
            if (isStandalone) {
                this.isInstalled = true;
                console.log('✅ 应用运行在独立模式');
            } else {
                console.log('📱 应用运行在浏览器中');
            }
        }
    };
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            SimplePWAManager.init();
        });
    } else {
        SimplePWAManager.init();
    }
    
    // 导出到全局
    window.simplePWA = SimplePWAManager;
    
    console.log('📦 简化版PWA管理器加载完成');
    
})();