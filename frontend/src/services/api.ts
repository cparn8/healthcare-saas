import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// ✅ Helper function: set or clear token
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
  }
};

// ✅ Attach token automatically to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle expired tokens (refresh)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const res = await axios.post(
            'http://localhost:8000/api/token/refresh/',
            { refresh }
          );
          const newAccess = res.data.access;
          setAuthToken(newAccess);
          error.config.headers['Authorization'] = `Bearer ${newAccess}`;
          return API.request(error.config); // retry failed request
        } catch {
          setAuthToken(null);
          localStorage.removeItem('refresh');
          window.location.href = '/'; // force re-login
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
