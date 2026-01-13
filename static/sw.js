// Service Worker for Push Notifications
// This file handles push notifications and background sync

const CACHE_NAME = 'drawtopia-v1';
const OFFLINE_URL = '/offline.html';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/icon-192.png',
        '/badge-72.png',
      ]).catch((err) => {
        console.error('Cache addAll failed:', err);
      });
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  
  // Claim all clients
  self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: '🎁 New Gift!',
    body: 'You have received a new gift story',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: '/dashboard',
    },
  };
  
  // Parse notification data from push event
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.data?.giftId || 'gift-notification',
        requireInteraction: true,
        data: data.data || notificationData.data,
        actions: data.actions || [
          {
            action: 'view',
            title: 'View Gift',
            icon: '/icon-view.png',
          },
          {
            action: 'close',
            title: 'Close',
            icon: '/icon-close.png',
          },
        ],
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }
  
  // Show notification and notify clients
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag,
        requireInteraction: notificationData.requireInteraction,
        data: notificationData.data,
        actions: notificationData.actions,
        vibrate: [200, 100, 200],
      }),
      // Notify all clients that a new notification was received
      notifyClients({ type: 'NOTIFICATION_RECEIVED', data: notificationData.data }),
      // Update badge count
      updateBadgeCount(),
    ])
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  // Handle action buttons
  if (event.action === 'close') {
    return;
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event - track dismissals
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Optional: Send analytics or update server
  // fetch('/api/notification-dismissed', {
  //   method: 'POST',
  //   body: JSON.stringify({ notificationId: event.notification.tag }),
  // });
});

// Background sync event - for offline support
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          
          return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_BADGE_COUNT') {
    updateBadgeCount().then((count) => {
      event.ports[0].postMessage({ count });
    });
  }
});

// Helper: Update badge count
async function updateBadgeCount() {
  try {
    // Get unread notification count from the app
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    
    if (clients.length > 0) {
      // Ask the client for the badge count
      const response = await new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        
        clients[0].postMessage(
          { type: 'GET_UNREAD_COUNT' },
          [messageChannel.port2]
        );
        
        // Timeout after 1 second
        setTimeout(() => resolve({ count: 0 }), 1000);
      });
      
      const count = response.count || 0;
      
      // Update badge (if supported)
      if ('setAppBadge' in navigator) {
        if (count > 0) {
          navigator.setAppBadge(count);
        } else {
          navigator.clearAppBadge();
        }
      }
      
      return count;
    }
  } catch (error) {
    console.error('Error updating badge count:', error);
  }
  
  return 0;
}

// Helper: Sync notifications with server
async function syncNotifications() {
  try {
    // Fetch latest notifications
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Show new notifications
      if (data.newNotifications && data.newNotifications.length > 0) {
        for (const notification of data.newNotifications) {
          await self.registration.showNotification(notification.title, {
            body: notification.body,
            icon: notification.icon || '/icon-192.png',
            badge: '/badge-72.png',
            data: notification.data,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Helper: Notify all clients of an event
async function notifyClients(message) {
  try {
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const client of clients) {
      client.postMessage(message);
    }
  } catch (error) {
    console.error('Error notifying clients:', error);
  }
}

console.log('Service Worker loaded');

