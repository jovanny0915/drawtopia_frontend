<script lang="ts">
  import { onMount } from 'svelte';
  import {
    isPushNotificationSupported,
    getNotificationPermissionStatus,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    isSubscribedToPushNotifications,
    showLocalNotification,
    getUserPushSubscriptions,
  } from '$lib/pushNotifications';
  import PrimaryBtn from './PrimaryBtn.svelte';
  import OutlineBtn from './OutlineBtn.svelte';

  export let compact = false;

  let supported = false;
  let permission = { granted: false, denied: false, default: true };
  let subscribed = false;
  let loading = false;
  let error = '';
  let subscriptions: any[] = [];
  let showDevices = false;

  onMount(async () => {
    supported = isPushNotificationSupported();
    if (supported) {
      permission = getNotificationPermissionStatus();
      try {
        subscribed = await isSubscribedToPushNotifications();
        if (subscribed) {
          subscriptions = await getUserPushSubscriptions();
        }
      } catch (err) {
        console.error('Error checking subscription status:', err);
        subscribed = false;
        subscriptions = [];
        // Don't show error on mount - only show when user tries to interact
      }
    }
  });

  async function handleSubscribe() {
    loading = true;
    error = '';

    try {
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        subscribed = true;
        subscriptions = await getUserPushSubscriptions();
        
        // Show test notification
        await showLocalNotification('Notifications Enabled! 🎉', {
          body: 'You will now receive gift notifications',
          icon: '/icon-192.png',
          badge: '/badge-72.png',
        });
      } else {
        error = 'Please allow notifications in your browser settings';
      }
    } catch (err) {
      console.error('Error subscribing:', err);
      error = err instanceof Error ? err.message : 'Failed to enable notifications';
    } finally {
      loading = false;
    }
  }

  async function handleUnsubscribe() {
    loading = true;
    error = '';

    try {
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        subscribed = false;
        subscriptions = [];
      }
    } catch (err) {
      console.error('Error unsubscribing:', err);
      error = err instanceof Error ? err.message : 'Failed to disable notifications';
    } finally {
      loading = false;
    }
  }

  async function sendTestNotification() {
    try {
      await showLocalNotification('Test Notification 🎁', {
        body: 'This is how gift notifications will look!',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        requireInteraction: false,
      });
    } catch (err) {
      console.error('Error showing test notification:', err);
      error = 'Failed to show test notification';
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getBrowserName(userAgent: string): string {
    if (userAgent.includes('Chrome')) return '🌐 Chrome';
    if (userAgent.includes('Firefox')) return '🦊 Firefox';
    if (userAgent.includes('Safari')) return '🧭 Safari';
    if (userAgent.includes('Edge')) return '🌊 Edge';
    return '🌐 Browser';
  }
</script>

{#if !supported}
  <div class="not-supported" class:compact>
    <p class="icon">🔔</p>
    <p class="message">Push notifications are not supported in this browser.</p>
    <p class="hint">Try using Chrome, Firefox, or Safari on a supported device.</p>
  </div>
{:else if permission.denied}
  <div class="denied" class:compact>
    <p class="icon">🔕</p>
    <p class="message">Notifications are blocked</p>
    <p class="hint">
      Please enable notifications in your browser settings to receive gift alerts.
    </p>
  </div>
{:else}
  <div class="settings" class:compact>
    {#if !compact}
      <div class="header">
        <h3>🔔 Push Notifications</h3>
        <p>Get notified when you receive gift stories</p>
      </div>
    {/if}

    <div class="status">
      {#if subscribed}
        <div class="status-badge enabled">
          <span class="dot"></span>
          <span>Notifications Enabled</span>
        </div>
      {:else}
        <div class="status-badge disabled">
          <span class="dot"></span>
          <span>Notifications Disabled</span>
        </div>
      {/if}
    </div>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    <div class="actions">
      {#if subscribed}
        <OutlineBtn 
          onClick={handleUnsubscribe} 
          isLoading={loading}
          text="Disable Notifications"
          spinner_name="Processing..."
        />
        <button class="test-btn" on:click={sendTestNotification}>
          Send Test Notification
        </button>
      {:else}
        <PrimaryBtn 
          onClick={handleSubscribe} 
          isLoading={loading}
          text="Enable Notifications"
          spinner_name="Enabling..."
        />
      {/if}
    </div>

    {#if subscribed && subscriptions.length > 0 && !compact}
      <div class="devices-section">
        <button class="devices-toggle" on:click={() => (showDevices = !showDevices)}>
          <span>Your Devices ({subscriptions.length})</span>
          <span class="arrow" class:open={showDevices}>▼</span>
        </button>

        {#if showDevices}
          <div class="devices-list">
            {#each subscriptions as subscription}
              <div class="device-item">
                <div class="device-info">
                  <p class="device-name">{getBrowserName(subscription.user_agent || '')}</p>
                  <p class="device-date">
                    Added {formatDate(subscription.created_at)}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .not-supported,
  .denied,
  .settings {
    padding: 1.5rem;
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .not-supported.compact,
  .denied.compact,
  .settings.compact {
    padding: 1rem;
  }

  .icon {
    font-size: 3rem;
    margin: 0 0 1rem 0;
    text-align: center;
  }

  .message {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.5rem 0;
    text-align: center;
  }

  .hint {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
    text-align: center;
  }

  .header {
    margin-bottom: 1.5rem;
  }

  .header h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
    color: #333;
  }

  .header p {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
  }

  .status {
    margin-bottom: 1rem;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .status-badge.enabled {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .status-badge.disabled {
    background: #fafafa;
    color: #666;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .error {
    padding: 0.75rem;
    background: #ffebee;
    color: #c62828;
    border-radius: 8px;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .test-btn {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: 1px solid #ddd;
    border-radius: 8px;
    color: #666;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .test-btn:hover {
    background: #f5f5f5;
    border-color: #bbb;
  }

  .devices-section {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }

  .devices-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.75rem;
    background: #f8f8f8;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    color: #333;
    transition: background 0.2s;
  }

  .devices-toggle:hover {
    background: #f0f0f0;
  }

  .arrow {
    transition: transform 0.2s;
    font-size: 0.8rem;
    color: #666;
  }

  .arrow.open {
    transform: rotate(180deg);
  }

  .devices-list {
    margin-top: 0.75rem;
  }

  .device-item {
    padding: 0.75rem;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .device-item:last-child {
    margin-bottom: 0;
  }

  .device-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .device-name {
    margin: 0;
    font-weight: 500;
    color: #333;
  }

  .device-date {
    margin: 0;
    font-size: 0.85rem;
    color: #999;
  }

  @media (max-width: 768px) {
    .actions {
      flex-direction: column;
      width: 100%;
    }

    .actions :global(button),
    .test-btn {
      width: 100%;
    }

    .device-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }
  }
</style>

