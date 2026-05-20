import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial to include cookies (refreshToken) in request headers
  headers: {
    'Content-Type': 'application/json'
  }
});

let accessTokenMemory = '';

// Inject Access Token helper
export const setAccessToken = (token) => {
  accessTokenMemory = token;
};

export const getAccessToken = () => {
  return accessTokenMemory;
};

// 1. Request Interceptor: Attach bearer access token to requests if present
API.interceptors.request.use(
  (config) => {
    if (accessTokenMemory) {
      config.headers.Authorization = `Bearer ${accessTokenMemory}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Intercept 401 token expiry errors and rotate access tokens
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401, not a retry attempt, and indicates token expired
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      error.response.data &&
      error.response.data.message === 'token_expired'
    ) {
      originalRequest._retry = true;

      try {
        console.log('Access token expired. Executing token rotation...');
        
        // Request a new access token using HttpOnly refresh token cookie
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = res.data;
        
        // Store new access token in memory
        setAccessToken(accessToken);

        // Update authorization header and repeat original failed call
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        console.error('Token rotation failed. User session terminated.');
        setAccessToken('');
        // Let the application handle authentication state reset
        window.dispatchEvent(new Event('auth_session_expired'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
