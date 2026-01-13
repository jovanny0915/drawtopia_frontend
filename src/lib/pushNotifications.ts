/**
 * Push Notifications Library
 * Handles Web Push subscriptions and notifications
 */

import { supabase } from './supabase';
import { getCurrentUser } from './auth';

// VAPID public key - get this from your backend/environment
// Generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// Check if VAPID key is configured
if (!VAPID_PUBLIC_KEY) {
  console.warn('⚠️ VITE_VAPID_PUBLIC_KEY not configured. Push notifications will not work.');
  console.warn('📖 See PUSH_NOTIFICATIONS_SETUP.md for setup instructions.');
}

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

export interface NotificationPermissionResult {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermissionResult {
  if (!isPushNotificationSupported()) {
    return { granted: false, denied: false, default: false };
  }

  const permission = Notification.permission;
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    default: permission === 'default',
  };
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers are not supported in this browser');
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration);

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
}

/**
 * Convert base64 VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported');
  }

  // Check permission
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.log('Notification permission denied');
    return null;
  }

  // Check if VAPID key is configured
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('VAPID public key not configured. Please set VITE_VAPID_PUBLIC_KEY in your .env file. See PUSH_NOTIFICATIONS_SETUP.md for instructions.');
  }

  try {
    // Register service worker
    const registration = await registerServiceWorker();

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscribe to push notifications
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });

      console.log('New push subscription created:', subscription);
    } else {
      console.log('Already subscribed to push notifications');
    }

    // Save subscription to database
    await savePushSubscription(subscription);

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    if (error instanceof Error && error.message.includes('VAPID')) {
      throw error;
    }
    throw new Error('Failed to subscribe to notifications. Please check browser console for details.');
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from push
      await subscription.unsubscribe();

      // Remove from database
      await removePushSubscription(subscription);

      console.log('Unsubscribed from push notifications');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    throw error;
  }
}

/**
 * Check if currently subscribed to push notifications
 */
export async function isSubscribedToPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('Error checking push subscription status:', error);
    return false;
  }
}

/**
 * Save push subscription to database
 */
async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Convert subscription to JSON
  const subscriptionJson = subscription.toJSON();

  if (!subscriptionJson.endpoint || !subscriptionJson.keys) {
    throw new Error('Invalid subscription object');
  }

  const subscriptionData: PushSubscriptionData = {
    endpoint: subscriptionJson.endpoint,
    p256dh: subscriptionJson.keys.p256dh || '',
    auth: subscriptionJson.keys.auth || '',
    userAgent: navigator.userAgent,
  };

  // Upsert subscription (insert or update if exists)
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.p256dh,
        auth: subscriptionData.auth,
        user_agent: subscriptionData.userAgent,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,endpoint',
      }
    );

  if (error) {
    console.error('Error saving push subscription:', error);
    throw error;
  }

  console.log('Push subscription saved to database');
}

/**
 * Remove push subscription from database
 */
async function removePushSubscription(subscription: PushSubscription): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const subscriptionJson = subscription.toJSON();
  const endpoint = subscriptionJson.endpoint;

  if (!endpoint) {
    return;
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);

  if (error) {
    console.error('Error removing push subscription:', error);
    throw error;
  }

  console.log('Push subscription removed from database');
}

/**
 * Get all push subscriptions for current user
 */
export async function getUserPushSubscriptions(): Promise<any[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching push subscriptions:', error);
    return [];
  }

  return data || [];
}

/**
 * Show a local notification (for testing)
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!isPushNotificationSupported()) {
    throw new Error('Notifications are not supported');
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    ...options,
  });
}

/**
 * Update app badge count
 */
export async function updateBadgeCount(count: number): Promise<void> {
  if ('setAppBadge' in navigator) {
    try {
      if (count > 0) {
        await (navigator as any).setAppBadge(count);
      } else {
        await (navigator as any).clearAppBadge();
      }
    } catch (error) {
      console.error('Error updating badge:', error);
    }
  }
}

/**
 * Clear app badge
 */
export async function clearBadge(): Promise<void> {
  await updateBadgeCount(0);
}

/**
 * Initialize push notifications
 * Call this when the app loads
 */
export async function initializePushNotifications(): Promise<void> {
  if (!isPushNotificationSupported()) {
    console.log('Push notifications not supported');
    return;
  }

  try {
    // Register service worker
    await registerServiceWorker();

    // Check if already subscribed
    const isSubscribed = await isSubscribedToPushNotifications();
    console.log('Push notification status:', isSubscribed ? 'subscribed' : 'not subscribed');

    // Set up service worker message listener
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'GET_UNREAD_COUNT') {
          // Send unread count to service worker
          // This is handled by the notification store/component
          const unreadCount = getUnreadNotificationCount();
          event.ports[0].postMessage({ count: unreadCount });
        }
      });
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
}

/**
 * Get unread notification count
 * This should be implemented based on your notification store
 */
function getUnreadNotificationCount(): number {
  // Import from giftNotifications store
  // This is handled by the store's message listener
  try {
    const { getUnreadCount } = require('./stores/giftNotifications');
    return getUnreadCount();
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

