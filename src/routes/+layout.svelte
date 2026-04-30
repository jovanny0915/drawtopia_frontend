<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { initAuth, isAuthenticated, authLoading } from '$lib/stores/auth';
  import { addNotification } from '$lib/stores/notification';
  import { registerServiceWorker } from '$lib/pushNotifications';
  import NotificationContainer from '../components/NotificationContainer.svelte';
  import '../app.css';

  const publicRoutes = [
    '/login',
    '/signup',
    '/otp-email',
    '/otp-phone',
    '/share',
    '/consent-send',
    '/admin',
    '/admin-test'
  ];

  function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route => {
      return pathname === route || pathname.startsWith(route + '/');
    });
  }

  onMount(() => {
    const unsubscribe = initAuth();
    const originalAlert = window.alert;
    
    if (browser) {
      window.alert = (message?: string) => {
        const text = typeof message === 'string' ? message : String(message ?? '');
        addNotification({
          type: 'info',
          message: text,
          duration: 5000
        });
      };

      registerServiceWorker()
        .then(() => {
          console.log('Service worker registered successfully');
        })
        .catch((error) => {
          console.error('Failed to register service worker:', error);
        });
    }
    
    return () => {
      window.alert = originalAlert;
      unsubscribe();
    };
  });

  $: if (browser && !$authLoading) {
    const currentPath = $page.url.pathname;
    
    if (currentPath === '/') {
      goto('/dashboard');
    }
    
    if (!$isAuthenticated && !isPublicRoute(currentPath)) {
      console.log('User not authenticated, redirecting to login from:', currentPath);
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      goto('/login');
    }
    
    if ($isAuthenticated && (currentPath === '/login' || currentPath === '/signup')) {
      console.log('User already authenticated, redirecting to dashboard');
      goto('/dashboard');
    }
  }
</script>

<main>
  <slot />
</main>


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

  .app-footer {
    padding: 0.5rem 1rem;
    text-align: center;
    font-size: 0.875rem;
  }
  .app-footer a {
    color: #555;
    text-decoration: none;
  }
  .app-footer a:hover {
    text-decoration: underline;
  }
</style>