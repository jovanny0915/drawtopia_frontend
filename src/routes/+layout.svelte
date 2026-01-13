<!-- Root layout for all pages -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { initAuth, isAuthenticated, authLoading } from '$lib/stores/auth';
  import { registerServiceWorker } from '$lib/pushNotifications';
  import NotificationContainer from '../components/NotificationContainer.svelte';
  import '../app.css';

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/otp-email',
    '/otp-phone',
    '/share',
    '/consent-send'
  ];

  // Check if the current route is public
  function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route => {
      // Exact match or starts with the route (for nested routes)
      return pathname === route || pathname.startsWith(route + '/');
    });
  }

  // Initialize authentication and push notifications on app startup
  onMount(() => {
    const unsubscribe = initAuth();
    
    // Register service worker for push notifications (async, but don't block)
    if (browser) {
      registerServiceWorker()
        .then(() => {
          console.log('Service worker registered successfully');
        })
        .catch((error) => {
          console.error('Failed to register service worker:', error);
        });
    }
    
    // Return cleanup function synchronously
    return unsubscribe;
  });

  // Reactive statement to check authentication status
  $: if (browser && !$authLoading) {
    const currentPath = $page.url.pathname;
    
    // If user is not authenticated and trying to access a protected route
    if (!$isAuthenticated && !isPublicRoute(currentPath)) {
      console.log('User not authenticated, redirecting to login from:', currentPath);
      // Store the intended destination to redirect after login
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      goto('/login');
    }
    
    // If user is authenticated and on login/signup page, redirect to dashboard
    if ($isAuthenticated && (currentPath === '/login' || currentPath === '/signup')) {
      console.log('User already authenticated, redirecting to dashboard');
      goto('/dashboard');
    }
  }
</script>

<main>
  <slot />
</main>

<!-- Global notification container -->
<NotificationContainer />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    width: 100%;
    min-height: 100vh;
  }
</style>