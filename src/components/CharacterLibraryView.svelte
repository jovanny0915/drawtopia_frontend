<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { user } from "../lib/stores/auth";
  import { getAllCharacters, getAllStoriesForParent } from "../lib/database/stories";
  import CharacterCard from "./CharacterCard.svelte";
  import whitePlus from "../assets/Plus.svg";

  // Only keep event handler as prop - component manages its own data
  export let handleCharacterPreview: (event: CustomEvent) => void;

  // Internal state for characters and loading
  let characters: any[] = [];
  let loading: boolean = false;
  let error: string = "";
  let charactersFetched: boolean = false;

  let searchQuery: string = "";
  let selectedFilter: string = "all";

  // Filter options
  const filterOptions = [
    { value: "all", label: "All" },
    { value: "person", label: "Person" },
    { value: "animal", label: "Animal" },
    { value: "magical", label: "Magical" }
  ];

  // Filter characters based on search query and filter
  $: filteredCharacters = (() => {
    if (!characters || characters.length === 0) {
      return [];
    }
    
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const hasSearch = normalizedQuery.length > 0;
    const hasFilter = selectedFilter !== "all";
    
    // If no filters applied, return all characters
    if (!hasSearch && !hasFilter) {
      return characters;
    }
    
    return characters.filter((character) => {
      // Filter by search query
      const matchesSearch = hasSearch
        ? (character.character_name?.toLowerCase().includes(normalizedQuery) ?? false)
        : true;

      // Filter by character type
      const matchesFilter = hasFilter
        ? character.character_type === selectedFilter
        : true;

      return matchesSearch && matchesFilter;
    });
  })();

  // Fetch characters from API and calculate books count
  const fetchCharacters = async (userId: string) => {
    if (!userId || loading) return;
    
    console.log('[CharacterLibraryView] Fetching characters for user:', userId);
    loading = true;
    error = "";
    
    try {
      // Fetch characters from API
      const result = await getAllCharacters(userId);
      if (!result.success || !result.data) {
        error = result.error || "Failed to fetch characters";
        characters = [];
        console.error('[CharacterLibraryView] Error fetching characters:', error);
        loading = false;
        return;
      }

      // Fetch all stories to calculate books count
      const storiesResult = await getAllStoriesForParent(userId);
      let storiesData: any[] = [];
      
      if (storiesResult.success && storiesResult.data) {
        storiesData = Array.isArray(storiesResult.data) ? storiesResult.data : [];
        console.log('[CharacterLibraryView] Fetched stories:', storiesData.length);
      }

      // Calculate books count for each character
      const characterBookCounts = new Map<string, number>();
      
      storiesData.forEach((story: any) => {
        if (story.character_name) {
          const key = story.character_name.toLowerCase();
          characterBookCounts.set(key, (characterBookCounts.get(key) || 0) + 1);
        }
      });

      // Add booksCount to each character
      characters = result.data.map((character: any) => ({
        ...character,
        booksCount: characterBookCounts.get(character.character_name?.toLowerCase() || '') || 0
      }));

      console.log('[CharacterLibraryView] Successfully fetched', characters.length, 'characters with books count');
    } catch (err) {
      error = "An error occurred while fetching characters";
      characters = [];
      console.error('[CharacterLibraryView] Exception fetching characters:', err);
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
    console.log('[CharacterLibraryView] User available, fetching characters:', $user.id);
    fetchCharacters($user.id);
    charactersFetched = true;
  }
</script>

<div class="frame-1410104150_01">
  <div class="frame-1410104154_01">
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

    </div>
    <div style="display: flex; gap: 10px; flex-direction: row-reverse; justify-content: space-between; align-items: center; width: 100%; height: 49px;">
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
  </div>

  <div class="frame-1410103894">
    {#if loading}
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading characters...</p>
      </div>
    {:else if error}
      <div class="error-state">
        <p class="error-text">{error}</p>
        {#if $user?.id}
          <button
            class="retry-button"
            on:click={() => {
              charactersFetched = false;
              fetchCharacters($user.id);
            }}
          >
            Try Again
          </button>
        {/if}
      </div>
    {:else if filteredCharacters.length === 0}
      <div class="empty-state">
        <p class="empty-text">No characters found</p>
      </div>
    {:else}
      {#each filteredCharacters as character (character.id || character.character_name)}
        <CharacterCard 
          item={character} 
          on:preview={handleCharacterPreview}
        />
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
    display: flex;
    align-items: center;
    justify-content: center;
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
    display: flex;
    align-items: center;
    justify-content: center;
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
    width: 409px;
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
    width: 398px;
  }

  .frame-1410104155_01 {
    align-self: stretch;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    display: flex;
    height: 49px  ;
  }

  .frame-1410104154_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
    width: 100%;
  }

  .frame-1410104150_01 {
    align-self: stretch;
    padding: 16px;
    background: white;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-1410103894 {
    align-self: stretch;
    gap: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
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

  .retry-button:active {
    transform: scale(0.98);
  }

  .empty-text {
    color: #666d80;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    margin: 0 0 8px 0;
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
      gap: 12px;
    }

    .yourcharacterlibrary_01_span {
      font-size: 20px;
      line-height: 28px;
    }

    .selectacharactertouseinyournewbook_01_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .frame-1410103894 {
      grid-template-columns: 1fr;
    }

    .dropdown_01 {
      flex-wrap: wrap;
    }

    .dropdown_item {
      min-width: 80px;
    }
  }
</style>

