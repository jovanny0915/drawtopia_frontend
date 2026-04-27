<!-- Admin Layout with Sidebar (Tailwind admin template inspired) -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { user, isAuthenticated, authLoading } from '$lib/stores/auth';
  import { supabase } from '$lib/supabase';
  import { signOut } from '$lib/auth';
  import { onMount } from 'svelte';
  import { Book, LayoutDashboard, Users, LogOut, MessageSquareText, History } from 'lucide-svelte';
  import logo from '../../assets/white-logo.webp';

  let userRole: string | null = null;
  let loading = true;
  let sidebarOpen = true;
  let hasStartedAdminCheck = false;

  // Verify user is admin on mount
  onMount(() => {
    // Poll until auth loading completes, then verify admin exactly once.
    const checkAuth = setInterval(() => {
      if (!$authLoading && !hasStartedAdminCheck) {
        hasStartedAdminCheck = true;
        clearInterval(checkAuth);
        void verifyAdmin();
      }
    }, 100);

    // Fallback: auth can take longer on slower network/OAuth callback flows.
    // Do not redirect on timeout; trigger one admin check only if auth is ready.
    const authTimeout = setTimeout(() => {
      clearInterval(checkAuth);
      if (loading && !$authLoading && !hasStartedAdminCheck) {
        hasStartedAdminCheck = true;
        void verifyAdmin();
        return;
      }
      if (loading && $authLoading) {
        console.warn('Auth check still loading after timeout window.');
      }
    }, 10000);

    return () => {
      clearInterval(checkAuth);
      clearTimeout(authTimeout);
    };
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
    await signOut();
    goto('/login');
  }

  type NavChildItem = {
    label: string;
    description?: string;
    href: string;
    match: (path: string, tab: string) => boolean;
  };

  type NavItem = {
    label: string;
    description: string;
    path: string;
    icon: typeof LayoutDashboard;
    match?: (path: string, tab: string) => boolean;
    children?: NavChildItem[];
  };

  // Sidebar nav items (icon component per item)
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      description: 'Overview and quick stats',
      path: '/admin',
      icon: LayoutDashboard
    },
    {
      label: 'Users',
      description: 'User management',
      path: '/admin/user-manage',
      icon: Users
    },
    {
      label: 'Stories',
      description: 'Templates and generated stories',
      path: '/admin/stories',
      icon: Book,
      match: (path) => path === '/admin/stories' || path === '/admin/book-templates',
      children: [
        {
          label: 'Book Templates',
          description: 'Manage book templates',
          href: '/admin/stories?tab=book-templates',
          match: (path, tab) => path === '/admin/book-templates' || (path === '/admin/stories' && tab === 'book-templates')
        },
        {
          label: 'Story List',
          description: 'Review generated stories',
          href: '/admin/stories?tab=story-list',
          match: (path, tab) => path === '/admin/stories' && tab === 'story-list'
        }
      ]
    },
    {
      label: 'Generation Logs',
      description: 'Detailed AI generation history',
      path: '/admin/generation-logs',
      icon: History
    },
    {
      label: 'AI Prompts',
      description: 'Prompt management',
      path: '/admin/prompts-manage',
      icon: MessageSquareText
    },
  ];

  function normalizeStoriesTab(value: string | null): 'book-templates' | 'story-list' {
    return value === 'book-templates' ? 'book-templates' : 'story-list';
  }

  function isNavItemActive(item: NavItem, path: string, tab: string): boolean {
    if (item.match) {
      return item.match(path, tab);
    }

    return path === item.path || (item.path !== '/admin' && path.startsWith(item.path));
  }

  $: currentPath = $page.url.pathname;
  $: currentStoriesTab = normalizeStoriesTab($page.url.searchParams.get('tab'));
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
          {@const itemActive = isNavItemActive(item, currentPath, currentStoriesTab)}
          <div class="nav-item-group" class:has-children={Boolean(item.children?.length)}>
            <a
              href={item.path}
              class="nav-item"
              class:active={itemActive}
            >
              <span class="nav-icon">
                <svelte:component this={item.icon} size={20} />
              </span>
              {#if sidebarOpen}
                <span class="nav-copy">
                  <span class="nav-label">{item.label}</span>
                  <span class="nav-description">{item.description}</span>
                </span>
              {/if}
            </a>

            {#if sidebarOpen && item.children?.length}
              <div class="subnav-list">
                {#each item.children as child}
                  <a
                    href={child.href}
                    class="subnav-item"
                    class:active={child.match(currentPath, currentStoriesTab)}
                  >
                    <span class="subnav-bullet"></span>
                    <span class="subnav-copy">
                      <span class="subnav-label">{child.label}</span>
                      {#if child.description}
                        <span class="subnav-description">{child.description}</span>
                      {/if}
                    </span>
                  </a>
                {/each}
              </div>
            {/if}
          </div>
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
    width: 290px;
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
    overflow-x: hidden;
  }

  .nav-item-group {
    display: flex;
    flex-direction: column;
  }

  .nav-item {
    display: flex;
    align-items: flex-start;
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
    margin-top: 0.15rem;
  }

  .nav-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 0.15rem;
  }

  .nav-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
  }

  .nav-description {
    font-size: 0.8rem;
    line-height: 1.25;
    color: rgba(255, 255, 255, 0.68);
  }

  .subnav-list {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.2rem 0 0.5rem 3.2rem;
  }

  .subnav-item {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    padding: 0.5rem 0.85rem 0.5rem 0;
    color: rgba(255, 255, 255, 0.76);
    text-decoration: none;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .subnav-item:hover {
    color: #ffffff;
    transform: translateX(2px);
  }

  .subnav-item.active {
    color: #ffffff;
  }

  .subnav-bullet {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.35);
    margin-top: 0.45rem;
    flex-shrink: 0;
  }

  .subnav-item.active .subnav-bullet {
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.15);
  }

  .subnav-copy {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .subnav-label {
    font-size: 0.86rem;
    font-weight: 600;
  }

  .subnav-description {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.58);
    line-height: 1.25;
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
    margin-left: 290px;
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
    padding: 2rem 0 2rem 0;
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
