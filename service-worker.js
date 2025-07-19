// 当Service Worker安装时触发
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  // 这里可以添加缓存静态文件的逻辑，但为了简单起见，我们暂时跳过
  self.skipWaiting();
});

// 当Service Worker激活时触发
self.addEventListener('activate', event => {
  console.log('Service worker activating...');
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  // 目前我们只做最简单的网络请求代理
  // 让所有请求都直接走网络
  event.respondWith(fetch(event.request));
});
