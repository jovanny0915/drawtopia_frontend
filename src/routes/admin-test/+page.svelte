<!-- Admin Test/Setup Page -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { supabase } from '$lib/supabase';

  let currentUser: any = null;
  let userRole: string | null = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    if ($user) {
      currentUser = $user;
      await checkRole();
    }
    loading = false;
  });

  async function checkRole() {
    try {
      const { data, error: err } = await supabase
        .from('users')
        .select('role, email, first_name, last_name')
        .eq('id', $user!.id)
        .single();

      if (err) {
        error = err.message;
      } else {
        userRole = data?.role || 'No role set';
      }
    } catch (err: any) {
      error = err.message;
    }
  }

  async function makeCurrentUserAdmin() {
    if (!$user) return;

    try {
      const { error: err } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', $user.id);

      if (err) {
        alert(`Error: ${err.message}`);
      } else {
        alert('Success! You are now an admin. Refresh the page and try accessing /admin');
        await checkRole();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  }
</script>

<div class="test-page">
  <h1>Admin Access Test Page</h1>
  
  {#if loading}
    <p>Loading...</p>
  {:else if !currentUser}
    <p class="error">Not logged in. Please <a href="/login">login</a> first.</p>
  {:else}
    <div class="info-box">
      <h2>Current User Info</h2>
      <p><strong>Email:</strong> {currentUser.email}</p>
      <p><strong>User ID:</strong> {currentUser.id}</p>
      <p><strong>Role:</strong> {userRole || 'Loading...'}</p>
      
      {#if error}
        <p class="error">Error: {error}</p>
      {/if}
    </div>

    {#if userRole !== 'admin'}
      <div class="action-box">
        <h3>⚠️ You are not an admin</h3>
        <p>To access the admin panel, your account needs the 'admin' role.</p>
        <p><strong>Option 1:</strong> Run this SQL in your Supabase SQL Editor:</p>
        <pre><code>UPDATE users SET role = 'admin' WHERE email = '{currentUser.email}';</code></pre>
        
        <p><strong>Option 2:</strong> Click the button below (requires proper RLS policies):</p>
        <button class="admin-btn" on:click={makeCurrentUserAdmin}>
          Make Me Admin
        </button>
        <p class="note">Note: This will only work if you have permission to update the users table.</p>
      </div>
    {:else}
      <div class="success-box">
        <h3>✅ You are an admin!</h3>
        <p>You should be able to access the admin panel.</p>
        <a href="/admin" class="admin-link">Go to Admin Panel →</a>
      </div>
    {/if}
  {/if}
</div>

<style>
  .test-page {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    font-family: 'Quicksand', sans-serif;
  }

  h1 {
    color: #1e40af;
    margin-bottom: 2rem;
  }

  .info-box, .action-box, .success-box {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .info-box {
    background: #f9fafb;
  }

  .action-box {
    border-color: #fbbf24;
    background: #fffbeb;
  }

  .success-box {
    border-color: #10b981;
    background: #ecfdf5;
  }

  pre {
    background: #1f2937;
    color: #f3f4f6;
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    font-size: 0.875rem;
  }

  code {
    font-family: 'Courier New', monospace;
  }

  .admin-btn {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
    margin-top: 1rem;
  }

  .admin-btn:hover {
    transform: translateY(-2px);
  }

  .admin-link {
    display: inline-block;
    background: #10b981;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.2s;
  }

  .admin-link:hover {
    background: #059669;
  }

  .error {
    color: #dc2626;
  }

  .note {
    font-size: 0.875rem;
    color: #6b7280;
    font-style: italic;
  }

  p {
    margin: 0.5rem 0;
  }
</style>
