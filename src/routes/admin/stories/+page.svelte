<script lang="ts">
  import { onMount } from 'svelte';
  import { BookOpen, RefreshCcw, Save } from 'lucide-svelte';
  import {
    getAdminStories,
    getAdminStoryDetail,
    updateAdminStory,
    type AdminStoryDetail,
    type AdminStoryPageText,
    type AdminStorySummary
  } from '$lib/api/adminStories';
  import { getBookTemplates, type BookTemplate } from '$lib/database/bookTemplates';
  import { buildTemplateCompositeCoverPrompt } from '$lib/promptBuilder';
  import { generateStyledImage } from '$lib/imageGeneration';
  import {
    buildStoryPagePrompt,
    generateCharacterAction,
    generateImageWithTwoTemplates,
    generateSceneDescription
  } from '$lib/storyGenerationHelpers';
  import { loadRuntimePromptDocuments } from '$lib/promptRuntime';

  type EnhancementLevel = 'minimal' | 'normal' | 'high';
  type BusyKey = 'text' | 'character' | 'cover' | `character:${EnhancementLevel}` | `page:${number}` | `page:${number}:${number}`;

  const enhancementSlots: { level: EnhancementLevel; label: string; description: string }[] = [
    { level: 'minimal', label: 'Minimal', description: 'Light cleanup' },
    { level: 'normal', label: 'Normal', description: 'Storybook quality' },
    { level: 'high', label: 'High', description: 'Publication ready' }
  ];

  let stories: AdminStorySummary[] = [];
  let selectedStory: AdminStoryDetail | null = null;
  let templates: BookTemplate[] = [];
  let loadingStories = true;
  let loadingDetail = false;
  let loadError = '';
  let detailError = '';
  let successMessage = '';
  let busy: Partial<Record<BusyKey, boolean>> = {};
  let storyTextDrafts: Record<number, string> = {};
  let selectedEnhancementIndex = 0;

  onMount(() => {
    void loadAdminStories();
    void loadBookTemplates();
    void loadRuntimePromptDocuments();
  });

  function storyKey(story: AdminStorySummary | AdminStoryDetail): string {
    return story.uid || story.id;
  }

  function cleanUrl(url?: string | null): string | null {
    return url ? url.split('?')[0] : null;
  }

  function normalizeImageUrls(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.flatMap((item) => normalizeImageUrls(item));
    }
    if (typeof value === 'object') {
      return normalizeImageUrls(
        value.url || value.image_url || value.imageUrl || value.scene || value.sceneImage
      );
    }
    if (typeof value !== 'string') return [];

    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed !== trimmed) {
        return normalizeImageUrls(parsed);
      }
    } catch (_) {
      // Not JSON; handle URL blobs below.
    }

    const matches = trimmed.match(/https?:\/\/[^\s"'<>\]\)]+/g);
    const rawUrls = matches?.length ? matches : trimmed.split(/[\n,]+/);
    return rawUrls
      .map((url) => cleanUrl(url.trim().replace(/^["']|["']$/g, '').replace(/[.;,]+$/g, '')))
      .filter((url): url is string => Boolean(url));
  }

  function getEnhancedCharacterImages(): string[] {
    return normalizeImageUrls(selectedStory?.character?.enhanced_images || getRawStoryValue('enhanced_images'));
  }

  function getEnhancedCharacterImage(index: number): string | null {
    return getEnhancedCharacterImages()[index] || null;
  }

  function getSelectedEnhancedCharacterImage(): string | null {
    const enhanced = getEnhancedCharacterImages();
    const selectedUrl = cleanUrl(enhanced[selectedEnhancementIndex]);
    return selectedUrl || cleanUrl(enhanced.find(Boolean));
  }

  function getSelectedEnhancementLabel(): string {
    const selectedSlot = enhancementSlots[selectedEnhancementIndex];
    return selectedSlot?.label || 'Enhanced';
  }

  function selectEnhancedCharacterImage(index: number) {
    if (!getEnhancedCharacterImage(index)) return;
    selectedEnhancementIndex = index;
  }

  function normalizeCharacterType(value?: string | null): 'person' | 'animal' | 'magical' {
    const normalized = (value || '').toLowerCase();
    if (normalized.includes('animal')) return 'animal';
    if (normalized.includes('magical')) return 'magical';
    return 'person';
  }

  function normalizeCharacterStyle(value?: string | null): '3d' | 'cartoon' | 'anime' {
    const normalized = (value || '').toLowerCase();
    if (normalized.includes('anime')) return 'anime';
    if (normalized.includes('3d')) return '3d';
    return 'cartoon';
  }

  function storyWorldForTemplate(value?: string | null): 'forest' | 'underwater' | 'outerspace' {
    const normalized = (value || '').toLowerCase();
    if (normalized.includes('underwater') || normalized.includes('kingdom')) return 'underwater';
    if (normalized.includes('space') || normalized.includes('outer')) return 'outerspace';
    return 'forest';
  }

  function storyWorldForPrompt(value?: string | null): string {
    const normalized = storyWorldForTemplate(value);
    if (normalized === 'outerspace') return 'outer-space';
    if (normalized === 'underwater') return 'underwater-kingdom';
    return 'enchanted-forest';
  }

  function getRawStoryValue(key: string): any {
    return selectedStory?.raw_story?.[key];
  }

  function getCurrentCharacterImage(): string | null {
    return getSelectedEnhancedCharacterImage() || cleanUrl(selectedStory?.character?.original_image_url) || cleanUrl(getRawStoryValue('original_image_url'));
  }

  function getOriginalCharacterImage(): string | null {
    return cleanUrl(selectedStory?.character?.original_image_url) || cleanUrl(getRawStoryValue('original_image_url'));
  }

  function findMatchingTemplate(): BookTemplate | null {
    if (!selectedStory) return null;
    const templateId = getRawStoryValue('template_id');
    const byId = templateId ? templates.find((template) => template.id === templateId) : null;
    if (byId) return byId;

    const world = storyWorldForTemplate(getRawStoryValue('story_world'));
    const format = selectedStory.format === 'interactive_search' ? 'interactive_story' : 'adventure_story';
    return (
      templates.find((template) => {
        const templateFormat = template.story_format || 'adventure_story';
        return template.story_world === world && templateFormat === format;
      }) ||
      templates.find((template) => template.story_world === world) ||
      null
    );
  }

  function getPageImageUrls(page: { image_url?: string | string[] | null; image_urls?: string[] }): string[] {
    const urls = normalizeImageUrls(page.image_urls);
    if (urls.length > 0) return urls;
    return normalizeImageUrls(page.image_url);
  }

  function getStoryTextPayload(): AdminStoryPageText[] {
    return Object.entries(storyTextDrafts)
      .map(([pageNumber, text]) => ({
        page_number: Number(pageNumber),
        text
      }))
      .filter((page) => page.page_number > 0)
      .sort((a, b) => a.page_number - b.page_number);
  }

  function setBusy(key: BusyKey, value: boolean) {
    busy = { ...busy, [key]: value };
  }

  async function loadAdminStories() {
    loadingStories = true;
    loadError = '';
    const result = await getAdminStories();
    if (result.success && result.data) {
      stories = result.data;
      if (!selectedStory && stories[0]) {
        await selectStory(stories[0]);
      }
    } else {
      loadError = result.error || 'Failed to load stories.';
    }
    loadingStories = false;
  }

  async function loadBookTemplates() {
    const result = await getBookTemplates();
    templates = result.data || [];
  }

  async function selectStory(story: AdminStorySummary) {
    loadingDetail = true;
    detailError = '';
    successMessage = '';
    const result = await getAdminStoryDetail(storyKey(story));
    if (result.success && result.data) {
      selectedStory = result.data;
      selectedEnhancementIndex = 0;
      storyTextDrafts = {};
      for (const page of result.data.story_pages_text || []) {
        storyTextDrafts[page.page_number] = page.text || '';
      }
    } else {
      detailError = result.error || 'Failed to load story detail.';
    }
    loadingDetail = false;
  }

  async function refreshSelectedStory() {
    if (!selectedStory) return;
    const result = await getAdminStoryDetail(storyKey(selectedStory));
    if (result.success && result.data) {
      selectedStory = result.data;
      storyTextDrafts = {};
      for (const page of result.data.story_pages_text || []) {
        storyTextDrafts[page.page_number] = page.text || '';
      }
    }
  }

  async function saveStoryText() {
    if (!selectedStory) return;
    setBusy('text', true);
    successMessage = '';
    detailError = '';
    const result = await updateAdminStory(storyKey(selectedStory), {
      story_pages_text: getStoryTextPayload()
    });
    if (result.success) {
      successMessage = 'Story text saved.';
      await refreshSelectedStory();
    } else {
      detailError = result.error || 'Failed to save story text.';
    }
    setBusy('text', false);
  }

  async function regenerateCharacter(level: EnhancementLevel = 'normal', imageIndex = 1) {
    if (!selectedStory) return;
    const originalUrl = getOriginalCharacterImage();
    if (!originalUrl) {
      detailError = 'No original character reference image found.';
      return;
    }

    const busyKey: BusyKey = `character:${level}`;
    setBusy(busyKey, true);
    successMessage = '';
    detailError = '';
    const result = await generateStyledImage({
      imageUrl: originalUrl,
      style: normalizeCharacterStyle(getRawStoryValue('character_style')),
      quality: level,
      saveToStorage: true,
      storageKey: `adminGeneratedCharacterImage_${level}`,
      characterName: selectedStory.character_name,
      characterType: normalizeCharacterType(getRawStoryValue('character_type')),
      specialAbility: getRawStoryValue('special_ability') || '',
      ageGroup: '7-10'
    });

    if (result.success && result.url) {
      const existingImages = getEnhancedCharacterImages();
      const generatedUrl = cleanUrl(result.url)!;
      const enhancedImages = [...existingImages];
      while (enhancedImages.length < enhancementSlots.length) {
        enhancedImages.push('');
      }
      enhancedImages[imageIndex] = generatedUrl;
      const updateResult = await updateAdminStory(storyKey(selectedStory), { enhanced_images: enhancedImages });
      if (updateResult.success) {
        selectedEnhancementIndex = imageIndex;
        successMessage = `${enhancementSlots[imageIndex]?.label || 'Character'} enhancement regenerated from the reference image.`;
        await refreshSelectedStory();
      } else {
        detailError = updateResult.error || 'Character image was generated but could not be saved.';
      }
    } else {
      detailError = result.error || `Failed to regenerate ${level} character enhancement.`;
    }
    setBusy(busyKey, false);
  }

  async function regenerateCover() {
    if (!selectedStory) return;
    const template = findMatchingTemplate();
    const characterUrl = getSelectedEnhancedCharacterImage();
    if (!template?.cover_image) {
      detailError = 'No matching template cover image found.';
      return;
    }
    if (!characterUrl) {
      detailError = 'Select or generate one enhanced character image before regenerating the cover.';
      return;
    }

    setBusy('cover', true);
    successMessage = '';
    detailError = '';
    try {
      const prompt = buildTemplateCompositeCoverPrompt({
        characterName: selectedStory.character_name,
        characterType: normalizeCharacterType(getRawStoryValue('character_type')),
        characterStyle: normalizeCharacterStyle(getRawStoryValue('character_style')),
        storyWorld: storyWorldForPrompt(getRawStoryValue('story_world')),
        adventureType: getRawStoryValue('adventure_type') || 'Treasure Hunt',
        ageGroup: '7-10',
        storyTitle: selectedStory.story_title
      });
      const result = await generateImageWithTwoTemplates(template.cover_image, characterUrl, prompt);
      if (result.success && result.url) {
        const saved = await updateAdminStory(storyKey(selectedStory), {
          story_cover: cleanUrl(result.url)
        });
        if (saved.success) {
          successMessage = `Cover image regenerated with the ${getSelectedEnhancementLabel()} enhanced character.`;
          await refreshSelectedStory();
        } else {
          detailError = saved.error || 'Cover generated but could not be saved.';
        }
      } else {
        detailError = result.error || 'Failed to regenerate cover.';
      }
    } catch (error) {
      detailError = error instanceof Error ? error.message : 'Failed to regenerate cover.';
    }
    setBusy('cover', false);
  }

  async function regenerateStoryPage(pageNumber: number, imageIndex = 0) {
    if (!selectedStory) return;
    const template = findMatchingTemplate();
    const characterUrl = getCurrentCharacterImage();
    const templateImage = template?.story_page_images?.[pageNumber - 1];
    const pageText = storyTextDrafts[pageNumber] || selectedStory.story_pages_text.find((page) => page.page_number === pageNumber)?.text || '';
    if (!templateImage) {
      detailError = `No template image found for page ${pageNumber}.`;
      return;
    }
    if (!characterUrl) {
      detailError = 'No character image found for page regeneration.';
      return;
    }

    const busyKey: BusyKey = `page:${pageNumber}:${imageIndex}`;
    setBusy(busyKey, true);
    successMessage = '';
    detailError = '';
    try {
      const storyWorld = storyWorldForPrompt(getRawStoryValue('story_world'));
      const characterAction = generateCharacterAction(pageNumber, storyWorld, pageText);
      const sceneDescription = generateSceneDescription(pageNumber, storyWorld, pageText);
      const prompt = buildStoryPagePrompt(pageNumber, pageText, characterAction, sceneDescription, {
        characterName: selectedStory.character_name,
        characterType: normalizeCharacterType(getRawStoryValue('character_type')),
        specialAbility: getRawStoryValue('special_ability') || '',
        characterStyle: normalizeCharacterStyle(getRawStoryValue('character_style')),
        storyWorld,
        adventureType: getRawStoryValue('adventure_type') || 'Treasure Hunt',
        ageGroup: '7-10',
        storyTitle: selectedStory.story_title,
        characterImageUrl: characterUrl,
        storyFormat: selectedStory.format === 'interactive_search' ? 'interactive_story' : 'adventure_story',
        characterGender: getRawStoryValue('character_gender') || 'neutral'
      });
      const result = await generateImageWithTwoTemplates(templateImage, characterUrl, prompt);
      if (result.success && result.url) {
        const generatedUrl = cleanUrl(result.url)!;
        const saved = await updateAdminStory(storyKey(selectedStory), {
          scene_image_update: {
            page_number: pageNumber,
            image_url: generatedUrl,
            image_index: imageIndex
          }
        });
        if (saved.success) {
          successMessage = `Page ${pageNumber} illustration ${imageIndex + 1} regenerated.`;
          await refreshSelectedStory();
        } else {
          detailError = saved.error || 'Page generated but could not be saved.';
        }
      } else {
        detailError = result.error || `Failed to regenerate page ${pageNumber} illustration ${imageIndex + 1}.`;
      }
    } catch (error) {
      detailError = error instanceof Error ? error.message : `Failed to regenerate page ${pageNumber} illustration ${imageIndex + 1}.`;
    }
    setBusy(busyKey, false);
  }
</script>

<svelte:head>
  <title>Stories - Admin</title>
</svelte:head>

<div class="admin-stories-page">
  <div class="page-header">
    <h1><BookOpen size={28} /> Stories</h1>
    <p>Edit story text and regenerate cover, character, or individual page illustrations.</p>
  </div>

  {#if loadError}
    <p class="error-text">{loadError}</p>
  {/if}
  {#if detailError}
    <p class="error-text">{detailError}</p>
  {/if}
  {#if successMessage}
    <p class="success-text">{successMessage}</p>
  {/if}

  <div class="stories-layout">
    <aside class="story-list">
      <div class="panel-title">Story List</div>
      {#if loadingStories}
        <p class="muted">Loading stories...</p>
      {:else}
        {#each stories as story}
          <button
            type="button"
            class:selected={selectedStory && storyKey(selectedStory) === storyKey(story)}
            on:click={() => selectStory(story)}
          >
            {#if story.cover_image}
              <img src={story.cover_image} alt="" />
            {/if}
            <span>
              <strong>{story.story_title}</strong>
              <small>{story.character_name} · {story.user_email || story.user_name || 'Unknown user'}</small>
            </span>
          </button>
        {/each}
      {/if}
    </aside>

    <section class="story-detail">
      {#if loadingDetail}
        <p class="muted">Loading story detail...</p>
      {:else if selectedStory}
        <div class="detail-header">
          <div>
            <p class="eyebrow">{selectedStory.format || 'story'}</p>
            <h2>{selectedStory.story_title}</h2>
            <p>{selectedStory.character_name}</p>
          </div>
          <button type="button" class="secondary-action" on:click={refreshSelectedStory}>
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>

        <div class="actions-grid">
          <div class="action-card">
            <p class="panel-title">Character</p>
            {#if getOriginalCharacterImage()}
              <img class="preview-image" src={getOriginalCharacterImage()!} alt="Original uploaded character" />
              <p class="muted small-text">Original uploaded character</p>
            {/if}
            <p class="muted small-text">
              Cover reference: {getSelectedEnhancedCharacterImage() ? `${getSelectedEnhancementLabel()} enhanced image` : 'generate an enhanced image'}
            </p>
            <div class="enhanced-image-grid" aria-label="Enhanced character images">
              {#each enhancementSlots as slot, index (slot.level)}
                {@const imageUrl = getEnhancedCharacterImage(index)}
                <figure class:active={Boolean(imageUrl && index === selectedEnhancementIndex)}>
                  {#if imageUrl}
                    <img src={imageUrl} alt={`${slot.label} enhanced character`} />
                  {:else}
                    <div class="enhanced-placeholder">
                      <span>{slot.label}</span>
                      <small>No image yet</small>
                    </div>
                  {/if}
                  <button
                    type="button"
                    class="secondary-action"
                    disabled={!imageUrl}
                    on:click={() => selectEnhancedCharacterImage(index)}
                  >
                    {imageUrl && index === selectedEnhancementIndex ? 'Selected for Cover' : 'Use for Cover'}
                  </button>
                  <button
                    type="button"
                    class="secondary-action"
                    disabled={busy[`character:${slot.level}` as BusyKey]}
                    on:click={() => regenerateCharacter(slot.level, index)}
                  >
                    {busy[`character:${slot.level}` as BusyKey] ? 'Regenerating...' : imageUrl ? 'Regenerate' : 'Generate'}
                  </button>
                  <figcaption>
                    <span>{imageUrl && index === selectedEnhancementIndex ? 'Active' : slot.label}</span>
                    <small>{slot.description}</small>
                  </figcaption>
                </figure>
              {/each}
            </div>
          </div>

          <div class="action-card">
            <p class="panel-title">Cover Image</p>
            {#if selectedStory.cover_image}
              <img class="preview-image" src={selectedStory.cover_image} alt="Story cover" />
            {/if}
            <p class="muted small-text">
              Regenerates with: {getSelectedEnhancedCharacterImage() ? `${getSelectedEnhancementLabel()} enhanced character` : 'no enhanced character selected'}
            </p>
            <button type="button" class="primary-action" disabled={busy.cover} on:click={regenerateCover}>
              {busy.cover ? 'Regenerating...' : 'Regenerate Cover Image'}
            </button>
          </div>
        </div>

        <div class="text-editor-panel">
          <div class="panel-row">
            <p class="panel-title">Story Text</p>
            <button type="button" class="primary-action" disabled={busy.text} on:click={saveStoryText}>
              <Save size={16} /> {busy.text ? 'Saving...' : 'Save Story Text'}
            </button>
          </div>

          {#each selectedStory.story_pages_text as page}
            <label class="text-page-editor">
              <span>Page {page.page_number}</span>
              <textarea bind:value={storyTextDrafts[page.page_number]}></textarea>
            </label>
          {/each}
        </div>

        <div class="pages-panel">
          <p class="panel-title">Page Illustrations</p>
          <div class="page-grid">
            {#each selectedStory.pages.filter((page) => page.page_number) as page}
              <article class="page-card">
                {#if getPageImageUrls(page).length > 0}
                  <div class="page-card-images">
                    {#each getPageImageUrls(page) as imageUrl, index (`${page.key}-${index}-${imageUrl}`)}
                      <figure>
                        <img src={imageUrl} alt={`${page.label} illustration ${index + 1}`} />
                        <button
                          type="button"
                          class="secondary-action"
                          disabled={busy[`page:${page.page_number}:${index}` as BusyKey]}
                          on:click={() => regenerateStoryPage(page.page_number || 1, index)}
                        >
                          {busy[`page:${page.page_number}:${index}` as BusyKey] ? 'Regenerating...' : `Regenerate Image ${index + 1}`}
                        </button>
                      </figure>
                    {/each}
                  </div>
                {/if}
                <div>
                  <strong>{page.label}</strong>
                  <p>{storyTextDrafts[page.page_number || 0] || page.text || 'No page text'}</p>
                  {#if getPageImageUrls(page).length === 0}
                    <button
                      type="button"
                      class="secondary-action"
                      disabled={busy[`page:${page.page_number}:0` as BusyKey]}
                      on:click={() => regenerateStoryPage(page.page_number || 1, 0)}
                    >
                      {busy[`page:${page.page_number}:0` as BusyKey] ? 'Regenerating...' : 'Generate Page Illustration'}
                    </button>
                  {/if}
                </div>
              </article>
            {/each}
          </div>
        </div>
      {:else}
        <p class="muted">Select a story to manage it.</p>
      {/if}
    </section>
  </div>
</div>

<style>
  .admin-stories-page {
    width: 100%;
    padding: 0 1rem;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.25rem;
    color: #111827;
    font-size: 1.5rem;
  }

  .page-header p,
  .muted {
    margin: 0;
    color: #6b7280;
  }

  .stories-layout {
    display: grid;
    grid-template-columns: minmax(260px, 340px) 1fr;
    gap: 1rem;
  }

  .story-list,
  .story-detail,
  .action-card,
  .text-editor-panel,
  .pages-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  .story-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-height: calc(100vh - 150px);
    overflow: auto;
  }

  .story-list button {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 0.55rem;
    background: #ffffff;
    padding: 0.65rem;
    cursor: pointer;
    text-align: left;
  }

  .story-list button.selected {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .story-list img {
    width: 52px;
    height: 52px;
    border-radius: 0.4rem;
    object-fit: cover;
  }

  .story-list small {
    display: block;
    margin-top: 0.2rem;
    color: #6b7280;
  }

  .detail-header,
  .panel-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .detail-header h2 {
    margin: 0;
    color: #111827;
  }

  .eyebrow {
    margin: 0 0 0.25rem;
    color: #2563eb;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .panel-title {
    margin: 0;
    color: #111827;
    font-weight: 700;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .preview-image {
    width: 100%;
    max-height: 260px;
    object-fit: contain;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    margin: 0.75rem 0;
  }

  .enhanced-image-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.6rem;
    margin: 0.75rem 0;
  }

  .enhanced-image-grid figure {
    display: grid;
    gap: 0.45rem;
    margin: 0;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 0.35rem;
    background: #f9fafb;
  }

  .enhanced-image-grid figure.active {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .enhanced-image-grid img,
  .enhanced-placeholder {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 0.35rem;
  }

  .enhanced-image-grid img {
    background: #ffffff;
    object-fit: contain;
  }

  .enhanced-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    min-height: 84px;
    background: #eef2f7;
    border: 1px dashed #cbd5e1;
    color: #6b7280;
    text-align: center;
  }

  .enhanced-placeholder span {
    color: #374151;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .enhanced-placeholder small,
  .enhanced-image-grid figcaption small {
    display: block;
    font-size: 0.7rem;
    font-weight: 400;
  }

  .enhanced-image-grid figcaption {
    min-height: 2.25rem;
    font-weight: 700;
  }

  .enhanced-image-grid .secondary-action {
    width: 100%;
    padding: 0.45rem 0.35rem;
    font-size: 0.78rem;
  }

  .enhanced-image-grid figcaption {
    margin: 0.25rem 0 0;
    color: #6b7280;
    font-size: 0.78rem;
  }

  .text-editor-panel,
  .pages-panel {
    margin-top: 1rem;
  }

  .text-page-editor {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-bottom: 0.8rem;
    color: #374151;
    font-weight: 700;
  }

  textarea {
    min-height: 110px;
    resize: vertical;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    padding: 0.75rem;
    font: inherit;
    line-height: 1.45;
  }

  .page-grid {
    display: grid;
    gap: 0.9rem;
  }

  .page-card {
    display: grid;
    grid-template-columns: minmax(120px, 180px) 1fr;
    gap: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.6rem;
    padding: 0.8rem;
  }

  .page-card-images {
    display: grid;
    gap: 0.5rem;
  }

  .page-card-images figure {
    display: grid;
    gap: 0.45rem;
    margin: 0;
  }

  .page-card-images img {
    width: 100%;
    max-height: 160px;
    object-fit: contain;
    background: #f9fafb;
    border-radius: 0.45rem;
  }

  .page-card p {
    color: #4b5563;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .primary-action,
  .secondary-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border-radius: 0.45rem;
    padding: 0.55rem 0.85rem;
    font-weight: 700;
    cursor: pointer;
  }

  .primary-action {
    border: 1px solid #2563eb;
    background: #2563eb;
    color: #ffffff;
  }

  .secondary-action {
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #374151;
  }

  .primary-action:disabled,
  .secondary-action:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .error-text,
  .success-text {
    margin: 0 0 1rem;
    font-weight: 700;
  }

  .error-text {
    color: #dc2626;
  }

  .success-text {
    color: #15803d;
  }

  @media (max-width: 900px) {
    .stories-layout,
    .page-card {
      grid-template-columns: 1fr;
    }
  }
</style>
