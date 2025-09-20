// src/hooks/useAuth.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Necesitarás instalar esta librería

/**
 * Hook para proteger rutas según los roles permitidos.
 * @param {string[]} allowedRoles - Array de roles permitidos (ej: ['ADMIN'] o ['ESTUDIANTE'])
 */
export function useAuth(allowedRoles = []) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("rol");

    // Si no hay token, redirige al login
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      // Verificar si el token es válido y no ha expirado
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Si el token ha expirado
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        localStorage.removeItem("userId");
        navigate("/login", { replace: true });
        return;
      }

      // Verificar si el rol del usuario está permitido
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Usuario no tiene permisos, redirigir según su rol real
        if (userRole === "ADMIN") {
          navigate("/admin/dashboard", { replace: true });
        } else if (userRole === "ESTUDIANTE") {
          navigate("/estudiante/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
        return;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("rol");
      localStorage.removeItem("userId");
      navigate("/login", { replace: true });
    }
  }, [allowedRoles, navigate]);
}