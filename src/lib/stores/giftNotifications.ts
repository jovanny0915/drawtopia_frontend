/**
 * Gift Notifications Store
 * Manages gift notifications (different from toast notifications)
 */

import { writable, derived, get } from 'svelte/store';
import type { Gift } from '$lib/database/gifts';
import { browser } from '$app/environment';

// Gift notifications store
export const giftNotifications = writable<Gift[]>([]);

// Unread count
export const unreadCount = derived(giftNotifications, ($notifications) => {
  return $notifications.length;
});

// Set gift notifications
export function setGiftNotifications(notifications: Gift[]) {
  giftNotifications.set(notifications);
  
  // Update badge count
  if (browser) {
    updateAppBadge(notifications.length);
  }
}

// Add a gift notification
export function addGiftNotification(notification: Gift) {
  giftNotifications.update((items) => [notification, ...items]);
  
  // Update badge count
  if (browser) {
    updateAppBadge(get(unreadCount));
  }
}

// Remove a gift notification
export function removeGiftNotification(giftId: string) {
  giftNotifications.update((items) => items.filter((item) => item.id !== giftId));
  
  // Update badge count
  if (browser) {
    updateAppBadge(get(unreadCount));
  }
}

// Clear all gift notifications
export function clearGiftNotifications() {
  giftNotifications.set([]);
  
  // Clear badge
  if (browser) {
    updateAppBadge(0);
  }
}

// Get unread count (for service worker)
export function getUnreadCount(): number {
  return get(unreadCount);
}

// Update app badge
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
  
  // Also notify service worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'BADGE_COUNT_UPDATED',
      count,
    });
  }
}

// Listen for messages from service worker
if (browser && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_UNREAD_COUNT') {
      // Send unread count to service worker
      const count = get(unreadCount);
      event.ports[0]?.postMessage({ count });
    }
  });
}

