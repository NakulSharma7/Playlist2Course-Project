// Centralized API configuration
// If VITE_API_BASE_URL is set, use it.
// Otherwise, in production (e.g. Vercel), use relative '/api'.
// In development, default to 'http://localhost:5000/api'.
const isProd = import.meta.env.PROD;
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || (isProd ? '/api' : 'http://localhost:5000/api');
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');
