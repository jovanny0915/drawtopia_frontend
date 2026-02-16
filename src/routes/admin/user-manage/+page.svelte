<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    type AdminUser
  } from '$lib/api/admin';
  import { Users, Plus, Pencil, Trash2, X } from 'lucide-svelte';

  let users: AdminUser[] = [];
  let loading = true;
  let error = '';
  let saving = false;
  let deletingId = '';

  let showUserModal = false;
  let editingUserId: string | null = null;

  let formEmail = '';
  let formFirstName = '';
  let formLastName = '';
  let formRole = 'user';
  let formSubscriptionStatus = '';
  let formCredit = 0;

  type SortKey = 'user' | 'role' | 'subscription' | 'credit' | 'created';
  type SortDirection = 'asc' | 'desc';
  let sortKey: SortKey = 'created';
  let sortDirection: SortDirection = 'desc';
  let pageSize = 5;
  const pageSizeOptions = [5, 10, 15, 20];
  let currentPage = 1;
  let failedAvatarUserIds = new Set<string>();

  onMount(async () => {
    await loadUsers();
  });

  async function loadUsers() {
    loading = true;
    error = '';
    const result = await getUsers();
    if (!result.success || result.error) {
      error = result.error || 'Failed to load users';
      users = [];
    } else {
      users = result.data ?? [];
      failedAvatarUserIds = new Set<string>();
    }
    loading = false;
  }

  function openAddModal() {
    editingUserId = null;
    formEmail = '';
    formFirstName = '';
    formLastName = '';
    formRole = 'user';
    formSubscriptionStatus = '';
    formCredit = 0;
    showUserModal = true;
  }

  function openEditModal(user: AdminUser) {
    editingUserId = user.id;
    formEmail = user.email || '';
    formFirstName = user.first_name || '';
    formLastName = user.last_name || '';
    formRole = user.role || 'user';
    formSubscriptionStatus = user.subscription_status || '';
    formCredit = Math.max(0, user.credit || 0);
    showUserModal = true;
  }

  function closeModal() {
    showUserModal = false;
  }

  function formatCreatedAt(value?: string | null) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  }

  function getDisplayName(user: AdminUser) {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || 'No name';
  }

  function getUserInitials(user: AdminUser) {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    if (fullName) {
      const nameParts = fullName.split(/\s+/).filter(Boolean);
      return nameParts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('');
    }

    return (user.email || '?').slice(0, 2).toUpperCase();
  }

  function shouldShowAvatarImage(user: AdminUser) {
    return isGmailUser(user) && Boolean(user.avatar_url) && !failedAvatarUserIds.has(user.id);
  }

  function handleAvatarError(userId: string) {
    failedAvatarUserIds = new Set([...failedAvatarUserIds, userId]);
  }

  function isGmailUser(user: AdminUser) {
    return (user.email || '').toLowerCase().endsWith('@gmail.com');
  }

  function toggleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    sortKey = nextSortKey;
    sortDirection = nextSortKey === 'created' || nextSortKey === 'credit' ? 'desc' : 'asc';
  }

  function getSortIndicator(key: SortKey) {
    if (sortKey !== key) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  }

  function getSortValue(user: AdminUser, key: SortKey): string | number {
    if (key === 'user') {
      return `${getDisplayName(user)} ${user.email || ''}`.trim().toLowerCase();
    }
    if (key === 'role') {
      return (user.role || '').toLowerCase();
    }
    if (key === 'subscription') {
      return (user.subscription_status || '').toLowerCase();
    }
    if (key === 'credit') {
      return user.credit ?? 0;
    }

    if (!user.created_at) return 0;
    const createdTimestamp = new Date(user.created_at).getTime();
    return Number.isNaN(createdTimestamp) ? 0 : createdTimestamp;
  }

  function handlePageSizeChange() {
    currentPage = 1;
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
  }

  function getVisiblePageItems(total: number, current: number): Array<number | string> {
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  $: sortedUsers = [...users].sort((a, b) => {
    const aValue = getSortValue(a, sortKey);
    const bValue = getSortValue(b, sortKey);
    const directionFactor = sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * directionFactor;
    }

    return String(aValue).localeCompare(String(bValue), undefined, { sensitivity: 'base' }) * directionFactor;
  });
  $: totalUsers = sortedUsers.length;
  $: totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  $: if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  $: if (currentPage < 1) {
    currentPage = 1;
  }
  $: pageStartIndex = (currentPage - 1) * pageSize;
  $: pageEndIndex = Math.min(pageStartIndex + pageSize, totalUsers);
  $: pagedUsers = sortedUsers.slice(pageStartIndex, pageEndIndex);
  $: visiblePageItems = getVisiblePageItems(totalPages, currentPage);

  async function handleSaveUser() {
    if (!formEmail.trim()) {
      alert('Email is required');
      return;
    }

    saving = true;
    const payload = {
      email: formEmail.trim(),
      first_name: formFirstName.trim() || undefined,
      last_name: formLastName.trim() || undefined,
      role: formRole.trim() || 'user',
      subscription_status: formSubscriptionStatus.trim() || undefined,
      credit: Math.max(0, Number(formCredit) || 0)
    };

    try {
      const result = editingUserId
        ? await updateUser(editingUserId, payload)
        : await createUser(payload);

      if (!result.success || result.error) {
        alert(`Failed to save user: ${result.error}`);
        return;
      }

      await loadUsers();
      closeModal();
    } finally {
      saving = false;
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    if (!confirm(`Delete user ${user.email}?`)) return;

    deletingId = user.id;
    try {
      const result = await deleteUser(user.id);
      if (!result.success || result.error) {
        alert(`Failed to delete user: ${result.error}`);
        return;
      }

      await loadUsers();
    } finally {
      deletingId = '';
    }
  }
</script>

<svelte:head>
  <title>User Manage - Admin</title>
</svelte:head>

<div class="user-manage-page">
  <div class="page-header">
    <div>
      <h1 class="page-title">
        <Users size={28} />
        User Management
      </h1>
      <p class="page-description">Add, edit, and delete users</p>
    </div>
    <button class="add-btn" on:click={openAddModal}>
      <Plus size={16} />
      Add User
    </button>
  </div>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <p>{error}</p>
    </div>
  {:else if users.length === 0}
    <div class="empty-state">
      <p>No users found.</p>
    </div>
  {:else}
    <div class="table-wrap">
      <table class="users-table">
        <thead>
          <tr>
            <th>
              <button
                class="sort-header-btn"
                class:active-sort={sortKey === 'user'}
                on:click={() => toggleSort('user')}
                title="Sort by user"
              >
                User
                <span class="sort-indicator">{getSortIndicator('user')}</span>
              </button>
            </th>
            <th>
              <button
                class="sort-header-btn"
                class:active-sort={sortKey === 'role'}
                on:click={() => toggleSort('role')}
                title="Sort by role"
              >
                Role
                <span class="sort-indicator">{getSortIndicator('role')}</span>
              </button>
            </th>
            <th>
              <button
                class="sort-header-btn"
                class:active-sort={sortKey === 'subscription'}
                on:click={() => toggleSort('subscription')}
                title="Sort by subscription"
              >
                Subscription
                <span class="sort-indicator">{getSortIndicator('subscription')}</span>
              </button>
            </th>
            <th>
              <button
                class="sort-header-btn"
                class:active-sort={sortKey === 'credit'}
                on:click={() => toggleSort('credit')}
                title="Sort by credit"
              >
                Credit
                <span class="sort-indicator">{getSortIndicator('credit')}</span>
              </button>
            </th>
            <th>
              <button
                class="sort-header-btn"
                class:active-sort={sortKey === 'created'}
                on:click={() => toggleSort('created')}
                title="Sort by created date"
              >
                Created
                <span class="sort-indicator">{getSortIndicator('created')}</span>
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each pagedUsers as user}
            <tr>
              <td>
                <div class="user-item">
                  <div class="user-avatar">
                    {#if shouldShowAvatarImage(user)}
                      <img
                        class="user-avatar-image"
                        src={user.avatar_url || ''}
                        alt={`${getDisplayName(user)} avatar`}
                        loading="lazy"
                        decoding="async"
                        referrerpolicy="no-referrer"
                        crossorigin="anonymous"
                        on:error={() => handleAvatarError(user.id)}
                      />
                    {:else}
                      {getUserInitials(user)}
                    {/if}
                  </div>
                  <div class="user-identity">
                    <div class="user-name">{getDisplayName(user)}</div>
                    <div class="user-email">{user.email || '-'}</div>
                  </div>
                </div>
              </td>
              <td>{user.role || '-'}</td>
              <td>{user.subscription_status || '-'}</td>
              <td>{user.credit ?? 0}</td>
              <td>{formatCreatedAt(user.created_at)}</td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn edit" on:click={() => openEditModal(user)} title="Edit user">
                    <Pencil size={15} />
                  </button>
                  <button
                    class="icon-btn delete"
                    on:click={() => handleDeleteUser(user)}
                    title="Delete user"
                    disabled={deletingId === user.id}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="table-pagination">
      <div class="pagination-left">
        <label for="rows-per-page" class="rows-per-page-label">
          Rows per page
          <select
            id="rows-per-page"
            class="rows-per-page-select"
            bind:value={pageSize}
            on:change={handlePageSizeChange}
          >
            {#each pageSizeOptions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </label>
        <span class="pagination-summary">
          Showing {totalUsers === 0 ? 0 : pageStartIndex + 1}-{pageEndIndex} of {totalUsers}
        </span>
      </div>

      <div class="pagination-nav">
        <button
          class="pagination-btn"
          on:click={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {#each visiblePageItems as pageItem, index}
          {#if typeof pageItem === 'number'}
            <button
              class="pagination-btn page-number"
              class:active-page={pageItem === currentPage}
              on:click={() => goToPage(pageItem)}
            >
              {pageItem}
            </button>
          {:else}
            <span class="pagination-ellipsis" aria-hidden="true">...</span>
          {/if}
        {/each}

        <button
          class="pagination-btn"
          on:click={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
</div>

{#if showUserModal}
  <div
    class="modal-backdrop"
    role="button"
    tabindex="0"
    aria-label="Close modal"
    on:click|self={closeModal}
    on:keydown={(event) => (event.key === 'Enter' || event.key === ' ') && closeModal()}
  >
    <div class="modal">
      <div class="modal-header">
        <h2>{editingUserId ? 'Edit User' : 'Add User'}</h2>
        <button class="icon-btn close" on:click={closeModal}>
          <X size={18} />
        </button>
      </div>

      <div class="modal-body">
        <label for="email">Email</label>
        <input id="email" type="email" bind:value={formEmail} placeholder="user@example.com" />

        <label for="first-name">First Name</label>
        <input id="first-name" type="text" bind:value={formFirstName} placeholder="First name" />

        <label for="last-name">Last Name</label>
        <input id="last-name" type="text" bind:value={formLastName} placeholder="Last name" />

        <label for="role">Role</label>
        <input id="role" type="text" bind:value={formRole} placeholder="user" />

        <label for="subscription-status">Subscription Status</label>
        <input id="subscription-status" type="text" bind:value={formSubscriptionStatus} placeholder="inactive" />

        <label for="credit">Credit</label>
        <input id="credit" type="number" bind:value={formCredit} min="0" />
      </div>

      <div class="modal-actions">
        <button class="secondary-btn" on:click={closeModal} disabled={saving}>Cancel</button>
        <button class="primary-btn" on:click={handleSaveUser} disabled={saving}>
          {saving ? 'Saving...' : editingUserId ? 'Save Changes' : 'Create User'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .user-manage-page {
    width: 100%;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .page-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }

  .page-description {
    margin: 0;
    color: #6b7280;
    font-size: 0.9375rem;
  }

  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    border: none;
    background: #1d4ed8;
    color: white;
    border-radius: 0.5rem;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
  }

  .add-btn:hover {
    background: #1e40af;
  }

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 3rem;
    border-radius: 0.5rem;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .error-state p {
    color: #dc2626;
  }

  .loading-state p,
  .empty-state p {
    color: #6b7280;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #1e40af;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .table-wrap {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: auto;
  }

  .users-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
  }

  .users-table th,
  .users-table td {
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    font-size: 0.875rem;
  }

  .users-table th {
    background: #f9fafb;
    color: #374151;
    font-weight: 600;
    white-space: nowrap;
  }

  .sort-header-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.35rem;
    width: 100%;
    border: none;
    background: transparent;
    color: inherit;
    font-size: inherit;
    font-weight: inherit;
    border-radius: 0.375rem;
    padding: 0.2rem 0.35rem;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .sort-header-btn:hover {
    background: #eef2ff;
    color: #1e3a8a;
  }

  .sort-header-btn:focus-visible {
    outline: 2px solid #93c5fd;
    outline-offset: 1px;
  }

  .sort-header-btn.active-sort {
    background: #dbeafe;
    color: #1e3a8a;
    font-weight: 700;
  }

  .sort-indicator {
    color: #6b7280;
    font-size: 0.8rem;
    line-height: 1;
    transition: color 0.15s ease;
  }

  .sort-header-btn:hover .sort-indicator,
  .sort-header-btn.active-sort .sort-indicator {
    color: currentColor;
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    min-width: 220px;
  }

  .user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    background: #dbeafe;
    color: #1e40af;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    flex-shrink: 0;
    overflow: hidden;
  }

  .user-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .user-identity {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .user-name {
    font-size: 1.05rem;
    font-weight: 600;
    color: #111827;
    line-height: 1.2;
  }

  .user-email {
    font-size: 0.8125rem;
    color: #6b7280;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  .row-actions {
    display: inline-flex;
    gap: 0.4rem;
  }

  .table-pagination {
    margin-top: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .pagination-left {
    display: inline-flex;
    align-items: center;
    gap: 0.85rem;
    flex-wrap: wrap;
  }

  .rows-per-page-label {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.8125rem;
    color: #374151;
  }

  .rows-per-page-select {
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    padding: 0.3rem 0.4rem;
    font-size: 0.8125rem;
    color: #111827;
    background: white;
  }

  .pagination-summary {
    font-size: 0.8125rem;
    color: #6b7280;
  }

  .pagination-nav {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .pagination-btn {
    border: 1px solid #d1d5db;
    background: white;
    color: #374151;
    border-radius: 0.375rem;
    padding: 0.35rem 0.55rem;
    font-size: 0.8125rem;
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }

  .pagination-btn:hover:not(:disabled) {
    background: #eef2ff;
    border-color: #93c5fd;
    color: #1e3a8a;
  }

  .pagination-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .pagination-btn.page-number {
    min-width: 32px;
  }

  .pagination-btn.active-page {
    background: #1d4ed8;
    border-color: #1d4ed8;
    color: white;
    font-weight: 600;
  }

  .pagination-ellipsis {
    color: #6b7280;
    font-size: 0.875rem;
    padding: 0 0.2rem;
  }

  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: white;
    color: #374151;
    width: 32px;
    height: 32px;
    cursor: pointer;
  }

  .icon-btn.edit:hover {
    border-color: #2563eb;
    color: #2563eb;
  }

  .icon-btn.delete:hover {
    border-color: #dc2626;
    color: #dc2626;
  }

  .icon-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(17, 24, 39, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1200;
    padding: 1rem;
  }

  .modal {
    width: 100%;
    max-width: 540px;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.125rem;
    color: #111827;
  }

  .icon-btn.close {
    width: 30px;
    height: 30px;
  }

  .modal-body {
    padding: 1rem 1.25rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .modal-body label {
    font-size: 0.8125rem;
    color: #374151;
    margin-top: 0.25rem;
  }

  .modal-body input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    padding: 0.6rem 0.7rem;
    font-size: 0.875rem;
    color: #111827;
  }

  .modal-actions {
    padding: 1rem 1.25rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .secondary-btn,
  .primary-btn {
    border: none;
    border-radius: 0.5rem;
    padding: 0.6rem 0.9rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
  }

  .secondary-btn {
    background: #e5e7eb;
    color: #111827;
  }

  .secondary-btn:hover {
    background: #d1d5db;
  }

  .primary-btn {
    background: #1d4ed8;
    color: white;
  }

  .primary-btn:hover {
    background: #1e40af;
  }

  .secondary-btn:disabled,
  .primary-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
