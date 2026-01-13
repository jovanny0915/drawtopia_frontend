<script lang="ts">
	import { env } from '$lib/env';
	import { user, isAuthenticated, initAuth } from '$lib/stores/auth';
	import { signOut, getUserProfile } from '$lib/auth';
	import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';
	import { addNotification } from '$lib/stores/notification';

	let userProfile: any = null;
	initAuth();
	console.log("isAuthenticated", $isAuthenticated);
	console.log("user", $user);
	async function handleSignOut() {
		try {
			// Clear local user profile data
			userProfile = null;

			const result = await signOut();
			if (result.success) {
				console.log('User signed out successfully');
				// Show success message and redirect to login
				addNotification({
					type: 'success',
					message: 'Signed out successfully!'
				});
				goto('/login');
			} else {
				console.error('Sign out failed:', result.error);
				addNotification({
					type: 'error',
					message: 'Error signing out: ' + result.error
				});
			}
		} catch (error) {
			console.error('Sign out error:', error);
			addNotification({
				type: 'error',
				message: 'An unexpected error occurred during sign out'
			});
		}
	}

	// Fetch user profile when user changes, clear when user signs out
	$: if ($user) {
		fetchUserProfile($user.id);
	} else {
		userProfile = null;
	}

	async function fetchUserProfile(userId: string) {
		const result = await getUserProfile(userId);
		if (result.success) {
			userProfile = result.profile;
		} else {
			console.error('Failed to fetch user profile:', result.error);
		}
	}
</script>

<div class="welcome-container">
	<div class="welcome-card">
		<h1>Welcome to {env.APP_NAME}</h1>
		<p>Your creative drawing platform awaits!</p>
		
{#if env.DEV_MODE}
			<div class="dev-info">
				<small>🔧 Development Mode | API: {env.API_BASE_URL}</small>
			</div>
		{/if}

		{#if $isAuthenticated}
			<div class="user-info">
				{#if userProfile}
					<p>Welcome back, {userProfile.first_name} {userProfile.last_name}!</p>
					{#if userProfile.google_id}
						<p><small>Signed in with Google</small></p>
					{/if}
				{:else}
					<p>Welcome back, {$user?.user_metadata?.full_name || $user?.email || 'User'}!</p>
				{/if}
			</div>
			<div class="auth-buttons">
				<a href="/dashboard" class="btn btn-primary">Go to Dashboard</a>
				<button on:click={handleSignOut} class="btn btn-primary">Sign Out</button>
			</div>
			<a href="/create-child-profile" class="btn btn-primary">Create Child Profile</a>
		{:else}
			<div class="auth-buttons">
				<a href="/login" class="btn btn-primary">Sign In</a>
				<a href="/signup" class="btn btn-secondary">Create Account</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.welcome-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1rem;
	}

	.welcome-card {
		background: white;
		border-radius: 16px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		padding: 3rem;
		text-align: center;
		max-width: 500px;
		width: 100%;
	}

	h1 {
		color: #667eea;
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
	}

	p {
		color: #6b7280;
		font-size: 1.125rem;
		margin: 0 0 2rem 0;
	}

	.dev-info {
		background: #f3f4f6;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		margin: 1rem 0;
		border-left: 3px solid #10b981;
	}

	.dev-info small {
		color: #374151;
		font-family: monospace;
	}

	.auth-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		padding: 0.75rem 2rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		font-size: 1rem;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		display: inline-block;
		min-width: 140px;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
	}

	.btn:hover {
		transform: translateY(-2px);
	}

	.btn-primary:hover {
		box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
	}

	.btn-secondary:hover {
		background: #f8fafc;
		box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
	}

	@media (max-width: 480px) {
		.welcome-card {
			padding: 2rem;
			margin: 1rem;
		}
		
		h1 {
			font-size: 2rem;
		}
		
		.auth-buttons {
			flex-direction: column;
		}
	}
</style>
