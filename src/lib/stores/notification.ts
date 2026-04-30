
import { writable } from 'svelte/store';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const notifications = writable<Notification[]>([]);

export function addNotification(notification: Omit<Notification, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9);
  const newNotification: Notification = {
    id,
    duration: 5000,
    ...notification
  };

  notifications.update(items => [...items, newNotification]);

  if (newNotification.duration && newNotification.duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  }

  return id;
}

export function removeNotification(id: string) {
  notifications.update(items => items.filter(item => item.id !== id));
}

export function clearNotifications() {
  notifications.set([]);
}
