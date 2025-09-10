/**
 * Service Worker - Core Web Vitals 优化版本
 * 专注缓存策略和性能提升
 */

const CACHE_NAME = 'wplace-tool-v1757468535886';
const STATIC_CACHE_NAME = 'wplace-static-v1';

// 关键资源 - 立即缓存
const CRITICAL_RESOURCES = [
    '/',
    '/index.html',
    '/js/logger.js',
    '/js/lazy-translations-optimized.js',
    '/js/app-simple.js',
    '/css/main.css',
    '/manifest.json'
];

// 翻译文件 - 按需缓存
const TRANSLATION_PATTERN = /\/lang\/\w+\.json$/;

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => cache.addAll(CRITICAL_RESOURCES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // 翻译文件 - stale-while-revalidate
    if (TRANSLATION_PATTERN.test(url.pathname)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(response => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                    return response || fetchPromise;
                });
            })
        );
        return;
    }

    // 静态资源 - cache first
    if (CRITICAL_RESOURCES.includes(url.pathname)) {
        event.respondWith(
            caches.match(request)
                .then(response => response || fetch(request))
        );
        return;
    }

    // 图像资源 - cache first with fallback
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) return response;
                    return fetch(request).then(networkResponse => {
                        const cache = caches.open(CACHE_NAME);
                        cache.then(c => c.put(request, networkResponse.clone()));
                        return networkResponse;
                    });
                })
        );
        return;
    }

    // 其他请求 - network first
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});

// 预加载策略
self.addEventListener('message', event => {
    if (event.data.type === 'PRELOAD_ROUTE') {
        const urls = event.data.urls;
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return Promise.all(
                    urls.map(url => 
                        fetch(url).then(response => cache.put(url, response))
                    )
                );
            })
        );
    }
});