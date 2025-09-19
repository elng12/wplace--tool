/**
 * 高级UI组件库
 * 提供可复用的UI组件和交互效果
 */

'use strict';

'use strict';

class UIComponents {
    constructor() {
        this.components = new Map();
        this.animations = new Map();
        this.init();
    }

    // 安全转义HTML字符
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 安全设置HTML内容，仅允许受信任的SVG
    safeSetHtml(element, html) {
        if (typeof html !== 'string') return;

        // 仅允许SVG内容
        if (html.includes('<svg') && html.includes('</svg>')) {
            // 验证是否为有效的SVG片段
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const svg = tempDiv.querySelector('svg');
            if (svg) {
                // 清除潜在的恶意属性
                const dangerousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover', 'javascript:', 'data:'];
                dangerousAttrs.forEach(attr => {
                    if (svg.getAttribute(attr)) {
                        svg.removeAttribute(attr);
                    }
                });
                element.innerHTML = '';
                element.appendChild(svg);
            }
        } else {
            element.textContent = html;
        }
    }
    
    init() {
        window.logger?.log('🎨 初始化UI组件库...');
        this.setupGlobalStyles();
        this.initializeComponents();
        window.logger?.log('✅ UI组件库初始化完成');
    }
    
    // 设置全局样式
    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* UI组件全局样式 */
            .ui-fade-in {
                animation: uiFadeIn 0.3s ease-in-out;
            }
            
            .ui-slide-up {
                animation: uiSlideUp 0.4s ease-out;
            }
            
            .ui-bounce {
                animation: uiBounce 0.6s ease-in-out;
            }
            
            .ui-pulse {
                animation: uiPulse 2s infinite;
            }
            
            .ui-loading-dots::after {
                content: '';
                animation: uiLoadingDots 1.5s infinite;
            }
            
            @keyframes uiFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes uiSlideUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes uiBounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
            
            @keyframes uiPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            @keyframes uiLoadingDots {
                0% { content: ''; }
                25% { content: '.'; }
                50% { content: '..'; }
                75% { content: '...'; }
                100% { content: ''; }
            }
            
