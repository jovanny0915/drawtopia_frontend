<script lang="ts">
  import { MessageSquareText } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Prompts Manage - Admin</title>
</svelte:head>

<div class="prompts-manage-page">
  <div class="page-header">
    <h1 class="page-title">
      <MessageSquareText size={28} />
      Prompts Manage
    </h1>
    <p class="page-description">Configure and maintain prompt templates for the platform.</p>
  </div>

  <div class="coming-soon-card">
    <h2>Coming soon!</h2>
    <p>This admin section is under development and will be available in a future update.</p>
  </div>
</div>

<style>
  .prompts-manage-page {
    width: 100%;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }

  .page-description {
    margin: 0;
    color: #6b7280;
    font-size: 0.9375rem;
  }

  .coming-soon-card {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    border: 1px solid #e5e7eb;
  }

  .coming-soon-card h2 {
    margin: 0 0 0.6rem 0;
    color: #111827;
    font-size: 1.125rem;
    font-weight: 700;
  }

  .coming-soon-card p {
    margin: 0;
    color: #4b5563;
    font-size: 0.9375rem;
  }
</style>
