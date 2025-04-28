// sw.js - Service Worker

self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('Push received:', data);
  
    const options = {
      body: data.body,
      icon: '/icon.png',
      badge: '/badge.png'
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
  