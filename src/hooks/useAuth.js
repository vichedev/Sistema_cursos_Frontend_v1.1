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
        // VULN-02: el refreshToken es una cookie httpOnly, no está en localStorage
        // El interceptor de axiosInstance intentará renovarlo automáticamente.
        // Si falla, axiosInstance llama a clearSessionAndRedirect().
        // Aquí solo verificamos que el access token no esté completamente muerto.
        // Si la expiración es reciente, dejamos pasar y confiamos en el interceptor.
        const expiredSecondsAgo = currentTime - decoded.exp;
        if (expiredSecondsAgo > 60 * 60 * 24 * 7) {
          // Expirado hace más de 7 días — no hay forma que el refresh sea válido
          clearSession();
          navigate("/login", { replace: true });
          return;
        }
        // Si expiró recientemente, dejar pasar: axiosInstance renovará al primer request
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
  // VULN-07: solo limpiar datos mínimos almacenados en localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("userId");
  localStorage.removeItem("usuario");
  localStorage.removeItem("nombres");
  localStorage.removeItem("cargo");
}
