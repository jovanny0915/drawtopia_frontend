<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getTemplates,
    createTemplate,
    deleteTemplate,
    uploadTemplateImage,
    uploadStoryPage,
    uploadMainCharacterImage,
    uploadCharacterForFindingImage,
    deleteTemplateImage,
    deleteStoryPage,
    deleteMainCharacterImage,
    deleteCharacterForFindingImage,
    updateTemplate,
    type BookTemplate,
    type BookTemplateStoryFormat,
  } from '$lib/api/admin';
  import { optimizeImage } from '$lib/imageOptimizer';
  import { Plus, Trash2, X, Save } from 'lucide-svelte';

  type StoryStyleValue =
    | '3d'
    | 'anime'
    | 'cartoon'
    | 'story'
    | 'search'
    | 'adventure'
    | 'search-and-find';

  const STORY_STYLE_OPTIONS: { value: StoryStyleValue; label: string }[] = [
    { value: 'story', label: 'Story' },
    { value: 'search', label: 'Search' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'search-and-find', label: 'Search and Find' },
    { value: '3d', label: '3D' },
    { value: 'anime', label: 'Anime' },
    { value: 'cartoon', label: 'Cartoon' }
  ];

  const STORY_FORMAT_SWITCHES: { value: BookTemplateStoryFormat; label: string }[] = [
    { value: 'adventure_story', label: 'Adventure Story' },
    { value: 'interactive_story', label: 'Interactive Story' }
  ];

  let templates: BookTemplate[] = [];
  let visibleTemplates: BookTemplate[] = [];
  let loading = true;
  let error = '';
  let showAddModal = false;
  let selectedStoryFormat: BookTemplateStoryFormat = 'adventure_story';

  let showUploadModal = false;
  let uploadModalType: 'single' | 'multiple' = 'single';
  let currentUploadField: string = '';
  let currentTemplateId: string = '';
  let currentTemplateName: string = '';
  let selectedFiles: File[] = [];
  let previewUrls: string[] = [];
  let existingUploadUrls: string[] = [];
  let modalFileInput: HTMLInputElement | null = null;
  let targetStoryPageIndex: number | null = null;
  let uploadInProgress = false;
  let deletingSceneInProgress = false;

  let showPositionModal = false;
  let positionModalTemplateId: string = '';
  let positionModalTemplateName: string = '';
  let positionModalPositions: { x: number; y: number }[] = [];
  let newPositionX: string = '';
  let newPositionY: string = '';
  let positionSaving = false;

  let pendingChanges: Map<string, {
    story_world?: 'forest' | 'underwater' | 'outerspace' | '';
    story_style?: StoryStyleValue | '';
  }> = new Map();

  let savingRows: Set<string> = new Set();

  let newTemplateName = '';
  let newTemplateStoryWorld: 'forest' | 'underwater' | 'outerspace' | '' = '';
  let newTemplateStoryStyle: StoryStyleValue | '' = '';

  onMount(async () => {
    await loadTemplates();
  });

  function getStoryFormatLabel(value: BookTemplateStoryFormat): string {
    return value === 'adventure_story' ? 'Adventure Story' : 'Interactive Story';
  }

  async function handleStoryFormatSwitch(nextFormat: BookTemplateStoryFormat) {
    if (nextFormat === selectedStoryFormat || loading) return;
    selectedStoryFormat = nextFormat;
    pendingChanges.clear();
    pendingChanges = pendingChanges;
    await loadTemplates();
  }

  async function loadTemplates() {
    loading = true;
    error = '';
    const result = await getTemplates(selectedStoryFormat);
    if (!result.success || result.error) {
      error = result.error || 'Failed to load templates';
    } else {
      templates = result.data ?? [];
    }
    loading = false;
  }

  function normalizeTemplateStoryFormat(value: string | undefined): BookTemplateStoryFormat {
    if (!value || !value.trim()) return 'adventure_story';
    const normalized = value.trim().toLowerCase().replace('-', '_');
    return normalized === 'interactive_story' ? 'interactive_story' : 'adventure_story';
  }

  $: visibleTemplates = templates.filter(
    (template) => normalizeTemplateStoryFormat(template.story_format) === selectedStoryFormat
  );

  function openAddModal() {
    newTemplateName = '';
    newTemplateStoryWorld = '';
    newTemplateStoryStyle = '';
    showAddModal = true;
  }

    function closeAddModal() {
    showAddModal = false;
  }

  function openSingleImageUploadModal(templateId: string, fieldKey: string, templateName: string) {
    if (savingRows.has(templateId)) return;

    const template = templates.find((t) => t.id === templateId);
    const currentUrl = template?.[fieldKey as keyof BookTemplate];

    currentTemplateId = templateId;
    currentUploadField = fieldKey;
    currentTemplateName = templateName;
    uploadModalType = 'single';
    selectedFiles = [];
    previewUrls = [];
    targetStoryPageIndex = null;
    existingUploadUrls = typeof currentUrl === 'string' && currentUrl ? [currentUrl] : [];
    showUploadModal = true;
  }

  type MultiImageFieldKey = 'story_page_images' | 'main_character_images' | 'character_for_finding';

  function openMultipleImageUploadModal(
    templateId: string,
    templateName: string,
    fieldKey: MultiImageFieldKey
  ) {
    if (savingRows.has(templateId)) return;

    const template = templates.find((t) => t.id === templateId);

    currentTemplateId = templateId;
    currentUploadField = fieldKey;
    currentTemplateName = templateName;
    uploadModalType = 'multiple';
    selectedFiles = [];
    previewUrls = [];
    targetStoryPageIndex = null;
    existingUploadUrls =
      fieldKey === 'story_page_images'
        ? template?.story_page_images || []
        : fieldKey === 'main_character_images'
        ? template?.main_character_images || []
        : template?.character_for_finding || [];
    showUploadModal = true;
  }

  function closeUploadModal() {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    showUploadModal = false;
    currentTemplateId = '';
    currentUploadField = '';
    currentTemplateName = '';
    selectedFiles = [];
    previewUrls = [];
    targetStoryPageIndex = null;
    existingUploadUrls = [];
  }

  function handleModalFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const isReplacingStoryScene = uploadModalType === 'multiple' && targetStoryPageIndex !== null;

    if (uploadModalType === 'single' || isReplacingStoryScene) {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      selectedFiles = [];
      previewUrls = [];
    }

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not a valid image`);
        continue;
      }

      if ((uploadModalType === 'single' || isReplacingStoryScene) && selectedFiles.length > 0) {
        break;
      }

      selectedFiles.push(file);
      previewUrls.push(URL.createObjectURL(file));
    }
    
    selectedFiles = selectedFiles;
    previewUrls = previewUrls;
    
    input.value = '';
  }

  async function handleModalUpload() {
    if (selectedFiles.length === 0) {
      alert('Please select at least one image');
      return;
    }

    uploadInProgress = true;

    try {
      const template = templates.find(t => t.id === currentTemplateId);
      if (!template) throw new Error('Template not found');
      let updatedTemplate: BookTemplate | undefined;

      if (uploadModalType === 'single') {
        const file = selectedFiles[0];
        
        const optimized = await optimizeImage(file, {
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 0.9,
          format: 'webp'
        });

        const result = await uploadTemplateImage(
          currentTemplateId,
          optimized.file,
          currentUploadField as 'cover_image' | 'copyright_page_image' | 'dedication_page_image' | 'back_cover_image' | 'last_words_page_image' | 'last_story_page_image'
        );

        if (!result.success || result.error) {
          throw new Error(result.error || 'Upload failed');
        }

        updatedTemplate = result.data;
        alert('Image uploaded successfully!');
      } else {
        const existingImages =
          currentUploadField === 'story_page_images'
            ? template.story_page_images || []
            : currentUploadField === 'main_character_images'
            ? template.main_character_images || []
            : template.character_for_finding || [];
        const isReplaceMode = targetStoryPageIndex !== null;

        if (isReplaceMode) {
          const file = selectedFiles[0];
          const pageIndex = targetStoryPageIndex as number;

          const optimized = await optimizeImage(file, {
            maxWidth: 2048,
            maxHeight: 2048,
            quality: 0.9,
            format: 'webp'
          });

          const result =
            currentUploadField === 'story_page_images'
              ? await uploadStoryPage(currentTemplateId, optimized.file, pageIndex)
              : currentUploadField === 'main_character_images'
              ? await uploadMainCharacterImage(currentTemplateId, optimized.file, pageIndex)
              : await uploadCharacterForFindingImage(currentTemplateId, optimized.file, pageIndex);

          if (!result.success || result.error) {
            throw new Error(result.error || 'Failed to replace image');
          }

          updatedTemplate = result.data;
          alert(
            currentUploadField === 'story_page_images'
              ? `Story scene #${pageIndex + 1} replaced successfully!`
              : `Main character image #${pageIndex + 1} replaced successfully!`
          );
        } else {
          for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const pageIndex = existingImages.length + i;

            const optimized = await optimizeImage(file, {
              maxWidth: 2048,
              maxHeight: 2048,
              quality: 0.9,
              format: 'webp'
            });

            const result =
              currentUploadField === 'story_page_images'
                ? await uploadStoryPage(currentTemplateId, optimized.file, pageIndex)
                : currentUploadField === 'main_character_images'
                ? await uploadMainCharacterImage(currentTemplateId, optimized.file, pageIndex)
                : await uploadCharacterForFindingImage(currentTemplateId, optimized.file, pageIndex);

            if (!result.success || result.error) {
              throw new Error(`Failed to upload image ${i + 1}: ${result.error}`);
            }

            updatedTemplate = result.data;
          }

          alert(
            currentUploadField === 'story_page_images'
              ? `${selectedFiles.length} story page(s) uploaded successfully!`
              : currentUploadField === 'main_character_images'
              ? `${selectedFiles.length} main character image(s) uploaded successfully!`
              : `${selectedFiles.length} character-for-finding image(s) uploaded successfully!`
          );
        }
      }

      if (updatedTemplate) {
        refreshTemplateRow(updatedTemplate);
      }

      closeUploadModal();

      await loadTemplates();
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      uploadInProgress = false;
    }
  }

  async function handleAddTemplate() {
    if (!newTemplateName.trim()) {
      alert('Please provide a template name.');
      return;
    }

    const result = await createTemplate(
      newTemplateName.trim(), 
      newTemplateStoryWorld || undefined,
      newTemplateStoryStyle || undefined,
      selectedStoryFormat
    );
    if (!result.success || result.error) {
      alert(`Error adding template: ${result.error}`);
    } else {
      await loadTemplates();
      closeAddModal();
    }
  }

  async function handleDeleteTemplate(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete template "${name}"? This will also delete all associated images.`)) {
      return;
    }

    try {
      const result = await deleteTemplate(id, selectedStoryFormat);
      if (!result.success || result.error) {
        alert(`Error deleting template: ${result.error}`);
      } else {
        pendingChanges.delete(id);
        pendingChanges = pendingChanges;
        await loadTemplates();
      }
    } catch (err: any) {
      console.error('Error in delete operation:', err);
      alert(`Error deleting template: ${err.message}`);
    }
  }

  function handleStoryWorldChange(templateId: string, newValue: string) {
    const changes = pendingChanges.get(templateId) || {};
    changes.story_world = newValue as 'forest' | 'underwater' | 'outerspace' | '';
    pendingChanges.set(templateId, changes);
    pendingChanges = pendingChanges;
  }

  function handleStoryStyleChange(templateId: string, newValue: string) {
    const changes = pendingChanges.get(templateId) || {};
    changes.story_style = newValue as StoryStyleValue | '';
    pendingChanges.set(templateId, changes);
    pendingChanges = pendingChanges;
  }

  async function handleSaveTemplateMetadata(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    if (!hasPendingChanges(templateId)) return;

    const currentStoryWorld = getDisplayStoryWorld(templateId, template.story_world) as 'forest' | 'underwater' | 'outerspace' | undefined;
    const currentStoryStyle = getDisplayStoryStyle(
      templateId,
      template.story_style ?? template.story_type
    );

    savingRows.add(templateId);
    savingRows = savingRows;

    try {
      const result = await updateTemplate(templateId, {
        story_world: currentStoryWorld,
        story_style: currentStoryStyle,
        story_type: currentStoryStyle,
        story_format: selectedStoryFormat
      });
      
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to update template metadata');
      }

      pendingChanges.delete(templateId);
      pendingChanges = pendingChanges;

      await loadTemplates();

      alert('Template metadata updated successfully!');
    } catch (err: any) {
      console.error('Save error:', err);
      alert(`Failed to save: ${err.message}`);
    } finally {
      savingRows.delete(templateId);
      savingRows = savingRows;
    }
  }

  function getDisplayStoryPages(templateId: string, actualUrls: string[] | undefined): string[] {
    return actualUrls || [];
  }

  function getDisplayStoryWorld(templateId: string, actualWorld: string | undefined): string | undefined {
    const changes = pendingChanges.get(templateId);
    if (changes && 'story_world' in changes) {
      return changes.story_world || undefined;
    }
    return actualWorld;
  }

  function getDisplayStoryStyle(templateId: string, actualStyle: string | undefined): string | undefined {
    const changes = pendingChanges.get(templateId);
    if (changes && 'story_style' in changes) {
      return changes.story_style || undefined;
    }
    return actualStyle;
  }

  function hasPendingChanges(templateId: string): boolean {
    const changes = pendingChanges.get(templateId);
    if (!changes) return false;

    return 'story_world' in changes || 'story_style' in changes;
  }

  function isKnownStoryStyle(value: string | undefined): boolean {
    if (!value) return false;
    return STORY_STYLE_OPTIONS.some((option) => option.value === value);
  }

  function formatStoryStyleLabel(value: string | undefined): string {
    if (!value) return '';
    return value
      .split('-')
      .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
      .join(' ');
  }

  function getUploadFieldDisplayName(fieldKey: string): string {
    return fieldKey.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function triggerModalFilePicker(storyPageIndex: number | null = null) {
    if (uploadInProgress || deletingSceneInProgress) return;
    if (uploadModalType === 'multiple') {
      targetStoryPageIndex = storyPageIndex;
    }
    modalFileInput?.click();
  }

  function triggerAppendStoryScenePicker() {
    if (uploadInProgress || deletingSceneInProgress || uploadModalType !== 'multiple') return;
    targetStoryPageIndex = null;
    modalFileInput?.click();
  }

  function openPositionModal(templateId: string, templateName: string) {
    if (savingRows.has(templateId)) return;
    const template = templates.find((t) => t.id === templateId);
    positionModalTemplateId = templateId;
    positionModalTemplateName = templateName;
    positionModalPositions = (template?.positions || []).map((p: any) => ({ x: p.x, y: p.y }));
    newPositionX = '';
    newPositionY = '';
    showPositionModal = true;
  }

  function closePositionModal() {
    showPositionModal = false;
    positionModalTemplateId = '';
    positionModalTemplateName = '';
    positionModalPositions = [];
    newPositionX = '';
    newPositionY = '';
  }

  async function handleAddPosition() {
    if (!positionModalTemplateId) return;
    const x = parseFloat(newPositionX);
    const y = parseFloat(newPositionY);
    if (Number.isNaN(x) || Number.isNaN(y)) {
      alert('Please enter valid numeric x and y values');
      return;
    }
    if (positionModalPositions.length >= 16) {
      alert('Maximum 16 coordinates allowed');
      return;
    }
    positionModalPositions = [...positionModalPositions, { x, y }];
    newPositionX = '';
    newPositionY = '';
  }

  async function removePosition(index: number) {
    if (!positionModalTemplateId) return;
    if (!confirm('Remove this coordinate?')) return;
    positionModalPositions = positionModalPositions.filter((_, i) => i !== index);
    await savePositions();
  }

  async function savePositions() {
    if (!positionModalTemplateId) return;
    positionSaving = true;
    try {
      const result = await updateTemplate(positionModalTemplateId, { positions: positionModalPositions });
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to save positions');
      }
      if (result.data) {
        refreshTemplateRow(result.data);
      }
      alert('Positions saved');
      closePositionModal();
    } catch (err: any) {
      console.error('Save positions error', err);
      alert(`Failed to save positions: ${err.message}`);
    } finally {
      positionSaving = false;
    }
  }

  function getModalSceneUrls(): string[] {
    if (previewUrls.length === 0) {
      return existingUploadUrls;
    }

    if (uploadModalType === 'multiple') {
      if (targetStoryPageIndex !== null && previewUrls[0]) {
        const merged = [...existingUploadUrls];
        merged[targetStoryPageIndex] = previewUrls[0];
        return merged;
      }

      return [...existingUploadUrls, ...previewUrls];
    }

    return previewUrls;
  }

  function addCacheBuster(url?: string, stamp: number = Date.now()): string | undefined {
    if (!url) return undefined;
    return `${url}${url.includes('?') ? '&' : '?'}v=${stamp}`;
  }

  function withRefreshedImageUrls(template: BookTemplate, stamp: number = Date.now()): BookTemplate {
    return {
      ...template,
      cover_image: addCacheBuster(template.cover_image, stamp),
      copyright_page_image: addCacheBuster(template.copyright_page_image, stamp),
      dedication_page_image: addCacheBuster(template.dedication_page_image, stamp),
      last_words_page_image: addCacheBuster(template.last_words_page_image, stamp),
      last_story_page_image: addCacheBuster(template.last_story_page_image, stamp),
      back_cover_image: addCacheBuster(template.back_cover_image, stamp),
      story_page_images: (template.story_page_images || []).map((url) => addCacheBuster(url, stamp) || ''),
      main_character_images: (template.main_character_images || []).map((url) => addCacheBuster(url, stamp) || '')
      ,character_for_finding: (template.character_for_finding || []).map((url) => addCacheBuster(url, stamp) || '')
    };
  }

  function refreshTemplateRow(updatedTemplate: BookTemplate) {
    const refreshed = withRefreshedImageUrls(updatedTemplate);
    templates = templates.map((template) => (template.id === refreshed.id ? refreshed : template));
  }

  async function handleDeleteScene(sceneIndex: number) {
    if (uploadInProgress || deletingSceneInProgress) return;
    if (previewUrls.length > 0) {
      alert('Please upload or clear your new selection first before deleting current scene.');
      return;
    }

    const confirmed = confirm(
      uploadModalType === 'single'
        ? 'Delete this scene image from the template?'
        : `Delete story scene #${sceneIndex + 1} from this template?`
    );
    if (!confirmed) return;

    deletingSceneInProgress = true;
    try {
      let result;
      if (uploadModalType === 'single') {
        result = await deleteTemplateImage(
          currentTemplateId,
          currentUploadField as 'cover_image' | 'copyright_page_image' | 'dedication_page_image' | 'last_words_page_image' | 'last_story_page_image' | 'back_cover_image'
        );
      } else {
        result =
          currentUploadField === 'story_page_images'
            ? await deleteStoryPage(currentTemplateId, sceneIndex)
            : currentUploadField === 'main_character_images'
            ? await deleteMainCharacterImage(currentTemplateId, sceneIndex)
            : await deleteCharacterForFindingImage(currentTemplateId, sceneIndex);
      }

      if (!result.success || result.error || !result.data) {
        throw new Error(result.error || 'Failed to delete scene image');
      }

      refreshTemplateRow(result.data);
      if (uploadModalType === 'single') {
        existingUploadUrls = [];
      } else {
        existingUploadUrls =
          currentUploadField === 'story_page_images'
            ? result.data.story_page_images || []
            : currentUploadField === 'main_character_images'
            ? result.data.main_character_images || []
            : result.data.character_for_finding || [];
      }

      closeUploadModal();
      await loadTemplates();
      alert('Scene deleted successfully!');
    } catch (err: any) {
      console.error('Delete scene error:', err);
      alert(`Delete failed: ${err.message}`);
    } finally {
      deletingSceneInProgress = false;
    }
  }
