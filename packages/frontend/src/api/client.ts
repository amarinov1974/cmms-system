/**
 * API Client
 * Axios instance with base config
 */

import axios from 'axios';

// Use relative /api in dev so Vite proxy works; avoids CORS and wrong host/port
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true, // Send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/'
    ) {
      // Session expired - redirect to entry (avoid redirect loop when on entry)
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
