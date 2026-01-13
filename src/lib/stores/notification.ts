/**
 * Notification store
 * Simple notification system for displaying messages to users
 */

import { writable } from 'svelte/store';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // milliseconds, 0 for persistent
}

// Notification store
export const notifications = writable<Notification[]>([]);

// Add notification function
export function addNotification(notification: Omit<Notification, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9);
  const newNotification: Notification = {
    id,
    duration: 5000, // Default 5 seconds
    ...notification
  };

  notifications.update(items => [...items, newNotification]);

  // Auto-remove after duration (if not persistent)
  if (newNotification.duration && newNotification.duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  }

  return id;
}

// Remove notification function
export function removeNotification(id: string) {
  notifications.update(items => items.filter(item => item.id !== id));
}

// Clear all notifications
export function clearNotifications() {
  notifications.set([]);
}
