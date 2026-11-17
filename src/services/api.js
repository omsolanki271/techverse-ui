import axios from 'axios';

// Resolve and normalize API base URL ensuring '/api' prefix is included exactly once
export const getBaseApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const raw = (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0)
    ? envUrl.trim()
    : 'http://localhost:8081/api';

  // Strip trailing slashes
  const clean = raw.replace(/\/+$/, '');

  // If the URL already ends with /api, return it
  if (clean.endsWith('/api')) {
    return clean;
  }

  // Otherwise append /api
  return `${clean}/api`;
};

// Create base instance
const api = axios.create({
  baseURL: getBaseApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && token.trim().length > 0) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      // Do NOT clear token on auth endpoints or public browsing
      const isAuthRequest = url.includes('/auth/login');

      // Only clear credentials when an authenticated request to a protected endpoint is rejected
      if (!isAuthRequest && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
