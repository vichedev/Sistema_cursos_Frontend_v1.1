// src/hooks/useAuth.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

/**
 * Hook para proteger rutas según los roles permitidos.
 * Verifica el access token; si expiró intenta renovarlo con el refresh token.
 * Si ambos expiraron → redirige al login.
 *
 * @param {string[]} allowedRoles - Array de roles permitidos (ej: ['ADMIN'])
 */
export function useAuth(allowedRoles = []) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const userRole = localStorage.getItem("rol");

    // Sin token → login
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Access token expirado — verificar si hay refresh token válido
        if (!refreshToken) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }

        try {
          const decodedRefresh = jwtDecode(refreshToken);
          if (decodedRefresh.exp < currentTime) {
            // Refresh token también expirado → logout
            clearSession();
            navigate("/login", { replace: true });
            return;
          }
          // Refresh token aún válido — el interceptor de axiosInstance
          // se encargará de renovar el access token en el siguiente request.
          // Aquí solo dejamos pasar.
        } catch {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }
      }

      // Verificar rol
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        if (userRole === "ADMIN") {
          navigate("/admin/dashboard", { replace: true });
        } else if (userRole === "ESTUDIANTE") {
          navigate("/estudiante/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (error) {
      console.error("Error decodificando token:", error);
      clearSession();
      navigate("/login", { replace: true });
    }
  }, [allowedRoles, navigate]);
}

function clearSession() {
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
}