</script>

<div class="templates-page">
  <div class="page-header">
    <div class="page-header-left">
      <h1>Book Templates</h1>
      <div class="story-format-switch" role="tablist" aria-label="Template story format">
        {#each STORY_FORMAT_SWITCHES as formatOption}
          <button
            class="format-switch-btn"
            class:active={selectedStoryFormat === formatOption.value}
            on:click={() => handleStoryFormatSwitch(formatOption.value)}
            disabled={loading}
            role="tab"
            aria-selected={selectedStoryFormat === formatOption.value}
          >
            {formatOption.label}
          </button>
        {/each}
      </div>
    </div>
    <div class="page-header-actions">
      <button class="add-btn" on:click={openAddModal}>
        <Plus size={20} />
        Add Template
      </button>
    </div>
  </div>

  {#if loading}
    <div class="loading-state">Loading templates...</div>
  {:else if error}
    <div class="error-state">Error: {error}</div>
  {:else if visibleTemplates.length === 0}
    <div class="empty-state">
      <p>No {getStoryFormatLabel(selectedStoryFormat).toLowerCase()} templates found. Create one to get started.</p>
    </div>
  {:else}
    <div class="table-container">
      <table class="templates-table">
        <thead>
          <tr>
            <th style="width: 100px; overflow: hidden; text-overflow: ellipsis;">Name</th>
            <th>Story World</th>
            <th>Story Type</th>
            <th>Cover</th>
            <th>Copyright</th>
            <th>Dedication</th>
            <th>Story Pages</th>
            {#if selectedStoryFormat === 'interactive_story'}
              <th>Main character images</th>
              <th>Character for Finding</th>
              <th>Positions</th>
            {/if}
            <th>Last Words</th>
            <th>Last Story</th>
            <th>Back Cover</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each visibleTemplates as template (template.id)}
            {@const isSaving = savingRows.has(template.id)}
            {@const hasPending = hasPendingChanges(template.id)}
            {@const displayStoryWorld = getDisplayStoryWorld(template.id, template.story_world)}
            {@const displayStoryStyle = getDisplayStoryStyle(template.id, template.story_style ?? template.story_type)}
            {@const coverUrl = template.cover_image}
            {@const copyrightUrl = template.copyright_page_image}
            {@const dedicationUrl = template.dedication_page_image}
            {@const storyPagesUrls = getDisplayStoryPages(template.id, template.story_page_images)}
            {@const mainCharacterUrls = template.main_character_images || []}
            {@const characterForFindingUrls = template.character_for_finding || []}
            {@const lastWordsUrl = template.last_words_page_image}
            {@const lastStoryUrl = template.last_story_page_image}
            {@const backCoverUrl = template.back_cover_image}
            
            <tr>
              <td class="template-name">{template.name}</td>
              
              <td class="story-world-cell">
                <select
                  class="story-world-select"
                  value={displayStoryWorld || ''}
                  on:change={(e) => handleStoryWorldChange(template.id, e.currentTarget.value)}
                  disabled={isSaving}
                >
                  <option value="">— None —</option>
                  <option value="forest">🌲 Forest</option>
                  <option value="underwater">🌊 Underwater</option>
                  <option value="outerspace">🚀 Outer Space</option>
                </select>
              </td>

              <td class="story-world-cell">
                <select
                  class="story-world-select"
                  value={displayStoryStyle || ''}
                  on:change={(e) => handleStoryStyleChange(template.id, e.currentTarget.value)}
                  disabled={isSaving}
                >
                  <option value="">— None —</option>
                  {#if displayStoryStyle && !isKnownStoryStyle(displayStoryStyle)}
                    <option value={displayStoryStyle}>{formatStoryStyleLabel(displayStoryStyle)} (legacy)</option>
                  {/if}
                  {#each STORY_STYLE_OPTIONS as styleOption}
                    <option value={styleOption.value}>{styleOption.label}</option>
                  {/each}
                </select>
              </td>
              
              <td class="image-cell">
                <div 
                  class="image-upload-box" 
                  class:disabled={isSaving}
                  on:click={() => openSingleImageUploadModal(template.id, 'cover_image', template.name)}
                  on:keydown={(e) => e.key === 'Enter' && openSingleImageUploadModal(template.id, 'cover_image', template.name)}
                  role="button"
                  tabindex="0"
                >
                  {#if coverUrl}
                    <img src={coverUrl} alt="Cover" class="thumbnail" />
                  {:else}
                    <div class="upload-placeholder">
                      <Plus size={32} strokeWidth={1.5} />
                    </div>
                  {/if}
                </div>
              </td>
              
              <td class="image-cell">
                <div 
                  class="image-upload-box" 
                  class:disabled={isSaving}
                  on:click={() => openSingleImageUploadModal(template.id, 'copyright_page_image', template.name)}
                  on:keydown={(e) => e.key === 'Enter' && openSingleImageUploadModal(template.id, 'copyright_page_image', template.name)}
                  role="button"
                  tabindex="0"
                >
                  {#if copyrightUrl}
                    <img src={copyrightUrl} alt="Copyright" class="thumbnail" />
                  {:else}
                    <div class="upload-placeholder"><Plus size={32} strokeWidth={1.5} /></div>
                  {/if}
                </div>
              </td>
              
              <td class="image-cell">
                <div 
                  class="image-upload-box" 
                  class:disabled={isSaving}
                  on:click={() => openSingleImageUploadModal(template.id, 'dedication_page_image', template.name)}
                  on:keydown={(e) => e.key === 'Enter' && openSingleImageUploadModal(template.id, 'dedication_page_image', template.name)}
                  role="button"
                  tabindex="0"
                >
                  {#if dedicationUrl}
                    <img src={dedicationUrl} alt="Dedication" class="thumbnail" />
                  {:else}
                    <div class="upload-placeholder"><Plus size={32} strokeWidth={1.5} /></div>
                  {/if}
                </div>
              </td>
              
              <td class="image-cell story-pages-cell-container">
                <div 
                  class="image-upload-box" 
                  class:disabled={isSaving}
                  on:click={() => openMultipleImageUploadModal(template.id, template.name, 'story_page_images')}
                  on:keydown={(e) => e.key === 'Enter' && openMultipleImageUploadModal(template.id, template.name, 'story_page_images')}
                  role="button"
                  tabindex="0"
                >
                  {#if storyPagesUrls.length > 0}
                    <div class="story-thumbnail-wrapper">
                      <img 
                        src={storyPagesUrls[0]} 
                        alt="First story page" 
                        class="thumbnail story-thumbnail" 
                      />
                      <div class="story-overlay">
                        <span class="story-count-badge">{storyPagesUrls.length} image{storyPagesUrls.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  {:else}
                    <div class="upload-placeholder">
                      <Plus size={32} strokeWidth={1.5} />
                    </div>
                  {/if}
                </div>
              </td>

              {#if selectedStoryFormat === 'interactive_story'}
                <td class="image-cell story-pages-cell-container">
                  <div 
                    class="image-upload-box" 
                    class:disabled={isSaving}
                    on:click={() => openMultipleImageUploadModal(template.id, template.name, 'main_character_images')}
                    on:keydown={(e) => e.key === 'Enter' && openMultipleImageUploadModal(template.id, template.name, 'main_character_images')}
                    role="button"
                    tabindex="0"
                  >
                    {#if mainCharacterUrls.length > 0}
                      <div class="story-thumbnail-wrapper">
                        <img 
                          src={mainCharacterUrls[0]} 
                          alt="First main character image" 
                          class="thumbnail story-thumbnail" 
                        />
                        <div class="story-overlay">
                          <span class="story-count-badge">{mainCharacterUrls.length} image{mainCharacterUrls.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    {:else}
                      <div class="upload-placeholder">
                        <Plus size={32} strokeWidth={1.5} />
                      </div>
                    {/if}
                  </div>
                </td>
                <td class="image-cell story-pages-cell-container">
                  <div 
                    class="image-upload-box" 
                    class:disabled={isSaving}
                    on:click={() => openMultipleImageUploadModal(template.id, template.name, 'character_for_finding')}
                    on:keydown={(e) => e.key === 'Enter' && openMultipleImageUploadModal(template.id, template.name, 'character_for_finding')}
                    role="button"
                    tabindex="0"
                  >
                    {#if characterForFindingUrls.length > 0}
                      <div class="story-thumbnail-wrapper">
                        <img 
                          src={characterForFindingUrls[0]} 
                          alt="First character-for-finding image" 
                          class="thumbnail story-thumbnail" 
                        />
                        <div class="story-overlay">
                          <span class="story-count-badge">{characterForFindingUrls.length} image{characterForFindingUrls.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    {:else}
                      <div class="upload-placeholder">
                        <Plus size={32} strokeWidth={1.5} />
                      </div>
                    {/if}
                  </div>
                </td>
                <td class="positions-cell">
                  {#if (template.positions && template.positions.length > 0)}
                    <div class="positions-list">
                      {#each template.positions as pos, idx}
                        <div class="position-item">#{idx + 1}: ({pos.x.toFixed(2)}, {pos.y.toFixed(2)})</div>
                      {/each}
                    </div>
                  {:else}
                    <div class="positions-empty">—</div>
                  {/if}
                  <div class="positions-actions">
                    <button class="scene-add-btn" on:click={() => openPositionModal(template.id, template.name)}>Add Coordinate</button>
                  </div>
                </td>
              {/if}
              
              <td class="image-cell">
                <div 
                  class="image-upload-box" 
                  class:disabled={isSaving}
                  on:click={() => openSingleImageUploadModal(template.id, 'last_words_page_image', template.name)}
                  on:keydown={(e) => e.key === 'Enter' && openSingleImageUploadModal(template.id, 'last_words_page_image', template.name)}
                  role="button"
                  tabindex="0"
                >
                  {#if lastWordsUrl}
                    <img src={lastWordsUrl} alt="Last Words" class="thumbnail" />
                  {:else}
                    <div class="upload-placeholder"><Plus size={32} strokeWidth={1.5} /></div>
                  {/if}
                </div>
              </td>
              
              <td class="image-cell">
                <div 
                  class="image-upload-box" 
                  class:disabled={isSaving}
                  on:click={() => openSingleImageUploadModal(template.id, 'last_story_page_image', template.name)}
                  on:keydown={(e) => e.key === 'Enter' && openSingleImageUploadModal(template.id, 'last_story_page_image', template.name)}
                  role="button"
                  tabindex="0"
                >
                  {#if lastStoryUrl}
                    <img src={lastStoryUrl} alt="Last Story" class="thumbnail" />
                  {:else}
                    <div class="upload-placeholder"><Plus size={32} strokeWidth={1.5} /></div>
                  {/if}
                </div>
              </td>
              
              <td class="image-cell">
                <div 
                  class="image-upload-box" 
                  class:disabled={isSaving}
                  on:click={() => openSingleImageUploadModal(template.id, 'back_cover_image', template.name)}
                  on:keydown={(e) => e.key === 'Enter' && openSingleImageUploadModal(template.id, 'back_cover_image', template.name)}
                  role="button"
                  tabindex="0"
                >
                  {#if backCoverUrl}
                    <img src={backCoverUrl} alt="Back Cover" class="thumbnail" />
                  {:else}
                    <div class="upload-placeholder">
                      <Plus size={32} strokeWidth={1.5} />
                    </div>
                  {/if}
                </div>
              </td>
              
              <td class="actions-cell">
                <div class="action-buttons">
                  <button
                    class="save-btn"
                    on:click={() => handleSaveTemplateMetadata(template.id)}
                    disabled={isSaving || !hasPending}
                    title="Save template metadata"
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    class="delete-btn"
                    on:click={() => handleDeleteTemplate(template.id, template.name)}
                    title="Delete template"
                    disabled={isSaving}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

{#if showAddModal}
  <div class="modal-overlay" on:click={closeAddModal} on:keydown={(e) => e.key === 'Escape' && closeAddModal()} role="button" tabindex="-1">
    <div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation role="dialog" tabindex="-1">
      <div class="modal-header">
        <h2>Add New Template</h2>
        <button class="close-btn" on:click={closeAddModal}>
          <X size={24} />
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="template-name">Template Name</label>
          <input
            id="template-name"
            type="text"
            bind:value={newTemplateName}
            placeholder="e.g. Standard Book"
          />
        </div>
        <div class="form-group">
          <label for="story-world">Story World (Optional)</label>
          <select
            id="story-world"
            bind:value={newTemplateStoryWorld}
            class="select-input"
          >
            <option value="">-- No specific world --</option>
            <option value="forest">Forest (Enchanted Forest)</option>
            <option value="underwater">Underwater (Underwater Kingdom)</option>
            <option value="outerspace">Outer Space</option>
          </select>
        </div>
        <div class="form-group">
          <label for="story-style">Story Type (Optional)</label>
          <select
            id="story-style"
            bind:value={newTemplateStoryStyle}
            class="select-input"
          >
            <option value="">-- No specific style --</option>
            {#each STORY_STYLE_OPTIONS as styleOption}
              <option value={styleOption.value}>{styleOption.label}</option>
            {/each}
          </select>
        </div>
        <small class="help-text">
          This template will be added to <strong>{getStoryFormatLabel(selectedStoryFormat)}</strong>.
          After creating the template, you can upload images for each page type. Story World and Story Type are both saved as metadata for template selection.
        </small>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" on:click={closeAddModal}>Cancel</button>
        <button class="btn btn-primary" on:click={handleAddTemplate}>Add Template</button>
      </div>
    </div>
  </div>
{/if}

{#if showPositionModal}
  <div class="modal-overlay" on:click={closePositionModal} on:keydown={(e) => e.key === 'Escape' && closePositionModal()} role="button" tabindex="-1">
    <div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation role="dialog" tabindex="-1">
      <div class="modal-header">
        <h2>Manage Coordinates — {positionModalTemplateName}</h2>
        <button class="close-btn" on:click={closePositionModal}>
          <X size={24} />
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Existing Coordinates</label>
          {#if positionModalPositions.length > 0}
            <div class="positions-list-modal">
              {#each positionModalPositions as pos, idx}
                <div class="position-row">
                  <div>#{idx + 1}: x={pos.x.toFixed(3)}, y={pos.y.toFixed(3)}</div>
                  <button class="scene-delete-btn" on:click={() => removePosition(idx)}>Remove</button>
                </div>
              {/each}
            </div>
          {:else}
            <div class="no-selection">No coordinates yet.</div>
          {/if}
        </div>

        <div class="form-group">
          <label>Add Coordinate (0.0 - 1.0)</label>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="text" placeholder="x (e.g. 0.12)" bind:value={newPositionX} />
            <input type="text" placeholder="y (e.g. 0.34)" bind:value={newPositionY} />
            <button class="scene-add-btn" on:click={handleAddPosition}>Add</button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" on:click={closePositionModal} disabled={positionSaving}>Cancel</button>
        <button class="btn btn-primary" on:click={savePositions} disabled={positionSaving}>{positionSaving ? 'Saving...' : 'Save Coordinates'}</button>
      </div>
    </div>
  </div>
{/if}

{#if showUploadModal}
  <div class="modal-overlay" on:click={closeUploadModal} on:keydown={(e) => e.key === 'Escape' && closeUploadModal()} role="button" tabindex="-1">
    <div class="modal-content upload-modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" tabindex="-1">
      <div class="modal-header">
        <h2>
          {#if uploadModalType === 'single'}
            Enchanted Image Chamber
          {:else}
            Story Gallery Portal
          {/if}
        </h2>
        <button class="close-btn" on:click={closeUploadModal} disabled={uploadInProgress || deletingSceneInProgress}>
          <X size={24} />
        </button>
      </div>
      <div class="modal-body upload-modal-body">
        <div class="upload-info">
          <p><strong>Template:</strong> {currentTemplateName}</p>
          <p><strong>Field:</strong> {getUploadFieldDisplayName(currentUploadField)}</p>
          <p class="upload-hint">
            {#if uploadModalType === 'single'}
              Replace the current image or choose a new one to begin.
            {:else}
              Add more images in order. Existing images remain untouched.
            {/if}
          </p>
        </div>

        <div class="current-upload-section">
          <div class="section-title">
            {#if previewUrls.length > 0}
              New Scene Preview
            {:else}
              Current Uploaded Image{uploadModalType === 'multiple' ? 's' : ''}
            {/if}
          </div>
          {#if uploadModalType === 'multiple' && !(uploadInProgress || deletingSceneInProgress)}
            <div class="scene-actions-row">
              <button class="scene-add-btn" on:click={triggerAppendStoryScenePicker}>
              Add Images
              </button>
            </div>
          {/if}
          {#if getModalSceneUrls().length > 0}
            <div class="preview-grid current-grid" class:single={uploadModalType === 'single'}>
              {#each getModalSceneUrls() as url, index}
                <div class="preview-item current-preview-item">
                  <img src={url} alt="Scene image {index + 1}" class="preview-image" />
                  {#if !(uploadInProgress || deletingSceneInProgress)}
                    <button
                      class="scene-change-btn on-image"
                      on:click={() => triggerModalFilePicker(uploadModalType === 'multiple' ? index : null)}
                      title="Change scene image"
                    >
                      Change Scene
                    </button>
                  {/if}
                  {#if !(uploadInProgress || deletingSceneInProgress) && previewUrls.length === 0}
                    <button
                      class="scene-delete-btn on-image-delete"
                      on:click={() => handleDeleteScene(index)}
                      title="Delete this scene image"
                    >
                      Delete Scene
                    </button>
                  {/if}
                  {#if uploadModalType === 'multiple'}
                    <div class="preview-number current-number">#{index + 1}</div>
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <div class="no-selection current-empty-state scene-empty-card">
              <p>No image uploaded yet for this slot.</p>
              <button
                class="scene-change-btn"
                on:click={() => triggerModalFilePicker(uploadModalType === 'multiple' ? null : 0)}
                disabled={uploadInProgress || deletingSceneInProgress}
              >
                {uploadModalType === 'multiple' ? 'Add Images' : 'Change Scene'}
              </button>
            </div>
          {/if}
        </div>

        <input
          bind:this={modalFileInput}
          type="file"
          accept="image/*"
          multiple={uploadModalType === 'multiple' && targetStoryPageIndex === null}
          on:change={handleModalFileSelect}
          disabled={uploadInProgress || deletingSceneInProgress}
          style="display: none;"
        />
      </div>
      <div class="modal-footer">
        <button 
          class="btn btn-secondary" 
          on:click={closeUploadModal}
          disabled={uploadInProgress || deletingSceneInProgress}
        >
          Cancel
        </button>
        <button 
          class="btn btn-primary upload-btn" 
          on:click={handleModalUpload}
          disabled={uploadInProgress || deletingSceneInProgress || selectedFiles.length === 0}
        >
          {#if uploadInProgress}
            Uploading...
          {:else if deletingSceneInProgress}
            Deleting...
          {:else}
            Upload ({selectedFiles.length})
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .templates-page {
    max-width: 100%;
    padding: 0 1rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .page-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .page-header-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.65rem;
  }

  .page-header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .story-format-switch {
    display: inline-flex;
    align-items: center;
    border: 1px solid #dbe4ff;
    border-radius: 0.65rem;
    background: #f8faff;
    padding: 0.2rem;
    gap: 0.2rem;
  }

  .format-switch-btn {
    border: none;
    background: transparent;
    color: #4b5563;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.45rem 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .format-switch-btn:hover:not(:disabled) {
    color: #1e40af;
  }

  .format-switch-btn.active {
    background: #1e40af;
    color: #ffffff;
    box-shadow: 0 1px 2px rgba(30, 64, 175, 0.35);
  }

  .format-switch-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .add-btn {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
  }

  .loading-state,
  .error-state,
  .empty-state {
    padding: 3rem;
    text-align: center;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .error-state {
    color: #dc2626;
  }

  .empty-state {
    color: #6b7280;
  }

  .table-container {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
  }

  .templates-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .templates-table thead {
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  }

  .templates-table th {
    padding: 1rem;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
  }

  .templates-table td {
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
  }

  .templates-table tbody tr:hover {
    background-color: #f9fafb;
  }

  .templates-table tbody tr:last-child td {
    border-bottom: none;
  }

  .template-name {
    font-weight: 600;
    color: #111827;
    min-width: 150px;
  }

  .story-world-cell {
    min-width: 160px;
  }

  .story-world-select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .story-world-select:focus {
    outline: none;
    border-color: #1e40af;
  }

  .story-world-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .image-cell {
    text-align: center;
    min-width: 120px;
  }

  .image-upload-box {
    display: inline-block;
    cursor: pointer;
    transition: all 0.2s;
  }

  .image-upload-box.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .image-upload-box:not(.disabled):hover .thumbnail {
    border-color: #1e40af;
    box-shadow: 0 0 0 2px #eff6ff;
  }

  .image-upload-box:not(.disabled):hover .upload-placeholder {
    border-color: #1e40af;
    background: #eff6ff;
  }

  .image-upload-box:not(.disabled):hover .upload-placeholder :global(svg) {
    color: #1e40af;
  }

  .thumbnail {
    width: 100px;
    height: 140px;
    object-fit: cover;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    display: inline-block;
    transition: all 0.2s;
  }

  .upload-placeholder {
    width: 100px;
    height: 140px;
    border: 2px dashed #d1d5db;
    border-radius: 0.375rem;
    background: #f9fafb;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .upload-placeholder :global(svg) {
    color: #9ca3af;
    transition: color 0.2s;
    pointer-events: none;
  }

  .story-pages-cell-container {
    position: relative;
  }

  .story-thumbnail-wrapper {
    position: relative;
    display: inline-block;
    width: 100px;
    height: 140px;
    border-radius: 0.375rem;
    overflow: hidden;
    transition: all 0.2s;
  }

  .story-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
    padding: 0.5rem 0.25rem 0.25rem;
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }

  .story-count-badge {
    background: #1e40af;
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 700;
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .actions-cell {
    text-align: center;
    min-width: 180px;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .save-btn,
  .delete-btn {
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 100px;
    justify-content: center;
  }

  .save-btn {
    background: #dcfce7;
    color: #166534;
  }

  .save-btn:hover:not(:disabled) {
    background: #bbf7d0;
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .delete-btn {
    background: #fee2e2;
    color: #dc2626;
  }

  .delete-btn:hover:not(:disabled) {
    background: #fecaca;
  }

  .delete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .modal-content {
    background: white;
    border-radius: 0.75rem;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: #111827;
  }

  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }

  .form-group input[type='text'] {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .form-group input[type='text']:focus {
    outline: none;
    border-color: #1e40af;
  }

  .form-group .select-input {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: border-color 0.2s;
    background: white;
    cursor: pointer;
  }

  .form-group .select-input:focus {
    outline: none;
    border-color: #1e40af;
  }

  .help-text {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }

  .modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }

  .btn-primary {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .upload-modal {
    max-width: 700px;
    background:
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 45%),
      radial-gradient(circle at top left, rgba(167, 139, 250, 0.12), transparent 40%),
      #ffffff;
    border: 1px solid rgba(99, 102, 241, 0.2);
    box-shadow:
      0 24px 60px rgba(15, 23, 42, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .upload-modal-body {
    max-height: 60vh;
    overflow-y: auto;
  }

  .upload-info {
    background: linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%);
    padding: 1rem 1.125rem;
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid rgba(99, 102, 241, 0.25);
  }

  .upload-info p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
    color: #374151;
  }

  .upload-hint {
    color: #4338ca;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .section-title {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #4338ca;
    margin-bottom: 0.625rem;
  }

  .current-upload-section {
    margin-bottom: 1rem;
    border-radius: 0.75rem;
    border: 1px solid #e0e7ff;
    background: #f8faff;
    padding: 0.9rem;
  }

  .current-grid {
    margin-top: 0.25rem;
  }

  .current-preview-item {
    border-color: #c7d2fe;
  }

  .current-number {
    background: rgba(67, 56, 202, 0.88);
  }

  .current-empty-state {
    padding: 1.25rem;
    border-radius: 0.5rem;
    border: 1px dashed #c7d2fe;
    background: #f5f3ff;
  }

  .scene-empty-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .scene-actions-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
  }

  .scene-add-btn {
    border: 1px solid rgba(67, 56, 202, 0.35);
    background: #eef2ff;
    color: #3730a3;
    border-radius: 999px;
    padding: 0.42rem 0.8rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }

  .scene-add-btn:hover {
    background: #e0e7ff;
    transform: translateY(-1px);
  }

  .scene-change-btn {
    border: none;
    background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
    color: #ffffff;
    border-radius: 999px;
    padding: 0.5rem 0.95rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.25);
  }

  .scene-change-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.35);
  }

  .scene-change-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .scene-change-btn.on-image {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    backdrop-filter: blur(3px);
    background: rgba(30, 64, 175, 0.92);
    border: 1px solid rgba(191, 219, 254, 0.8);
    z-index: 3;
  }

  .scene-change-btn.on-image:hover:not(:disabled) {
    transform: translate(-50%, calc(-50% - 1px));
  }

  .scene-delete-btn {
    border: 1px solid rgba(252, 165, 165, 0.8);
    background: rgba(185, 28, 28, 0.9);
    color: #ffffff;
    border-radius: 999px;
    padding: 0.38rem 0.75rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.015em;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s;
    z-index: 3;
  }

  .scene-delete-btn:hover {
    transform: translateY(-1px);
    background: rgba(153, 27, 27, 0.95);
  }

  .on-image-delete {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .preview-grid.single {
    grid-template-columns: 1fr;
    max-width: 300px;
    margin: 1rem auto;
  }

  .preview-item {
    position: relative;
    border-radius: 0.5rem;
    overflow: hidden;
    aspect-ratio: 5/7;
    border: 2px solid #e5e7eb;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-number {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    background: rgba(30, 64, 175, 0.9);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 700;
    font-size: 0.75rem;
  }

  .positions-cell {
    min-width: 180px;
    text-align: left;
    padding: 0.75rem;
  }

  .positions-list { display:flex; flex-direction:column; gap:4px; }
  .position-item { font-size:0.85rem; color:#374151 }
  .positions-actions { margin-top:6px }
  .positions-empty { color:#9ca3af }
  .positions-list-modal { display:flex; flex-direction:column; gap:8px }
  .position-row { display:flex; justify-content:space-between; align-items:center; gap:8px }

  .no-selection {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  }

  .no-selection p {
    margin: 0;
  }

  .upload-btn {
    min-width: 120px;
  }
</style>
