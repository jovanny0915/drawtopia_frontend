
export const LOGO_PATH = '/assets/logo.webp';

const rawBackendBase = (
	import.meta.env.VITE_API_BASE_URL ||
	import.meta.env.VITE_PUBLIC_BACKEND_URL ||
	(import.meta.env.PROD ? 'https://app.drawtopia.ai' : 'http://localhost:8000')
).replace(/\/$/, '');

const apiBaseUrl = rawBackendBase.endsWith('/api') ? rawBackendBase : `${rawBackendBase}/api`;
const publicBackendUrl = rawBackendBase.replace(/\/api$/, '');

export const env = {
	API_BASE_URL: apiBaseUrl,
	PUBLIC_BACKEND_URL: publicBackendUrl,
	PUBLIC_APP_URL: import.meta.env.VITE_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
	APP_NAME: import.meta.env.VITE_APP_NAME || 'Drawtopia',
	
	ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
	DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
	
	isDevelopment: () => import.meta.env.DEV,
	isProduction: () => import.meta.env.PROD
};

if (env.isDevelopment() && env.ENABLE_DEBUG) {
	console.log('Environment Variables:', {
		API_BASE_URL: env.API_BASE_URL,
		PUBLIC_BACKEND_URL: env.PUBLIC_BACKEND_URL,
		APP_NAME: env.APP_NAME,
		DEV_MODE: env.DEV_MODE,
		ENABLE_DEBUG: env.ENABLE_DEBUG,
	});
}
