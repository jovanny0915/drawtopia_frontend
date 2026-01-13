<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "../lib/stores/auth";
  import BookCard from "./BookCard.svelte";
  import CharacterCard from "./CharacterCard.svelte";
  import ChildCard from "./ChildCard.svelte";
  import AdvancedSelect from "./AdvancedSelect.svelte";
  import ShareStoryModal from "./ShareStoryModal.svelte";
  import whitePlus from "../assets/Plus.svg";
  import userCirclePlus from "../assets/UserCirclePlus.svg";
  import bookIcon from "../assets/Book.svg";
  import bookOpen from "../assets/BookOpen.svg";
  import headset from "../assets/OutlineHeadset.svg";
  import starIcon from "../assets/OutlineStar.svg";
  
  let showShareStoryModal = false;
  let selectedStoryForSharing: any = null;

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
  
  // Reading statistics props
  export let adventureStoriesCount: number = 0;
  export let searchStoriesCount: number = 0;
  export let adventureReadingTime: number = 0;
  export let searchReadingTime: number = 0;
  export let audioListenedCount: number = 0;
  export let averageStars: number = 0;
  export let averageHints: number = 0;

  import { createEventDispatcher } from "svelte";
    import { browser } from "$app/environment";
    import { storyCreation } from "$lib/stores/storyCreation";
  const dispatch = createEventDispatcher();

  // Helper function to format reading time
  function formatReadingTime(seconds: number): string {
    if (seconds === 0) return '0 s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    let parts: string[] = [];
    if (h > 0) parts.push(`${h} h`);
    if (m > 0) parts.push(`${m} m`);
    if (s > 0) parts.push(`${s} s`);
    return parts.length > 0 ? parts.join(' ') : '0 s';
  }

  // Handle character preview event
  function handleCharacterPreview(event: CustomEvent) {
    dispatch("characterPreview", event.detail);
  }

  // Handle share event
  function handleShare(event: CustomEvent) {
    const storyInfo = event.detail;
    console.log('Share story:', storyInfo);
    selectedStoryForSharing = storyInfo;
    showShareStoryModal = true;
  }

  function handleNewStory(event: CustomEvent): void {
    const child = event.detail.item || event.detail;
    const childId = child.id?.toString();
    const childName = child.name || child.first_name || "Unnamed Child";

    if (!childId) {
      console.error("Child ID is missing");
      return;
    }

    // Store child info in sessionStorage
    if (browser) {
      sessionStorage.setItem("selectedChildProfileId", childId);
      sessionStorage.setItem("selectedChildProfileName", childName);
    }

    // Update story creation store
    storyCreation.setSelectedChild(childId, childName);

    // Navigate to create-character/1
    goto("/create-character/1");
  }
</script>

