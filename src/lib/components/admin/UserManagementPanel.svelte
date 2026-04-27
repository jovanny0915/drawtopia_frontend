<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, RotateCcw, Eye, X, Users } from 'lucide-svelte';
  import {
    getUsers,
    getUserDetail,
    type AdminUser,
    type AdminUserDetail,
    type AdminUserListFilters
  } from '$lib/api/admin';

  const ACCOUNT_TYPE_OPTIONS = [
    { value: '', label: 'All account types' },
    { value: 'parent', label: 'Parent' },
    { value: 'admin', label: 'Admin' },
    { value: 'guest', label: 'Guest' }
  ];

  const SUBSCRIPTION_OPTIONS = [
    { value: '', label: 'All subscriptions' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'trial', label: 'Trial' }
  ];

  let users: AdminUser[] = [];
  let loading = true;
  let error = '';
  let filters: AdminUserListFilters = {
    search: '',
    account_type: '',
    subscription_status: '',
    registered_from: '',
    registered_to: '',
    story_count_min: undefined,
    story_count_max: undefined
  };

  let selectedUser: AdminUserDetail | null = null;
  let detailLoading = false;
  let detailError = '';
  let showDetailModal = false;

  onMount(async () => {
    await loadUsers();
  });

  async function loadUsers() {
    loading = true;
    error = '';

    const response = await getUsers(filters);

    if (!response.success) {
      error = response.error ?? 'Failed to load users';
      users = [];
    } else {
      users = response.data ?? [];
    }

    loading = false;
  }

  async function applyFilters() {
    await loadUsers();
  }

  async function resetFilters() {
    filters = {
      search: '',
      account_type: '',
      subscription_status: '',
      registered_from: '',
      registered_to: '',
      story_count_min: undefined,
      story_count_max: undefined
    };

    await loadUsers();
  }

  async function openUserDetail(userId: string) {
    showDetailModal = true;
    detailLoading = true;
    detailError = '';
    selectedUser = null;

    const response = await getUserDetail(userId);

    if (!response.success || !response.data) {
      detailError = response.error ?? 'Failed to load user details';
    } else {
      selectedUser = response.data;
    }

    detailLoading = false;
  }

  function closeUserDetail() {
    showDetailModal = false;
    detailLoading = false;
    detailError = '';
    selectedUser = null;
  }

  function formatDate(value?: string | null): string {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  }

  function formatName(user: AdminUser): string {
    return user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || '-';
  }

  function formatLabel(value?: string | null): string {
    if (!value) return '-';

    return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatCurrency(value: unknown): string {
    if (typeof value !== 'number') return '-';
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  }

  function getRecordEntries(record: Record<string, unknown>): Array<[string, unknown]> {
    return Object.entries(record).filter(([, value]) => value !== null && value !== undefined && value !== '');
  }

  function formatRecordValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'string') return value;

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  function handleRowKeydown(event: KeyboardEvent, userId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void openUserDetail(userId);
    }
  }
</script>

