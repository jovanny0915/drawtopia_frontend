import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Ensure ESM-only Supabase client is bundled for SSR builds (Vercel)
	ssr: {
		noExternal: ['@supabase/supabase-js']
	},
	server: {
		hmr: false,
		allowedHosts: [
			'frostily-untamable-wanita.ngrok-free.dev',
			'.ngrok-free.dev',
			'.ngrok.io'
		]
	}
});