            /* 通知组件样式 */
            .ui-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                min-width: 300px;
                max-width: 500px;
                padding: 16px 20px;
                border-radius: 12px;
                color: white;
                font-size: 14px;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            }
            
            .ui-toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .ui-toast.success { background: linear-gradient(135deg, #10b981, #059669); }
            .ui-toast.error { background: linear-gradient(135deg, #ef4444, #dc2626); }
            .ui-toast.warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
            .ui-toast.info { background: linear-gradient(135deg, #3b82f6, #2563eb); }
            
            /* 模态框样式 */
            .ui-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            }
            
            .ui-modal-overlay.show {
                opacity: 1;
            }
            
            .ui-modal {
                background: white;
                border-radius: 16px;
                max-width: 90vw;
                max-height: 90vh;
                overflow: hidden;
                transform: scale(0.8);
                transition: transform 0.3s ease-in-out;
                box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            }
            
            .ui-modal-overlay.show .ui-modal {
                transform: scale(1);
            }
            
            /* 进度条样式 */
            .ui-progress {
                width: 100%;
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }
            
            .ui-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #10b981, #059669);
                border-radius: 4px;
                transition: width 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .ui-progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: uiProgressShine 2s infinite;
            }
            
            @keyframes uiProgressShine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            /* 按钮加载状态 */
            .ui-btn-loading {
                pointer-events: none;
                position: relative;
                color: transparent !important;
            }
            
            .ui-btn-loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 16px;
                height: 16px;
                margin: -8px 0 0 -8px;
                border: 2px solid transparent;
                border-top-color: currentColor;
                border-radius: 50%;
                animation: uiBtnSpin 1s linear infinite;
            }
            
            @keyframes uiBtnSpin {
                to { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // 初始化组件
    initializeComponents() {
        // 注册所有可用组件
        this.registerComponent('Toast', this.createToast.bind(this));
        this.registerComponent('Modal', this.createModal.bind(this));
        this.registerComponent('Progress', this.createProgress.bind(this));
        this.registerComponent('Loading', this.createLoading.bind(this));
        this.registerComponent('Tooltip', this.createTooltip.bind(this));
    }
    
    // 注册组件
    registerComponent(name, factory) {
        this.components.set(name, factory);
    }
    
    // 创建Toast通知
    createToast(options = {}) {
        const {
            message = '通知消息',
            type = 'info', // success, error, warning, info
            duration = 4000,
            closable = true,
            position = 'top-right'
        } = options;
        
        const toast = document.createElement('div');
        toast.className = `ui-toast ${type}`;
        
        const content = document.createElement('div');
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.gap = '8px';
        
        // 图标
        const icon = document.createElement('div');
        this.safeSetHtml(icon, this.getToastIcon(type));
        content.appendChild(icon);
        
        // 消息
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.flex = '1';
        content.appendChild(messageEl);
        
        // 关闭按钮
        if (closable) {
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = 'background:none;border:none;color:white;font-size:20px;cursor:pointer;padding:0;margin-left:8px;';
            closeBtn.onclick = () => this.removeToast(toast);
            content.appendChild(closeBtn);
        }
        
        toast.appendChild(content);
        document.body.appendChild(toast);
        
        // 显示动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }
        
        return {
            element: toast,
            remove: () => this.removeToast(toast)
        };
    }
    
    // 移除Toast
    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    
    // 获取Toast图标
    getToastIcon(type) {
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        };
        return icons[type] || icons.info;
    }
    
    // 创建模态框
    createModal(options = {}) {
        const {
            title = '模态框',
            content = '',
            width = 'auto',
            height = 'auto',
            closable = true,
            backdrop = true
        } = options;
        
        const overlay = document.createElement('div');
        overlay.className = 'ui-modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'ui-modal';
        modal.style.width = width;
        modal.style.height = height;
        
        // 头部
        const header = document.createElement('div');
        header.style.cssText = 'padding:20px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;';
        
        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        titleEl.style.cssText = 'margin:0;font-size:18px;font-weight:600;color:#111827;';
        header.appendChild(titleEl);
        
        if (closable) {
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = 'background:none;border:none;font-size:24px;cursor:pointer;color:#6b7280;padding:0;';
            closeBtn.onclick = () => this.removeModal(overlay);
            header.appendChild(closeBtn);
        }
        
        modal.appendChild(header);
        
        // 内容
        const body = document.createElement('div');
        body.style.cssText = 'padding:20px;';

        if (typeof content === 'string') {
            // 安全处理字符串内容，防止XSS攻击
            const tempDiv = document.createElement('div');
            tempDiv.textContent = content;
            // 如果内容包含HTML标签，需要进行安全转义
            if (content.includes('<') || content.includes('>')) {
                body.textContent = content;
            } else {
                body.textContent = content;
            }
        } else {
            body.appendChild(content);
        }
        
        modal.appendChild(body);
        overlay.appendChild(modal);
        
        // 背景点击关闭
        if (backdrop) {
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    this.removeModal(overlay);
                }
            };
        }
        
        document.body.appendChild(overlay);
        
        // 显示动画
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });
        
        return {
            element: overlay,
            modal: modal,
            remove: () => this.removeModal(overlay)
        };
    }
    
    // 移除模态框
    removeModal(overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
    
    // 创建进度条
    createProgress(options = {}) {
        const {
            value = 0,
            max = 100,
            animated = true,
            showValue = false
        } = options;
        
        const container = document.createElement('div');
        container.style.cssText = 'position:relative;';
        
        const progress = document.createElement('div');
        progress.className = 'ui-progress';
        
        const bar = document.createElement('div');
        bar.className = 'ui-progress-bar';
        bar.style.width = `${(value / max) * 100}%`;
        
        if (showValue) {
            const label = document.createElement('div');
            label.style.cssText = 'text-align:center;margin-top:8px;font-size:12px;color:#6b7280;';
            label.textContent = `${value}%`;
            container.appendChild(label);
        }
        
        progress.appendChild(bar);
        container.appendChild(progress);
        
        return {
            element: container,
            setValue: (newValue) => {
                bar.style.width = `${(newValue / max) * 100}%`;
                if (showValue) {
                    container.querySelector('div:last-child').textContent = `${newValue}%`;
                }
            }
        };
    }
    
    // 创建加载指示器
    createLoading(options = {}) {
        const {
            size = 40,
            color = '#10b981',
            overlay = false
        } = options;
        
        const container = document.createElement('div');
        
        if (overlay) {
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
            `;
        }
        
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            border: 3px solid #e5e7eb;
            border-top-color: ${color};
            border-radius: 50%;
            animation: uiBtnSpin 1s linear infinite;
        `;
        
        container.appendChild(spinner);
        
        return {
            element: container,
            remove: () => {
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            }
        };
    }
    
    // 创建工具提示
    createTooltip(element, text, position = 'top') {
        let tooltip = null;
        
        const show = () => {
            if (tooltip) return;
            
            tooltip = document.createElement('div');
            tooltip.textContent = text;
            tooltip.style.cssText = `
                position: absolute;
                background: #1f2937;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 10001;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;
            
            document.body.appendChild(tooltip);
            
            // 计算位置
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let top, left;
            
            switch (position) {
                case 'top':
                    top = rect.top - tooltipRect.height - 8;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + 8;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'left':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.left - tooltipRect.width - 8;
                    break;
                case 'right':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.right + 8;
                    break;
            }
            
            tooltip.style.top = `${top + window.scrollY}px`;
            tooltip.style.left = `${left + window.scrollX}px`;
            
            requestAnimationFrame(() => {
                tooltip.style.opacity = '1';
            });
        };
        
        const hide = () => {
            if (!tooltip) return;
            
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip && tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
                tooltip = null;
            }, 200);
        };
        
        element.addEventListener('mouseenter', show);
        element.addEventListener('mouseleave', hide);
        element.addEventListener('focus', show);
        element.addEventListener('blur', hide);
        
        return {
            destroy: () => {
                element.removeEventListener('mouseenter', show);
                element.removeEventListener('mouseleave', hide);
                element.removeEventListener('focus', show);
                element.removeEventListener('blur', hide);
                hide();
            }
        };
    }
    
    // 按钮加载状态
    setButtonLoading(button, loading = true) {
        if (loading) {
            button.classList.add('ui-btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('ui-btn-loading');
            button.disabled = false;
        }
    }
    
    // 元素动画
    animate(element, animation, duration = 300) {
        element.style.animation = `${animation} ${duration}ms ease-in-out`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }
}

// 创建全局实例
const UI = new UIComponents();

// 导出到全局
window.UI = UI;

// 便捷方法
window.showToast = (message, type = 'info', duration = 4000) => {
    return UI.createToast({ message, type, duration });
};

window.showModal = (title, content, options = {}) => {
    return UI.createModal({ title, content, ...options });
};

window.showLoading = (overlay = true) => {
    return UI.createLoading({ overlay });
};

window.logger?.log('🎨 UI组件库已加载');