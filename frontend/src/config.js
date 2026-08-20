// Centralized API configuration
// In development, defaults to '/api' (proxied by Vite to http://localhost:5000) or VITE_API_BASE_URL
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');
