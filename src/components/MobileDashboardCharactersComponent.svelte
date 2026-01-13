<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { createEventDispatcher } from "svelte";
  import { user } from "../lib/stores/auth";
  import { getAllCharacters, getAllStoriesForParent } from "../lib/database/stories";
  import CharacterCard from "./CharacterCard.svelte";
  import whitePlus from "../assets/Plus.svg";

  const dispatch = createEventDispatcher();

  // Internal state for characters and loading
  let characters: any[] = [];
  let loading: boolean = false;
  let error: string = "";
  let charactersFetched: boolean = false;

  // Filter states
  let selectedFilter = "all";
  let searchQuery = "";

  // Filter options
  const filterOptions = [
    { value: "all", label: "All" },
    { value: "person", label: "Person" },
    { value: "animal", label: "Animal" },
    { value: "magical", label: "Magical" }
  ];

  // Filtered characters based on search and filter
  $: filteredCharacters = characters.filter((character) => {
    // Filter by search query
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = !normalizedQuery || 
      (character.character_name?.toLowerCase().includes(normalizedQuery) ?? false);

    // Filter by character type
    const matchesFilter = selectedFilter === "all" || 
      character.character_type === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  // Fetch characters from API and calculate books count
  const fetchCharacters = async (userId: string) => {
    if (!userId || loading) return;
    
    console.log('[MobileDashboardCharactersComponent] Fetching characters for user:', userId);
    loading = true;
    error = "";
    
    try {
      // Fetch characters from API
      const result = await getAllCharacters(userId);
      if (!result.success || !result.data) {
        error = result.error || "Failed to fetch characters";
        characters = [];
        console.error('[MobileDashboardCharactersComponent] Error fetching characters:', error);
        loading = false;
        return;
      }

      characters = result.data;
    } catch (err) {
      error = "An error occurred while fetching characters";
      characters = [];
      console.error('[MobileDashboardCharactersComponent] Exception fetching characters:', err);
    } finally {
      loading = false;
    }
  };

  // Fetch characters when component mounts
  onMount(() => {
    const unsubscribe = user.subscribe(($user) => {
      if ($user?.id && !charactersFetched) {
        fetchCharacters($user.id);
        charactersFetched = true;
      }
    });

    return () => {
      unsubscribe();
    };
  });

  // Reactive statement to handle user changes
  $: if ($user?.id && !charactersFetched) {
    console.log('[MobileDashboardCharactersComponent] User available, fetching characters:', $user.id);
    fetchCharacters($user.id);
    charactersFetched = true;
  }

  // Handle character preview from CharacterCard
  function handleCharacterPreview(event: CustomEvent) {
    dispatch("characterPreview", event.detail);
  }
</script>

<div class="sidebar">
  <div class="frame-1410104150_01">
    <div class="frame-1410104155_01">
      <div class="frame-1410104151_01">
        <div class="your-character-library_01">
          <span class="yourcharacterlibrary_01_span">Your Character Library</span>
        </div>
        <div class="select-a-character-to-use-in-your-new-book_01">
          <span class="selectacharactertouseinyournewbook_01_span">Select a character to use in your new book</span>
        </div>
      </div>

      <div 
        class="frame-1410104245_01" 
        on:click={() => goto("/create-character/1")}
        role="button"
        tabindex="0"
        on:keydown={(e) => (e.key === "Enter" || e.key === " ") && goto("/create-character/1")}
      >
        <div class="ellipse-1415_01"></div>
        <div class="plus_01">
          <img src={whitePlus} alt="plus" />
        </div>
        <div class="create-new_01">
          <span class="createnew_01_span">Create New</span>
        </div>
      </div>

      <div class="dropdown_01">
        {#each filterOptions as option}
          <div 
            class="dropdown_item" 
            class:active={selectedFilter === option.value}
            on:click={() => selectedFilter = option.value}
            role="button"
            tabindex="0"
            on:keydown={(e) => (e.key === "Enter" || e.key === " ") && (selectedFilter = option.value)}
          >
            <div class="filter-text">
              <span class="filter_span">{option.label}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="frame-1410103898_01">
      <div class="magnifyingglass_01">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <input 
        type="text" 
        placeholder="Search Character" 
        bind:value={searchQuery}
        class="search-input"
      />
    </div>
  </div>

  <div class="frame-1410103852">
    {#if loading}
      <div class="loading-message">Loading characters...</div>
    {:else if error}
      <div class="error-message">{error}</div>
    {:else if filteredCharacters.length === 0}
      <div class="empty-message">No characters found</div>
    {:else}
      {#each filteredCharacters as character (character.id)}
        <CharacterCard item={character} on:preview={handleCharacterPreview} />
      {/each}
    {/if}
  </div>
</div>

<style>
  .yourcharacterlibrary_01_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
  }

  .your-character-library_01 {
    align-self: stretch;
  }

  .selectacharactertouseinyournewbook_01_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .select-a-character-to-use-in-your-new-book_01 {
    align-self: stretch;
  }

  .ellipse-1415_01 {
    width: 248px;
    height: 114px;
    left: 52px;
    top: 17px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .plus_01 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .createnew_01_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .create-new_01 {
    text-align: center;
  }

  .filter_span {
    color: black;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .filter-text {
    text-align: center;
  }

  .dropdown_item {
    flex: 1 1 0;
    padding: 12px;
    border-radius: 9999px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dropdown_item.active {
    background: white;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .dropdown_item:hover {
    background: #f5f5f5;
  }

  .dropdown_item.active:hover {
    background: white;
  }

  .magnifyingglass_01 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.40px;
  }

  .search-input::placeholder {
    color: #727272;
  }

  .frame-1410104151_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .dropdown_01 {
    align-self: stretch;
    padding: 4px;
    background: #F8FAFB;
    border-radius: 99px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104245_01 {
    align-self: stretch;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438BFF;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .frame-1410104245_01:hover {
    background: #3a7ae4;
  }

  .frame-1410103898_01 {
    align-self: stretch;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #F8FAFB;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410104155_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410104150_01 {
    align-self: stretch;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-1410103852 {
    width: 100%;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .sidebar {
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .loading-message,
  .error-message,
  .empty-message {
    width: 100%;
    padding: 32px;
    text-align: center;
    color: #666;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
  }

  .error-message {
    color: #d32f2f;
  }

  .empty-message {
    color: #999;
  }
</style>
