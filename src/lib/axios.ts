// lib/axios.ts
import axios from 'axios';

const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fintechapi.softsuitetech.com/api';
const baseURL = rawBase.replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  // Do not set a default Content-Type here so axios can correctly
  // set the header (and boundary) when sending FormData (file uploads).
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

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

// Add response interceptor for debugging
api.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
}, error => {
  console.log('Response Error:', error);
  return Promise.reject(error);
});

export default api;