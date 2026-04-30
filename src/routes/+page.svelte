<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  onMount(() => {
    if (browser) {
      goto('/dashboard', { replaceState: true });
    }
  });
</script>

<div class="home-page">
  <div class="home-content">
    <p>Redirecting...</p>
  </div>
</div>

<style>
  .home-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .home-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .home-footer {
    padding: 1rem;
    display: flex;
    gap: 1.5rem;
    justify-content: center;
  }
  .home-footer a {
    color: #666;
    text-decoration: none;
  }
  .home-footer a:hover {
    text-decoration: underline;
  }
</style>
