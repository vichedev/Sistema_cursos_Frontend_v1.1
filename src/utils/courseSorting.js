// ✅ ORDENAMIENTO MEJORADO - CURSOS NUEVOS SIEMPRE PRIMERO
// ✅ ORDENAMIENTO MEJORADO - CURSOS MÁS RECIENTES PRIMERO
const sortCoursesByRelevance = (cursos) => {
  return cursos.sort((a, b) => {
    // Primero: Ordenar por fecha de creación (más reciente primero)
    const dateA = new Date(a.createdAt || "1970-01-01");
    const dateB = new Date(b.createdAt || "1970-01-01");

    // Si las fechas son diferentes, ordenar por fecha (más reciente primero)
    if (dateB.getTime() !== dateA.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }

    // Si las fechas son iguales, ordenar por ID (más alto primero)
    return (b.id || 0) - (a.id || 0);
  });
};

// ✅ FUNCIONES PARA DETECTAR CURSOS NUEVOS (MEJORADAS)
const isVeryNewCourse = (curso) => {
  // Método 1: Por createdAt (si existe)
  if (curso.createdAt) {
    try {
      const courseDate = new Date(curso.createdAt);
      const hoursDiff = (new Date() - courseDate) / (1000 * 60 * 60);
      return hoursDiff <= 24; // Menos de 24 horas
    } catch {
      // Si falla, continuar al método 2
    }
  }

  // Método 2: Por ID (asumir que IDs altos son nuevos)
  // Esto es un fallback si createdAt no existe
  return false;
};

const isNewCourse = (curso) => {
  // Método 1: Por createdAt (si existe)
  if (curso.createdAt) {
    try {
      const courseDate = new Date(curso.createdAt);
      const daysDiff = (new Date() - courseDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 3; // Menos de 3 días
    } catch {
      // Si falla, continuar al método 2
    }
  }

  // Método 2: Por ID (asumir que IDs altos son nuevos)
  return false;
};

// ✅ FUNCIONES CORREGIDAS PARA FECHAS DEL CURSO (100% PRECISAS)
const isTodayCourse = (curso) => {
  if (!curso.fecha) return false;
  try {
    // Extraer la fecha del curso (puede venir como "2025-10-10" o "2025-10-10T00:00:00")
    const fechaStr = curso.fecha.split("T")[0]; // "2025-10-10"

    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    console.log(
      "🔍 isTodayCourse - Curso:",
      fechaStr,
      "Hoy:",
      todayStr,
      "Match:",
      fechaStr === todayStr
    );

    return fechaStr === todayStr;
  } catch (error) {
    console.error("❌ Error en isTodayCourse:", error);
    return false;
  }
};

const isTomorrowCourse = (curso) => {
  if (!curso.fecha) return false;
  try {
    // Extraer la fecha del curso
    const fechaStr = curso.fecha.split("T")[0];

    // Obtener la fecha de mañana en formato YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(
      tomorrow.getMonth() + 1
    ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    console.log(
      "🔍 isTomorrowCourse - Curso:",
      fechaStr,
      "Mañana:",
      tomorrowStr,
      "Match:",
      fechaStr === tomorrowStr
    );

    return fechaStr === tomorrowStr;
  } catch (error) {
    console.error("❌ Error en isTomorrowCourse:", error);
    return false;
  }
};

const isUpcomingCourse = (curso) => {
  if (!curso.fecha) return false;
  try {
    // Extraer la fecha del curso
    const fechaStr = curso.fecha.split("T")[0];
    const [year, month, day] = fechaStr.split("-").map(Number);

    // Crear fecha del curso (sin hora)
    const courseDate = new Date(year, month - 1, day);

    // Crear fecha de hoy (sin hora)
    const today = new Date();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Calcular diferencia en días
    const daysDiff = Math.round(
      (courseDate - todayDate) / (1000 * 60 * 60 * 24)
    );

    console.log(
      "🔍 isUpcomingCourse - Curso:",
      fechaStr,
      "Días diff:",
      daysDiff
    );

    return daysDiff >= 2 && daysDiff <= 7;
  } catch (error) {
    console.error("❌ Error en isUpcomingCourse:", error);
    return false;
  }
};

const getDaysUntilCourse = (curso) => {
  if (!curso.fecha) return null;
  try {
    // Extraer la fecha del curso
    const fechaStr = curso.fecha.split("T")[0];
    const [year, month, day] = fechaStr.split("-").map(Number);

    // Crear fecha del curso (sin hora)
    const courseDate = new Date(year, month - 1, day);

    // Crear fecha de hoy (sin hora)
    const today = new Date();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Calcular diferencia en días
    const daysDiff = Math.round(
      (courseDate - todayDate) / (1000 * 60 * 60 * 24)
    );

    console.log(
      "🔍 getDaysUntilCourse - Curso:",
      fechaStr,
      "Días hasta:",
      daysDiff
    );

    return daysDiff >= 0 ? daysDiff : null;
  } catch (error) {
    console.error("❌ Error en getDaysUntilCourse:", error);
    return null;
  }
};

// ✅ FUNCIÓN PARA OBTENER HORAS DESDE CREACIÓN
const getHoursSinceCreation = (curso) => {
  if (!curso.createdAt) return null;
  try {
    const courseDate = new Date(curso.createdAt);
    const hoursDiff = Math.floor((new Date() - courseDate) / (1000 * 60 * 60));
    return hoursDiff;
  } catch {
    return null;
  }
};

// ✅ FUNCIÓN PARA OBTENER DÍAS DESDE CREACIÓN
const getDaysSinceCreation = (curso) => {
  if (!curso.createdAt) return null;
  try {
    const courseDate = new Date(curso.createdAt);
    const daysDiff = Math.floor(
      (new Date() - courseDate) / (1000 * 60 * 60 * 24)
    );
    return daysDiff;
  } catch {
    return null;
  }
};