<div class="user-management-panel">
  <div class="page-header">
    <div>
      <h1>User Management</h1>
      <p>Search, filter, and inspect platform users.</p>
    </div>
  </div>

  <section class="filter-card">
    <div class="filter-grid">
      <label class="field search-field">
        <span>Search</span>
        <div class="search-input">
          <Search size={16} />
          <input
            type="text"
            bind:value={filters.search}
            placeholder="Email or name"
            on:keydown={(event) => event.key === 'Enter' && applyFilters()}
          />
        </div>
      </label>

      <label class="field">
        <span>Account type</span>
        <select bind:value={filters.account_type}>
          {#each ACCOUNT_TYPE_OPTIONS as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span>Subscription</span>
        <select bind:value={filters.subscription_status}>
          {#each SUBSCRIPTION_OPTIONS as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span>Registered from</span>
        <input type="date" bind:value={filters.registered_from} />
      </label>

      <label class="field">
        <span>Registered to</span>
        <input type="date" bind:value={filters.registered_to} />
      </label>

      <label class="field">
        <span>Min stories</span>
        <input
          type="number"
          min="0"
          bind:value={filters.story_count_min}
          placeholder="0"
        />
      </label>

      <label class="field">
        <span>Max stories</span>
        <input
          type="number"
          min="0"
          bind:value={filters.story_count_max}
          placeholder="100"
        />
      </label>
    </div>

    <div class="filter-actions">
      <button class="secondary-btn" on:click={resetFilters}>
        <RotateCcw size={16} />
        Reset
      </button>
      <button class="primary-btn" on:click={applyFilters}>
        <Search size={16} />
        Apply Filters
      </button>
    </div>
  </section>

  {#if loading}
    <div class="state-card">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>
  {:else if error}
    <div class="state-card error">
      <p>{error}</p>
    </div>
  {:else if users.length === 0}
    <div class="state-card">
      <p>No users matched the current filters.</p>
    </div>
  {:else}
    <div class="table-card">
      <table class="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Account</th>
            <th>Subscription</th>
            <th>Stories</th>
            <th>Children</th>
            <th>Created</th>
            <th>Last login</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each users as item}
            <tr
              on:click={() => openUserDetail(item.id)}
              on:keydown={(event) => handleRowKeydown(event, item.id)}
              tabindex="0"
              role="button"
            >
              <td>
                <div class="primary-cell">{item.email}</div>
                <div class="secondary-cell">{formatName(item)}</div>
              </td>
              <td>{formatLabel(item.role)}</td>
              <td>{formatLabel(item.account_type)}</td>
              <td>{formatLabel(item.subscription_status)}</td>
              <td>{item.total_stories_created ?? item.story_count ?? 0}</td>
              <td>{item.child_count ?? 0}</td>
              <td>{formatDate(item.registration_date ?? item.created_at)}</td>
              <td>{formatDate(item.last_login)}</td>
              <td>
                <button class="row-action" on:click|stopPropagation={() => openUserDetail(item.id)}>
                  <Eye size={16} />
                  View
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

{#if showDetailModal}
  <div
    class="modal-overlay"
    on:click={closeUserDetail}
    on:keydown={(event) => event.key === 'Escape' && closeUserDetail()}
    role="button"
    tabindex="-1"
  >
    <div
      class="modal-shell"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="modal-header">
        <div>
          <p class="eyebrow">User Detail</p>
          <h2>{selectedUser?.account_information?.email ?? 'Loading user...'}</h2>
        </div>
        <button class="close-btn" on:click={closeUserDetail} aria-label="Close user detail">
          <X size={20} />
        </button>
      </div>

      {#if detailLoading}
        <div class="state-card">
          <div class="spinner"></div>
          <p>Loading user details...</p>
        </div>
      {:else if detailError}
        <div class="state-card error">
          <p>{detailError}</p>
        </div>
      {:else if selectedUser}
        <div class="modal-body">
          <section class="summary-grid">
            <article class="summary-card">
              <div class="summary-icon"><Users size={18} /></div>
              <div>
                <div class="summary-label">Role</div>
                <div class="summary-value">{formatLabel(selectedUser.account_information.role as string)}</div>
              </div>
            </article>
            <article class="summary-card">
              <div class="summary-icon"><Search size={18} /></div>
              <div>
                <div class="summary-label">Subscription</div>
                <div class="summary-value">{formatLabel(selectedUser.account_information.subscription_status as string)}</div>
              </div>
            </article>
            <article class="summary-card">
              <div class="summary-icon"><Eye size={18} /></div>
              <div>
                <div class="summary-label">Credit</div>
                <div class="summary-value">{selectedUser.account_information.credit ?? 0}</div>
              </div>
            </article>
            <article class="summary-card">
              <div class="summary-icon"><RotateCcw size={18} /></div>
              <div>
                <div class="summary-label">Total paid</div>
                <div class="summary-value">{formatCurrency(selectedUser.account_information.total_amount_paid)}</div>
              </div>
            </article>
          </section>

          <section class="detail-section">
            <h3>Account Information</h3>
            <div class="detail-grid">
              {#each getRecordEntries(selectedUser.account_information) as [key, value]}
                <article class="detail-card">
                  <div class="detail-key">{formatLabel(key)}</div>
                  <div class="detail-value">{formatRecordValue(value)}</div>
                </article>
              {/each}
            </div>
          </section>

          <section class="detail-section">
            <h3>Characters ({selectedUser.characters.length})</h3>
            {#if selectedUser.characters.length > 0}
              <div class="record-list">
                {#each selectedUser.characters as record}
                  <article class="record-card">
                    {#each getRecordEntries(record).slice(0, 8) as [key, value]}
                      <div><strong>{formatLabel(key)}:</strong> {formatRecordValue(value)}</div>
                    {/each}
                  </article>
                {/each}
              </div>
            {:else}
              <div class="empty-card">No character records found.</div>
            {/if}
          </section>

          <section class="detail-section">
            <h3>Story Library ({selectedUser.story_library.length})</h3>
            {#if selectedUser.story_library.length > 0}
              <div class="record-list">
                {#each selectedUser.story_library as record}
                  <article class="record-card">
                    {#each getRecordEntries(record).slice(0, 8) as [key, value]}
                      <div><strong>{formatLabel(key)}:</strong> {formatRecordValue(value)}</div>
                    {/each}
                  </article>
                {/each}
              </div>
            {:else}
              <div class="empty-card">No saved stories found.</div>
            {/if}
          </section>

          <section class="detail-section">
            <h3>Payment History ({selectedUser.payment_history.length})</h3>
            {#if selectedUser.payment_history.length > 0}
              <div class="record-list">
                {#each selectedUser.payment_history as record}
                  <article class="record-card">
                    {#each getRecordEntries(record).slice(0, 8) as [key, value]}
                      <div><strong>{formatLabel(key)}:</strong> {formatRecordValue(value)}</div>
                    {/each}
                  </article>
                {/each}
              </div>
            {:else}
              <div class="empty-card">No payment history found.</div>
            {/if}
          </section>

          <section class="detail-section">
            <h3>Generation History ({selectedUser.generation_history.length})</h3>
            {#if selectedUser.generation_history.length > 0}
              <div class="record-list">
                {#each selectedUser.generation_history as record}
                  <article class="record-card">
                    {#each getRecordEntries(record).slice(0, 8) as [key, value]}
                      <div><strong>{formatLabel(key)}:</strong> {formatRecordValue(value)}</div>
                    {/each}
                  </article>
                {/each}
              </div>
            {:else}
              <div class="empty-card">No generation history found.</div>
            {/if}
          </section>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .user-management-panel {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .page-header h1 {
    margin: 0;
    font-size: 2rem;
    color: #0f172a;
  }

  .page-header p {
    margin: 0.35rem 0 0;
    color: #475569;
  }

  .filter-card,
  .table-card,
  .state-card,
  .summary-card,
  .detail-card,
  .record-card,
  .empty-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  }

  .filter-card {
    padding: 1rem;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .search-field {
    grid-column: span 2;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    font-size: 0.9rem;
    color: #334155;
    font-weight: 600;
  }

  .field input,
  .field select {
    width: 100%;
    min-height: 2.75rem;
    border-radius: 0.75rem;
    border: 1px solid #cbd5e1;
    padding: 0.7rem 0.9rem;
    font-size: 0.95rem;
    color: #0f172a;
    background: #ffffff;
  }

  .search-input {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.75rem;
    padding: 0 0.85rem;
    min-height: 2.75rem;
  }

  .search-input input {
    border: none;
    padding: 0;
    min-height: auto;
  }

  .search-input input:focus,
  .field input:focus,
  .field select:focus {
    outline: none;
  }

  .filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .primary-btn,
  .secondary-btn,
  .row-action,
  .close-btn {
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
  }

  .primary-btn,
  .secondary-btn,
  .row-action {
    padding: 0.72rem 1rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    transition: transform 0.2s ease;
  }

  .primary-btn {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
    color: #ffffff;
  }

  .secondary-btn {
    background: #f1f5f9;
    color: #334155;
  }

  .row-action {
    background: #eff6ff;
    color: #1d4ed8;
    padding: 0.55rem 0.85rem;
  }

  .primary-btn:hover,
  .secondary-btn:hover,
  .row-action:hover {
    transform: translateY(-1px);
  }

  .table-card {
    overflow: hidden;
  }

  .users-table {
    width: 100%;
    border-collapse: collapse;
  }

  .users-table thead {
    background: #f8fafc;
  }

  .users-table th,
  .users-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }

  .users-table tbody tr {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .users-table tbody tr:hover,
  .users-table tbody tr:focus {
    background: #f8fbff;
    outline: none;
  }

  .primary-cell {
    font-weight: 600;
    color: #0f172a;
  }

  .secondary-cell {
    margin-top: 0.25rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .state-card {
    text-align: center;
    padding: 2.4rem 1.5rem;
    color: #475569;
  }

  .state-card.error {
    color: #b91c1c;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    border: 3px solid #dbeafe;
    border-top-color: #2563eb;
    margin: 0 auto 0.85rem;
    animation: spin 0.8s linear infinite;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    justify-content: center;
    align-items: stretch;
    padding: 1.5rem;
    z-index: 2100;
  }

  .modal-shell {
    width: min(1160px, 100%);
    background: #f8fafc;
    border-radius: 1rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    box-shadow: 0 30px 60px rgba(15, 23, 42, 0.28);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
  }

  .eyebrow {
    margin: 0 0 0.3rem;
    color: #2563eb;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .modal-header h2 {
    margin: 0;
    color: #0f172a;
    font-size: 1.5rem;
  }

  .close-btn {
    width: 2.5rem;
    height: 2.5rem;
    background: #ffffff;
    color: #475569;
    border: 1px solid #dbe3f0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .modal-body {
    overflow: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .summary-grid,
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }

  .summary-card {
    display: flex;
    gap: 0.9rem;
    padding: 1rem;
  }

  .summary-icon {
    width: 2.35rem;
    height: 2.35rem;
    border-radius: 0.75rem;
    background: #eff6ff;
    color: #2563eb;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .summary-label,
  .detail-key {
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .summary-value,
  .detail-value {
    margin-top: 0.3rem;
    color: #0f172a;
    font-weight: 600;
    line-height: 1.4;
    word-break: break-word;
  }

  .detail-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .detail-section h3 {
    margin: 0;
    color: #0f172a;
  }

  .detail-card,
  .record-card,
  .empty-card {
    padding: 1rem;
  }

  .record-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .record-card {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    color: #334155;
    line-height: 1.5;
  }

  .empty-card {
    color: #64748b;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 960px) {
    .table-card {
      overflow-x: auto;
    }

    .users-table {
      min-width: 1080px;
    }

    .search-field {
      grid-column: span 1;
    }

    .modal-overlay {
      padding: 0.75rem;
    }
  }
</style>
