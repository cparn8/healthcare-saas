// frontend/src/services/api.ts
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

// --- Token helpers --------------------------------------------------
export const setAuthToken = (token: string | null) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// Automatically load token on start
const token = localStorage.getItem("token") || sessionStorage.getItem("token");
if (token) setAuthToken(token);

// --- Auto-refresh interceptor --------------------------------------
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired (401) and we haven’t retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh =
        localStorage.getItem("refresh") || sessionStorage.getItem("refresh");

      if (refresh) {
        try {
          console.log("♻️ Refreshing expired token...");
          const res = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
            refresh,
          });

          const newAccess = res.data.access;

          // Save new token
          if (localStorage.getItem("refresh")) {
            localStorage.setItem("token", newAccess);
          } else {
            sessionStorage.setItem("token", newAccess);
          }

          setAuthToken(newAccess);
          originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

          console.log("✅ Token refreshed — retrying request.");
          return API(originalRequest);
        } catch (refreshError) {
          console.warn("❌ Token refresh failed:", refreshError);
          handleLogout();
        }
      } else {
        console.warn("⚠️ No refresh token available — logging out.");
        handleLogout();
      }
    }

    return Promise.reject(error);
  }
);

// --- Logout helper -------------------------------------------------
export const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("refresh");
  window.location.href = "/login";
};

export default API;
