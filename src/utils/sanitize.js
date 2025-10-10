// Utilidades de sanitización para prevenir XSS e inyección
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>"'`;()&|$\\]/g, '') // Eliminar caracteres peligrosos PERO mantener @ . - _
    .substring(0, 100); // Limitar longitud
};

export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9@._+-]/g, '') // Solo caracteres válidos para email (incluye +)
    .substring(0, 100);
};

export const sanitizeNumber = (number) => {
  if (typeof number !== 'string') return '';
  
  return number
    .trim()
    .replace(/[^0-9]/g, '') // Solo números
    .substring(0, 20);
};

export const sanitizeName = (name) => {
  if (typeof name !== 'string') return '';
  
  return name
    .trim()
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') // Solo letras y espacios
    .substring(0, 50);
};

export const sanitizeUsername = (username) => {
  if (typeof username !== 'string') return '';
  
  return username
    .trim()
    // ✅ CORREGIDO: Mantener puntos, guiones y arrobas que son válidos en usuarios
    .replace(/[<>"'`;()&|$\\]/g, '') // Solo eliminar caracteres realmente peligrosos
    .substring(0, 30);
};