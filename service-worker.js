// 当Service Worker安装时触发
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

// 当Service Worker激活时触发
self.addEventListener('activate', event => {
  console.log('Service worker activating...');
});

// 监听推送事件
self.addEventListener('push', event => {
  console.log('收到推送事件');
  
  let notificationData = {
    title: 'MaoChat 有新消息',
    body: '您收到了一条新消息。',
    icon: 'icon-192.png'
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      console.error('解析推送数据失败', e);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: 'icon-192.png',
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
