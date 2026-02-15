/**
 * Environment variables helper
 * This module provides typed access to environment variables
 */

/** Path to the Drawtopia logo (relative to app origin). Used for last admin page and back cover. */
export const LOGO_PATH = '/assets/logo.png';

export const env = {
	// API Configuration
	API_BASE_URL: 'https://image-edit-five.vercel.app/api',
	PUBLIC_BACKEND_URL: import.meta.env.VITE_API_BASE_URL || 'https://image-edit-five.vercel.app',
	/** Public app URL (e.g. https://drawtopia.com). Used to build full logo URL for backend overlay APIs. */
	PUBLIC_APP_URL: import.meta.env.VITE_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
	APP_NAME: import.meta.env.VITE_APP_NAME || 'Drawtopia',
	
	ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
	DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
	
	// Utility functions
	isDevelopment: () => import.meta.env.DEV,
	isProduction: () => import.meta.env.PROD
};

// Log environment in development
if (env.isDevelopment() && env.ENABLE_DEBUG) {
	console.log('Environment Variables:', {
		API_BASE_URL: env.API_BASE_URL,
		PUBLIC_BACKEND_URL: env.PUBLIC_BACKEND_URL,
		APP_NAME: env.APP_NAME,
		DEV_MODE: env.DEV_MODE,
		ENABLE_DEBUG: env.ENABLE_DEBUG,
	});
}
