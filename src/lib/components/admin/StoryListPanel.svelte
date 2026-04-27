<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, RotateCcw, Eye, TriangleAlert, Sparkles, Clock3 } from 'lucide-svelte';
  import {
    getAdminStories,
    getAdminStoryDetail,
    type AdminStoryListFilters,
    type AdminStorySummary,
    type AdminStoryDetail
  } from '$lib/api/admin';
  import StoryDetailModal from '$lib/components/admin/StoryDetailModal.svelte';

  const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'generating', label: 'Generating' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];

  const FORMAT_OPTIONS = [
    { value: '', label: 'All formats' },
    { value: 'interactive_search', label: 'Interactive Search' },
    { value: 'story_adventure', label: 'Story Adventure' }
  ];

  let stories: AdminStorySummary[] = [];
  let loading = true;
  let error = '';
  let filters: AdminStoryListFilters = {
    search: '',
    status: '',
    format_type: '',
    created_from: '',
    created_to: ''
  };

  let selectedStory: AdminStoryDetail | null = null;
  let detailLoading = false;
  let detailError = '';
  let showDetailModal = false;

  onMount(async () => {
    await loadStories();
  });

  async function loadStories() {
    loading = true;
    error = '';

    const response = await getAdminStories(filters);

    if (!response.success) {
      error = response.error ?? 'Failed to load stories';
      stories = [];
    } else {
      stories = response.data ?? [];
    }

    loading = false;
  }

  async function openStoryDetail(storyRef: string | null | undefined) {
    if (!storyRef) {
      detailError = 'Story identifier is missing';
      showDetailModal = true;
      return;
    }

    showDetailModal = true;
    detailLoading = true;
    detailError = '';
    selectedStory = null;

    const response = await getAdminStoryDetail(storyRef);

    if (!response.success || !response.data) {
      detailError = response.error ?? 'Failed to load story details';
      selectedStory = null;
    } else {
      selectedStory = response.data;
    }

    detailLoading = false;
  }

  function closeStoryDetail() {
    showDetailModal = false;
    detailLoading = false;
    detailError = '';
    selectedStory = null;
  }

  async function applyFilters() {
    await loadStories();
  }

  async function resetFilters() {
    filters = {
      search: '',
      status: '',
      format_type: '',
      created_from: '',
      created_to: ''
    };

    await loadStories();
  }

  function formatStatus(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatFormat(value: string): string {
    if (value === 'interactive_search') return 'Interactive Search';
    if (value === 'story_adventure') return 'Story Adventure';
    return formatStatus(value);
  }

  function formatDate(value?: string | null): string {
    if (!value) return 'Not available';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  }

  function formatDuration(value?: number | null): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '-';
    if (value < 60) return `${Math.round(value)}s`;

    const minutes = Math.floor(value / 60);
    const seconds = Math.round(value % 60);
    return `${minutes}m ${seconds}s`;
  }

  function getStoryDetailRef(story: AdminStorySummary): string {
    return story.uid ?? story.id;
  }

  function handleRowKeydown(event: KeyboardEvent, story: AdminStorySummary) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void openStoryDetail(getStoryDetailRef(story));
    }
  }

  $: failedCount = stories.filter((story) => story.status === 'failed').length;
  $: generatingCount = stories.filter((story) => story.status === 'generating').length;
  $: completedCount = stories.filter((story) => story.status === 'completed').length;
</script>

