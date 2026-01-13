<script>
  export let isLoading;
  export let text;
  export let spinner_name;
  export let onClick;
</script>

<button class="primary_btn" disabled={isLoading} on:click={onClick}>
  {#if isLoading}
    <div class="spinner"></div>
    <span class="primary_span">{spinner_name}</span>
  {:else}
    <div class="login"><span class="primary_span">{text}</span></div>
  {/if}
</button>

<style>
  .primary_btn {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    width: 100%;
    margin-bottom: 10px;
  }

  .primary_btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .primary_btn {
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  .primary_btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(67, 139, 255, 0.3);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .primary_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .primary_btn {
      padding-left: 20px;
      padding-right: 20px;
      padding-top: 14px;
      padding-bottom: 14px;
      margin-bottom: 8px;
    }
    
    .primary_span {
      font-size: 18px;
      line-height: 25.2px;
    }
  }

  @media (max-width: 480px) {
    .primary_btn {
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 12px;
      padding-bottom: 12px;
      margin-bottom: 6px;
    }
    
    .primary_span {
      font-size: 18px;
      line-height: 25.2px;
    }
  }
</style>