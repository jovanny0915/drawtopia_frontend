<script lang="ts">
  import purple_check from "../assets/purple-check.svg";

  export let formatId: string;
  export let title: string;
  export let features: { icon: string; text: string }[];
  export let imageSrc: string;
  export let imageAlt: string;
  export let isSelected: boolean = false;
  export let onSelect: (formatId: string) => void;

  function handleClick() {
    onSelect(formatId);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleClick();
    }
  }
</script>

<div 
  class={`format-card ${isSelected ? 'selected_card' : ''}`}
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
  </div>
  <div class="frame-10">
    <div class="format-title">
      <span class="format-title_span">{title}</span>
    </div>
    <div class="features-list">
      {#each features as feature}
        <div class="feature-item">
          <img src={feature.icon} alt="feature icon" class="feature-icon" />
          <span class="feature-text">{feature.text}</span>
        </div>
      {/each}
    </div>
    <button class="select-button">
      <span class="select-button_span">Select</span>
    </button>
  </div>
  {#if isSelected}
    <img src={purple_check} alt="purple_check" class="purple_check" />
  {/if}
</div>

<style>
  .format-card {
    flex: 1 1 0;
    padding-bottom: 20px;
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

  .format-card:hover {
    outline: 1px #438bff solid;
    box-shadow: 0px 2px 8px rgba(67, 139, 255, 0.1);
  }

  .format-card.selected_card {
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

  .frame-10 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 16px;
    padding-right: 16px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .format-title {
    align-self: stretch;
  }

  .format-title_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .features-list {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .feature-item {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .feature-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .feature-text {
    color: #121212;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .select-button {
    align-self: stretch;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    justify-content: center;
    align-items: center;
    display: flex;
  }

  .select-button:hover {
    background: #3370cc;
  }

  .select-button_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .purple_check {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
  }

  @media (max-width: 800px) {
    .format-card {
      width: 100%;
      flex: none;
    }

    .format-title_span {
      font-size: 20px;
      line-height: 28px;
    }

    .feature-text {
      font-size: 14px;
      line-height: 19.6px;
    }

    .select-button {
      padding-top: 12px;
      padding-bottom: 12px;
    }
  }
</style>

