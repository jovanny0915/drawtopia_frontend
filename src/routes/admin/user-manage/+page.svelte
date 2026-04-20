<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getUsers,
    getUserDetail,
    createUser,
    updateUser,
    deleteUser,
    type AdminUser,
    type AdminUserDetail,
    type AdminUserListFilters
  } from '$lib/api/admin';
  import { Users, Plus, Pencil, Trash2, X, Search, RefreshCw } from 'lucide-svelte';

  let users: AdminUser[] = [];
  let loading = true;
  let error = '';
  let saving = false;
  let deletingId = '';

  let selectedUserId = '';
  let selectedUserDetail: AdminUserDetail | null = null;
  let detailLoading = false;
  let detailError = '';

  let showUserModal = false;
  let editingUserId: string | null = null;

  let formEmail = '';
  let formFirstName = '';
  let formLastName = '';
  let formRole = 'user';
  let formSubscriptionStatus = '';
  let formCredit = 0;

  let filterSearch = '';
  let filterAccountType = '';
  let filterSubscriptionStatus = '';
  let filterRegisteredFrom = '';
  let filterRegisteredTo = '';
  let filterStoryCountMin = '';
  let filterStoryCountMax = '';

  type SortKey = 'user' | 'account' | 'subscription' | 'stories' | 'registered' | 'lastLogin';
  type SortDirection = 'asc' | 'desc';
  let sortKey: SortKey = 'registered';
  let sortDirection: SortDirection = 'desc';
  let pageSize = 10;
  const pageSizeOptions = [10, 20, 50];
  let currentPage = 1;
  let failedAvatarUserIds = new Set<string>();

  const accountTypeOptions = [
    { value: '', label: 'All account types' },
    { value: 'free', label: 'Free' },
    { value: 'individual', label: 'Individual' },
    { value: 'family', label: 'Family' },
    { value: 'founding_member', label: 'Founding Member' }
  ];

  const subscriptionStatusOptions = [
    { value: '', label: 'All subscription states' },
    { value: 'premium', label: 'Premium' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'canceled', label: 'Canceled' },
    { value: 'past_due', label: 'Past Due' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'inactive', label: 'Inactive' }
  ];

  onMount(async () => {
    await loadUsers();
  });

  function buildFilters(): AdminUserListFilters {
    const filters: AdminUserListFilters = {};
    if (filterSearch.trim()) filters.search = filterSearch.trim();
    if (filterAccountType) filters.account_type = filterAccountType;
    if (filterSubscriptionStatus) filters.subscription_status = filterSubscriptionStatus;
    if (filterRegisteredFrom) filters.registered_from = filterRegisteredFrom;
    if (filterRegisteredTo) filters.registered_to = filterRegisteredTo;
    if (filterStoryCountMin.trim()) filters.story_count_min = Number(filterStoryCountMin);
    if (filterStoryCountMax.trim()) filters.story_count_max = Number(filterStoryCountMax);
    return filters;
  }

  async function loadUsers() {
    loading = true;
    error = '';
    const result = await getUsers(buildFilters());
    if (!result.success || result.error) {
      error = result.error || 'Failed to load users';
      users = [];
    } else {
      users = result.data ?? [];
      failedAvatarUserIds = new Set<string>();
    }
    loading = false;

    if (selectedUserId && users.some((user) => user.id === selectedUserId)) {
      await selectUser(selectedUserId, false);
    } else if (selectedUserId) {
      clearSelectedUser();
    }
  }

  async function selectUser(userId: string, forceReload = true) {
    if (!forceReload && selectedUserId === userId && selectedUserDetail) {
      return;
    }

    selectedUserId = userId;
    detailLoading = true;
    detailError = '';

    const result = await getUserDetail(userId);
    if (!result.success || result.error) {
      selectedUserDetail = null;
      detailError = result.error || 'Failed to load user detail';
    } else {
      selectedUserDetail = result.data ?? null;
    }

    detailLoading = false;
  }

  function clearSelectedUser() {
    selectedUserId = '';
    selectedUserDetail = null;
    detailError = '';
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

  function formatDateTime(value?: string | null) {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  }

  function formatAccountType(value?: string | null) {
    if (!value) return 'Free';
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatMoney(value: unknown) {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount)) return '$0.00';
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function getDisplayName(user: AdminUser) {
    return user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name';
  }

  function getUserInitials(user: AdminUser) {
    const fullName = getDisplayName(user);
    if (fullName && fullName !== 'No name') {
      return fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('');
    }

    return (user.email || '?').slice(0, 2).toUpperCase();
  }

  function shouldShowAvatarImage(user: AdminUser) {
    return Boolean(user.avatar_url) && !failedAvatarUserIds.has(user.id);
  }

  function handleAvatarError(userId: string) {
    failedAvatarUserIds = new Set([...failedAvatarUserIds, userId]);
  }

  function normalizeArray(value: unknown): unknown[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value ? [value] : [];
      }
    }
    return [];
  }

  function getCharacterName(character: Record<string, unknown>) {
    return String(character.character_name || character.name || character.title || 'Unnamed character');
  }

  function getStoryTitle(story: Record<string, unknown>) {
    return String(story.story_title || story.title || story.uid || story.id || 'Untitled story');
  }

  function getSortIndicator(key: SortKey) {
    if (sortKey !== key) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  }

  function toggleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    sortKey = nextSortKey;
    sortDirection = nextSortKey === 'stories' || nextSortKey === 'registered' || nextSortKey === 'lastLogin' ? 'desc' : 'asc';
  }

  function getSortValue(user: AdminUser, key: SortKey): string | number {
    if (key === 'user') return `${getDisplayName(user)} ${user.email || ''}`.trim().toLowerCase();
    if (key === 'account') return (user.account_type || '').toLowerCase();
    if (key === 'subscription') return (user.subscription_status || '').toLowerCase();
    if (key === 'stories') return Number(user.total_stories_created || 0);

    const value = key === 'lastLogin' ? user.last_login : user.created_at;
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
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
      const result = editingUserId ? await updateUser(editingUserId, payload) : await createUser(payload);

      if (!result.success || result.error) {
        alert(`Failed to save user: ${result.error}`);
        return;
      }

      await loadUsers();
      if (editingUserId) {
        await selectUser(editingUserId);
      }
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

      if (selectedUserId === user.id) {
        clearSelectedUser();
      }
      await loadUsers();
    } finally {
      deletingId = '';
    }
  }

  async function applyFilters() {
    currentPage = 1;
    await loadUsers();
  }

  async function resetFilters() {
    filterSearch = '';
    filterAccountType = '';
    filterSubscriptionStatus = '';
    filterRegisteredFrom = '';
    filterRegisteredTo = '';
    filterStoryCountMin = '';
    filterStoryCountMax = '';
    currentPage = 1;
    await loadUsers();
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
  $: if (currentPage > totalPages) currentPage = totalPages;
  $: if (currentPage < 1) currentPage = 1;
  $: pageStartIndex = (currentPage - 1) * pageSize;
  $: pageEndIndex = Math.min(pageStartIndex + pageSize, totalUsers);
  $: pagedUsers = sortedUsers.slice(pageStartIndex, pageEndIndex);
  $: visiblePageItems = getVisiblePageItems(totalPages, currentPage);
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
      <p class="page-description">Search, filter, and inspect account, story, payment, and generation history for every user.</p>
    </div>
    <button class="add-btn" on:click={openAddModal}>
      <Plus size={16} />
      Add User
    </button>
  </div>

  <section class="filters-panel">
    <div class="filter-grid">
      <label class="filter-field search-field">
        <span>Search</span>
        <div class="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            bind:value={filterSearch}
            placeholder="Email, name, or user ID"
            on:keydown={(event) => event.key === 'Enter' && applyFilters()}
          />
        </div>
      </label>

      <label class="filter-field">
        <span>Account Type</span>
        <select bind:value={filterAccountType}>
          {#each accountTypeOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="filter-field">
        <span>Subscription Status</span>
        <select bind:value={filterSubscriptionStatus}>
          {#each subscriptionStatusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="filter-field">
        <span>Registered From</span>
        <input type="date" bind:value={filterRegisteredFrom} />
      </label>

      <label class="filter-field">
        <span>Registered To</span>
        <input type="date" bind:value={filterRegisteredTo} />
      </label>

      <label class="filter-field">
        <span>Min Story Count</span>
        <input type="number" min="0" bind:value={filterStoryCountMin} placeholder="0" />
      </label>

      <label class="filter-field">
        <span>Max Story Count</span>
        <input type="number" min="0" bind:value={filterStoryCountMax} placeholder="100" />
      </label>
    </div>

    <div class="filter-actions">
      <button class="primary-btn" on:click={applyFilters}>Apply Filters</button>
      <button class="secondary-btn" on:click={resetFilters}>Reset</button>
      <button class="ghost-btn" on:click={loadUsers} title="Refresh user list">
        <RefreshCw size={15} />
        Refresh
      </button>
    </div>
  </section>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <p>{error}</p>
    </div>
  {:else}
    <div class="content-grid">
      <section class="table-section">
        {#if users.length === 0}
          <div class="empty-state">
            <p>No users matched the current filters.</p>
          </div>
        {:else}
          <div class="table-wrap">
            <table class="users-table">
              <thead>
                <tr>
                  <th>
                    <button class="sort-header-btn" class:active-sort={sortKey === 'user'} on:click={() => toggleSort('user')}>
                      User
                      <span class="sort-indicator">{getSortIndicator('user')}</span>
                    </button>
                  </th>
                  <th>
                    <button class="sort-header-btn" class:active-sort={sortKey === 'account'} on:click={() => toggleSort('account')}>
                      Account Type
                      <span class="sort-indicator">{getSortIndicator('account')}</span>
                    </button>
                  </th>
                  <th>
                    <button class="sort-header-btn" class:active-sort={sortKey === 'subscription'} on:click={() => toggleSort('subscription')}>
                      Subscription
                      <span class="sort-indicator">{getSortIndicator('subscription')}</span>
                    </button>
                  </th>
                  <th>
                    <button class="sort-header-btn" class:active-sort={sortKey === 'stories'} on:click={() => toggleSort('stories')}>
                      Stories
                      <span class="sort-indicator">{getSortIndicator('stories')}</span>
                    </button>
                  </th>
                  <th>
                    <button class="sort-header-btn" class:active-sort={sortKey === 'registered'} on:click={() => toggleSort('registered')}>
                      Registered
                      <span class="sort-indicator">{getSortIndicator('registered')}</span>
                    </button>
                  </th>
                  <th>
                    <button class="sort-header-btn" class:active-sort={sortKey === 'lastLogin'} on:click={() => toggleSort('lastLogin')}>
                      Last Login
                      <span class="sort-indicator">{getSortIndicator('lastLogin')}</span>
                    </button>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each pagedUsers as user}
                  <tr class:selected-row={selectedUserId === user.id} on:click={() => selectUser(user.id)}>
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
                          <div class="user-meta">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class={`badge badge-account ${user.account_type || 'free'}`}>{formatAccountType(user.account_type)}</span>
                    </td>
                    <td>
                      <div class="cell-stack">
                        <span class={`badge badge-subscription ${(user.subscription_status || 'inactive').replace(/\s+/g, '-')}`}>{user.subscription_status || 'inactive'}</span>
                        <span class="subtle">{user.subscription_expires ? `Renews until ${formatDateTime(user.subscription_expires)}` : 'No expiry on file'}</span>
                      </div>
                    </td>
                    <td>
                      <div class="cell-stack">
                        <strong>{user.total_stories_created || 0}</strong>
                        <span class="subtle">{user.purchase_count || 0} payments</span>
                      </div>
                    </td>
                    <td>{formatDateTime(user.created_at)}</td>
                    <td>{formatDateTime(user.last_login)}</td>
                    <td>
                      <div class="row-actions">
                        <button class="icon-btn edit" on:click|stopPropagation={() => openEditModal(user)} title="Edit user">
                          <Pencil size={15} />
                        </button>
                        <button
                          class="icon-btn delete"
                          on:click|stopPropagation={() => handleDeleteUser(user)}
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
                <select id="rows-per-page" class="rows-per-page-select" bind:value={pageSize} on:change={handlePageSizeChange}>
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
              <button class="pagination-btn" on:click={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
              {#each visiblePageItems as pageItem}
                {#if typeof pageItem === 'number'}
                  <button class="pagination-btn page-number" class:active-page={pageItem === currentPage} on:click={() => goToPage(pageItem)}>
                    {pageItem}
                  </button>
                {:else}
                  <span class="pagination-ellipsis" aria-hidden="true">...</span>
                {/if}
              {/each}
              <button class="pagination-btn" on:click={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        {/if}
      </section>

      <aside class="detail-panel">
        {#if !selectedUserId}
          <div class="placeholder-panel">
            <p>Select a user to inspect their account details, characters, stories, payments, and generation history.</p>
          </div>
        {:else if detailLoading}
          <div class="loading-state inline-state">
            <div class="spinner"></div>
            <p>Loading user detail...</p>
          </div>
        {:else if detailError}
          <div class="error-state inline-state">
            <p>{detailError}</p>
          </div>
        {:else if selectedUserDetail}
          <div class="detail-stack">
            <section class="detail-card hero-card">
              <div class="hero-header">
                <div>
                  <h2>{getDisplayName(selectedUserDetail.account_information)}</h2>
                  <p>{selectedUserDetail.account_information.email || 'No email on file'}</p>
                </div>
                <button class="icon-btn close" on:click={clearSelectedUser} title="Close detail">
                  <X size={16} />
                </button>
              </div>

              <div class="stats-grid">
                <div class="stat-tile">
                  <span class="stat-label">Account Type</span>
                  <strong>{formatAccountType(selectedUserDetail.account_information.account_type)}</strong>
                </div>
                <div class="stat-tile">
                  <span class="stat-label">Stories Created</span>
                  <strong>{selectedUserDetail.account_information.total_stories_created || 0}</strong>
                </div>
                <div class="stat-tile">
                  <span class="stat-label">Payments</span>
                  <strong>{selectedUserDetail.payment_history.length}</strong>
                </div>
                <div class="stat-tile">
                  <span class="stat-label">Total Paid</span>
                  <strong>{formatMoney(selectedUserDetail.account_information.total_amount_paid)}</strong>
                </div>
              </div>

              <div class="detail-grid compact-grid">
                <div>
                  <span class="info-label">Registration Date</span>
                  <p>{formatDateTime(String(selectedUserDetail.account_information.created_at || ''))}</p>
                </div>
                <div>
                  <span class="info-label">Last Login</span>
                  <p>{formatDateTime(String(selectedUserDetail.account_information.last_login || ''))}</p>
                </div>
                <div>
                  <span class="info-label">Subscription Status</span>
                  <p>{String(selectedUserDetail.account_information.subscription_status || 'inactive')}</p>
                </div>
                <div>
                  <span class="info-label">Credit Balance</span>
                  <p>{selectedUserDetail.account_information.credit || 0}</p>
                </div>
              </div>
            </section>

            <section class="detail-card">
              <div class="card-header">
                <h3>Account Information</h3>
                <span>{normalizeArray(selectedUserDetail.account_information.children).length} child profiles</span>
              </div>
              <div class="detail-grid">
                <div>
                  <span class="info-label">User ID</span>
                  <p>{selectedUserDetail.account_information.id}</p>
                </div>
                <div>
                  <span class="info-label">Role</span>
                  <p>{selectedUserDetail.account_information.role || 'user'}</p>
                </div>
                <div>
                  <span class="info-label">Stripe Customer</span>
                  <p>{String(selectedUserDetail.account_information.stripe_customer_id || 'Not linked')}</p>
                </div>
                <div>
                  <span class="info-label">Subscription Expires</span>
                  <p>{formatDateTime(String(selectedUserDetail.account_information.subscription_expires || ''))}</p>
                </div>
              </div>

              {#if normalizeArray(selectedUserDetail.account_information.children).length > 0}
                <div class="subsection">
                  <h4>Children</h4>
                  <div class="pill-list">
                    {#each normalizeArray(selectedUserDetail.account_information.children) as child}
                      <span class="pill">{String((child as Record<string, unknown>).first_name || (child as Record<string, unknown>).id || 'Child profile')}</span>
                    {/each}
                  </div>
                </div>
              {/if}
            </section>

            <section class="detail-card">
              <div class="card-header">
                <h3>Characters</h3>
                <span>{selectedUserDetail.characters.length}</span>
              </div>
              {#if selectedUserDetail.characters.length === 0}
                <p class="empty-copy">No characters found.</p>
              {:else}
                <div class="character-grid">
                  {#each selectedUserDetail.characters as character}
                    <article class="character-card">
                      <div class="character-images">
                        {#if character.original_image_url}
                          <img src={String(character.original_image_url)} alt={getCharacterName(character)} />
                        {/if}
                        {#each normalizeArray(character.enhanced_images).slice(0, 3) as enhancedImage}
                          <img src={String(enhancedImage)} alt={`${getCharacterName(character)} enhanced`} />
                        {/each}
                      </div>
                      <div class="character-info">
                        <h4>{getCharacterName(character)}</h4>
                        <p>{String(character.character_type || character.style || 'No character metadata')}</p>
                      </div>
                    </article>
                  {/each}
                </div>
              {/if}
            </section>

            <section class="detail-card">
              <div class="card-header">
                <h3>Story Library</h3>
                <span>{selectedUserDetail.story_library.length}</span>
              </div>
              {#if selectedUserDetail.story_library.length === 0}
                <p class="empty-copy">No stories found.</p>
              {:else}
                <div class="list-table">
                  {#each selectedUserDetail.story_library as story}
                    <div class="list-row">
                      <div>
                        <strong>{getStoryTitle(story)}</strong>
                        <span>{String(story.uid || story.id || 'No story ID')}</span>
                      </div>
                      <div>
                        <strong>{String(story.status || 'unknown')}</strong>
                        <span>{String(story.story_type || 'story')}</span>
                      </div>
                      <div>
                        <strong>{formatDateTime(String(story.created_at || ''))}</strong>
                        <span>Created</span>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </section>

            <section class="detail-card">
              <div class="card-header">
                <h3>Payment History</h3>
                <span>{selectedUserDetail.payment_history.length}</span>
              </div>
              {#if selectedUserDetail.payment_history.length === 0}
                <p class="empty-copy">No payments recorded.</p>
              {:else}
                <div class="list-table">
                  {#each selectedUserDetail.payment_history as payment}
                    <div class="list-row">
                      <div>
                        <strong>{formatMoney(payment.amount_paid)}</strong>
                        <span>{String(payment.payment_method || 'unknown method')}</span>
                      </div>
                      <div>
                        <strong>{String(payment.purchase_status || 'unknown')}</strong>
                        <span>{String(payment.transaction_id || payment.story_id || 'No reference')}</span>
                      </div>
                      <div>
                        <strong>{formatDateTime(String(payment.purchase_date || payment.created_at || ''))}</strong>
                        <span>Purchase date</span>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </section>

            <section class="detail-card">
              <div class="card-header">
                <h3>Generation History</h3>
                <span>{selectedUserDetail.generation_history.length}</span>
              </div>
              {#if selectedUserDetail.generation_history.length === 0}
                <p class="empty-copy">No generation jobs found.</p>
              {:else}
                <div class="list-table">
                  {#each selectedUserDetail.generation_history as job}
                    <div class="list-row multi-row">
                      <div>
                        <strong>{String(job.job_type || 'unknown job')}</strong>
                        <span>Job #{String(job.id || '-')}</span>
                      </div>
                      <div>
                        <strong>{String(job.status || 'unknown')}</strong>
                        <span>Priority {String(job.priority || '-')}</span>
                      </div>
                      <div>
                        <strong>{formatDateTime(String(job.created_at || ''))}</strong>
                        <span>{job.completed_at ? `Completed ${formatDateTime(String(job.completed_at))}` : 'Not completed'}</span>
                      </div>
                      {#if job.error_message}
                        <div class="job-error">{String(job.error_message)}</div>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </section>
          </div>
        {/if}
      </aside>
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
    padding: 0 1rem 2rem;
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
    max-width: 52rem;
  }

  .filters-panel,
  .table-wrap,
  .detail-card,
  .loading-state,
  .error-state,
  .empty-state,
  .placeholder-panel {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  }

  .filters-panel {
    padding: 1rem;
    margin-bottom: 1.25rem;
    border: 1px solid #e5e7eb;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.85rem;
  }

  .filter-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.8125rem;
    color: #374151;
  }

  .filter-field input,
  .filter-field select,
  .search-input-wrap {
    border: 1px solid #d1d5db;
    border-radius: 0.55rem;
    background: #fff;
  }

  .filter-field input,
  .filter-field select {
    padding: 0.65rem 0.75rem;
    font-size: 0.875rem;
    color: #111827;
  }

  .search-field {
    grid-column: span 2;
  }

  .search-input-wrap {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0 0.7rem;
  }

  .search-input-wrap input {
    border: none;
    box-shadow: none;
    padding: 0.65rem 0;
    width: 100%;
  }

  .search-input-wrap input:focus {
    outline: none;
  }

  .filter-actions {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.95fr);
    gap: 1rem;
    align-items: start;
  }

  .table-section,
  .detail-panel {
    min-width: 0;
  }

  .table-wrap {
    overflow: auto;
    border: 1px solid #e5e7eb;
  }

  .users-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1000px;
  }

  .users-table th,
  .users-table td {
    padding: 0.85rem 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    vertical-align: top;
    font-size: 0.875rem;
  }

  .users-table th {
    background: #f8fafc;
    color: #374151;
    font-weight: 600;
    white-space: nowrap;
  }

  .users-table tbody tr {
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .users-table tbody tr:hover {
    background: #f8fbff;
  }

  .users-table tbody tr.selected-row {
    background: #eff6ff;
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
  }

  .sort-header-btn:hover,
  .sort-header-btn.active-sort {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .sort-indicator {
    font-size: 0.8rem;
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 240px;
  }

  .user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    background: #dbeafe;
    color: #1d4ed8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    font-weight: 700;
    overflow: hidden;
    flex-shrink: 0;
  }

  .user-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .user-identity,
  .cell-stack {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .user-name {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }

  .user-email,
  .user-meta,
  .subtle,
  .info-label,
  .stat-label,
  .list-row span,
  .empty-copy {
    font-size: 0.78rem;
    color: #6b7280;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .badge-account {
    background: #e0f2fe;
    color: #075985;
  }

  .badge-account.founding_member {
    background: #fef3c7;
    color: #92400e;
  }

  .badge-account.family {
    background: #dcfce7;
    color: #166534;
  }

  .badge-account.individual {
    background: #ede9fe;
    color: #5b21b6;
  }

  .badge-subscription {
    background: #e5e7eb;
    color: #374151;
  }

  .badge-subscription.premium,
  .badge-subscription.active,
  .badge-subscription.trialing {
    background: #dcfce7;
    color: #166534;
  }

  .badge-subscription.cancelled,
  .badge-subscription.canceled,
  .badge-subscription.unpaid,
  .badge-subscription.past_due {
    background: #fee2e2;
    color: #991b1b;
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

  .pagination-left,
  .pagination-nav {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .rows-per-page-label,
  .pagination-summary {
    font-size: 0.8125rem;
    color: #374151;
  }

  .rows-per-page-select,
  .pagination-btn,
  .icon-btn,
  .add-btn,
  .primary-btn,
  .secondary-btn,
  .ghost-btn {
    border-radius: 0.55rem;
  }

  .rows-per-page-select,
  .pagination-btn,
  .icon-btn,
  .ghost-btn {
    border: 1px solid #d1d5db;
    background: white;
    color: #374151;
  }

  .pagination-btn,
  .ghost-btn {
    padding: 0.45rem 0.7rem;
    font-size: 0.8125rem;
    cursor: pointer;
  }

  .pagination-btn.active-page {
    background: #1d4ed8;
    border-color: #1d4ed8;
    color: white;
  }

  .pagination-ellipsis {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .detail-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .detail-card {
    padding: 1rem;
    border: 1px solid #e5e7eb;
  }

  .hero-card {
    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  }

  .hero-header,
  .card-header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .hero-header h2,
  .card-header h3,
  .subsection h4,
  .character-info h4 {
    margin: 0;
    color: #111827;
  }

  .hero-header p,
  .card-header span,
  .detail-grid p,
  .placeholder-panel p,
  .loading-state p,
  .empty-state p,
  .error-state p,
  .character-info p {
    margin: 0;
  }

  .stats-grid,
  .detail-grid,
  .character-grid {
    display: grid;
    gap: 0.75rem;
  }

  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-bottom: 1rem;
  }

  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .compact-grid {
    margin-top: 1rem;
  }

  .stat-tile {
    padding: 0.85rem;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #dbeafe;
    border-radius: 0.7rem;
  }

  .stat-tile strong {
    display: block;
    margin-top: 0.25rem;
    font-size: 1.15rem;
    color: #111827;
  }

  .subsection {
    margin-top: 1rem;
  }

  .pill-list {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .pill {
    background: #f3f4f6;
    color: #111827;
    padding: 0.35rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
  }

  .character-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .character-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.7rem;
    overflow: hidden;
    background: #fff;
  }

  .character-images {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.25rem;
    background: #f8fafc;
    padding: 0.25rem;
  }

  .character-images img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 0.45rem;
    background: #e5e7eb;
  }

  .character-info {
    padding: 0.75rem;
  }

  .list-table {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .list-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.7rem;
    padding: 0.75rem;
    background: #fff;
  }

  .list-row strong,
  .job-error {
    display: block;
    color: #111827;
  }

  .multi-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .job-error {
    grid-column: 1 / -1;
    margin-top: 0.2rem;
    color: #991b1b;
    background: #fef2f2;
    border-radius: 0.5rem;
    padding: 0.5rem 0.65rem;
    font-size: 0.8rem;
  }

  .placeholder-panel,
  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    border: 1px solid #e5e7eb;
  }

  .inline-state {
    min-height: 220px;
  }

  .error-state p {
    color: #dc2626;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #1d4ed8;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    cursor: pointer;
  }

  .icon-btn.edit:hover,
  .ghost-btn:hover,
  .pagination-btn:hover:not(:disabled) {
    border-color: #60a5fa;
    color: #1d4ed8;
    background: #eff6ff;
  }

  .icon-btn.delete:hover {
    border-color: #f87171;
    color: #dc2626;
    background: #fef2f2;
  }

  .icon-btn:disabled,
  .pagination-btn:disabled,
  .secondary-btn:disabled,
  .primary-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .add-btn,
  .primary-btn,
  .secondary-btn,
  .ghost-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.65rem 0.95rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
  }

  .add-btn,
  .primary-btn {
    border: none;
    background: #1d4ed8;
    color: white;
  }

  .add-btn:hover,
  .primary-btn:hover {
    background: #1e40af;
  }

  .secondary-btn {
    border: none;
    background: #e5e7eb;
    color: #111827;
  }

  .secondary-btn:hover {
    background: #d1d5db;
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

  .modal-header,
  .modal-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
  }

  .modal-header {
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-body {
    padding: 1rem 1.25rem;
    display: grid;
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
    border-top: 1px solid #e5e7eb;
    justify-content: flex-end;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1200px) {
    .content-grid {
      grid-template-columns: 1fr;
    }

    .detail-panel {
      order: -1;
    }
  }

  @media (max-width: 900px) {
    .stats-grid,
    .detail-grid,
    .list-row {
      grid-template-columns: 1fr;
    }

    .search-field {
      grid-column: span 1;
    }
  }
</style>