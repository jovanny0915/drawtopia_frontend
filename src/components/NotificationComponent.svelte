<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { browser } from '$app/environment';
  import { getGiftsReceivedByUser, markGiftAsChecked, checkGiftNotificationAndAddCredit, type Gift } from '../lib/database/gifts';
  import { user, session } from '../lib/stores/auth';
  import { setGiftNotifications, removeGiftNotification, unreadCount, addGiftNotification } from '../lib/stores/giftNotifications';
  import { supabase } from '../lib/supabase';
  import giftIcon from '../assets/Gift.svg';
  import type { RealtimeChannel } from '@supabase/supabase-js';

  let notifications: Gift[] = [];
  let loading = true;
  let error = '';
  let showDropdown = false;
  let notificationElement: HTMLElement;
  let realtimeChannel: RealtimeChannel | null = null;
  let scheduledGiftTimers: Map<string, NodeJS.Timeout> = new Map();

  // Fetch notifications (gifts received by user) from Supabase
  const fetchNotifications = async () => {
    try {
      loading = true;
      error = '';
      
      const result = await getGiftsReceivedByUser();
      
      if (result.success && result.data) {
        const fetchedGifts = result.data as Gift[];
        notifications = fetchedGifts;
        // Update the store
        setGiftNotifications(notifications);
        
        // Schedule any gifts that are scheduled for future delivery
        // We need to check all unchecked gifts (including future ones) to set up timers
        const currentUser = get(user);
        const userEmailForSchedule = currentUser?.email?.toLowerCase().trim();
        if (userEmailForSchedule) {
          // Fetch all unchecked gifts for this user by delivery_email (including future scheduled ones)
          // to set up timers for scheduled gifts
          const { data: allGifts, error: allGiftsError } = await supabase
            .from('gifts')
            .select('*')
            .eq('delivery_email', userEmailForSchedule)
            .or('checked.is.null,checked.eq.false')
            .order('delivery_time', { ascending: true });
          
          if (!allGiftsError && allGifts) {
            allGifts.forEach((gift: Gift) => {
              // If gift is not yet deliverable, schedule it
              if (gift.delivery_time && !shouldShowGift(gift)) {
                scheduleGiftNotification(gift);
              }
            });
          }
        }
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

  // Handle notification item click: mark as checked, add 1 credit to recipient (to_user_id), then open gift page
  const handleNotificationClick = async (notification: Gift) => {
    if (!notification.id) {
      console.error('Notification item has no ID');
      return;
    }

    try {
      const accessToken = $session?.access_token;
      // Prefer backend API so recipient gets +1 credit when checking the notification
      if (accessToken) {
        const apiResult = await checkGiftNotificationAndAddCredit(notification.id, accessToken);
        if (apiResult.success) {
          if (apiResult.credit_added) {
            console.log('Gift checked and 1 credit added to recipient');
          }
          notifications = notifications.filter(n => n.id !== notification.id);
          removeGiftNotification(notification.id);
          showDropdown = false;
          const giftUrl = `/gift/recipient/gift1?giftId=${notification.id}`;
          if (browser) {
            window.open(giftUrl, '_blank', 'noopener,noreferrer');
          }
          return;
        }
      }
      // Fallback: mark as checked via Supabase only (no credit added)
      const result = await markGiftAsChecked(notification.id);
      if (result.success) {
        console.log('Successfully marked gift as checked');
      } else {
        console.error('Failed to mark gift as checked:', result.error);
      }
      notifications = notifications.filter(n => n.id !== notification.id);
      removeGiftNotification(notification.id);
      showDropdown = false;
      const giftUrl = `/gift/recipient/gift1?giftId=${notification.id}`;
      if (browser) {
        window.open(giftUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
      notifications = notifications.filter(n => n.id !== notification.id);
      removeGiftNotification(notification.id);
      showDropdown = false;
      const giftUrl = `/gift/recipient/gift1?giftId=${notification.id}`;
      if (browser) {
        window.open(giftUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Helper function to check if a gift is for the current user (by delivery_email only)
  const isGiftForUser = (gift: Gift, _userId: string, userEmail?: string): boolean => {
    return (
      userEmail !== undefined &&
      gift.delivery_email?.toLowerCase().trim() === userEmail.toLowerCase().trim()
    );
  };

  // Helper function to check if a gift should be shown (delivery time has passed and not checked)
  const shouldShowGift = (gift: Gift): boolean => {
    // Check if gift is not checked
    const isUnchecked = gift.checked === false || gift.checked === null || gift.checked === undefined;
    if (!isUnchecked) return false;
    
    // If no delivery_time, don't show
    if (!gift.delivery_time) return false;
    
    // Check if delivery_time has passed
    const deliveryDate = new Date(gift.delivery_time);
    const now = new Date();
    const isDeliverable = deliveryDate <= now;
    
    return isDeliverable;
  };

  // Schedule a gift to be shown at its delivery_time
  const scheduleGiftNotification = (gift: Gift) => {
    if (!browser || !gift.id || !gift.delivery_time) return;

    // Clear existing timer for this gift if any
    const existingTimer = scheduledGiftTimers.get(gift.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      scheduledGiftTimers.delete(gift.id);
    }

    const deliveryDate = new Date(gift.delivery_time);
    const now = new Date();
    const delay = deliveryDate.getTime() - now.getTime();

    // If delivery time has already passed, show immediately
    if (delay <= 0) {
      console.log('Gift delivery time has passed, showing immediately:', gift.id);
      if (shouldShowGift(gift)) {
        addGiftNotification(gift);
        fetchNotifications();
      }
      return;
    }

    // Schedule notification for future delivery
    const giftId = gift.id; // Store gift.id in a const for use in callback
    if (!giftId) return; // Type guard - ensure giftId is defined
    
    console.log(`Scheduling gift notification for ${giftId} at ${gift.delivery_time} (in ${Math.round(delay / 1000)}s)`);
    
    const timer = setTimeout(() => {
      console.log('Scheduled gift delivery time arrived:', giftId);
      scheduledGiftTimers.delete(giftId);
      
      // Re-check if gift should still be shown (might have been checked in the meantime)
      fetchNotifications().then(() => {
        // The fetchNotifications will update the list with current state
        // But we also want to trigger a real-time check
        const currentGift = notifications.find(n => n.id === giftId);
        if (currentGift && shouldShowGift(currentGift)) {
          addGiftNotification(currentGift);
        }
      });
    }, delay);

    scheduledGiftTimers.set(giftId, timer);
  };

  // Clean up scheduled timers
  const cleanupScheduledTimers = () => {
    scheduledGiftTimers.forEach((timer) => clearTimeout(timer));
    scheduledGiftTimers.clear();
  };

  // Set up real-time subscription for gift notifications
  const setupRealtimeSubscription = (userId: string, userEmail?: string) => {
    if (!browser) return;

    // Clean up existing subscription if any
    if (realtimeChannel) {
      console.log('Cleaning up existing real-time subscription');
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

    // Clean up scheduled timers
    cleanupScheduledTimers();

    console.log('Setting up real-time subscription for user:', userId, 'email:', userEmail);

    // Create a channel for gift notifications
    // We subscribe to all INSERT/UPDATE events and filter in the callback by delivery_email
    realtimeChannel = supabase
      .channel(`gift-notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gifts'
        },
        (payload) => {
          console.log('New gift inserted via real-time:', payload);
          const newGift = payload.new as Gift;
          
          // Check if gift is for this user
          if (!isGiftForUser(newGift, userId, userEmail)) {
            console.log('Gift not for this user (delivery_email):', newGift.delivery_email);
            return;
          }

          // Check if gift should be shown immediately or scheduled
          if (shouldShowGift(newGift)) {
            // Immediate gift - show notification right away
            console.log('Adding immediate gift notification:', newGift);
            addGiftNotification(newGift);
            fetchNotifications();
          } else if (newGift.delivery_time) {
            // Scheduled gift - schedule notification for delivery_time
            console.log('Scheduling gift notification for future delivery:', newGift.id);
            scheduleGiftNotification(newGift);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'gifts'
        },
        (payload) => {
          console.log('Gift updated via real-time:', payload);
          const updatedGift = payload.new as Gift;
          const oldGift = payload.old as Gift;
          
          // Check if this gift is for the current user
          if (!isGiftForUser(updatedGift, userId, userEmail)) {
            return;
          }
          
          // If gift was marked as checked, remove it from notifications
          if (updatedGift.checked === true && oldGift.checked !== true) {
            console.log('Gift marked as checked, removing from notifications');
            removeGiftNotification(updatedGift.id!);
            notifications = notifications.filter(n => n.id !== updatedGift.id);
            // Also clear any scheduled timer
            const timer = scheduledGiftTimers.get(updatedGift.id!);
            if (timer) {
              clearTimeout(timer);
              scheduledGiftTimers.delete(updatedGift.id!);
            }
          } else if (shouldShowGift(updatedGift)) {
            // Gift became deliverable (status changed to completed, delivery_time passed, etc.)
            const exists = notifications.some(n => n.id === updatedGift.id);
            if (!exists) {
              console.log('Gift became deliverable, adding to notifications:', updatedGift);
              addGiftNotification(updatedGift);
              fetchNotifications();
            }
          } else if (updatedGift.delivery_time && !shouldShowGift(updatedGift)) {
            // Delivery time might have been updated to a future time - reschedule
            scheduleGiftNotification(updatedGift);
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time gift notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error');
          error = 'Failed to connect to real-time notifications';
        }
      });

    return realtimeChannel;
  };

  onMount(() => {
    // Fetch notifications when component mounts
    if ($user?.id) {
      fetchNotifications();
      // Set up real-time subscription with user email for matching
      setupRealtimeSubscription($user.id, $user.email);
    }

    // Listen for user changes
    const unsubscribe = user.subscribe(($user) => {
      if ($user?.id) {
        fetchNotifications().then(() => {
          // After fetching, check for any scheduled gifts that need timers
          notifications.forEach((gift) => {
            if (gift.delivery_time && !shouldShowGift(gift)) {
              scheduleGiftNotification(gift);
            }
          });
        });
        // Set up real-time subscription for new user with email
        setupRealtimeSubscription($user.id, $user.email);
      } else {
        // Clean up subscription when user logs out
        if (realtimeChannel) {
          console.log('User logged out, cleaning up real-time subscription');
          supabase.removeChannel(realtimeChannel);
          realtimeChannel = null;
        }
        cleanupScheduledTimers();
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
      // Clean up real-time subscription
      if (realtimeChannel) {
        console.log('Component unmounting, cleaning up real-time subscription');
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
      if (browser) {
        document.removeEventListener('click', handleClickOutside);
      }
    };
  });

  onDestroy(() => {
    // Clean up real-time subscription
    if (realtimeChannel) {
      console.log('Component destroying, cleaning up real-time subscription');
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
    // Clean up scheduled timers
    cleanupScheduledTimers();
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
