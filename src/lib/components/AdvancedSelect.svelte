<script lang="ts">
  import { ChevronDown, Check } from 'lucide-svelte';

  export type AdvancedSelectOption = {
    value: string | number;
    label: string;
    description?: string;
  };

  export let value: string | number = '';
  export let options: AdvancedSelectOption[] = [];
  export let placeholder = 'Select an option';
  export let disabled = false;
  export let compact = false;
  export let ariaLabel = 'Select option';

  let open = false;
  let rootElement: HTMLDivElement | null = null;

  $: selectedOption = options.find((option) => option.value === value);
  $: buttonLabel = selectedOption?.label || placeholder;

  function toggleOpen() {
    if (disabled) return;
    open = !open;
  }

  function close() {
    open = false;
  }

  function selectOption(optionValue: string | number) {
    value = optionValue;
    close();
  }

  function handleWindowClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!open || !rootElement || (target && rootElement.contains(target))) return;
    close();
  }

  function handleTriggerKeydown(event: KeyboardEvent) {
    if (disabled) return;

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open = true;
      return;
    }

    if (event.key === 'Escape') {
      close();
    }
  }

  function handleListKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }
</script>

<svelte:window on:click={handleWindowClick} />

<div
  class:compact
  class:open
  class:disabled
  class="advanced-select"
  bind:this={rootElement}
>
  <button
    type="button"
    class="advanced-select-trigger"
    aria-expanded={open}
    aria-haspopup="listbox"
    aria-label={ariaLabel}
    disabled={disabled}
    on:click={toggleOpen}
    on:keydown={handleTriggerKeydown}
  >
    <span class:placeholder-text={!selectedOption} class="advanced-select-value">{buttonLabel}</span>
    <span class="advanced-select-icon" aria-hidden="true">
      <ChevronDown size={compact ? 15 : 16} />
    </span>
  </button>

  {#if open}
    <div class="advanced-select-menu" role="listbox" tabindex="-1" on:keydown={handleListKeydown}>
      {#each options as option}
        <button
          type="button"
          class:selected={option.value === value}
          class="advanced-select-option"
          role="option"
          aria-selected={option.value === value}
          on:click={() => selectOption(option.value)}
        >
          <span class="option-copy">
            <span class="option-label">{option.label}</span>
            {#if option.description}
              <span class="option-description">{option.description}</span>
            {/if}
          </span>
          {#if option.value === value}
            <span class="option-check" aria-hidden="true">
              <Check size={16} />
            </span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .advanced-select {
    position: relative;
    width: 100%;
  }

  .advanced-select-trigger {
    width: 100%;
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.72rem 0.95rem;
    border: 1px solid #d1d5db;
    border-radius: 0.85rem;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    color: #111827;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background 0.18s ease,
      transform 0.18s ease;
  }

  .advanced-select:hover .advanced-select-trigger {
    border-color: #93c5fd;
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
  }

  .advanced-select.open .advanced-select-trigger,
  .advanced-select-trigger:focus-visible {
    outline: none;
    border-color: #3b82f6;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14);
  }

  .advanced-select.disabled .advanced-select-trigger {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .advanced-select-value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .placeholder-text {
    color: #94a3b8;
  }

  .advanced-select-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #64748b;
    transition: color 0.18s ease, transform 0.18s ease;
  }

  .advanced-select:hover .advanced-select-icon,
  .advanced-select.open .advanced-select-icon {
    color: #2563eb;
  }

  .advanced-select.open .advanced-select-icon {
    transform: rotate(180deg);
  }

  .advanced-select-menu {
    position: absolute;
    top: calc(100% + 0.45rem);
    left: 0;
    right: 0;
    z-index: 30;
    display: grid;
    gap: 0.3rem;
    padding: 0.45rem;
    border: 1px solid rgba(148, 163, 184, 0.28);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.98);
    box-shadow:
      0 22px 44px rgba(15, 23, 42, 0.18),
      0 4px 16px rgba(15, 23, 42, 0.08);
    backdrop-filter: blur(12px);
  }

  .advanced-select-option {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.72rem 0.8rem;
    border: none;
    border-radius: 0.8rem;
    background: transparent;
    color: #111827;
    text-align: left;
    cursor: pointer;
    transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
  }

  .advanced-select-option:hover,
  .advanced-select-option:focus-visible {
    outline: none;
    background: #eff6ff;
    color: #1d4ed8;
    transform: translateY(-1px);
  }

  .advanced-select-option.selected {
    background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
    color: #1d4ed8;
  }

  .option-copy {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .option-label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .option-description {
    font-size: 0.75rem;
    color: #64748b;
  }

  .option-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .compact .advanced-select-trigger {
    min-height: 40px;
    padding-top: 0.55rem;
    padding-bottom: 0.55rem;
    border-radius: 0.75rem;
  }

  .compact .advanced-select-menu {
    border-radius: 0.85rem;
  }

  .compact .advanced-select-option {
    padding-top: 0.55rem;
    padding-bottom: 0.55rem;
  }
</style>
