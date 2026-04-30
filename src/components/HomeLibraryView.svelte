<script lang="ts">
  import BookCard from "./BookCard.svelte";
  import CharacterCard from "./CharacterCard.svelte";
  import ChildCard from "./ChildCard.svelte";
  import AdvancedSelect from "./AdvancedSelect.svelte";
  import ShareStoryModal from "./ShareStoryModal.svelte";
  import plus from "../assets/Plus.svg";
  import usercircleplus from "../assets/UserCirclePlus.svg";

  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { user } from "$lib/stores/auth";
  import { getAllStoriesForParent, getAllCharacters } from "$lib/database/stories";
  import { getChildrenForParent } from "$lib/database/childProfiles";
  
  export let handleAddChildren: () => void;
  export let handleCharacterPreview: (event: CustomEvent) => void;
  export let handleNewStory: (event: CustomEvent) => void;
  export let libraryView: "all" | "characters" | "children" = "all";

  const setLibraryView = (v: "all" | "characters" | "children") =>
  (libraryView = v);
  
  let loadingStories: boolean = false;
  let storiesError: string = "";
  let error: string = "";
  let allStories: any[] = [];
  let filteredStories: any[] = [];
  let characters: any[] = [];
  let childProfiles: any[] = [];
  let loading: boolean = false;
  let showShareStoryModal = false;
  let selectedStoryForSharing: any = null;
  let loadingCharacters: boolean = false;
  let charactersError: string = "";

  let selectedFormat: string = "all";
  let selectedChild: string = "all";
  let selectedStatus: string = "all";
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

  $: childrenOptions = [
    {value: "all", label: "All Children"},
    ...childProfiles.map((child) => ({
        value: child.id?.toString() || child.id,
        label: child.name || child.first_name,
      })),
  ];

  $: filteredStories = allStories.filter((story) => {
    if (selectedFormat !== "all") {
      const storyType = (story.story_type || "story").toLowerCase();
      if (selectedFormat === "story_adventure" && storyType !== "story") {
        return false;
      }
      if (selectedFormat === "interactive_search" && storyType !== "search") {
        return false;
      }
    }

    if (selectedChild !== "all") {
      const childId = story.child_profile_id?.toString() || story.child_profile_id;
      const selectedChildId = selectedChild.toString();
      if (childId !== selectedChildId) {
        return false;
      }
    }

    if (selectedStatus !== "all") {
      const storyStatus = (story.status || "").toLowerCase();
      if (storyStatus !== selectedStatus.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  $: storiesWithKeys = filteredStories.map((story, index) => {
    const uniqueKey = story.id || story.uid || `story-${index}-${story.created_at || Date.now()}`;
    return {
      ...story,
      _uniqueKey: uniqueKey
    };
  });

  export let adventureStoriesCount: number = 0;
  export let searchStoriesCount: number = 0;
  export let adventureReadingTime: number = 0;
  export let searchReadingTime: number = 0;
  export let audioListenedCount: number = 0;
  export let averageStars: number = 0;
  export let averageHints: number = 0;

  $: {
    const adventureStories = allStories.filter(story => {
      const storyType = (story.story_type || "story").toLowerCase();
      return storyType === "story";
    });
    
    const searchStories = allStories.filter(story => {
      const storyType = (story.story_type || "story").toLowerCase();
      return storyType === "search";
    });
    
    adventureStoriesCount = adventureStories.length;
    searchStoriesCount = searchStories.length;
    
    adventureReadingTime = adventureStories.reduce((total, story) => {
      if (story.reading_state && typeof story.reading_state === 'object') {
        const readingTime = story.reading_state.reading_time || 0;
        return total + readingTime;
      }
      return total;
    }, 0);
    
    searchReadingTime = searchStories.reduce((total, story) => {
      if (story.reading_state && typeof story.reading_state === 'object') {
        const readingTime = story.reading_state.reading_time || 0;
        return total + readingTime;
      }
      return total;
    }, 0);
    
    audioListenedCount = adventureStories.filter(story => {
      if (story.reading_state && typeof story.reading_state === 'object') {
        return story.reading_state.audio_listened === true;
      }
      return false;
    }).length;
    
    const searchStoriesWithStars = searchStories.filter(story => 
      story.reading_state && 
      typeof story.reading_state === 'object' && 
      typeof story.reading_state.avg_star === 'number'
    );
    
    if (searchStoriesWithStars.length > 0) {
      const totalStars = searchStoriesWithStars.reduce((sum, story) => {
        return sum + (story.reading_state.avg_star || 0);
      }, 0);
      averageStars = totalStars / searchStoriesWithStars.length;
    } else {
      averageStars = 0;
    }
    
    const searchStoriesWithHints = searchStories.filter(story => 
      story.reading_state && 
      typeof story.reading_state === 'object' && 
      typeof story.reading_state.avg_hint === 'number'
    );
    
    if (searchStoriesWithHints.length > 0) {
      const totalHints = searchStoriesWithHints.reduce((sum, story) => {
        return sum + (story.reading_state.avg_hint || 0);
      }, 0);
      averageHints = totalHints / searchStoriesWithHints.length;
    } else {
      averageHints = 0;
    }
  }

  let currentUserId: string = "";
  let charactersFetched: boolean = false;

  $: if (libraryView === "characters" && !charactersFetched && !loadingCharacters && currentUserId) {
    loadingCharacters = true;
    charactersFetched = true;
    charactersError = "";
    getAllCharacters(currentUserId).then((result) => {
      if (result.success && result.data) {
        const characterBookCounts = new Map<string, number>();
        
        allStories.forEach((story: any) => {
          if (story.character_name) {
            const key = story.character_name.toLowerCase();
            characterBookCounts.set(key, (characterBookCounts.get(key) || 0) + 1);
          }
        });

        characters = result.data.map((character: any) => ({
          ...character,
          booksCount: characterBookCounts.get(character.character_name?.toLowerCase() || '') || 0
        }));
      } else {
        charactersError = result.error || "Failed to fetch characters";
        characters = [];
      }
      loadingCharacters = false;
    }).catch((err) => {
      charactersError = err instanceof Error ? err.message : 'Failed to fetch characters';
      characters = [];
      loadingCharacters = false;
    });
  }

  $: if (libraryView !== "characters") {
    charactersFetched = false;
  }

  let childrenFetched: boolean = false;

  $: if (libraryView === "children" && !childrenFetched && !loading && currentUserId) {
    loading = true;
    childrenFetched = true;
    error = "";
    getChildrenForParent(currentUserId).then((result) => {
      if (result.success && result.data) {
        childProfiles = result.data;
      } else {
        error = result.error || "Failed to fetch children";
        childProfiles = [];
      }
      loading = false;
    }).catch((err) => {
      error = err instanceof Error ? err.message : 'Failed to fetch children';
      childProfiles = [];
      loading = false;
    });
  }

  $: if (libraryView !== "children") {
    childrenFetched = false;
  }

  onMount(() => {
    const unsubscribe = user.subscribe(($user) => {
      if ($user?.id) {
        currentUserId = $user.id;
        loadingStories = true;
        storiesError = "";
        getAllStoriesForParent($user.id).then((result) => {
          if (result.success && result.data) {
            allStories = result.data;
          } else {
            storiesError = result.error || "Failed to fetch stories";
            allStories = [];
          }
          loadingStories = false;
        }).catch((err) => {
          storiesError = err instanceof Error ? err.message : 'Failed to fetch stories';
          allStories = [];
          loadingStories = false;
        });

        getChildrenForParent($user?.id).then((result) => {
          if (result.success && result.data) {
            childProfiles = result.data;
          } else {
            error = result.error || "Failed to fetch children";
            childProfiles = [];
          }
        }).catch((err) => {
          error = err instanceof Error ? err.message : 'Failed to fetch children';
          childProfiles = [];
        });
      }
    });
    return unsubscribe;
  })

  const handleViewBook = async (event: CustomEvent) => {
    const bookInfo = event.detail;
    console.log(bookInfo);
  }

  const handleShare = (event: CustomEvent) => {
    const storyInfo = event.detail;
    console.log('Share story:', storyInfo);
    selectedStoryForSharing = storyInfo;
    showShareStoryModal = true;
  }
  
    

      






        


        


            



  

</script>

<div class="frame-1410104150">
  <div class="frame-2147227615">
    <div class="frame-2147227616">
      <div class="frame-2147227614">
        <div class="your-library">
          <span class="yourlibrary_span">Your Library</span>
        </div>
        <div class="switch" role="tablist" aria-label="Your Library view">
          <div
            class="button"
            class:active={libraryView === "all"}
            role="tab"
            aria-selected={libraryView === "all"}
            tabindex="0"
            on:click={() => setLibraryView("all")}
            on:keydown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              setLibraryView("all")}
          >
            <div><span class="allbooks_span">All Books</span></div>
          </div>
          <div
            class="button_01"
            class:active={libraryView === "characters"}
            role="tab"
            aria-selected={libraryView === "characters"}
            tabindex="0"
            on:click={() => setLibraryView("characters")}
            on:keydown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              setLibraryView("characters")}
          >
            <div><span class="characters_span">Characters</span></div>
          </div>
          <div
            class="button_02"
            class:active={libraryView === "children"}
            role="tab"
            aria-selected={libraryView === "children"}
            tabindex="0"
            on:click={() => setLibraryView("children")}
            on:keydown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              setLibraryView("children")}
          >
            <div><span class="children_span">Children</span></div>
          </div>
        </div>
      </div>
      <div class="frame-1410104245" on:click={() => goto("/create-character/1")} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && goto("/create-character/1")}>
        <div class="ellipse-1415"></div>
        <div class="plus">
          <img src={plus} alt="plus" />
        </div>
        <div class="new-book">
          <span class="newbook_span">New Book</span>
        </div>
      </div>
    </div>
    <div class="rectangle-263"></div>
    <div class="frame-1410103899-add-children">
      {#if libraryView === "children"}
        <div class="frame-1410104245-add-children" on:click={handleAddChildren} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleAddChildren()}>
          <div class="usercircleplus-add-children">
            <img src={usercircleplus} alt="add children" class="usercircleplus-icon" />
          </div>
          <div class="add-children"><span class="addchildren_span">Add Children</span></div>
          <div class="ellipse-1415-add-children"></div>
        </div>
      {/if}
      <div class="frame-1410103899">
          <div class="dropdown-filters">
            <div class="filter-select-wrapper">
              <AdvancedSelect
                options={formatOptions}
                bind:selectedOption={selectedFormat}
                placeholder="All Formats"
                id="format-select"
              />
            </div>
            <div class="filter-select-wrapper">
              <AdvancedSelect
                options={childrenOptions}
                bind:selectedOption={selectedChild}
                placeholder="All Children"
                id="child-select"
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
  <div class="frame-1410104154">
    <div class="frame-1410103894">
      {#if libraryView === "all"}
        {#if loadingStories}
          <div class="loading-message">Loading books...</div>
        {:else if storiesError}
          <div class="error-message">{storiesError}</div>
        {:else if filteredStories.length === 0}
          <div class="empty-message">No books found</div>
        {:else}
          {#each storiesWithKeys as story (story._uniqueKey)}
            <BookCard item={story} on:viewBook={handleViewBook} on:share={handleShare} />
          {/each}
        {/if}
      {:else if libraryView === "characters"}
        {#if loadingCharacters}
          <div class="loading-message">Loading characters...</div>
        {:else if charactersError}
          <div class="error-message">{charactersError}</div>
        {:else if characters.length === 0}
          <div class="empty-message">No characters found</div>
        {:else}
          {#each characters as character (character.id || character.uid || `character-${character.character_name || ''}`)}
            <CharacterCard 
              item={character} 
              booksCount={character.booksCount || 0}
              on:preview={handleCharacterPreview}
            />
          {/each}
        {/if}
      {:else if libraryView === "children"}
        {#if loading}
          <div class="loading-message">Loading children...</div>
        {:else if error}
          <div class="error-message">{error}</div>
        {:else if childProfiles.length === 0}
          <div class="empty-message">No children found</div>
        {:else}
          {#each childProfiles as child, index (child.id || child.uid || `child-${index}-${child.first_name || ''}`)}
            <ChildCard 
            item={child}
            on:newStory={handleNewStory}
            on:editChild={(event) => {
              const childItem = event.detail.item || child;
              goto(
                `/create-child-profile/edit?id=${childItem.id || ""}&name=${encodeURIComponent(childItem.name || childItem.first_name || "")}`,
              );
            }}
          />
          {/each}
        {/if}
      {/if}
    </div>
  </div>
</div>

{#if showShareStoryModal}
  <ShareStoryModal 
    storyTitle={selectedStoryForSharing?.story_title || "Untitled Story"} 
    storyId={selectedStoryForSharing?.uid || selectedStoryForSharing?.id || ""}
    storyCoverUrl={selectedStoryForSharing?.story_cover ?? ""}
    on:close={() => {
      showShareStoryModal = false;
      selectedStoryForSharing = null;
    }} 
  />
{/if}

<style>
  .yourlibrary_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.8px;
    word-wrap: break-word;
  }

  .your-library {
    text-align: center;
  }

  .allbooks_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .characters_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .children_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -49px;
    top: 20px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .newbook_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .new-book {
    text-align: center;
  }

  .rectangle-263 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .button {
    padding-left: 22px;
    padding-right: 22px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .switch .button,
  .switch .button_01,
  .switch .button_02 {
    border-radius: 12px;
    cursor: pointer;
  }
  .switch .button.active,
  .switch .button_01.active,
  .switch .button_02.active {
    background: white;
  }
  .switch .button .allbooks_span,
  .switch .button_01 .characters_span,
  .switch .button_02 .children_span {
    color: #727272;
  }
  .switch .button.active .allbooks_span,
  .switch .button_01.active .characters_span,
  .switch .button_02.active .children_span {
    color: #141414;
  }

  .button_01 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .button_02 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .plus {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .switch {
    width: 371px;
    padding: 4px;
    background: #eceff3;
    border-radius: 8px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104245 {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438bff;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
    cursor: pointer;
  }

  .frame-2147227614 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .frame-2147227616 {
    align-self: stretch;
    justify-content: space-between;
    align-items: flex-end;
    display: inline-flex;
  }

  .frame-1410103899 {
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: inline-flex;
  }

  .dropdown-filters {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .filter-select-wrapper {
    flex: 1;
    min-width: 250px;
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

  .frame-2147227615 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410103894 {
    align-self: stretch;
    gap: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .loading-message,
  .error-message,
  .empty-message {
    grid-column: 1 / -1;
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

  .frame-1410104154 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410104150 {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: inline-flex;
    padding: 32px;
  }

  .frame-1410104245-add-children {
    width: 200px;
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
    transition: background-color 0.2s;
    box-sizing: border-box;
  }

  .frame-1410104245-add-children:hover {
    background: #3b7ce6;
  }

  .frame-1410103899-add-children {
    flex-direction: row;
    gap: 12px;
    display: flex;
  }

  .usercircleplus-add-children {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .usercircleplus-icon {
    width: 24px;
    height: 24px;
    filter: brightness(0) invert(1);
  }

  .ellipse-1415-add-children {
    width: 248px;
    height: 114px;
    left: -38px;
    top: 20px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
    pointer-events: none;
  }

  .addchildren_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .add-children {
    text-align: center;
  }

  @media (max-width: 800px) {
    .frame-1410104150 {
      width: 100%;
    }

    .frame-1410103899 {
      width: 100%;
      flex-direction: column;
      gap: 12px;
    }

    .dropdown-filters {
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }

    .filter-select-wrapper {
      width: 100%;
    }

    .frame-1410104154 {
      gap: 16px;
    }
  }
</style>

