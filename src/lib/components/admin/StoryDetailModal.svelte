<script lang="ts">
  import { X, Clock3, CalendarDays, UserRound, Sparkles, BookOpenText } from 'lucide-svelte';
  import type { AdminStoryDetail, AdminStoryPage, AdminStoryTextPage } from '$lib/api/admin';

  export let open = false;
  export let loading = false;
  export let error = '';
  export let story: AdminStoryDetail | null = null;
  export let onClose: () => void = () => {};

  type UnknownRecord = Record<string, unknown>;

  function formatDate(value?: string | null): string {
    if (!value) return 'Not available';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  }

  function formatDuration(value?: number | null): string {
    if (value === null || value === undefined || Number.isNaN(value)) return 'Not available';

    if (value < 60) {
      return `${Math.round(value)}s`;
    }

    const minutes = Math.floor(value / 60);
    const seconds = Math.round(value % 60);
    return `${minutes}m ${seconds}s`;
  }

  function formatStatus(status?: string | null): string {
    if (!status) return 'Unknown';

    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatFormat(value?: string | null): string {
    if (value === 'interactive_search') return 'Interactive Search';
    if (value === 'story_adventure') return 'Story Adventure';
    if (value === 'interactive_story') return 'Interactive Search';
    if (value === 'adventure_story') return 'Story Adventure';
    return value ? formatStatus(value) : 'Unknown';
  }

  function imageList(values?: string[] | null): string[] {
    return (values ?? []).filter(Boolean);
  }

  function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  function pickString(...values: unknown[]): string | null {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return null;
  }

  function pickNumber(...values: unknown[]): number | null {
    for (const value of values) {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
    return null;
  }

  function parseStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }

    if (typeof value === 'string' && value.trim()) {
      return [value.trim()];
    }

    return [];
  }

  function normalizeTextPages(value: unknown): AdminStoryTextPage[] {
    if (!Array.isArray(value)) return [];

    return value
      .map((item, index): AdminStoryTextPage | null => {
        if (typeof item === 'string' && item.trim()) {
          return {
            page_number: index + 1,
            text: item.trim(),
            audio_url: null
          };
        }

        if (!isRecord(item)) return null;

        const text = pickString(item.text, item.story, item.pageText);
        if (!text) return null;

        return {
          page_number: pickNumber(item.page_number, item.pageNumber) ?? index + 1,
          text,
          audio_url: pickString(item.audio_url, item.audioUrl)
        };
      })
      .filter((item): item is AdminStoryTextPage => item !== null);
  }

  function parseStoryContentPages(value: unknown): AdminStoryTextPage[] {
    if (!value) return [];

    let parsed: unknown = value;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return [];

      try {
        parsed = JSON.parse(trimmed);
      } catch {
        return [
          {
            page_number: 1,
            text: trimmed,
            audio_url: null
          }
        ];
      }
    }

    const pagesSource =
      Array.isArray(parsed) ? parsed : isRecord(parsed) && Array.isArray(parsed.pages) ? parsed.pages : [];

    return normalizeTextPages(pagesSource);
  }

  function normalizePages(value: unknown): AdminStoryPage[] {
    if (!Array.isArray(value)) return [];

    return value
      .map((item, index): AdminStoryPage | null => {
        if (!isRecord(item)) return null;

        const imageUrl = pickString(item.image_url, item.imageUrl, item.url);
        if (!imageUrl) return null;

        return {
          key: pickString(item.key) ?? `page-${index + 1}`,
          label: pickString(item.label, item.title) ?? `Page ${index + 1}`,
          image_url: imageUrl,
          page_number: pickNumber(item.page_number, item.pageNumber),
          text: pickString(item.text, item.story)
        };
      })
      .filter((item): item is AdminStoryPage => item !== null);
  }

  function buildFallbackPages(rawStory: UnknownRecord, textPages: AdminStoryTextPage[], format?: string | null): AdminStoryPage[] {
    const pages: AdminStoryPage[] = [];
    const sceneImages = parseStringList(rawStory.scene_images ?? rawStory.story_page_images ?? rawStory.page_images);
    const itemLabel = format === 'interactive_search' || format === 'interactive_story' ? 'Scene' : 'Page';

    const addPage = (
      label: string,
      imageUrl: string | null,
      key: string,
      pageNumber: number | null = null,
      text: string | null = null
    ) => {
      if (!imageUrl) return;
      pages.push({
        key,
        label,
        image_url: imageUrl,
        page_number: pageNumber,
        text
      });
    };

    addPage('Copyright', pickString(rawStory.copyright_image, rawStory.copyright_page_image), 'copyright');
    addPage('Dedication', pickString(rawStory.dedication_image, rawStory.dedication_page_image), 'dedication');

    sceneImages.forEach((imageUrl, index) => {
      const pageNumber = index + 1;
      const pageText = textPages.find((item) => item.page_number === pageNumber)?.text ?? null;
      addPage(`${itemLabel} ${pageNumber}`, imageUrl, `scene-${pageNumber}`, pageNumber, pageText);
    });

    addPage('Last Words', pickString(rawStory.last_word_page_image, rawStory.last_words_page_image), 'last-words');
    addPage('Final Page', pickString(rawStory.last_admin_page_image, rawStory.last_story_page_image), 'final-page');
    addPage('Back Cover', pickString(rawStory.back_cover_image, rawStory.back_page_image), 'back-cover');

    return pages;
  }

  $: rawStory = isRecord(story?.raw_story) ? story.raw_story : {};
  $: storyTitle = pickString(story?.story_title, rawStory.story_title, rawStory.title, rawStory.story_name) ?? 'Story detail';
  $: ownerDisplay =
    pickString(story?.owner?.email, story?.owner?.name, rawStory.user_email, rawStory.user_name, rawStory.owner_name) ??
    'Unknown user';
  $: storyFormat = pickString(story?.format, rawStory.format, rawStory.story_format);
  $: storyStatus = pickString(story?.status, rawStory.status, rawStory.story_status);
  $: createdAt = pickString(story?.created_at, rawStory.created_at, rawStory.createdAt);
  $: generationDuration = pickNumber(
    story?.generation_duration_seconds,
    rawStory.generation_duration_seconds,
    rawStory.generation_duration,
    rawStory.duration_seconds
  );
  $: characterName =
    pickString(story?.character?.character_name, story?.character_name, rawStory.character_name) ?? 'Untitled character';
  $: originalImageUrl = pickString(
    story?.character?.original_image_url,
    rawStory.original_image_url,
    rawStory.character_image,
    rawStory.character_original_image
  );
  $: enhancedImages = imageList(
    story?.character?.enhanced_images?.length
      ? story.character.enhanced_images
      : parseStringList(rawStory.enhanced_images)
  );
  $: coverImageUrl = pickString(story?.cover_image, rawStory.cover_image, rawStory.story_cover, rawStory.coverImage);
  $: storyTextPages = normalizeTextPages(story?.story_pages_text);
  $: fallbackStoryTextPages = storyTextPages.length > 0 ? storyTextPages : parseStoryContentPages(rawStory.story_content);
  $: storyPages = normalizePages(story?.pages);
  $: fallbackPages =
    storyPages.length > 0 ? storyPages : buildFallbackPages(rawStory, fallbackStoryTextPages, storyFormat);
  $: pageSceneItemCount = fallbackPages.length + (coverImageUrl ? 1 : 0);
