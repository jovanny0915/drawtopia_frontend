/**
 * Environment variables helper
 * This module provides typed access to environment variables
 */

export const env = {
	// API Configuration
	API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
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
		APP_NAME: env.APP_NAME,
		DEV_MODE: env.DEV_MODE,
		ENABLE_DEBUG: env.ENABLE_DEBUG,
	});
}
