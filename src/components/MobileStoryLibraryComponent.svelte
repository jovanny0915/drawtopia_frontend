<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "../lib/stores/auth";
  import BookCard from "./BookCard.svelte";
  import CharacterCard from "./CharacterCard.svelte";
  import ChildCard from "./ChildCard.svelte";
  import AdvancedSelect from "./AdvancedSelect.svelte";
  import whitePlus from "../assets/Plus.svg";
  import searchIcon from "../assets/MagnifyingGlass.svg";

  export let libraryView: "all" | "characters" | "children" = "all";
  export let setLibraryView: (v: "all" | "characters" | "children") => void;
  export let stories: any[] = [];
  export let characters: any[] = [];
  export let childProfiles: any[] = [];
  export let loading: boolean = false;
  export let loadingStories: boolean = false;
  export let error: string = "";
  export let storiesError: string = "";
  export let selectedFormat: string = "all";
  export let selectedChild: string = "all";
  export let selectedStatus: string = "all";
  export let formatOptions: any[] = [];
  export let childrenOptions: any[] = [];
  export let statusOptions: any[] = [];
  export let filteredStories: any[] = [];
  export let fetchStories: (userId: string) => Promise<void>;
  export let fetchChildProfiles: (userId: string) => Promise<void>;

  let searchQuery = "";

  // Apply search filter on top of the already filtered stories
  $: searchFilteredStories = searchQuery.trim() 
    ? filteredStories.filter(story => 
        story.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.story_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.author?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredStories;

  // Filter characters based on search query
  $: searchFilteredCharacters = searchQuery.trim()
    ? characters.filter(character =>
        character.character_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.character_type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : characters;

  // Filter children based on search query
  $: searchFilteredChildren = searchQuery.trim()
    ? childProfiles.filter(child =>
        child.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : childProfiles;

  // Clear search
  function clearSearch() {
    searchQuery = "";
  }
</script>

<div class="frame-1410104150">
  <div class="frame-1410104155">
    <div class="frame-1410104151">
      <div class="children-story">
        <span class="childrenstory_span">Children Story</span>
      </div>
      <div class="browse-and-manage-all-created-stories">
        <span class="browseandmanageallcreatedstories_span">Browse and manage all created stories</span>
      </div>
    </div>
    <div class="dropdown">
      <div class="filter-select-wrapper">
        <AdvancedSelect
          options={formatOptions}
          bind:selectedOption={selectedFormat}
          placeholder="All Formats"
          id="story-library-format-select"
        />
      </div>
      <div class="filter-select-wrapper">
        <AdvancedSelect
          options={childrenOptions}
          bind:selectedOption={selectedChild}
          placeholder="All Children"
          id="story-library-child-select"
        />
      </div>
      <div class="filter-select-wrapper">
        <AdvancedSelect
          options={statusOptions}
          bind:selectedOption={selectedStatus}
          placeholder="All Status"
          id="story-library-status-select"
        />
      </div>
    </div>
  </div>
  <div class="frame-1410103898">
    <div class="magnifyingglass">
      <img src={searchIcon} alt="search" />
    </div>
    <input 
      type="text" 
      placeholder="Search Stories" 
      bind:value={searchQuery}
      class="search-stories"
    />
  </div>

  <div class="frame-1410104154">
    <div class="frame-1410103894">
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
      {:else if searchFilteredStories.length === 0}
        <div class="empty-state">
          {#if searchQuery}
            <p class="empty-text">No stories found for "{searchQuery}"</p>
            <p class="empty-subtext">Try adjusting your search terms</p>
            <button class="clear-search-button" on:click={clearSearch}>Clear Search</button>
          {:else}
            <p class="empty-text">No stories found</p>
            <p class="empty-subtext">Create your first story to get started!</p>
          {/if}
        </div>
      {:else}
        {#each searchFilteredStories as story (story.id)}
          <BookCard item={story} />
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
.childrenstory_span {
  color: black;
  font-size: 24px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 28.80px;
  word-wrap: break-word;
}

.children-story {
  align-self: stretch;
}

.browseandmanageallcreatedstories_span {
  color: #727272;
  font-size: 16px;
  font-family: DM Sans;
  font-weight: 400;
  line-height: 22.40px;
  word-wrap: break-word;
}

.browse-and-manage-all-created-stories {
  align-self: stretch;
  height: 26px;
}

.allformats_span {
  color: black;
  font-size: 16px;
  font-family: DM Sans;
  font-weight: 400;
  line-height: 22.40px;
  word-wrap: break-word;
}

.all-formats {
  text-align: center;
}

.vector {
  width: 13.75px;
  height: 7.50px;
  left: 3.13px;
  top: 6.88px;
  position: absolute;
  background: black;
}

.allchildren_span {
  color: black;
  font-size: 16px;
  font-family: DM Sans;
  font-weight: 400;
  line-height: 22.40px;
  word-wrap: break-word;
}

.all-children {
  text-align: center;
}

.vector_01 {
  width: 13.75px;
  height: 7.50px;
  left: 3.13px;
  top: 6.88px;
  position: absolute;
  background: black;
}

.allstatus_span {
  color: black;
  font-size: 16px;
  font-family: DM Sans;
  font-weight: 400;
  line-height: 22.40px;
  word-wrap: break-word;
}

.all-status {
  text-align: center;
}

.vector_02 {
  width: 13.75px;
  height: 7.50px;
  left: 3.13px;
  top: 6.88px;
  position: absolute;
  background: black;
}

.search-stories {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #727272;
  font-size: 16px;
  font-family: Quicksand;
  font-weight: 500;
  line-height: 22.40px;
  word-wrap: break-word;
}

.search-stories::placeholder {
  color: #727272;
}

.vector_04 {
  width: 11px;
  height: 13px;
  left: 2.50px;
  top: 1.50px;
  position: absolute;
  background: #438BFF;
}

.story_span {
  color: #438BFF;
  font-size: 14px;
  font-family: Quicksand;
  font-weight: 700;
  line-height: 19.60px;
  word-wrap: break-word;
}

.story {
  text-align: center;
}



.frame-1410104151 {
  align-self: stretch;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 4px;
  display: flex;
}

.sub-menu {
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: flex;
}

.frame-1410104124 {
  align-self: stretch;
  height: 38px;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  display: inline-flex;
}

.form {
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 4px;
  display: inline-flex;
}

.sub-menu_01 {
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: flex;
}

.caretdown {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.caretdown_01 {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.caretdown_02 {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.magnifyingglass {
  width: 24px;
  height: 24px;
  position: relative;
  overflow: hidden;
}

.magnifyingglass img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.book {
  width: 16px;
  height: 16px;
  position: relative;
  overflow: hidden;
}

.eye {
  width: 16px;
  height: 16px;
  position: relative;
  overflow: hidden;
}

.downloadsimple {
  width: 18px;
  height: 18px;
  position: relative;
  overflow: hidden;
}

.sharenetwork {
  width: 18px;
  height: 18px;
  position: relative;
  overflow: hidden;
}

.frame-1410103850 {
  justify-content: center;
  align-items: center;
  gap: 8px;
  display: flex;
}

.dropdown_01 {
  align-self: stretch;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 24px;
  padding-right: 12px;
  background: white;
  border-radius: 12px;
  outline: 1px #DCDCDC solid;
  outline-offset: -1px;
  justify-content: space-between;
  align-items: center;
  display: inline-flex;
}

.dropdown_02 {
  align-self: stretch;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 24px;
  padding-right: 12px;
  background: white;
  border-radius: 12px;
  outline: 1px #DCDCDC solid;
  outline-offset: -1px;
  justify-content: space-between;
  align-items: center;
  display: inline-flex;
}

.dropdown_03 {
  align-self: stretch;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 24px;
  padding-right: 12px;
  background: white;
  border-radius: 12px;
  outline: 1px #DCDCDC solid;
  outline-offset: -1px;
  justify-content: space-between;
  align-items: center;
  display: inline-flex;
}

.frame-1410103898 {
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

.frame-1410103869 {
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 14px;
  padding-right: 16px;
  background: white;
  border-radius: 12px;
  outline: 1px #438BFF solid;
  outline-offset: -1px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  display: flex;
}

.frame-1410104245 {
  flex: 1 1 0;
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
  display: flex;
}

.button {
  width: 44px;
  height: 44px;
  padding: 10px;
  border-radius: 12px;
  outline: 1px #EDEDED solid;
  outline-offset: -1px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: flex;
}

.button_01 {
  width: 44px;
  height: 44px;
  padding: 10px;
  border-radius: 12px;
  outline: 1px #EDEDED solid;
  outline-offset: -1px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: flex;
}

.frame-1410104125 {
  align-self: stretch;
  height: 38px;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  display: inline-flex;
}

.dropdown {
  align-self: stretch;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 12px;
  display: flex;
}

.filter-select-wrapper {
  width: 100%;
}


.frame-1410104126 {
  align-self: stretch;
  height: 38px;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  display: inline-flex;
}

.frame-1410104166 {
  align-self: stretch;
  justify-content: center;
  align-items: center;
  gap: 6px;
  display: inline-flex;
}

.frame-1410104155 {
  align-self: stretch;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 16px;
  display: flex;
}


.frame-1410103894 {
  align-self: stretch;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 16px;
  display: flex;
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
  border-radius: 8px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  display: inline-flex;
}

/* Loading, Error, and Empty States */
.loading-state,
.error-state,
.empty-state {
  width: 100%;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.retry-button,
.clear-search-button {
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

.retry-button:hover,
.clear-search-button:hover {
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
  margin: 0 0 16px 0;
}
</style>
