// src/utils/dateUtils.js
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