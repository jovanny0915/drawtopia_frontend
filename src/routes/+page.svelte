<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  // Redirect root path to dashboard
  onMount(() => {
    if (browser) {
      goto('/dashboard', { replaceState: true });
    }
  });
</script>

<!-- Temporary content while redirecting -->
<div style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
  <p>Redirecting...</p>
</div>
