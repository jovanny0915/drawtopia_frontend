<script lang="ts">
  import { onMount } from "svelte";
  import { user } from "../lib/stores/auth";
  import BookCard from "./BookCard.svelte";
  import AdvancedSelect from "./AdvancedSelect.svelte";
  import ShareStoryModal from "./ShareStoryModal.svelte";
  import magnifyingglass from "../assets/MagnifyingGlass.svg";

  export let stories: any[] = [];
  export let loadingStories: boolean = false;
  export let storiesError: string = "";
  export let fetchStories: (userId: string) => Promise<void>;
  export let childProfiles: any[] = [];

  let storiesFetched = false;
  let showShareStoryModal = false;
  let selectedStoryForSharing: any = null;

  let selectedFormat: string = "all";
  let selectedChild: string = "all";
  let selectedStatus: string = "all";
  let searchQuery: string = "";

  let formatOptions: Array<{ value: string; label: string }> = [
    {value: "all", label: "All Formats"},
    {value: "story_adventure", label: "Story Adventure Mode"},
    {value: "interactive_search", label: "Interactive Search Mode"},
  ];

  let childrenOptions: Array<{ value: string; label: string }> = [
    {value: "all", label: "All Children"},
  ];

  let statusOptions: Array<{ value: string; label: string }> = [
    {value: "all", label: "All Status"},
    {value: "completed", label: "Completed"},
    {value: "drafting", label: "Drafting"},
    {value: "generating", label: "Generating"},
    {value: "failed", label: "Failed"},
  ];

  // Update children options when childProfiles change
  $: childrenOptions = [
    {value: "all", label: "All Children"},
    ...childProfiles.map((child) => ({
        value: child.id?.toString() || child.id,
        label: child.name || child.first_name,
      })),
  ];

  // Filter stories based on selectedFormat, selectedChild, selectedStatus, and searchQuery
  $: filteredStories = stories.filter((story) => {
    // Filter by story type (format)
    if (selectedFormat !== "all") {
      const storyType = (story.story_type || "story").toLowerCase();
      if (selectedFormat === "story_adventure" && storyType !== "story") {
        return false;
      }
      if (selectedFormat === "interactive_search" && storyType !== "search") {
        return false;
      }
    }

    // Filter by child
    if (selectedChild !== "all") {
      const childId = story.child_profile_id?.toString() || story.child_profile_id;
      const selectedChildId = selectedChild.toString();
      if (childId !== selectedChildId) {
        return false;
      }
    }

    // Filter by status
    if (selectedStatus !== "all") {
      const storyStatus = (story.status || "").toLowerCase();
      if (storyStatus !== selectedStatus.toLowerCase()) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = (story.story_title || story.title || "").toLowerCase();
      const characterName = (story.character_name || "").toLowerCase();
      if (!title.includes(query) && !characterName.includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Fetch stories when component mounts or user changes
  onMount(() => {
    const unsubscribe = user.subscribe(($user) => {
      if ($user?.id && !storiesFetched) {
        console.log('[StoryLibraryView] Fetching stories for user:', $user.id);
        fetchStories($user.id);
        storiesFetched = true;
      }
    });

    return () => {
      unsubscribe();
    };
  });

  // Reset fetch flag when user changes
  $: if ($user?.id) {
    // Re-fetch stories if user changed and stories haven't been fetched yet
    if (!storiesFetched && fetchStories) {
      console.log('[StoryLibraryView] User available, fetching stories:', $user.id);
      fetchStories($user.id);
      storiesFetched = true;
    }
  }

  const handleViewBook = (event: CustomEvent) => {
    // Handle view book event if needed
    console.log('View book:', event.detail);
  };

  const handleShare = (event: CustomEvent) => {
    const storyInfo = event.detail;
    console.log('Share story:', storyInfo);
    selectedStoryForSharing = storyInfo;
    showShareStoryModal = true;
  };
</script>

<div class="frame-1410104150_01">
  <div class="frame-1410104154_01">
    <div class="frame-1410104155_01">
      <div class="search-input-container">
        <div class="frame-1410104151_01">
          <div class="story-library_01">
            <span class="storylibrary_01_span">Children Story</span>
          </div>
          <div class="browse-and-manage-all-created-stories">
            <span class="browseandmanageallcreatedstories_span"
              >Browse and manage all created stories</span
            >
          </div>
        </div>
        <div class="frame-1410103899">
          <div class="dropdown-filters">
            <div class="filter-select-wrapper">
              <AdvancedSelect
                options={formatOptions}
                bind:selectedOption={selectedFormat}
                placeholder="All Formats"
                id="format-select"
                width="250px"
              />
            </div>
            <div class="filter-select-wrapper">
              <AdvancedSelect
                options={childrenOptions}
                bind:selectedOption={selectedChild}
                placeholder="All Children"
                id="child-select"
                width="180px"
              />
            </div>
            <div class="filter-select-wrapper">
              <AdvancedSelect
                options={statusOptions}
                bind:selectedOption={selectedStatus}
                placeholder="All Status"
                id="status-select"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
    <div class="frame-1410103898">
      <img
        src={magnifyingglass}
        alt="magnifyingglass"
        class="magnifyingglass"
      />
      <input
        type="text"
        class="search-input"
        placeholder="Search Stories"
        bind:value={searchQuery}
      />
    </div>
    <div class="stories-grid">
      {#if loadingStories}
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading stories...</p>
        </div>
      {:else if storiesError}
        <div class="error-state">
          <p class="error-text">{storiesError}</p>
          <button
            class="retry-button"
            on:click={() => $user?.id && fetchStories($user.id)}
          >
            Try Again
          </button>
        </div>
      {:else if stories.length === 0}
        <div class="empty-state">
          <p class="empty-text">No stories found.</p>
          <p class="empty-subtext">
            Create your first story to get started!
          </p>
        </div>
      {:else if filteredStories.length === 0}
        <div class="empty-state">
          <p class="empty-text">No stories found.</p>
          <p class="empty-subtext">
            Try adjusting your filters or create a new story!
          </p>
        </div>
      {:else}
        {#each filteredStories as story (story.id || story.uid || `story-${story.created_at || Date.now()}`)}
          <BookCard item={story} on:viewBook={handleViewBook} on:share={handleShare} />
        {/each}
      {/if}
    </div>
  </div>
</div>

{#if showShareStoryModal}
  <ShareStoryModal 
    storyTitle={selectedStoryForSharing?.story_title || "Untitled Story"} 
    storyId={selectedStoryForSharing?.uid || selectedStoryForSharing?.id || ""}
    on:close={() => {
      showShareStoryModal = false;
      selectedStoryForSharing = null;
    }} 
  />
{/if}

<style>
  .storylibrary_01_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .story-library_01 {
    align-self: stretch;
  }

  .browseandmanageallcreatedstories_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .browse-and-manage-all-created-stories {
    align-self: stretch;
    height: 26px;
  }

  .frame-1410104151_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410103898 {
    width: 100%;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #f8fafb;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    outline: none;
  }

  .search-input::placeholder {
    color: #727272;
  }

  .search-input-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .dropdown-filters {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
  }

  .filter-select-wrapper {
    min-width: 150px;
  }

  .filter-select-wrapper :global(.container) {
    width: 100%;
  }

  .filter-select-wrapper :global(.dropdown) {
    padding: 12px 12px 12px 24px;
    height: auto;
    min-height: 48px;
    background: white;
    border: 1px solid #dcdcdc;
    border-radius: 20px;
    box-shadow: none;
  }

  .filter-select-wrapper :global(.selected-text) {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
  }

  .filter-select-wrapper :global(.icon) {
    width: 24px;
    height: 24px;
    stroke: #666;
  }

  .filter-select-wrapper :global(.dropdown-list) {
    border-radius: 20px;
    border: 1px solid #dcdcdc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .filter-select-wrapper :global(.item-btn) {
    padding: 12px 24px;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    color: black;
  }

  .filter-select-wrapper :global(.item-btn.selected) {
    background: #e3f2fd;
    color: #438bff;
    font-weight: 600;
  }

  .frame-1410103899 {
    width: 100%;
    justify-content: space-between;
    align-items: center;
    display: flex;
    gap: 12px;
  }

  .magnifyingglass {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410104155_01 {
    align-self: stretch;
    gap: 24px;
    display: flex;
    flex-direction: column;
  }

  .stories-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    width: 100%;
    justify-content: start;
  }

  .frame-1410104154_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .frame-1410104150_01 {
    align-self: stretch;
    padding: 16px;
    background: white;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  /* Loading, Error, and Empty States */
  .loading-state,
  .error-state,
  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    margin: 0;
  }

  .error-text {
    color: #dc2626;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    margin: 0 0 16px 0;
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

  .empty-text {
    color: #666d80;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .empty-subtext {
    color: #90a1b9;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    margin: 0;
  }

  /* Mobile responsive styles */
  @media (max-width: 800px) {
    .frame-1410104150_01 {
      padding: 12px;
    }

    .frame-1410104154_01 {
      gap: 16px;
      width: 100%;
    }

    .frame-1410104155_01 {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .stories-grid {
      grid-template-columns: 1fr;
      gap: 12px;
      width: 100%;
    }

    .frame-1410103899 {
      width: 100%;
      flex-direction: column;
      gap: 12px;
    }

    .frame-1410103898 {
      width: 100%;
    }

    .dropdown-filters {
      width: 100%;
      flex-direction: column;
      gap: 12px;
    }

    .filter-select-wrapper {
      width: 100%;
    }

    .storylibrary_01_span {
      font-size: 20px;
      line-height: 28px;
    }

    .browseandmanageallcreatedstories_span {
      font-size: 14px;
      line-height: 19.6px;
    }
  }
</style>