<div class="sidebar">
  <div class="frame-1410104150">
    <div class="frame-2147227615">
      <div class="frame-2147227616">
        <div class="frame-2147227614">
          <div class="your-library">
            <span class="yourlibrary_span">Your Library</span>
          </div>
          <div class="switch">
            <div 
              class="button" 
              class:active={libraryView === "all"} 
              on:click={() => setLibraryView("all")}
              role="button"
              tabindex="0"
              on:keydown={(e) => (e.key === "Enter" || e.key === " ") && setLibraryView("all")}
            >
              <div><span class="allbooks_span">All Books</span></div>
            </div>
            <div 
              class="button" 
              class:active={libraryView === "characters"} 
              on:click={() => setLibraryView("characters")}
              role="button"
              tabindex="0"
              on:keydown={(e) => (e.key === "Enter" || e.key === " ") && setLibraryView("characters")}
            >
              <div><span class="characters_span">Characters</span></div>
            </div>
            <div 
              class="button" 
              class:active={libraryView === "children"} 
              on:click={() => setLibraryView("children")}
              role="button"
              tabindex="0"
              on:keydown={(e) => (e.key === "Enter" || e.key === " ") && setLibraryView("children")}
            >
              <div><span class="children_span">Children</span></div>
            </div>
          </div>
        </div>
        <div 
          class="frame-1410104245" 
          on:click={() => goto("/create-character/1")} 
          role="button" 
          tabindex="0" 
          on:keydown={(e) => (e.key === "Enter" || e.key === " ") && goto("/create-character/1")}
        >
          <div class="ellipse-1415"></div>
          <img src={whitePlus} alt="whitePlus" />
          <div class="new-book">
            <span class="newbook_span">New Book</span>
          </div>
        </div>
      </div>
      <div class="rectangle-263"></div>
      <div class="frame-1410103899">
        <div class="dropdown">
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
      {#if libraryView === "children"}
        <div 
          class="frame-1410104245_01" 
          on:click={() => goto("/create-child-profile")} 
          role="button" 
          tabindex="0" 
          on:keydown={(e) => (e.key === "Enter" || e.key === " ") && goto("/child-profiles/create")}
        >
          <div class="ellipse-1415_01"></div>
          <img src={userCirclePlus} alt="userCirclePlus" class="usercircleplus" />
          <div class="add-children">
            <span class="addchildren_span">Add Children</span>
          </div>
        </div>
      {/if}
    </div>
    <div class="frame-1410104154">
      <div class="frame-1410103894">
        {#if libraryView === "all"}
          {#if loadingStories}
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p class="loading-text">Loading books...</p>
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
          {:else if filteredStories.length === 0}
            <div class="empty-state">
              <p class="empty-text">No books found</p>
              <p class="empty-subtext">Create your first story to get started!</p>
            </div>
          {:else}
            {#each filteredStories as story (story.id)}
              <BookCard item={story} on:share={handleShare} />
            {/each}
          {/if}
        {:else if libraryView === "characters"}
          {#if loadingStories}
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p class="loading-text">Loading characters...</p>
            </div>
          {:else if characters.length === 0}
            <div class="empty-state">
              <p class="empty-text">No characters found</p>
              <p class="empty-subtext">Create your first story to see characters!</p>
            </div>
          {:else}
            {#each characters as character (character.id)}
              <CharacterCard 
                item={character} 
                on:preview={handleCharacterPreview}
              />
            {/each}
          {/if}
        {:else if libraryView === "children"}
          {#if loading}
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p class="loading-text">Loading children...</p>
            </div>
          {:else if error}
            <div class="error-state">
              <p class="error-text">{error}</p>
              <button
                class="retry-button"
                on:click={() => $user?.id && fetchChildProfiles($user.id)}
              >
                Try Again
              </button>
            </div>
          {:else if childProfiles.length === 0}
            <div class="empty-state">
              <p class="empty-text">No children found</p>
              <p class="empty-subtext">Add your first child profile to get started!</p>
            </div>
          {:else}
            {#each childProfiles as child (child.id)}
              <ChildCard 
                item={child} 
                on:newStory={handleNewStory}
                on:editChild={(event) => {
                  const childItem = event.detail.item || child;
                  goto(
                    `/create-child-profile/edit?id=${childItem.id || ""}&name=${encodeURIComponent(childItem.name || childItem.first_name || "")}`,
                  );
                }} />
            {/each}
          {/if}
        {/if}
      </div>
    </div>
  </div>

  {#if libraryView === "all"}
  <div class="frame-1410104151">
    <div class="frame-2147227615_01">
      <div class="frame-2147227616_02">
        <div class="frame-2147227614_01">
          <div class="your-reading-stats">
            <span class="yourreadingstats_span">Your Reading Stats </span>
          </div>
        </div>
      </div>
      <div class="rectangle-263_05"></div>
    </div>
    <div class="frame-2147227617">
      <div class="frame-1410104092">
        <div class="frame-2147227618">
          <div class="check_01">
            <div class="book_03">
              <img src={bookIcon} alt="bookIcon">
            </div>
            <div class="ellipse-1415_05"></div>
          </div>
          <div class="frame-1410104098">
            <div class="story-adventure">
              <span class="storyadventure_span">Story Adventure</span>
            </div>
            <div class="text-books">
              <span class="fbooks_span">{adventureStoriesCount} {adventureStoriesCount === 1 ? 'Book' : 'Books'}</span>
            </div>
          </div>
        </div>
        <div class="rectangle-263_06"></div>
        <div class="frame-2147227619">
          <div class="bookopen">
            <img src={bookOpen} alt="bookOpen">
          </div>
          <div class="total-reading-time">
            <span class="totalreadingtime_span_01">Total reading time: </span><span class="totalreadingtime_span_02">{formatReadingTime(adventureReadingTime)}</span>
          </div>
      </div>
      <div class="frame-2147227620">
        <div class="headset">
          <img src={headset} alt="headset" class="headset-icon">
        </div>
        <div class="audio-listened">
          <span class="audiolistened_span_01">Audio listened: </span><span class="audiolistened_span_02">{audioListenedCount} {audioListenedCount === 1 ? 'Book' : 'Books'}</span>
        </div>
    </div>
  </div>
  <div class="frame-1410104095">
    <div class="frame-2147227618_01">
      <div class="check_02">
            <div class="book_04"> 
              <img src={bookIcon} alt="bookIcon">
            </div>
            <div class="ellipse-1415_06"></div>
          </div>
          <div class="frame-1410104098_01">
            <div class="interactive-search">
              <span class="interactivesearch_span">Interactive Search</span>
            </div>
            <div class="text-books_01">
              <span class="fbooks_span_01">{searchStoriesCount} {searchStoriesCount === 1 ? 'Book' : 'Books'}</span>
            </div>
          </div>
        </div>
        <div class="rectangle-263_07"></div>
        <div class="frame-2147227619_01">
          <div class="bookopen">
            <img src={bookOpen} alt="bookOpen">
          </div>
          <div class="total-reading-time_01">
            <span class="totalreadingtime_span_03">Total reading time: </span><span class="totalreadingtime_span_04">{formatReadingTime(searchReadingTime)}</span>
          </div>
        </div>
        <div class="frame-2147227620_01">
          <div class="star">
            <img src={starIcon} alt="starIcon" class="star-icon">
          </div>
          <div class="average-stars">
            <span class="averagestars_span_01">Average stars : </span><span class="averagestars_span_02">{averageStars > 0 ? averageStars.toFixed(1) : '0'}/5</span>
          </div>
        </div>
        <div class="frame-2147227621">
          <div class="star">
            <img src={starIcon} alt="starIcon" class="star-icon">
          </div>
          <div class="average-hints">
            <span class="averagehints_span_01">Average Hints : </span><span class="averagehints_span_02">{averageHints > 0 ? averageHints.toFixed(1) : '0'} Per Scene</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="rectangle-42"></div>
  {/if}
</div>

{#if showShareStoryModal}
  <ShareStoryModal 
    storyTitle={selectedStoryForSharing?.title || selectedStoryForSharing?.storyTitle || "Untitled Story"} 
    storyId={selectedStoryForSharing?.uid || selectedStoryForSharing?.id || ""}
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
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .characters_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .children_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: 44px;
    top: 17px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .ellipse-1415_01 {
    width: 248px;
    height: 114px;
    left: 52px;
    top: 17px;
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
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .new-book {
    text-align: center;
  }

  .addchildren_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .add-children {
    text-align: center;
  }

  .usercircleplus {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .rectangle-263 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .yourreadingstats_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .your-reading-stats {
    text-align: center;
  }

  .rectangle-263_05 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .ellipse-1415_05 {
    width: 248px;
    height: 114px;
    left: -102px;
    top: 3px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .storyadventure_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .story-adventure {
    align-self: stretch;
  }

  .fbooks_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .text-books {
    align-self: stretch;
  }

  .rectangle-263_06 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .totalreadingtime_span_01 {
    color: #727272;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .totalreadingtime_span_02 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .total-reading-time {
    text-align: center;
  }

  .audiolistened_span_01 {
    color: #727272;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .audiolistened_span_02 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .audio-listened {
    text-align: center;
  }

  .ellipse-1415_06 {
    width: 248px;
    height: 114px;
    left: -102px;
    top: 3px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .interactivesearch_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .interactive-search {
    align-self: stretch;
  }

  .fbooks_span_01 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .text-books_01 {
    align-self: stretch;
  }

  .rectangle-263_07 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .totalreadingtime_span_03 {
    color: #727272;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .totalreadingtime_span_04 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .total-reading-time_01 {
    text-align: center;
  }

  .averagestars_span_01 {
    color: #727272;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .averagestars_span_02 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .average-stars {
    text-align: center;
  }

  .averagehints_span_01 {
    color: #727272;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .averagehints_span_02 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .average-hints {
    text-align: center;
  }

  .rectangle-42 {
    align-self: stretch;
    height: 1px;
    border: 1px #dfe1e7 solid;
    margin-bottom: 24px;
  }

  .button {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    background: transparent;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
    cursor: pointer;
  }

  .switch {
    padding: 4px;
    background: #eceff3;
    border-radius: 8px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
    display: inline-flex;
    width: 100%;
  }

  .frame-1410104098 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104098_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: inline-flex;
  }

  .frame-2147227614_01 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .book_03 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .bookopen {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .headset {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .headset-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .book_04 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .star {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .star-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .frame-2147227616_02 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }

  .frame-1410104245 {
    align-self: stretch;
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
    display: inline-flex;
    cursor: pointer;
  }

  .frame-1410104245_01 {
    align-self: stretch;
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
    display: inline-flex;
    cursor: pointer;
  }

  .dropdown {
    width: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .filter-select-wrapper {
    width: 100%;
  }

  .frame-2147227618 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227618_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227616 {
    width: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410103899 {
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: inline-flex;
  }

  .frame-1410104092 {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104095 {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-2147227615 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-2147227615_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
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

  .frame-1410104151 {
    align-self: stretch;
    background: white;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
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

  .frame-2147227617 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410104150 {
    align-self: stretch;
    background: white;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .sidebar {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .check_01 {
    padding: 10px;
    position: relative;
    background: #438bff;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .check_02 {
    padding: 10px;
    position: relative;
    background: #438bff;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-2147227619 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227620 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227619_01 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227620_01 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227621 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227614 {
    width: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
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
    width: 100%;
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

  /* Active state for library view buttons */
  .switch .button.active {
    background: white;
  }

  .switch .button.active .allbooks_span,
  .switch .button.active .characters_span,
  .switch .button.active .children_span {
    color: #141414;
    font-weight: 600;
  }
</style>