</script>

{#if open}
  <div
    class="modal-overlay"
    on:click={onClose}
    on:keydown={(event) => event.key === 'Escape' && onClose()}
    role="button"
    tabindex="-1"
  >
    <div
      class="modal-shell"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-detail-title"
      tabindex="-1"
    >
      <div class="modal-header">
        <div>
          <p class="eyebrow">Story Detail View</p>
          <h2 id="story-detail-title">{storyTitle}</h2>
        </div>
        <button class="close-btn" on:click={onClose} aria-label="Close story detail">
          <X size={20} />
        </button>
      </div>

      {#if loading}
        <div class="state-card"> 
          <div class="spinner"></div>
          <p>Loading story details...</p>
        </div>
      {:else if error}
        <div class="state-card error">
          <p>{error}</p>
        </div>
      {:else if story}
        <div class="modal-body">
          <section class="summary-grid">
            <article class="summary-card">
              <div class="summary-icon"><UserRound size={18} /></div>
              <div>
                <div class="summary-label">Created by</div>
                <div class="summary-value">{ownerDisplay}</div>
              </div>
            </article>
            <article class="summary-card">
              <div class="summary-icon"><Sparkles size={18} /></div>
              <div>
                <div class="summary-label">Format / Status</div>
                <div class="summary-value">{formatFormat(storyFormat)} / {formatStatus(storyStatus)}</div>
              </div>
            </article>
            <article class="summary-card">
              <div class="summary-icon"><CalendarDays size={18} /></div>
              <div>
                <div class="summary-label">Created</div>
                <div class="summary-value">{formatDate(createdAt)}</div>
              </div>
            </article>
            <article class="summary-card">
              <div class="summary-icon"><Clock3 size={18} /></div>
              <div>
                <div class="summary-label">Generation time</div>
                <div class="summary-value">{formatDuration(generationDuration)}</div>
              </div>
            </article>
          </section>

          <section class="content-section">
            <div class="section-header">
              <h3>Character Assets</h3>
              <p>{characterName}</p>
            </div>

            <div class="asset-grid">
              <article class="asset-card">
                <h4>Original Drawing</h4>
                {#if originalImageUrl}
                  <img
                    src={originalImageUrl}
                    alt="Original character drawing"
                    class="asset-image"
                  />
                {:else}
                  <div class="empty-asset">No original image</div>
                {/if}
              </article>

              <article class="asset-card wide">
                <h4>Enhanced Versions</h4>
                {#if enhancedImages.length > 0}
                  <div class="thumb-grid">
                    {#each enhancedImages as imageUrl, index}
                      <img src={imageUrl} alt={`Enhanced character ${index + 1}`} class="thumb-image" />
                    {/each}
                  </div>
                {:else}
                  <div class="empty-asset">No enhanced images</div>
                {/if}
              </article>
            </div>
          </section>

          <section class="content-section">
            <div class="section-header">
              <h3>Pages / Scenes</h3>
              <p>{pageSceneItemCount} item{pageSceneItemCount === 1 ? '' : 's'}</p>
            </div>

            {#if pageSceneItemCount > 0}
              <div class="pages-grid">
                {#if coverImageUrl}
                  <article class="page-card">
                    <div class="page-card-header">
                      <div class="page-number cover-number">Cover</div>
                      <div>
                        <h4>Book Cover</h4>
                        <p>cover</p>
                      </div>
                    </div>

                    <img src={coverImageUrl} alt="Book cover" class="page-image" />
                  </article>
                {/if}

                {#each fallbackPages as pageItem, index}
                  <article class="page-card">
                    <div class="page-card-header">
                      <div class="page-number">
                        {pageItem.page_number ?? index + 1}
                      </div>
                      <div>
                        <h4>{pageItem.label}</h4>
                        <p>{pageItem.key}</p>
                      </div>
                    </div>

                    <img src={pageItem.image_url} alt={pageItem.label} class="page-image" />

                    {#if pageItem.text}
                      <div class="page-text">
                        <p>{pageItem.text}</p>
                      </div>
                    {/if}
                  </article>
                {/each}
              </div>
            {:else}
              <div class="empty-asset">No pages or scenes available</div>
            {/if}
          </section>

          {#if fallbackStoryTextPages.length > 0}
            <section class="content-section">
              <div class="section-header">
                <h3>Story Text</h3>
                <p>Story Adventure content</p>
              </div>

              <div class="text-pages-list">
                {#each fallbackStoryTextPages as textPage}
                  <article class="text-page-card">
                    <div class="text-page-header">
                      <BookOpenText size={18} />
                      <span>Page {textPage.page_number}</span>
                    </div>
                    <p>{textPage.text}</p>
                  </article>
                {/each}
              </div>
            </section>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    justify-content: center;
    align-items: stretch;
    padding: 1.5rem;
    z-index: 2100;
  }

  .modal-shell {
    width: min(1200px, 100%);
    background: #f8fafc;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(15, 23, 42, 0.28);
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
  }

  .eyebrow {
    margin: 0 0 0.3rem;
    color: #2563eb;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.55rem;
    color: #0f172a;
  }

  .close-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 999px;
    border: 1px solid #dbe3f0;
    background: #ffffff;
    color: #475569;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .modal-body {
    overflow: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }

  .summary-card,
  .asset-card,
  .page-card,
  .text-page-card,
  .state-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  }

  .summary-card {
    display: flex;
    gap: 0.9rem;
    padding: 1rem;
  }

  .summary-icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.75rem;
    background: #eff6ff;
    color: #1d4ed8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .summary-label {
    font-size: 0.78rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
  }

  .summary-value {
    margin-top: 0.3rem;
    color: #0f172a;
    font-weight: 600;
    line-height: 1.4;
  }

  .content-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-header h3,
  .asset-card h4,
  .page-card h4 {
    margin: 0;
    color: #0f172a;
  }

  .section-header p,
  .page-card-header p {
    margin: 0.25rem 0 0;
    color: #64748b;
    font-size: 0.9rem;
  }

  .asset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
  }

  .asset-card,
  .page-card,
  .text-page-card {
    padding: 1rem;
  }

  .asset-card.wide {
    grid-column: span 2;
  }

  .asset-image,
  .page-image,
  .thumb-image {
    width: 100%;
    border-radius: 0.8rem;
    border: 1px solid #dbe3f0;
    background: #f8fafc;
    object-fit: cover;
  }

  .asset-image {
    max-height: 420px;
  }

  .page-image {
    aspect-ratio: 5 / 7;
    margin-top: 0.9rem;
  }

  .thumb-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .thumb-image {
    aspect-ratio: 1;
  }

  .pages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
  }

  .page-card-header {
    display: flex;
    gap: 0.85rem;
    align-items: center;
  }

  .page-number {
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    background: #dbeafe;
    color: #1d4ed8;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .cover-number {
    width: auto;
    min-width: 3.5rem;
    padding: 0 0.7rem;
  }

  .page-text,
  .text-page-card p {
    margin-top: 0.9rem;
    color: #334155;
    line-height: 1.65;
    white-space: pre-wrap;
  }

  .text-pages-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .text-page-header {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    color: #1d4ed8;
    font-weight: 700;
  }

  .empty-asset,
  .state-card {
    padding: 2rem;
    text-align: center;
    color: #64748b;
  }

  .state-card {
    margin: 1.5rem;
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
    margin: 0 auto 0.8rem;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 900px) {
    .modal-overlay {
      padding: 0.75rem;
    }

    .asset-card.wide {
      grid-column: span 1;
    }
  }
</style>
