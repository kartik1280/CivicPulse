import axios from 'axios';

/**
 * Centralized Axios instance for CivicPulse.
 * Uses VITE_API_URL from environment variables as the base.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Add basic error interceptor for logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default api;
