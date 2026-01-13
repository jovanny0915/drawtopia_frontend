<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { getGiftsReceivedByUser, markGiftAsChecked, type Gift } from '../lib/database/gifts';
  import { user } from '../lib/stores/auth';
  import { setGiftNotifications, removeGiftNotification, unreadCount } from '../lib/stores/giftNotifications';
  import { initializePushNotifications, updateBadgeCount } from '../lib/pushNotifications';
  import giftIcon from '../assets/Gift.svg';

  let notifications: Gift[] = [];
  let loading = true;
  let error = '';
  let showDropdown = false;
  let notificationElement: HTMLElement;

  // Fetch notifications (gifts received by user) from Supabase
  const fetchNotifications = async () => {
    try {
      loading = true;
      error = '';
      
      const result = await getGiftsReceivedByUser();
      
      if (result.success && result.data) {
        notifications = result.data as Gift[];
        // Update the store
        setGiftNotifications(notifications);
      } else {
        error = result.error || 'Failed to fetch notifications';
        notifications = [];
        setGiftNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      error = 'An unexpected error occurred while fetching notifications';
      notifications = [];
      setGiftNotifications([]);
    } finally {
      loading = false;
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    showDropdown = !showDropdown;
    if (showDropdown) {
      fetchNotifications();
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (notificationElement && !notificationElement.contains(event.target as Node)) {
      showDropdown = false;
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981'; // green
      case 'generating':
        return '#f59e0b'; // amber
      case 'failed':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handle notification item click
  const handleNotificationClick = async (notification: Gift) => {
    if (!notification.id) {
      console.error('Notification item has no ID');
      return;
    }

    try {
      // Mark gift as checked in database
      console.log('Marking gift as checked:', notification.id);
      const result = await markGiftAsChecked(notification.id);
      
      if (result.success) {
        console.log('Successfully marked gift as checked');
        // Remove from local list immediately for better UX
        notifications = notifications.filter(n => n.id !== notification.id);
        // Update store
        removeGiftNotification(notification.id);
      } else {
        console.error('Failed to mark gift as checked:', result.error);
        // Still remove from list even if update fails
        notifications = notifications.filter(n => n.id !== notification.id);
        removeGiftNotification(notification.id);
      }
      
      // Close dropdown
      showDropdown = false;
      
      // Open gift detail page in a new tab
      const giftUrl = `/gift/recipient/gift1?giftId=${notification.id}`;
      if (browser) {
        window.open(giftUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
      // Remove from list even if there's an error
      notifications = notifications.filter(n => n.id !== notification.id);
      removeGiftNotification(notification.id);
      showDropdown = false;
      
      // Still open in new tab even if marking as checked fails
      const giftUrl = `/gift/recipient/gift1?giftId=${notification.id}`;
      if (browser) {
        window.open(giftUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  onMount(() => {
    // Initialize push notifications
    if (browser) {
      initializePushNotifications().catch(err => {
        console.error('Failed to initialize push notifications:', err);
      });

      // Set up service worker message listener for push notifications
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'NOTIFICATION_RECEIVED') {
            console.log('Received push notification, refreshing notifications...');
            fetchNotifications();
          }
        });
      }
    }

    // Fetch notifications when component mounts
    if ($user?.id) {
      fetchNotifications();
    }

    // Listen for user changes
    const unsubscribe = user.subscribe(($user) => {
      if ($user?.id) {
        fetchNotifications();
      } else {
        notifications = [];
        setGiftNotifications([]);
        loading = false;
      }
    });

    // Add click outside listener
    if (browser) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      unsubscribe();
      if (browser) {
        document.removeEventListener('click', handleClickOutside);
      }
    };
  });

  onDestroy(() => {
    if (browser) {
      document.removeEventListener('click', handleClickOutside);
    }
  });

  // Use unreadCount from store
  $: currentUnreadCount = $unreadCount;

  // Get notification badge count display
  $: badgeCount = currentUnreadCount > 99 ? '99+' : currentUnreadCount.toString();
</script>

<div class="notification-container" bind:this={notificationElement}>
  <button
    class="notification-button"
    on:click={toggleDropdown}
    on:keydown={(e) => e.key === 'Enter' && toggleDropdown()}
    aria-label="Notifications"
    aria-expanded={showDropdown}
  >
    <svg
      class="bell-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    {#if currentUnreadCount > 0}
      <span class="notification-badge">{badgeCount}</span>
    {/if}
  </button>

  {#if showDropdown}
    <div class="notification-dropdown">
      <div class="dropdown-header">
        <h3 class="dropdown-title">Notifications</h3>
        <button
          class="close-button"
          on:click={() => showDropdown = false}
          aria-label="Close notifications"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5l10 10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
      
      <div class="dropdown-content">
        {#if loading}
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        {:else if error}
          <div class="error-state">
            <p class="error-text">{error}</p>
            <button class="retry-button" on:click={fetchNotifications}>
              Try Again
            </button>
          </div>
        {:else if notifications.length === 0}
          <div class="empty-state">
            <svg
              class="empty-icon"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p class="empty-text">No notifications</p>
            <p class="empty-subtext">You're all caught up!</p>
          </div>
        {:else}
          <div class="notifications-list">
            {#each notifications as notification (notification.id)}
              <div 
                class="notification-item"
                on:click={() => handleNotificationClick(notification)}
                on:keydown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
                role="button"
                tabindex="0"
              >
                <div class="notification-icon">
                  <img src={giftIcon} alt="Gift" class="gift-icon-img" />
                </div>
                <div class="notification-content">
                  <div class="notification-header">
                    <span class="notification-title">
                      Gift for {notification.child_name}
                    </span>
                    <span
                      class="status-badge"
                      style="background-color: {getStatusColor(notification.status)}"
                    >
                      {formatStatus(notification.status)}
                    </span>
                  </div>
                  <p class="notification-message">
                    {notification.occasion} • {notification.relationship}
                  </p>
                  {#if notification.special_msg}
                    <p class="notification-special-message">
                      "{notification.special_msg}"
                    </p>
                  {/if}
                  <div class="notification-footer">
                    <span class="notification-date">
                      {formatDate(notification.created_at)}
                    </span>
                    {#if notification.delivery_time}
                      <span class="delivery-time">
                        Delivery: {formatDate(notification.delivery_time)}
                      </span>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .notification-container {
    position: relative;
    display: inline-block;
  }

  .notification-button {
    position: relative;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: background-color 0.2s;
    color: #666d80;
  }

  .notification-button:hover {
    background-color: #f8fafb;
  }

  .notification-button:focus {
    outline: 2px solid #438bff;
    outline-offset: 2px;
  }

  .bell-icon {
    width: 24px;
    height: 24px;
  }

  .notification-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    background: #ef4444;
    color: white;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 600;
    font-family: Quicksand;
    min-width: 18px;
    text-align: center;
    line-height: 14px;
  }

  .notification-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 400px;
    max-width: 90vw;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    max-height: 600px;
    border: 1px solid #e2e8f0;
  }

  .dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  .dropdown-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    font-family: Quicksand;
    color: #121212;
  }

  .close-button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666d80;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background-color: #f8fafb;
  }

  .dropdown-content {
    overflow-y: auto;
    flex: 1;
    max-height: 500px;
  }

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-text {
    color: #dc2626;
    font-size: 14px;
    font-family: Quicksand;
    margin-bottom: 12px;
  }

  .retry-button {
    padding: 8px 16px;
    background: #438bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .retry-button:hover {
    background: #3b7ce6;
  }

  .empty-icon {
    color: #90a1b9;
    margin-bottom: 12px;
  }

  .empty-text {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    margin: 0 0 4px 0;
  }

  .empty-subtext {
    color: #90a1b9;
    font-size: 14px;
    font-family: Quicksand;
    margin: 0;
  }

  .notifications-list {
    padding: 8px 0;
  }

  .notification-item {
    display: flex;
    padding: 12px 20px;
    gap: 12px;
    border-bottom: 1px solid #f1f5f9;
    transition: background-color 0.2s;
    cursor: pointer;
  }

  .notification-item:hover {
    background-color: #f8fafb;
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notification-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    background: #eef6ff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gift-icon-img {
    width: 24px;
    height: 24px;
  }

  .notification-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .notification-title {
    font-size: 14px;
    font-weight: 600;
    font-family: Quicksand;
    color: #121212;
    flex: 1;
  }

  .status-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
    font-family: Quicksand;
    color: white;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .notification-message {
    font-size: 13px;
    color: #666d80;
    font-family: Quicksand;
    margin: 0;
  }

  .notification-special-message {
    font-size: 12px;
    color: #438bff;
    font-family: Quicksand;
    font-style: italic;
    margin: 4px 0 0 0;
    padding-left: 8px;
    border-left: 2px solid #eef6ff;
  }

  .notification-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .notification-date,
  .delivery-time {
    font-size: 11px;
    color: #90a1b9;
    font-family: Quicksand;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .notification-dropdown {
      width: 100vw;
      max-width: 100vw;
      right: -20px;
      border-radius: 0;
      max-height: 80vh;
    }

    .notification-item {
      padding: 16px 20px;
    }
  }
</style>