<div class="story-list-panel">
  <div class="page-header">
    <div>
      <h1>Story List View</h1>
      <p>View and manage all stories being generated across the platform.</p>
    </div>
  </div>

  <section class="stats-grid">
    <article class="stat-card">
      <div class="stat-icon"><Sparkles size={18} /></div>
      <div>
        <div class="stat-label">All stories</div>
        <div class="stat-value">{stories.length}</div>
      </div>
    </article>
    <article class="stat-card stat-card-warning">
      <div class="stat-icon"><TriangleAlert size={18} /></div>
      <div>
        <div class="stat-label">Failed stories</div>
        <div class="stat-value">{failedCount}</div>
      </div>
    </article>
    <article class="stat-card">
      <div class="stat-icon"><Clock3 size={18} /></div>
      <div>
        <div class="stat-label">Generating</div>
        <div class="stat-value">{generatingCount}</div>
      </div>
    </article>
    <article class="stat-card">
      <div class="stat-icon"><Eye size={18} /></div>
      <div>
        <div class="stat-label">Completed</div>
        <div class="stat-value">{completedCount}</div>
      </div>
    </article>
  </section>

  <section class="filter-card">
    <div class="filter-grid">
      <label class="field">
        <span>Search</span>
        <div class="search-input">
          <Search size={16} />
          <input
            type="text"
            bind:value={filters.search}
            placeholder="User email, character name, or story title"
            on:keydown={(event) => event.key === 'Enter' && applyFilters()}
          />
        </div>
      </label>

      <label class="field">
        <span>Status</span>
        <select bind:value={filters.status}>
          {#each STATUS_OPTIONS as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span>Format</span>
        <select bind:value={filters.format_type}>
          {#each FORMAT_OPTIONS as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span>Created from</span>
        <input type="date" bind:value={filters.created_from} />
      </label>

      <label class="field">
        <span>Created to</span>
        <input type="date" bind:value={filters.created_to} />
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
      <p>Loading stories...</p>
    </div>
  {:else if error}
    <div class="state-card error">
      <p>{error}</p>
    </div>
  {:else if stories.length === 0}
    <div class="state-card">
      <p>No stories matched the current filters.</p>
    </div>
  {:else}
    <div class="table-card">
      <table class="stories-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Character</th>
            <th>Story title</th>
            <th>Format</th>
            <th>Status</th>
            <th>Created</th>
            <th>Duration</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each stories as story}
            <tr
              class:failed-row={story.status === 'failed'}
              on:click={() => openStoryDetail(getStoryDetailRef(story))}
              on:keydown={(event) => handleRowKeydown(event, story)}
              tabindex="0"
              role="button"
            >
              <td>
                <div class="primary-cell">{story.user_email ?? story.user_name ?? 'Unknown user'}</div>
                {#if story.user_name && story.user_name !== story.user_email}
                  <div class="secondary-cell">{story.user_name}</div>
                {/if}
              </td>
              <td>
                <div class="primary-cell">{story.character_name || '-'}</div>
                {#if story.child_name}
                  <div class="secondary-cell">Child: {story.child_name}</div>
                {/if}
              </td>
              <td>
                <div class="primary-cell">{story.story_title || '-'}</div>
                {#if story.status === 'failed' && story.error_message}
                  <div class="secondary-cell error-copy">{story.error_message}</div>
                {/if}
              </td>
              <td>{formatFormat(story.format)}</td>
              <td>
                <span class="status-badge" class:failed={story.status === 'failed'}>
                  {formatStatus(story.status)}
                </span>
              </td>
              <td>{formatDate(story.created_at)}</td>
              <td>{formatDuration(story.generation_duration_seconds)}</td>
              <td>
                <button
                  class="row-action"
                  on:click|stopPropagation={() => openStoryDetail(getStoryDetailRef(story))}
                >
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

<StoryDetailModal
  open={showDetailModal}
  loading={detailLoading}
  error={detailError}
  story={selectedStory}
  onClose={closeStoryDetail}
/>

<style>
  .story-list-panel {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 0 0.5rem;
  }

  .page-header h1 {
    margin: 0;
    font-size: 2rem;
    color: #0f172a;
  }

  .page-header p {
    margin: 0.4rem 0 0;
    color: #475569;
    font-size: 0.98rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 1rem;
  }

  .stat-card,
  .filter-card,
  .table-card,
  .state-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 1rem 1.1rem;
  }

  .stat-card-warning {
    border-color: #fecaca;
    background: #fff7f7;
  }

  .stat-icon {
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

  .stat-label {
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-value {
    margin-top: 0.25rem;
    color: #0f172a;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .filter-card {
    padding: 1rem;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    color: #334155;
    font-size: 0.9rem;
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
  .row-action {
    border: none;
    border-radius: 0.75rem;
    padding: 0.72rem 1rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
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

  .stories-table {
    width: 100%;
    border-collapse: collapse;
  }

  .stories-table thead {
    background: #f8fafc;
  }

  .stories-table th,
  .stories-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }

  .stories-table tbody tr {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .stories-table tbody tr:hover,
  .stories-table tbody tr:focus {
    background: #f8fbff;
    outline: none;
  }

  .failed-row {
    background: #fff5f5;
  }

  .failed-row:hover,
  .failed-row:focus {
    background: #ffe9e9;
  }

  .failed-row td:first-child {
    border-left: 4px solid #dc2626;
  }

  .primary-cell {
    font-weight: 600;
    color: #0f172a;
    line-height: 1.4;
  }

  .secondary-cell {
    margin-top: 0.3rem;
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .error-copy {
    color: #b91c1c;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 94px;
    padding: 0.45rem 0.7rem;
    border-radius: 999px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .status-badge.failed {
    background: #fee2e2;
    color: #b91c1c;
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

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 960px) {
    .table-card {
      overflow-x: auto;
    }

    .stories-table {
      min-width: 980px;
    }
  }
</style>
