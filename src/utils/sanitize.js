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

// Identificación / cédula: muchos países LATAM usan IDs ALFANUMÉRICOS
// (Chile RUT con K, México CURP/RFC con letras, etc.). Por eso NO se puede
// usar sanitizeNumber aquí — se permiten letras, dígitos y guiones, y se
// normaliza a mayúsculas para que las validaciones por país funcionen.
export const sanitizeCedula = (value) => {
  if (typeof value !== 'string') return '';

  return value
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, '') // letras, números y guion (coincide con el backend)
    .toUpperCase()
    .substring(0, 25);
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