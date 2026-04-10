<script lang="ts">
  export let characterImages: string[] = []; // Array of character image URLs (up to 4)
  export let collectedCount: number = 0; // Number of collected items (0-4)
  export let totalCount: number = 4; // Total items (always 4)
  export let isVisible: boolean = true; // Control visibility
  export let foundIndices: boolean[] = [false, false, false, false]; // 0..3; true means that specific character is found
</script>

<div class="character-item-counter" class:hidden={!isVisible}>
  <div class="counter-info">
    <div class="counter-label">{collectedCount}/{totalCount}</div>
    <div class="counter-title">Items</div>
  </div>
  <div class="character-images-grid">
    {#each Array(totalCount) as _, index}
      <div
        class="character-image-slot"
        class:collected={(foundIndices?.[index] === true) || index < collectedCount}
      >
        {#if index < characterImages.length && characterImages[index]}
          <img
            src={characterImages[index]}
            alt={`Character ${index + 1}`}
            class="character-image"
            draggable="false"
          />
        {:else}
          <div class="image-placeholder"></div>
        {/if}
        {#if foundIndices?.[index] === true}
          <div class="found-check-badge" aria-hidden="true">
            <span class="found-check-icon">&#10003;</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .character-item-counter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: transparent;
    border-radius: 12px;
    box-shadow: none;
    min-width: auto;
    z-index: 10;
  }

  .character-item-counter.hidden {
    display: none;
  }
  

  .counter-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    gap: 4px;
  }

  .counter-label {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    font-family: "Quicksand", sans-serif;
    white-space: nowrap;
    min-width: 40px;
  }

  .counter-title {
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    font-family: "Quicksand", sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .character-images-grid {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }

  .character-image-slot {
    position: relative;
    --slot-size: 64px;
    width: var(--slot-size);
    height: var(--slot-size);
    border: none;
    border-radius: 50%;
    overflow: hidden;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .character-image-slot.collected {
    box-shadow: 0 4px 14px rgba(76, 175, 80, 0.28);
    transform: translateY(-2px);
  }

  .found-check-badge {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(74, 222, 128, 0.28);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    box-shadow: 0 6px 16px rgba(74, 222, 128, 0.18);
  }

  .found-check-icon {
    font-size: calc(var(--slot-size) * 0.55);
    color: rgba(21, 128, 61, 0.95);
    font-weight: 700;
    line-height: 1;
  }

  .character-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
    border-radius: 50%;
  }

  @media (max-width: 768px) {
    .character-item-counter {
      gap: 8px;
      padding: 12px;
    }

    .counter-label {
      font-size: 16px;
      min-width: 35px;
    }

    .counter-title {
      font-size: 11px;
    }

    .character-image-slot {
      --slot-size: 56px;
      width: var(--slot-size);
      height: var(--slot-size);
    }
  }

  @media (max-width: 480px) {
    .character-item-counter {
      gap: 6px;
      padding: 10px;
    }

    .counter-label {
      font-size: 14px;
      min-width: 30px;
    }

    .counter-title {
      font-size: 10px;
    }

    .character-image-slot {
      --slot-size: 48px;
      width: var(--slot-size);
      height: var(--slot-size);
    }
  }
</style>
