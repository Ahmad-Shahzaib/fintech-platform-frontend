// @/lib/axios.ts

import axios from 'axios';

const api = axios.create({
  // Make sure this URL points to your backend API
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://fintechapi.softsuitetech.com/public/api',
  withCredentials: true, // CRITICAL: Allows sending/receiving cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Automatically attach CSRF token and Bearer token
api.interceptors.request.use((config) => {
  // 1. Attach CSRF Token from cookie for state-changing requests
  // This is required by Laravel's Sanctum for web-based authentication
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (csrfToken) {
    // Laravel expects the CSRF token in the 'X-XSRF-TOKEN' header
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
  }

  // 2. Attach Bearer token if it exists in localStorage
  // This is for API authentication after login
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;