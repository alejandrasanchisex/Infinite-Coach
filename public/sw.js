const CACHE_NAME = 'fitness-app-v105';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/client-login.html',
    '/client-dashboard.html',
    '/client-routine.html',
    '/client-diet.html',
    '/client-profile.html',
    '/client-feedback.html',
    '/trainer-dashboard.html',
    '/trainer-login.html',
    '/styles/theme.css',
    '/styles/components.css',
    '/styles/mobile.css',
    '/js/data-models.js',
    '/js/config.js',
    '/js/utils.js',
    '/js/utils.js?v=92',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
