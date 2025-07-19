// /service-worker.js

// 当Service Worker安装时触发
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  // self.skipWaiting() 会强制等待中的 Service Worker 在安装成功后立即激活
  self.skipWaiting();
});

// 当Service Worker激活时触发
self.addEventListener('activate', event => {
  console.log('Service worker activating...');
});

// --- 新增：核心的推送事件监听器 ---
self.addEventListener('push', event => {
  console.log('[Service Worker] 收到推送事件。');
  
  let notificationData = {
    title: 'MaoChat 有新消息',
    body: '您收到了一条新消息，快去看看吧！',
    icon: 'icon-192.png' // 默认图标
  };

  // 尝试解析从服务器传来的JSON数据
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData.title = data.title;
      notificationData.body = data.body;
      notificationData.icon = data.icon;
    } catch (e) {
      console.error('[Service Worker] 解析推送数据失败', e);
    }
  }

  // 设置通知的选项
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: 'icon-192.png', // Android上状态栏的小图标
    vibrate: [200, 100, 200, 100, 200, 100, 200] // 震动模式
  };
  
  // 使用 showNotification API 显示通知
  // event.waitUntil() 保证了在通知显示之前，Service Worker 不会被终止
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// 点击通知时的行为 (可选，但强烈推荐)
self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] 通知被点击。');
    
    // 关闭通知
    event.notification.close();

    // 尝试聚焦到已打开的应用窗口，如果没有则打开新窗口
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});


// 拦截网络请求 (暂时保持最简单的代理模式)
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
