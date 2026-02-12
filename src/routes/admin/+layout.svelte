<!-- Admin Layout with Sidebar (Tailwind admin template inspired) -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { user, isAuthenticated, authLoading } from '$lib/stores/auth';
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { Book, LogOut } from 'lucide-svelte';
  import logo from '../../assets/logo.png';

  let userRole: string | null = null;
  let loading = true;
  let sidebarOpen = true;

  // Verify user is admin on mount
  onMount(async () => {
    // Wait for auth to load
    const checkAuth = setInterval(() => {
      if (!$authLoading) {
        clearInterval(checkAuth);
        verifyAdmin();
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkAuth);
      if (loading) {
        console.error('Auth check timeout');
        goto('/login');
      }
    }, 5000);
  });

  async function verifyAdmin() {
    if (!$isAuthenticated || !$user) {
      console.log('Not authenticated, redirecting to login');
      goto('/login');
      return;
    }

    try {
      // Fetch user role from users table
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', $user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        goto('/dashboard');
        return;
      }

      if (data?.role !== 'admin') {
        console.log('User is not admin, redirecting to dashboard');
        goto('/dashboard');
        return;
      }

      // User is admin!
      userRole = data.role;
      loading = false;
    } catch (err) {
      console.error('Error in admin verification:', err);
      goto('/dashboard');
    }
  }

  // Toggle sidebar
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  // Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    goto('/login');
  }

  // Sidebar nav items
  const navItems = [
    { label: 'Book Templates', path: '/admin' },
    // Add more admin items as needed
  ];

  $: currentPath = $page.url.pathname;
</script>

{#if loading}
  <div class="loading-screen">
    <div class="loading-spinner"></div>
    <p>Verifying admin access...</p>
  </div>
{:else if userRole === 'admin'}
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" class:collapsed={!sidebarOpen}>
      <div class="sidebar-header">
        <a href="/dashboard" class="logo-link">
          <img src={logo} alt="Drawtopia" class="logo" />
        </a>
      </div>
      <nav class="sidebar-nav">
        {#each navItems as item}
          <a
            href={item.path}
            class="nav-item"
            class:active={currentPath === item.path}
          >
            <span class="nav-icon">
              <Book size={20} />
            </span>
            {#if sidebarOpen}
              <span class="nav-label">{item.label}</span>
            {/if}
          </a>
        {/each}
      </nav>
      <div class="sidebar-footer">
        <button on:click={handleLogout} class="logout-btn">
          <span class="nav-icon">
            <LogOut size={20} />
          </span>
          {#if sidebarOpen}
            <span>Logout</span>
          {/if}
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <header class="header">
        <button class="toggle-btn" on:click={toggleSidebar}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <div class="header-user">
          <span class="user-name">{$user?.email ?? 'Admin'}</span>
          <span class="user-role">Administrator</span>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
{/if}

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background-color: #f3f4f6;
  }

  /* Sidebar */
  .sidebar {
    width: 260px;
    background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
    color: white;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .sidebar.collapsed {
    width: 70px;
  }

  .sidebar-header {
    padding: 1.5rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .logo-link {
    display: block;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .logo-link:hover {
    opacity: 0.8;
  }

  .logo {
    width: 100%;
    height: auto;
    max-height: 60px;
    object-fit: contain;
  }

  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;
    overflow-y: auto;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    transition: background-color 0.2s;
    cursor: pointer;
  }

  .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .nav-item.active {
    background-color: rgba(255, 255, 255, 0.15);
    border-left: 4px solid #fff;
  }

  .nav-icon {
    font-size: 1.25rem;
    min-width: 1.5rem;
    text-align: center;
  }

  .nav-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .logout-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  /* Main content */
  .main-content {
    flex: 1;
    margin-left: 260px;
    display: flex;
    flex-direction: column;
    transition: margin-left 0.3s ease;
  }

  .sidebar.collapsed + .main-content {
    margin-left: 70px;
  }

  .header {
    background: white;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 999;
  }

  .toggle-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    color: #374151;
  }

  .header-user {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }

  .user-role {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .page-content {
    flex: 1;
    padding: 2rem;
  }

  .loading-screen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-size: 1.125rem;
    color: #6b7280;
    gap: 1rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top-color: #1e40af;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar {
      width: 100%;
      transform: translateX(-100%);
    }

    .sidebar.collapsed {
      width: 100%;
    }

    .main-content {
      margin-left: 0;
    }
  }
</style>
