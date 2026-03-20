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

const api = axios.create({ baseURL: BASE_URL });

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

    // Solo actuar en 401 y evitar loop en el propio endpoint /refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      // Sin refresh token → logout directo
      if (!refreshToken) {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Otro request ya está renovando — encolar y esperar
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
        const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const newToken = res.data.token;
        localStorage.setItem("token", newToken);

        // Actualizar header y reintentar todos los requests pendientes
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
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("rol");
  localStorage.removeItem("userId");
  localStorage.removeItem("usuario");
  localStorage.removeItem("nombres");
  localStorage.removeItem("apellidos");
  localStorage.removeItem("correo");
  localStorage.removeItem("celular");
  localStorage.removeItem("cargo");
  window.location.href = "/login";
}

export default api;
