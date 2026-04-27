<script lang="ts">
  import { page } from '$app/stores';
  import BookTemplatesPage from '../../../routes/admin/book-templates/+page.svelte';
  import StoryListPanel from '$lib/components/admin/StoryListPanel.svelte';

  type StoriesTab = 'book-templates' | 'story-list';

  function normalizeTab(value: string | null): StoriesTab {
    return value === 'book-templates' ? 'book-templates' : 'story-list';
  }

  $: activeTab = normalizeTab($page.url.searchParams.get('tab'));
</script>

{#if activeTab === 'book-templates'}
  <BookTemplatesPage />
{:else}
  <StoryListPanel />
{/if}

<style>
  :global(.stories-admin-panel) {
    width: 100%;
  }
</style>
