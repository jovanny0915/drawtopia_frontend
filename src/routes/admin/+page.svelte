<!-- Admin page - Book Templates Management -->
<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getTemplates,
    createTemplate,
    deleteTemplate,
    uploadTemplateImage,
    updateTemplate,
    type BookTemplate,
  } from '$lib/api/admin';
  import { optimizeImage } from '$lib/imageOptimizer';
  import { Plus, Trash2, X, Save } from 'lucide-svelte';

  let templates: BookTemplate[] = [];
  let loading = true;
  let error = '';
  let showAddModal = false;

  // Upload modal state
  let showUploadModal = false;
  let uploadModalType: 'single' | 'multiple' = 'single';
  let currentUploadField: string = '';
  let currentTemplateId: string = '';
  let currentTemplateName: string = '';
  let selectedFiles: File[] = [];
  let previewUrls: string[] = [];
  let uploadInProgress = false;

  // Track pending changes per template (only for story_world now)
  let pendingChanges: Map<string, {
    story_world?: 'forest' | 'underwater' | 'outerspace' | '';
  }> = new Map();

  // Track saving state per row
  let savingRows: Set<string> = new Set();

  // Form state for adding new template
  let newTemplateName = '';
  let newTemplateStoryWorld: 'forest' | 'underwater' | 'outerspace' | '' = '';

  onMount(async () => {
    await loadTemplates();
  });

  async function loadTemplates() {
    loading = true;
    error = '';
    const result = await getTemplates();
    if (!result.success || result.error) {
      error = result.error || 'Failed to load templates';
    } else {
      templates = result.data ?? [];
    }
    loading = false;
  }

  function openAddModal() {
    // Reset form
    newTemplateName = '';
    newTemplateStoryWorld = '';
    showAddModal = true;
  }

    function closeAddModal() {
    showAddModal = false;
  }

  // Open upload modal for single image
  function openSingleImageUploadModal(templateId: string, fieldKey: string, templateName: string) {
    currentTemplateId = templateId;
    currentUploadField = fieldKey;
    currentTemplateName = templateName;
    uploadModalType = 'single';
    selectedFiles = [];
    previewUrls = [];
    showUploadModal = true;
  }

  // Open upload modal for story pages (multiple images)
  function openMultipleImageUploadModal(templateId: string, templateName: string) {
    currentTemplateId = templateId;
    currentUploadField = 'story_page_images';
    currentTemplateName = templateName;
    uploadModalType = 'multiple';
    selectedFiles = [];
    previewUrls = [];
    showUploadModal = true;
  }

  // Close upload modal
  function closeUploadModal() {
    // Revoke all preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    showUploadModal = false;
    currentTemplateId = '';
    currentUploadField = '';
    currentTemplateName = '';
    selectedFiles = [];
    previewUrls = [];
  }

  // Handle file selection in upload modal
  function handleModalFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    // Clear existing selections for single mode
    if (uploadModalType === 'single') {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      selectedFiles = [];
      previewUrls = [];
    }

    // Add new files
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not a valid image`);
        continue;
      }

      // For single mode, only take the first file
      if (uploadModalType === 'single' && selectedFiles.length > 0) {
        break;
      }

      selectedFiles.push(file);
      previewUrls.push(URL.createObjectURL(file));
    }
    
    // Trigger reactivity
    selectedFiles = selectedFiles;
    previewUrls = previewUrls;
    
    // Clear input
    input.value = '';
  }

  // Remove file from modal selection
  function removeModalFile(index: number) {
    URL.revokeObjectURL(previewUrls[index]);
    selectedFiles.splice(index, 1);
    previewUrls.splice(index, 1);
    selectedFiles = selectedFiles;
    previewUrls = previewUrls;
  }

  // Handle upload from modal
  async function handleModalUpload() {
    if (selectedFiles.length === 0) {
      alert('Please select at least one image');
      return;
    }

    uploadInProgress = true;

    try {
      const template = templates.find(t => t.id === currentTemplateId);
      if (!template) throw new Error('Template not found');

      if (uploadModalType === 'single') {
        // Upload single image
        const file = selectedFiles[0];
        
        // Optimize image
        const optimized = await optimizeImage(file, {
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 0.9,
          format: 'webp'
        });

        const result = await uploadTemplateImage(
          currentTemplateId,
          optimized.file,
          currentUploadField as 'cover_image' | 'copyright_page_image' | 'dedication_page_image' | 'last_story_page_image' | 'back_cover_image',
          template.name
        );

        if (!result.success || result.error) {
          throw new Error(result.error || 'Upload failed');
        }

        alert('Image uploaded successfully!');
      } else {
        // Upload multiple story pages
        const existingImages = template.story_page_images || [];
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const pageIndex = existingImages.length + i;

          // Optimize image
          const optimized = await optimizeImage(file, {
            maxWidth: 2048,
            maxHeight: 2048,
            quality: 0.9,
            format: 'webp'
          });

          const { uploadStoryPage } = await import('$lib/api/admin');
          const result = await uploadStoryPage(
            currentTemplateId,
            optimized.file,
            template.name,
            pageIndex
          );

          if (!result.success || result.error) {
            throw new Error(`Failed to upload image ${i + 1}: ${result.error}`);
          }
        }

        alert(`${selectedFiles.length} story page(s) uploaded successfully!`);
      }

      // Reload templates to show updated data
      await loadTemplates();
      
      // Close modal
      closeUploadModal();
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
      newTemplateStoryWorld || undefined
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
      const result = await deleteTemplate(id);
      if (!result.success || result.error) {
        alert(`Error deleting template: ${result.error}`);
      } else {
        // Remove from pending changes if exists
        pendingChanges.delete(id);
        pendingChanges = pendingChanges;
        await loadTemplates();
      }
    } catch (err: any) {
      console.error('Error in delete operation:', err);
      alert(`Error deleting template: ${err.message}`);
    }
  }

  // Handle story world change
  function handleStoryWorldChange(templateId: string, newValue: string) {
    const changes = pendingChanges.get(templateId) || {};
    changes.story_world = newValue as 'forest' | 'underwater' | 'outerspace' | '';
    pendingChanges.set(templateId, changes);
    pendingChanges = pendingChanges;
  }

  // Save story world change
  async function handleSaveStoryWorld(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // Get the current display value (either from pending changes or actual value)
    const currentStoryWorld = getDisplayStoryWorld(templateId, template.story_world) as 'forest' | 'underwater' | 'outerspace' | undefined;

    savingRows.add(templateId);
    savingRows = savingRows;

    try {
      const result = await updateTemplate(templateId, {
        story_world: currentStoryWorld
      });
      
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to update story world');
      }

      // Clear pending changes
      pendingChanges.delete(templateId);
      pendingChanges = pendingChanges;

      // Reload templates
      await loadTemplates();

      alert('Story world updated successfully!');
    } catch (err: any) {
      console.error('Save error:', err);
      alert(`Failed to save: ${err.message}`);
    } finally {
      savingRows.delete(templateId);
      savingRows = savingRows;
    }
  }

  // Get display value for story pages
  function getDisplayStoryPages(templateId: string, actualUrls: string[] | undefined): string[] {
    return actualUrls || [];
  }

  // Get story world display value
  function getDisplayStoryWorld(templateId: string, actualWorld: string | undefined): string | undefined {
    const changes = pendingChanges.get(templateId);
    if (changes && 'story_world' in changes) {
      return changes.story_world || undefined;
    }
    return actualWorld;
  }
</script>

<div class="templates-page">
  <div class="page-header">
    <h1>Book Templates</h1>
    <button class="add-btn" on:click={openAddModal}>
      <Plus size={20} />
      Add Template
    </button>
  </div>

  {#if loading}
    <div class="loading-state">Loading templates...</div>
  {:else if error}
    <div class="error-state">Error: {error}</div>
  {:else if templates.length === 0}
    <div class="empty-state">
      <p>No templates found. Create one to get started.</p>
    </div>
  {:else}
    <div class="table-container">
      <table class="templates-table">
        <thead>
          <tr>
            <th>Template Name</th>
            <th>Story World</th>
            <th>Cover</th>
            <th>Copyright</th>
            <th>Dedication</th>
            <th>Story Pages</th>
            <th>Last Story Page</th>
            <th>Back Cover</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each templates as template (template.id)}
            {@const isSaving = savingRows.has(template.id)}
            {@const displayStoryWorld = getDisplayStoryWorld(template.id, template.story_world)}
            {@const coverUrl = template.cover_image}
            {@const copyrightUrl = template.copyright_page_image}
            {@const dedicationUrl = template.dedication_page_image}
            {@const storyPagesUrls = getDisplayStoryPages(template.id, template.story_page_images)}
            {@const lastStoryUrl = template.last_story_page_image}
            {@const backCoverUrl = template.back_cover_image}
            
            <tr>
              <td class="template-name">{template.name}</td>
              
              <!-- Story World - Editable -->
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
              
              <!-- Cover Image -->
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
              
              <!-- Copyright Page Image -->
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
                    <div class="upload-placeholder">
                      <Plus size={32} strokeWidth={1.5} />
                    </div>
                  {/if}
                </div>
              </td>
              
              <!-- Dedication Page Image -->
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
                    <div class="upload-placeholder">
                      <Plus size={32} strokeWidth={1.5} />
                    </div>
                  {/if}
                </div>
              </td>
              
              <!-- Story Pages - Multiple images -->
              <td class="image-cell story-pages-cell-container">
                <div 
                  class="image-upload-box" 
                  class:disabled={isSaving}
                  on:click={() => openMultipleImageUploadModal(template.id, template.name)}
                  on:keydown={(e) => e.key === 'Enter' && openMultipleImageUploadModal(template.id, template.name)}
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
              
              <!-- Last Story Page Image -->
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
                    <img src={lastStoryUrl} alt="Last Story Page" class="thumbnail" />
                  {:else}
                    <div class="upload-placeholder">
                      <Plus size={32} strokeWidth={1.5} />
                    </div>
                  {/if}
                </div>
              </td>
              
              <!-- Back Cover Image -->
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
              
              <!-- Actions -->
              <td class="actions-cell">
                <div class="action-buttons">
                  <button
                    class="save-btn"
                    on:click={() => handleSaveStoryWorld(template.id)}
                    disabled={isSaving}
                    title="Save story world"
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

<!-- Add Template Modal -->
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
        <small class="help-text">
          After creating the template, you can upload images for each page type. Story World determines which templates are randomly selected during cover generation.
        </small>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" on:click={closeAddModal}>Cancel</button>
        <button class="btn btn-primary" on:click={handleAddTemplate}>Add Template</button>
      </div>
    </div>
  </div>
{/if}

<!-- Upload Image Modal -->
{#if showUploadModal}
  <div class="modal-overlay" on:click={closeUploadModal} on:keydown={(e) => e.key === 'Escape' && closeUploadModal()} role="button" tabindex="-1">
    <div class="modal-content upload-modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" tabindex="-1">
      <div class="modal-header">
        <h2>
          {#if uploadModalType === 'single'}
            Upload Image
          {:else}
            Upload Story Page Images
          {/if}
        </h2>
        <button class="close-btn" on:click={closeUploadModal} disabled={uploadInProgress}>
          <X size={24} />
        </button>
      </div>
      <div class="modal-body upload-modal-body">
        <div class="upload-info">
          <p><strong>Template:</strong> {currentTemplateName}</p>
          <p><strong>Field:</strong> {currentUploadField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
        </div>

        <!-- File Input -->
        <div class="file-input-wrapper">
          <input
            type="file"
            accept="image/*"
            multiple={uploadModalType === 'multiple'}
            on:change={handleModalFileSelect}
            disabled={uploadInProgress}
            id="modal-file-input"
            style="display: none;"
          />
          <label for="modal-file-input" class="file-input-label" class:disabled={uploadInProgress}>
            <Plus size={24} />
            Select Image{uploadModalType === 'multiple' ? 's' : ''}
          </label>
        </div>

        <!-- Preview Grid -->
        {#if previewUrls.length > 0}
          <div class="preview-grid" class:single={uploadModalType === 'single'}>
            {#each previewUrls as url, index}
              <div class="preview-item">
                <img src={url} alt="Preview {index + 1}" class="preview-image" />
                {#if !uploadInProgress}
                  <button
                    class="remove-preview-btn"
                    on:click={() => removeModalFile(index)}
                    title="Remove image"
                  >
                    <X size={20} />
                  </button>
                {/if}
                {#if uploadModalType === 'multiple'}
                  <div class="preview-number">{index + 1}</div>
                {/if}
              </div>
            {/each}
          </div>
        {:else}
          <div class="no-selection">
            <p>No images selected yet</p>
          </div>
        {/if}
      </div>
      <div class="modal-footer">
        <button 
          class="btn btn-secondary" 
          on:click={closeUploadModal}
          disabled={uploadInProgress}
        >
          Cancel
        </button>
        <button 
          class="btn btn-primary upload-btn" 
          on:click={handleModalUpload}
          disabled={uploadInProgress || selectedFiles.length === 0}
        >
          {#if uploadInProgress}
            Uploading...
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
  }

  .page-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
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

  /* Table Styles */
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
    font-size: 1.2rem;
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

  /* Modal Styles */
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

  /* Upload Modal Styles */
  .upload-modal {
    max-width: 700px;
  }

  .upload-modal-body {
    max-height: 60vh;
    overflow-y: auto;
  }

  .upload-info {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .upload-info p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
    color: #374151;
  }

  .file-input-wrapper {
    margin-bottom: 1.5rem;
  }

  .file-input-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 2px dashed #d1d5db;
    border-radius: 0.5rem;
    background: #f9fafb;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    color: #374151;
  }

  .file-input-label:hover:not(.disabled) {
    border-color: #1e40af;
    background: #eff6ff;
    color: #1e40af;
  }

  .file-input-label.disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

  .remove-preview-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(220, 38, 38, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
  }

  .remove-preview-btn:hover {
    background: rgba(220, 38, 38, 1);
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
