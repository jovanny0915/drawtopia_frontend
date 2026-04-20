<svelte:head>
  <title>Generation Logs - Admin</title>
</svelte:head>

<div class="generation-logs-page">
  <div class="page-header">
    <h1 class="page-title">Generation Logs</h1>
    <p class="page-description">Detailed AI generation history</p>
  </div>

  <section class="placeholder-card">
    <h2>Logs view pending</h2>
    <p>
      This admin section is now available in the sidebar layout. A dedicated generation log explorer
      has not been implemented in the current frontend yet.
    </p>
    <p>
      For now, per-user generation history remains available through the Users admin page.
    </p>
    <a href="/admin/user-manage" class="action-link">Open Users</a>
  </section>
</div>

<style>
  .generation-logs-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .page-header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .page-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
  }

  .page-description {
    margin: 0;
    color: #4b5563;
    font-size: 1rem;
  }

  .placeholder-card {
    max-width: 720px;
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 1rem;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  }

  .placeholder-card h2 {
    margin: 0 0 0.75rem;
    font-size: 1.25rem;
    color: #111827;
  }

  .placeholder-card p {
    margin: 0 0 1rem;
    color: #4b5563;
    line-height: 1.6;
  }

  .action-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: #1d4ed8;
    color: white;
    text-decoration: none;
    font-weight: 600;
  }

  .action-link:hover {
    background: #1e40af;
  }
</style>