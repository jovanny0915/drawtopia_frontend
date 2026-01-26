import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
	plugins: [
		sveltekit(),
		basicSsl() // Enable HTTPS for local development
	],
	// Ensure ESM-only Supabase client is bundled for SSR builds (Vercel)
	ssr: {
		noExternal: ['@supabase/supabase-js']
	},
	server: {
		https: true, // Enable HTTPS
		port: 5173 // Keep the default port
	}
});
