// src/utils/dateUtils.js

/**
 * Convierte una fecha "solo día" ('YYYY-MM-DD' o ISO 'YYYY-MM-DDTHH:mm:ssZ') a un
 * objeto Date en hora LOCAL (medianoche local).
 *
 * ⚠️ NO uses `new Date('2026-05-12')` directamente: JavaScript la interpreta como
 * medianoche UTC, así que en zonas detrás de UTC (ej. UTC-5, Ecuador) representa el
 * día anterior y al formatearla se ve "2026-05-11".
 */
export const parseDateOnly = (fecha) => {
  if (!fecha) return null;
  const match = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const date = new Date(fecha);
  return isNaN(date.getTime()) ? null : date;
};

/** Formatea una fecha "solo día" a texto local sin desplazarla por la zona horaria. */
export const formatDateOnly = (fecha, locale = "es-ES", options) => {
  const date = parseDateOnly(fecha);
  if (!date) return "";
  return options
    ? date.toLocaleDateString(locale, options)
    : date.toLocaleDateString(locale);
};

/**
 * ¿El cupón ya expiró? La expiración es INCLUSIVA: el cupón sigue válido durante
 * todo su día de expiración. Devuelve true solo a partir del día siguiente.
 */
export const isCouponExpired = (fechaExpiracion) => {
  const exp = parseDateOnly(fechaExpiracion);
  if (!exp) return false; // sin fecha => nunca expira
  const hoy = new Date();
  const hoySoloDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return hoySoloDia > exp;
};

export const isCourseExpired = (course) => {
  if (!course.fecha) return false; // Si no tiene fecha, considerar como no expirado
  
  try {
    // Crear fecha del curso (combinar fecha y hora si existe)
    const courseDateTime = course.hora 
      ? `${course.fecha}T${course.hora}` 
      : `${course.fecha}T00:00`;
    
    const courseDate = new Date(courseDateTime);
    const now = new Date();
    
    return courseDate < now;
  } catch (error) {
    console.error("Error verificando fecha del curso:", error);
    return false;
  }
};

// Función adicional para obtener estado detallado del curso
export const getCourseStatus = (course) => {
  if (!course.fecha) return 'no-date';
  
  try {
    const courseDateTime = course.hora 
      ? `${course.fecha}T${course.hora}` 
      : `${course.fecha}T00:00`;
    
    const courseDate = new Date(courseDateTime);
    const now = new Date();
    
    // Si la fecha del curso es más de 24 horas en el futuro
    const isUpcoming = courseDate > new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Si la fecha del curso es dentro de las próximas 24 horas
    const isSoon = courseDate > now && courseDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Si la fecha del curso ya pasó
    const isExpired = courseDate < now;
    
    if (isExpired) return 'expired';
    if (isSoon) return 'soon';
    if (isUpcoming) return 'upcoming';
    
    return 'no-date';
  } catch (error) {
    console.error("Error obteniendo estado del curso:", error);
    return 'error';
  }
};