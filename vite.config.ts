import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
	plugins: [
		sveltekit(),
		basicSsl(), // Enable HTTPS for local development
		mkcert()
	],
	// Ensure ESM-only Supabase client is bundled for SSR builds (Vercel)
	ssr: {
		noExternal: ['@supabase/supabase-js']
	},
	server: {
		https: true, // enable HTTPS
		host: 'localhost',
		port: 5173,
	},
});
