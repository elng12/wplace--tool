/**
 * Wplace Tool Service Worker
 * 提供离线缓存和后台功能
 */

const CACHE_NAME = 'wplace-tool-v1.0.0';
const STATIC_CACHE_NAME = 'wplace-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'wplace-dynamic-v1.0.0';

// 静态资源缓存列表
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/blog.html', 
  '/privacy.html',
  '/terms.html',
  '/color-converter.html',
  '/css/main.css',
  '/js/app.js',
  '/js/app-simple.js',
  '/js/i18n.js',
  '/js/inline-translations.js',
  '/js/error-handler.js',
  '/js/performance-monitor.js',
  '/manifest.json'
];

// 博客文章
const BLOG_ASSETS = [
  '/blog/beginner-guide.html',
  '/blog/color-palette-strategies.html', 
  '/blog/dithering-techniques.html',
  '/blog/image-resampling.html'
];

// CDN资源（仅在线时缓存）
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com/3.3.0/tailwind.min.css'
];

// 安装事件 - 预缓存关键资源
self.addEventListener('install', event => {
  window.logger?.log('[SW] 🚀 安装Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE_NAME).then(cache => {
        window.logger?.log('[SW] 📦 缓存静态资源...');
        return cache.addAll([...STATIC_ASSETS, ...BLOG_ASSETS]);
      }),
      
      // 跳过等待，立即激活
      self.skipWaiting()
    ])
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  window.logger?.log('[SW] ✅ 激活Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('wplace-') && 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME
            )
            .map(cacheName => {
              window.logger?.log('[SW] 🗑️ 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // 立即控制所有客户端
      self.clients.claim()
    ])
  );
});

// 获取事件 - 网络请求拦截
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // 跳过非HTTP请求
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // 跳过POST请求（通常是表单提交）
  if (request.method !== 'GET') {
    return;
  }
  
  event.respondWith(handleFetch(request, url));
});

// 处理网络请求的核心函数
async function handleFetch(request, url) {
  try {
    // 静态资源 - 缓存优先策略
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    // HTML页面 - 网络优先，失败时回退到缓存
    if (isHTMLPage(url.pathname)) {
      return await networkFirstWithFallback(request, DYNAMIC_CACHE_NAME);
    }
    
    // CDN资源 - 缓存优先，失败时网络
    if (isCDNResource(url.href)) {
      return await cacheFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    // 图片资源 - 缓存优先
    if (isImageResource(url.pathname)) {
      return await cacheFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    // 其他资源 - 网络优先
    return await networkFirst(request, DYNAMIC_CACHE_NAME);
    
  } catch (error) {
    window.logger?.error('[SW] ❌ 请求处理失败:', error);
    
    // 如果是HTML页面请求失败，返回离线页面
    if (isHTMLPage(url.pathname)) {
      const offlineResponse = await getOfflinePage();
      if (offlineResponse) return offlineResponse;
    }
    
    // 返回网络错误
    return new Response('Network Error', {
      status: 408,
      statusText: 'Network Error'
    });
  }
}

// 缓存优先策略
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // 后台更新缓存
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // 网络失败时静默忽略
    });
    
    return cachedResponse;
  }
  
  // 缓存未命中，从网络获取
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// 网络优先策略
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // 网络失败，尝试缓存
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// 网络优先带回退策略
async function networkFirstWithFallback(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // 网络失败，尝试缓存
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 如果是根路径或index.html，返回缓存的首页
    if (request.url.endsWith('/') || request.url.endsWith('/index.html')) {
      const indexResponse = await cache.match('/index.html') || await cache.match('/');
      if (indexResponse) return indexResponse;
    }
    
    throw error;
  }
}

// 获取离线页面
async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  return await cache.match('/index.html') || await cache.match('/');
}

// 判断是否为静态资源
function isStaticAsset(pathname) {
  return pathname.startsWith('/css/') || 
         pathname.startsWith('/js/') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname === '/manifest.json';
}

// 判断是否为HTML页面
function isHTMLPage(pathname) {
  return pathname.endsWith('.html') || 
         pathname === '/' || 
         pathname.endsWith('/');
}

// 判断是否为CDN资源
function isCDNResource(url) {
  return url.includes('cdn.tailwindcss.com') ||
         url.includes('googleapis.com') ||
         url.includes('pagead2.googlesyndication.com');
}

// 判断是否为图片资源
function isImageResource(pathname) {
  return pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i);
}

// 后台同步事件
self.addEventListener('sync', event => {
  window.logger?.log('[SW] 🔄 后台同步:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 执行后台同步
async function doBackgroundSync() {
  try {
    // 这里可以添加后台数据同步逻辑
    window.logger?.log('[SW] ✅ 后台同步完成');
  } catch (error) {
    window.logger?.error('[SW] ❌ 后台同步失败:', error);
  }
}

// 推送通知事件
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Wplace Tool notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'wplace-notification',
    requireInteraction: false,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Wplace Tool', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow('/')
  );
});

// 消息事件（与主线程通信）
self.addEventListener('message', event => {
  const data = event.data;
  
  if (data && data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (data && data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(data.payload));
  }
});

// 缓存指定URLs
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  return cache.addAll(urls);
}

window.logger?.log('[SW] 📱 Wplace Tool Service Worker 已加载');