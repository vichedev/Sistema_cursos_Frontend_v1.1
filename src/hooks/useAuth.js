import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook para proteger rutas según los roles permitidos.
 * @param {string[]} allowedRoles - Array de roles permitidos (ej: ['ADMIN'] o ['ESTUDIANTE'])
 */
export function useAuth(allowedRoles = []) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    // Si no hay token o el rol no está permitido, redirige al login
    if (!token || (allowedRoles.length && !allowedRoles.includes(rol))) {
      navigate("/login", { replace: true });
    }
    // Se agrega allowedRoles y navigate como dependencia para evitar warning
  }, [allowedRoles, navigate]);
}
