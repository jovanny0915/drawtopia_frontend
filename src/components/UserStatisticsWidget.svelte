<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchUserStatistics, fetchUserStatisticsSummary, formatSubscriptionStatus, formatRole } from '$lib/api/userStatistics';
  import type { UserStatistics, UserStatisticsSummary } from '$lib/api/userStatistics';

  // Component props
  export let mode: 'summary' | 'detailed' = 'summary';
  export let autoRefresh: boolean = false;
  export let refreshInterval: number = 60000; // 60 seconds default

  // State
  let statistics: UserStatistics | null = null;
  let summary: UserStatisticsSummary | null = null;
  let loading = true;
  let error: string | null = null;
  let refreshTimer: number;

  // Load statistics on mount
  onMount(async () => {
    await loadStatistics();
    
    if (autoRefresh) {
      refreshTimer = window.setInterval(loadStatistics, refreshInterval);
    }
    
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  });

  async function loadStatistics() {
    try {
      loading = true;
      error = null;
      
      if (mode === 'summary') {
        summary = await fetchUserStatisticsSummary();
      } else {
        statistics = await fetchUserStatistics();
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load statistics';
      console.error('Error loading statistics:', err);
    } finally {
      loading = false;
    }
  }

  function formatNumber(num: number): string {
    return num.toLocaleString();
  }
</script>

<div class="user-statistics-widget">
  <div class="widget-header">
    <h3>User Statistics</h3>
    <button on:click={loadStatistics} disabled={loading} class="refresh-btn">
      {loading ? '⟳ Loading...' : '↻ Refresh'}
    </button>
  </div>

  {#if error}
    <div class="error-message">
      <p>❌ {error}</p>
    </div>
  {:else if loading && !summary && !statistics}
    <div class="loading">
      <p>Loading statistics...</p>
    </div>
  {:else if mode === 'summary' && summary}
    <!-- Summary View -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{formatNumber(summary.summary.total_users)}</div>
        <div class="stat-label">Total Users</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{formatNumber(summary.summary.active_users)}</div>
        <div class="stat-label">Active Users</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{formatNumber(summary.summary.new_users_24h)}</div>
        <div class="stat-label">New (24h)</div>
      </div>
    </div>
  {:else if mode === 'detailed' && statistics}
    <!-- Detailed View -->
    <div class="detailed-stats">
      <!-- Overview -->
      <div class="stats-section">
        <h4>Overview</h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{formatNumber(statistics.total_users)}</div>
            <div class="stat-label">Total Users</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{formatNumber(statistics.active_users.count)}</div>
            <div class="stat-label">Active Users</div>
            <div class="stat-sublabel">{statistics.active_users.percentage.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <!-- New Users -->
      <div class="stats-section">
        <h4>New Users</h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{formatNumber(statistics.new_users.daily)}</div>
            <div class="stat-label">Last 24 Hours</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{formatNumber(statistics.new_users.weekly)}</div>
            <div class="stat-label">Last 7 Days</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{formatNumber(statistics.new_users.monthly)}</div>
            <div class="stat-label">Last 30 Days</div>
          </div>
        </div>
      </div>

      <!-- By Role -->
      <div class="stats-section">
        <h4>Users by Role</h4>
        <div class="distribution-list">
          {#each Object.entries(statistics.by_role) as [role, count]}
            <div class="distribution-item">
              <span class="label">{formatRole(role)}</span>
              <span class="value">{formatNumber(count)}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- By Subscription -->
      <div class="stats-section">
        <h4>Users by Subscription</h4>
        <div class="distribution-list">
          {#each Object.entries(statistics.by_subscription_status) as [status, count]}
            <div class="distribution-item">
              <span class="label">{formatSubscriptionStatus(status)}</span>
              <span class="value">{formatNumber(count)}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Metadata -->
      <div class="metadata">
        <small>Last updated: {new Date(statistics.metadata.generated_at).toLocaleString()}</small>
      </div>
    </div>
  {/if}
</div>

<style>
  .user-statistics-widget {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .widget-header h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }

  .refresh-btn {
    padding: 8px 16px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .refresh-btn:hover:not(:disabled) {
    background: #45a049;
  }

  .refresh-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .error-message {
    padding: 15px;
    background: #ffebee;
    border-left: 4px solid #f44336;
    color: #c62828;
    border-radius: 4px;
  }

  .loading {
    text-align: center;
    padding: 40px;
    color: #666;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 6px;
    text-align: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #2196F3;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }

  .stat-sublabel {
    font-size: 0.8rem;
    color: #999;
    margin-top: 4px;
  }

  .detailed-stats {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .stats-section h4 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.2rem;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 8px;
  }

  .distribution-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .distribution-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .distribution-item .label {
    font-weight: 500;
    color: #333;
  }

  .distribution-item .value {
    font-weight: bold;
    color: #2196F3;
    font-size: 1.1rem;
  }

  .metadata {
    text-align: center;
    padding-top: 15px;
    border-top: 1px solid #e0e0e0;
    color: #999;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .widget-header {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }
  }
</style>

