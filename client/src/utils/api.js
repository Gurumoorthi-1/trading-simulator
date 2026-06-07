import axios from 'axios';

// ==================== Axios Base Instance ====================
// Dev: http://localhost:5000/api
// Production (Vercel + Render): VITE_API_URL set in Vercel environment variables pointing to Render backend
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Double check that /api is at the end of the URL
if (API_BASE_URL && !API_BASE_URL.endsWith('/api') && !API_BASE_URL.endsWith('/api/')) {
  API_BASE_URL = API_BASE_URL.endsWith('/') ? `${API_BASE_URL}api` : `${API_BASE_URL}/api`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable to track if a refresh is already in progress
let isRefreshing = false;
// Queue for requests that wait for the refresh to complete
let refreshSubscribers = [];

// Function to subscribe to refresh completion
const subscribeToRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers when refresh is done
const onRefreshComplete = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// ==================== Request Interceptor ====================
// Every request-ல automatically JWT token attached
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== Response Interceptor ====================
// 401 error வந்தா automatically try to refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token, logout immediately
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        if (isRefreshing) {
          // If refresh is already in progress, queue the request
          return new Promise((resolve) => {
            subscribeToRefresh((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to rotate tokens
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });

          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          // Notify all queued requests that refresh is complete
          onRefreshComplete(data.accessToken);

          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout
          console.error('Refresh token failed:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('auth-storage');
          refreshSubscribers = [];
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Payment API functions
export const paymentApi = {
  createOrder: (plan) => api.post('/payment/create-order', { plan }),
  verifyPayment: (data) => api.post('/payment/verify', data),
  handleFailure: (data) => api.post('/payment/failure', data),
  getHistory: () => api.get('/payment/history')
};
