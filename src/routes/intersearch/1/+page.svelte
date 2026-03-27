<script lang="ts">
  /**
   * Interactive search stories open here (same reader UI as /preview/default, inlined — no redirect).
   */
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import PreviewDefaultPage from "../../preview/default/+page.svelte";

  $: storyId = $page.url.searchParams.get("storyId");

  onMount(() => {
    if (!browser || storyId) return;
    goto("/intersearch", { replaceState: true });
  });
</script>

{#if storyId}
  <PreviewDefaultPage />
{:else}
  <div class="redirect-wrap" aria-live="polite">
    <p class="redirect-msg">Redirecting…</p>
  </div>
{/if}

<style>
  .redirect-wrap {
    min-height: 50vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5c6570;
    font-family: system-ui, sans-serif;
    font-size: 1rem;
  }
  .redirect-msg {
    margin: 0;
  }
</style>
