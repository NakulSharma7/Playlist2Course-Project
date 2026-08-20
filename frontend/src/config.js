// Centralized API configuration
// If in production (Vercel), ignore localhost/127.0.0.1 in VITE_API_BASE_URL and use relative '/api'
const isProd = import.meta.env.PROD;
let baseUrl = import.meta.env.VITE_API_BASE_URL;

if (isProd && (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'))) {
  baseUrl = '/api';
}

if (!baseUrl) {
  baseUrl = 'http://localhost:5000/api';
}

export const API_BASE_URL = baseUrl.replace(/\/$/, '');
