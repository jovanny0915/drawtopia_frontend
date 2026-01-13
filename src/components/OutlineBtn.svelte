<script>
  export let isLoading;
  export let text;
  export let spinner_name;
  export let onClick;
  export let outlineType = "solid-outline";
</script>

<button class={`outline_btn ${outlineType}`} disabled={isLoading} on:click={onClick}>
  {#if isLoading}
    <div class="spinner"></div>
    <span class="outline_span">{spinner_name}</span>
  {:else}
    <div class=""><span class="outline_span">{text}</span></div>
  {/if}
</button>

<style>
  .dot-outline{
    border: 2px dotted #438bff;
  }
  .solid-outline{
    border: 2px solid #438bff;
  }
  .outline_btn {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    color: #438bff;
    background-color: white;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    width: 100%;
    font-size: 16px;
    font-weight: bold;
  }
  .outline_span {
    color: #438bff;
    font-size: 16px;
    font-weight: bold;
  }
  .outline_btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .outline_btn {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .outline_btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(67, 139, 255, 0.3);
  }

  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .outline_btn {
      padding-left: 20px;
      padding-right: 20px;
      padding-top: 14px;
      padding-bottom: 14px;
      font-size: 16px;
    }
    
    .outline_span {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .outline_btn {
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 12px;
      padding-bottom: 12px;
      font-size: 15px;
    }
    
    .outline_span {
      font-size: 16px;
    }
  }
</style>
