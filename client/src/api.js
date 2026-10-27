import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("imovies_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clean up stale tokens if not on auth page
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        localStorage.removeItem("imovies_token");
        localStorage.removeItem("imovies_user");
      }
    }
    return Promise.reject(error);
  }
);

export const errorText = (e) =>
  e?.response?.data?.message || e.message || "An unexpected error occurred. Please try again.";
