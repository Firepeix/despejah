var cacheName = 'despeja-v1.0';

self.addEventListener('install', function () {
  caches.open(cacheName).then(function (cache) {
    cache.addAll([
      '/',
      '/index.html',
      '/favicon.ico',
      '/manifest.webmanifest',
      '/src/css/main.css',
      '/src/js/app.js',
      '/src/js/lib/maska.js',
      '/src/js/lib/simple-mask-money.js',
      '/src/js/lib/sweetalert2.js',
      '/src/libs/chart/Chart.bundle.js',
      '/src/libs/chart/Chart.bundle.min.js',
      '/src/libs/chart/Chart.min.css',
      '/src/libs/chart/Chart.css',
      '/src/libs/chart/Chart.js',
      '/src/libs/chart/Chart.min.js',
      '/src/icons/check-bold.svg',
      '/src/icons/dots-vertical.svg',
      '/src/icons/home.svg',
      '/src/icons/list.svg',
      '/src/icons/logo.svg',
      '/src/icons/minus-circle.svg',
      '/src/icons/pencil.svg',
      '/src/icons/plus.svg',
      '/src/icons/sad-face.svg',
      '/src/icons/expense-types/car.svg',
      '/src/icons/expense-types/food-fork-drink.svg',
      '/src/icons/expense-types/heart.svg',
      '/src/icons/expense-types/home.svg',
      '/src/icons/expense-types/tag.svg',
      '/images/icons/android-36x36.png',
      '/images/icons/android-48x48.png',
      '/images/icons/android-72x72.png',
      '/images/icons/android-96x96.png',
      '/images/icons/android-144x144.png',
      '/images/icons/android-192x192.png'
    ]);
  });
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function (event) {
  let resposta = caches.open(cacheName).then((cache) => {
    return cache.match(event.request).then((recurso) => {
      if (recurso) return recurso;
      return fetch(event.request).then((recurso) => {
        cache.put(event.request, recurso.clone());
        return recurso;
      });
    });
  });
  event.respondWith(resposta);
});
