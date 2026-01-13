<script lang="ts">
  import { notifications, removeNotification } from '$lib/stores/notification';
  import type { Notification } from '$lib/stores/notification';

  function getIconForType(type: Notification['type']) {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  }

  function getColorForType(type: Notification['type']) {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
      default:
        return '#3b82f6';
    }
  }
</script>

<div class="notification-container">
  {#each $notifications as notification (notification.id)}
    <div 
      class="notification" 
      style="border-left-color: {getColorForType(notification.type)}"
    >
      <div class="notification-content">
        <span class="notification-icon">
          {getIconForType(notification.type)}
        </span>
        <span class="notification-message">
          {notification.message}
        </span>
      </div>
      <button 
        class="notification-close" 
        on:click={() => removeNotification(notification.id)}
      >
        ×
      </button>
    </div>
  {/each}
</div>

<style>
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
  }

  .notification {
    background: white;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    animation: slideIn 0.3s ease-out;
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .notification-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .notification-message {
    font-family: 'Quicksand', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    line-height: 1.4;
  }

  .notification-close {
    background: none;
    border: none;
    font-size: 20px;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    margin-left: 12px;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .notification-close:hover {
    background: #f3f4f6;
    color: #374151;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    .notification-container {
      top: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
    }
  }
</style>
