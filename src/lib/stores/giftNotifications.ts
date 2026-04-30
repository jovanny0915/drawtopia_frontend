
import { writable, derived, get } from 'svelte/store';
import type { Gift } from '$lib/database/gifts';
import { browser } from '$app/environment';

export const giftNotifications = writable<Gift[]>([]);

export const unreadCount = derived(giftNotifications, ($notifications) => {
  return $notifications.length;
});

export function setGiftNotifications(notifications: Gift[]) {
  giftNotifications.set(notifications);
  
  if (browser) {
    updateAppBadge(notifications.length);
  }
}

export function addGiftNotification(notification: Gift) {
  giftNotifications.update((items) => [notification, ...items]);
  
  if (browser) {
    updateAppBadge(get(unreadCount));
  }
}

export function removeGiftNotification(giftId: string) {
  giftNotifications.update((items) => items.filter((item) => item.id !== giftId));
  
  if (browser) {
    updateAppBadge(get(unreadCount));
  }
}

export function clearGiftNotifications() {
  giftNotifications.set([]);
  
  if (browser) {
    updateAppBadge(0);
  }
}

export function getUnreadCount(): number {
  return get(unreadCount);
}

async function updateAppBadge(count: number) {
  if (!browser) return;
  
  try {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        await (navigator as any).setAppBadge(count);
      } else {
        await (navigator as any).clearAppBadge();
      }
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
  
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'BADGE_COUNT_UPDATED',
      count,
    });
  }
}

if (browser && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_UNREAD_COUNT') {
      const count = get(unreadCount);
      event.ports[0]?.postMessage({ count });
    }
  });
}

