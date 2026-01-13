// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Environment Variables TypeScript Declarations
interface ImportMetaEnv {
	readonly VITE_API_BASE_URL: string;
	readonly VITE_APP_NAME: string;
	readonly VITE_ENABLE_DEBUG: string;
	readonly VITE_DEV_MODE: string;
	readonly VITE_SUPABASE_URL: string;
	readonly VITE_SUPABASE_ANON_KEY: string;
	readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string;
	// Add more environment variables as needed
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

export {};
