<script lang="ts">
  import purple_check from "../assets/purple-check.svg";

  export let adventureId: string;
  export let title: string;
  export let storyPreview: string;
  export let focusTags: string[];
  export let imageSrc: string;
  export let imageAlt: string;
  export let isSelected: boolean = false;
  export let isGenerating: boolean = false;
  export let onSelect: (adventureId: string) => void;

  function handleClick() {
    onSelect(adventureId);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleClick();
    }
  }
</script>

<div 
  class={`adventure-card ${isSelected ? 'selected_card' : ''}`}
  style="position: relative;"
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keydown={handleKeydown}
>
  <div class="image-container">
    <img
      class="image"
      src={imageSrc}
      alt={imageAlt}
    />
    {#if isGenerating}
      <div class="generating-overlay">
        <div class="spinner"></div>
        <div class="generating-text">Generating...</div>
      </div>
    {/if}
  </div>
  <div class="frame-10">
    <div class="adventure-title">
      <span class="adventure-title_span">{title}</span>
    </div>
    <div class="frame-1410104045">
      <div class="your-story-preview">
        <span class="yourstorypreview_span">Your Story Preview</span>
      </div>
      <div class="rectangle-35"></div>
      <div class="story-preview-text">
        <span class="story-preview-text_span">{storyPreview}</span>
      </div>
    </div>
    <div class="frame-1410104048">
      <div class="story-focus">
        <span class="storyfocus_span">Story Focus</span>
      </div>
      <div class="frame-1410104047">
        {#each focusTags as tag, index}
          <div class="tags">
            <div>
              <span class="tag_span">{tag}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
  {#if isSelected}
    <img src={purple_check} alt="purple_check" class="purple_check" />
  {/if}
</div>

<style>
  .adventure-card {
    flex: 1 1 0;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .adventure-card:hover {
    outline: 1px #438bff solid;
    box-shadow: 0px 2px 8px rgba(67, 139, 255, 0.1);
  }

  .adventure-card.selected_card {
    outline: 2px #6912c5 solid;
    box-shadow: 0px 1px 8px #871fff;
  }

  .image-container {
    position: relative;
    width: 100%;
  }

  .image {
    width: 100%;
    aspect-ratio: 1 / 0.7;
    object-fit: cover;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
  }

  .generating-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    gap: 8px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .generating-text {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .frame-10 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .adventure-title {
    align-self: stretch;
  }

  .adventure-title_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .frame-1410104045 {
    align-self: stretch;
    padding: 12px;
    background: #ecffff;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .your-story-preview {
    align-self: stretch;
  }

  .yourstorypreview_span {
    color: #06a1b4;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .rectangle-35 {
    align-self: stretch;
    height: 1px;
    background: #ceffff;
  }

  .story-preview-text {
    align-self: stretch;
  }

  .story-preview-text_span {
    color: #06a1b4;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .frame-1410104048 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .story-focus {
    align-self: stretch;
  }

  .storyfocus_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .frame-1410104047 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    flex-wrap: wrap;
  }

  .tags {
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .tag_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .purple_check {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  @media (max-width: 800px) {
    .adventure-card {
      width: 100%;
      flex: none;
    }

    .frame-1410104047 {
      flex-wrap: wrap;
      gap: 8px;
    }

    .tags {
      padding: 8px;
      font-size: 14px;
    }
  }
</style>
