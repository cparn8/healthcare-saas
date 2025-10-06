import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// --- Token helpers --------------------------------------------------
export const setAuthToken = (token: string | null) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

// Automatically load token on start
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (token) setAuthToken(token);

// --- Auto-refresh interceptor --------------------------------------
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh =
        localStorage.getItem('refresh') || sessionStorage.getItem('refresh');
      if (refresh) {
        try {
          const res = await axios.post(
            'http://localhost:8000/api/auth/refresh/',
            { refresh }
          );
          const newAccess = res.data.access;

          // Persist new access token
          if (localStorage.getItem('token'))
            localStorage.setItem('token', newAccess);
          else sessionStorage.setItem('token', newAccess);

          setAuthToken(newAccess);
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
          return API(originalRequest);
        } catch {
          handleLogout();
        }
      } else {
        handleLogout();
      }
    }
    return Promise.reject(error);
  }
);

// --- Logout helper -------------------------------------------------
export const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refresh');
  window.location.href = '/login';
};

export default API;
