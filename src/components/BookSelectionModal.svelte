<script context="module" lang="ts">
  export interface BookOption {
    id: string;
    title: string;
    unlockTitle?: string; // Display name when unlocking (e.g., "The Starry Night Journey")
    coverImageUrl: string;
    pagesAvailable?: number; // e.g., 2 (pages 1-2)
    pagesLocked?: number; // e.g., 3
  }
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import logo from "../assets/logo.png";
  import XIcon from "../assets/X.svg";
  import BookOpenText from "../assets/BookOpenText.svg";
  import LockKey from "../assets/LockKey.svg";
  import { getAllStoriesForParent } from "../lib/database/stories";
  import { user } from "../lib/stores/auth";

  export let books: BookOption[] = []; // Initial/current book from parent
  export let currentBookId: string | null = null; // ID of the book currently being read
  export let totalBooks: number = 7;
  export let creditsAvailable: number = 1;
  export let creditsTotal: number = 1;

  const dispatch = createEventDispatcher();

  // All user books (fetched when modal opens)
  let allUserBooks: BookOption[] = [];
  let loadingUserBooks = false;

  onMount(async () => {
    if (!browser || !$user?.id) return;
    loadingUserBooks = true;
    try {
      const result = await getAllStoriesForParent($user.id);
      if (result.success && result.data) {
        const storiesData = Array.isArray(result.data) ? result.data : [];
        allUserBooks = storiesData
          .map((story: any) => {
            const id = story.uid || story.id || "";
            const coverUrl =
              story.story_cover ||
              story.cover ||
              (story.story_content && typeof story.story_content === "object" && story.story_content?.cover) ||
              "https://placehold.co/100x100";
            return {
              id,
              title: story.story_title || `${story.character_name || "Story"}'s Adventure`,
              unlockTitle: story.story_title || `${story.character_name || "Story"}'s Adventure`,
              coverImageUrl: typeof coverUrl === "string" ? coverUrl.split("?")[0] : "https://placehold.co/100x100",
              pagesAvailable: 2,
              pagesLocked: 3,
            } as BookOption;
          })
          .filter((b) => b.id);
      }
    } catch (err) {
      console.error("[BookSelectionModal] Error fetching user books:", err);
    } finally {
      loadingUserBooks = false;
    }
  });

  // Use fetched books when available; otherwise fall back to books prop
  $: displayBooks = allUserBooks.length > 0 ? allUserBooks : books;
  $: effectiveTotalBooks = displayBooks.length || totalBooks;

  // Merge current book from parent if it has better data (e.g. cover from storyScenes)
  $: currentBookFromParent = books.find((b) => b.id === currentBookId);
  $: effectiveCurrentId = currentBookId ?? (books[0]?.id ?? displayBooks[0]?.id ?? null);
  $: currentBook =
    currentBookFromParent ??
    displayBooks.find((b) => b.id === effectiveCurrentId) ??
    books[0] ??
    displayBooks[0];

  // Selected book for unlock (user selection, falls back to current book)
  let selectedBookId = "";
  $: defaultSelection = effectiveCurrentId ?? currentBook?.id ?? displayBooks[0]?.id ?? "";
  $: effectiveSelectedId = selectedBookId || defaultSelection;
  $: selectedBook =
    displayBooks.find((b) => b.id === effectiveSelectedId) ??
    currentBook ??
    displayBooks[0];

  function handleClose() {
    dispatch("close");
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) handleClose();
  }

  function selectBook(id: string) {
    selectedBookId = id;
  }

  function handleUnlock() {
    if (selectedBook) {
      dispatch("unlock", { book: selectedBook });
    }
  }

  function getDisplayTitle(book: BookOption | undefined): string {
    return book?.unlockTitle ?? book?.title ?? "";
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<div
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="book-selection-title"
  on:click={handleOverlayClick}
  on:keydown={(e) => (e.key === "Escape" || e.key === "Enter" || e.key === " ") && handleClose()}
  tabindex="-1"
>
  <div class="modal-content" on:click|stopPropagation role="document">
    <div class="modal-header">
      <div class="modal-logo">
        <img src={logo} alt="Drawtopia" class="logo-img" />
      </div>
      <button class="modal-close" on:click={handleClose} aria-label="Close">
        <img src={XIcon} alt="close" />
      </button>
    </div>

    <div class="modal-body">
      <h2 id="book-selection-title" class="modal-title">Choose Your Story Adventure</h2>
      <p class="modal-subtitle">You have {effectiveTotalBooks} books. Choose which one to unlock first!</p>

      <div class="section-divider"></div>

      <!-- Currently Reading -->
      {#if currentBook}
        <p class="section-label">You're currently reading</p>
        <div class="current-book-card">
          <div class="current-book-cover" style="background-image: url({currentBook.coverImageUrl})"></div>
          <div class="current-book-info">
            <span class="current-book-title">{currentBook.title}</span>
            <div class="current-book-status">
              <span class="status-line">
                <img src={BookOpenText} alt="" class="status-icon status-icon-book" />
                Pages {currentBook.pagesAvailable ? `1-${currentBook.pagesAvailable}` : "1-2"} available
              </span>
              <span class="status-line">
                <img src={LockKey} alt="" class="status-icon status-icon-lock" />
                {currentBook.pagesLocked ?? 3} more pages locked
              </span>
            </div>
          </div>
        </div>
      {/if}

      <div class="section-divider"></div>

      <!-- Select a different book -->
      <p class="section-label">Or select a different book to unlock:</p>
      <div class="book-covers-scroll">
        {#if loadingUserBooks}
          <div class="books-loading">Loading your books...</div>
        {:else}
        {#each displayBooks as book (book.id)}
          <button
            type="button"
            class="book-cover-btn"
            class:selected={book.id === effectiveSelectedId}
            on:click={() => selectBook(book.id)}
            aria-pressed={book.id === effectiveSelectedId}
            aria-label="Select {book.title}"
          >
            <div class="book-cover-thumb" style="background-image: url({book.coverImageUrl})"></div>
          </button>
        {/each}
        {/if}
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <div class="unlock-info">
          <span class="unlock-label">Unlock: {getDisplayTitle(selectedBook)}</span>
          <span class="credits-text">Uses 1 of your {creditsTotal} credit{creditsTotal !== 1 ? "s" : ""}</span>
        </div>
        <button
          type="button"
          class="unlock-btn"
          on:click={handleUnlock}
          disabled={creditsAvailable <= 0}
          aria-label="Unlock This Story"
        >
          <img src={LockKey} alt="" class="unlock-btn-icon" />
          Unlock This Story
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #dcdcdc;
  }

  .modal-logo {
    display: flex;
    align-items: center;
  }

  .logo-img {
    height: 38px;
    width: auto;
    object-fit: contain;
  }

  .modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease;
  }

  .modal-close:hover {
    opacity: 0.7;
  }

  .modal-close img {
    width: 24px;
    height: 24px;
  }

  .modal-body {
    padding: 24px 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-title {
    color: #000;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
  }

  .modal-subtitle {
    color: #000;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.4;
    margin: 0;
  }

  .section-divider {
    height: 1px;
    background: #dcdcdc;
    margin: 4px 0;
  }

  .section-label {
    color: #000;
    font-size: 16px;
    font-weight: 400;
    margin: 0;
  }

  .current-book-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 12px;
  }

  .current-book-cover {
    width: 80px;
    height: 80px;
    min-width: 80px;
    border-radius: 8px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #e8e8e8;
  }

  .current-book-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .current-book-title {
    font-size: 18px;
    font-weight: 700;
    color: #000;
  }

  .current-book-status {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .status-line {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #727272;
  }

  .status-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    filter: brightness(0) saturate(100%) invert(45%);
  }

  .books-loading {
    padding: 24px;
    color: #727272;
    font-size: 14px;
  }

  .book-covers-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 4px 0;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .book-covers-scroll::-webkit-scrollbar {
    height: 6px;
  }

  .book-covers-scroll::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 3px;
  }

  .book-covers-scroll::-webkit-scrollbar-thumb {
    background: #c0c0c0;
    border-radius: 3px;
  }

  .book-cover-btn {
    flex-shrink: 0;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 12px;
    scroll-snap-align: start;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .book-cover-btn:hover {
    transform: scale(1.02);
  }

  .book-cover-btn.selected {
    box-shadow: 0 0 0 3px #438bff;
  }

  .book-cover-thumb {
    width: 100px;
    height: 100px;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #e8e8e8;
  }

  .modal-footer {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 8px;
  }

  .unlock-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .unlock-label {
    font-size: 16px;
    font-weight: 700;
    color: #000;
  }

  .credits-text {
    font-size: 14px;
    color: #000;
  }

  .unlock-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px 24px;
    background: #438bff;
    color: white;
    font-size: 18px;
    font-weight: 600;
    font-family: Quicksand, sans-serif;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.1s ease;
  }

  .unlock-btn:hover:not(:disabled) {
    background: #3a7ae4;
    transform: translateY(-1px);
  }

  .unlock-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .unlock-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .unlock-btn-icon {
    width: 20px;
    height: 20px;
    filter: brightness(0) invert(1);
  }

  @media (max-width: 600px) {
    .modal-content {
      max-height: 85vh;
    }

    .modal-title {
      font-size: 20px;
    }

    .current-book-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .book-cover-thumb {
      width: 88px;
      height: 88px;
    }
  }
</style>
