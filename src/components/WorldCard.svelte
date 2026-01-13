<script lang="ts">
  import purple_check from "../assets/purple-check.svg";

  export let worldId: string;
  export let title: string;
  export let description: string;
  export let previewText: string;
  export let imageSrc: string;
  export let imageAlt: string;
  export let isSelected: boolean = false;
  export let isGenerating: boolean = false;
  export let onSelect: (worldId: string) => void;

  function handleClick() {
    onSelect(worldId);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleClick();
    }
  }
</script>

<div 
  class={`world-card ${isSelected ? 'selected_card' : ''}`}
  style="position: relative;"
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keydown={handleKeydown}
>
  <div class="image-container">
    <img
      class="image_02"
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
  <div class="frame-10_02">
    <div class="story_heading_02">
      <div class="world-title">
        <span class="world-title_span">{title}</span>
      </div>
      <div class="world-description">
        <span class="world-description_span">{description}</span>
      </div>
    </div>
    <div class="frame-1410104037">
      <div class="preview-text">
        <span class="preview-text_span">{previewText}</span>
      </div>
    </div>
  </div>
  {#if isSelected}
    <img src={purple_check} alt="purple_check" class="purple_check" />
  {/if}
</div>

<style>
  .world-card {
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

  .world-card:hover {
    outline: 1px #438bff solid;
    box-shadow: 0px 2px 8px rgba(67, 139, 255, 0.1);
  }

  .world-card.selected_card {
    outline: 2px #6912c5 solid;
    box-shadow: 0px 1px 8px #871fff;
  }

  .image-container {
    position: relative;
    width: 100%;
  }

  .image_02 {
    width: 100%;
    aspect-ratio: 1 / 0.7;
    object-fit: cover;
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    border: 1px #d3d3d3 solid;
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
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
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

  .frame-10_02 {
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

  .story_heading_02 {
    align-self: stretch;
    padding-top: 8px;
    padding-left: 8px;
    padding-right: 8px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .world-title {
    align-self: stretch;
  }

  .world-title_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .world-description {
    align-self: stretch;
  }

  .world-description_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .frame-1410104037 {
    align-self: stretch;
    padding: 12px;
    background: #f5f2ff;
    border-radius: 10px;
    outline: 1px #964dff solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .preview-text {
    flex: 1 1 0;
  }

  .preview-text_span {
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
    .world-card {
      width: 100%;
    }
  }
</style>
