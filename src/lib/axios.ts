// @/lib/axios.ts

import axios from 'axios';

const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fintechapi.softsuitetech.com/api';
const baseURL = rawBase.replace(/\/+$/, '');

const api = axios.create({
<<<<<<< HEAD
  baseURL,
  // Do not set a default Content-Type here so axios can correctly
  // set the header (and boundary) when sending FormData (file uploads).
=======
  // Make sure this URL points to your backend API
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://fintechapi.softsuitetech.com/public/api',
  withCredentials: true, // CRITICAL: Allows sending/receiving cookies
>>>>>>> dc389fb49d188bb7b44892c1840e2c6efd14abd1
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

<<<<<<< HEAD
// Add request interceptor for debugging
api.interceptors.request.use(request => {
  try {
    const u = request.baseURL ? `${request.baseURL}${request.url}` : request.url;
    console.log('Starting Request', u);
  } catch (e) {
    console.log('Starting Request', request.url);
  }

  // Attach Authorization header from localStorage if available.
  // Support multiple token keys because different auth thunks store different keys:
  // 'access_token', 'auth_token', 'authToken', 'authToken', or generic 'token'.
  try {
    if (typeof window !== 'undefined') {
      const tokenKeys = ['access_token', 'auth_token', 'authToken', 'authToken', 'token'];
      let token: string | null = null;
      for (const key of tokenKeys) {
        const t = localStorage.getItem(key);
        if (t) {
          token = t;
          break;
        }
      }

      if (token) {
        // request.headers can be an AxiosHeaders object; assign defensively
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (request.headers as any) = (request.headers as any) || {};
        (request.headers as any).Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // swallow errors reading localStorage in non-browser environments
  }

  return request;
});
=======
// Request Interceptor: Automatically attach CSRF token and Bearer token
api.interceptors.request.use((config) => {
  // 1. Attach CSRF Token from cookie for state-changing requests
  // This is required by Laravel's Sanctum for web-based authentication
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
>>>>>>> dc389fb49d188bb7b44892c1840e2c6efd14abd1

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