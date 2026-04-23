// src/utils/axiosInstance.js
// ─────────────────────────────────────────────────────────────────────────────
// Instancia centralizada de Axios con renovación automática de token.
//
// USO: importa este archivo en lugar de "axios" directamente en todos
//      los componentes que hagan llamadas autenticadas al backend.
//
//  import api from "../utils/axiosInstance";
//  const res = await api.get("/api/courses/all");
//
// Los componentes que ya usan axios.get/post/put/delete solo necesitan
// cambiar el import — el resto del código queda igual.
// ─────────────────────────────────────────────────────────────────────────────
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// VULN-02: withCredentials permite que el browser envíe la cookie httpOnly del refreshToken
const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

// ── Request interceptor — adjunta el token a cada request ────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Flag para evitar loops infinitos de refresh ───────────────────────────────
let isRefreshing = false;
let pendingRequests = [];

const processPending = (error, token = null) => {
  pendingRequests.forEach((cb) => {
    if (error) cb.reject(error);
    else cb.resolve(token);
  });
  pendingRequests = [];
};

// ── Response interceptor — renueva el access token si expiró (401) ───────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry automático en 429 (rate limit) — máx 2 reintentos con espera exponencial
    if (error.response?.status === 429 && (originalRequest._retryCount ?? 0) < 2) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
      const wait = Math.pow(2, originalRequest._retryCount) * 1000; // 2s, 4s
      await new Promise((r) => setTimeout(r, wait));
      return api(originalRequest);
    }

    // Solo actuar en 401 y evitar loop en el propio endpoint /refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // VULN-02: el refreshToken viaja como cookie httpOnly automáticamente (withCredentials)
        // No se envía en el body — el browser lo adjunta solo
        const res = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data.token;
        localStorage.setItem("token", newToken);

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processPending(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processPending(refreshError, null);
        clearSessionAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

function clearSessionAndRedirect() {
  // VULN-07: solo limpiar datos mínimos almacenados en localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("userId");
  localStorage.removeItem("usuario");
  localStorage.removeItem("nombres");
  localStorage.removeItem("cargo");
  // Notificar al backend para que limpie la cookie httpOnly del refreshToken
  axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true }).catch(() => {});
  window.location.href = "/login";
}

export default api;
