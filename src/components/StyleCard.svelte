<script lang="ts">
  import purple_check from "../assets/purple-check.svg";

  export let styleId: string;
  export let title: string;
  export let subtitle: string;
  export let bestForText: string;
  export let imageSrc: string;
  export let imageAlt: string;
  export let isSelected: boolean = false;
  export let isGenerating: boolean = false;
  export let onSelect: (styleId: string) => void;

  function handleClick() {
    onSelect(styleId);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleClick();
    }
  }
  console.log(imageSrc);
</script>

<div 
  class={isSelected ? "card_02_selected" : "card_02"}
  style="position: relative;"
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keydown={handleKeydown}
>
  <div class="image-container">
    {#if imageSrc}
      <img
        class="image_02"
        src={imageSrc}
        alt={imageAlt}
      />
    {:else}
      <div class="image_02 placeholder"></div>
    {/if}
    {#if isGenerating}
      <div class="spinner-overlay">
        <div class="spinner"></div>
        <div class="generating-text">Generating...</div>
      </div>
    {/if}
  </div>
  <div class="frame-10_02">
    <div class="heading_02">
      <div class="anime">
        <span class="anime_span">{title}</span>
      </div>
      <div class="japanesse-anime-style">
        <span class="japanesseanimestyle_span">{subtitle}</span>
      </div>
    </div>
    <div class="frame-1410104045_02">
      <div class="best-for_02">
        <span class="bestfor_02_span">Best For</span>
      </div>
      <div class="rectangle-35_02"></div>
      <div class="kids-who-love-anime-and-manga">
        <span class="kidswholoveanimeandmanga_span">{bestForText}</span>
      </div>
    </div>
  </div>
  {#if isSelected}
    <img src={purple_check} alt="purple_check" class="purple_check" />
  {/if}
</div>

<style>
  .image-container {
    position: relative;
    width: 100%;
  }

  .image_02 {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    border: 1px #d3d3d3 solid;
  }

  .placeholder {
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner-overlay {
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

  .anime_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .anime {
    align-self: stretch;
  }

  .japanesseanimestyle_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .japanesse-anime-style {
    align-self: stretch;
  }

  .bestfor_02_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .best-for_02 {
    align-self: stretch;
  }

  .rectangle-35_02 {
    align-self: stretch;
    height: 1px;
    background: #eceff3;
  }

  .kidswholoveanimeandmanga_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .kids-who-love-anime-and-manga {
    align-self: stretch;
  }

  .heading_02 {
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

  .frame-1410104045_02 {
    align-self: stretch;
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
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

  .card_02 {
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
  
  .card_02:hover {
    outline: 1px #438bff solid;
    box-shadow: 0px 2px 8px rgba(67, 139, 255, 0.1);
  }

  .card_02_selected {
    flex: 1 1 0;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 2px #6912c5 solid;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    box-shadow: 0px 1px 8px #871fff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .purple_check {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  @media (max-width: 800px) {
    .card_02,
    .card_02_selected {
      width: 100%;
    }
  }
</style>
