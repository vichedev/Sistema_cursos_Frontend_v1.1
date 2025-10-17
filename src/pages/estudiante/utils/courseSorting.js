// ✅ ORDENAMIENTO - CURSOS NUEVOS SIEMPRE PRIMERO
export const sortCoursesByRelevance = (cursos) => {
  return cursos.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });
};

// ✅ FUNCIONES MEJORADAS PARA DETECCIÓN DE CURSOS NUEVOS
export const getCourseLaunchInfo = (curso) => {
  if (!curso.createdAt) return null;

  try {
    const courseDate = new Date(curso.createdAt);
    const now = new Date();
    const hoursDiff = (now - courseDate) / (1000 * 60 * 60);
    const daysDiff = Math.floor(hoursDiff / 24);

    // Menos de 6 horas
    if (hoursDiff < 6) {
      return {
        type: "just-launched",
        label: "¡RECIÉN LANZADO!",
        icon: FaBolt,
        color: "from-green-500 to-emerald-600",
        borderColor: "border-yellow-300",
        animate: "animate-pulse",
        hours: Math.floor(hoursDiff),
      };
    }

    // Menos de 24 horas
    if (hoursDiff < 24) {
      return {
        type: "today",
        label: `Lanzado hace ${Math.floor(hoursDiff)}h`,
        icon: FaRocket,
        color: "from-blue-500 to-cyan-600",
        borderColor: "border-blue-300",
        animate: "",
        hours: Math.floor(hoursDiff),
      };
    }

    // 1 día
    if (daysDiff === 1) {
      return {
        type: "yesterday",
        label: "Lanzado hace 1 día",
        icon: FaStar,
        color: "from-purple-500 to-indigo-600",
        borderColor: "border-purple-300",
        animate: "",
        days: 1,
      };
    }

    // 2-3 días
    if (daysDiff >= 2 && daysDiff <= 3) {
      return {
        type: "recent",
        label: `Lanzado hace ${daysDiff} días`,
        icon: FaStar,
        color: "from-indigo-500 to-purple-600",
        borderColor: "border-indigo-300",
        animate: "",
        days: daysDiff,
      };
    }

    // 4-7 días (una semana)
    if (daysDiff >= 4 && daysDiff <= 7) {
      return {
        type: "week",
        label: `Lanzado hace ${daysDiff} días`,
        icon: FaCalendarAlt,
        color: "from-orange-500 to-amber-600",
        borderColor: "border-orange-300",
        animate: "",
        days: daysDiff,
      };
    }

    // 1-2 semanas
    if (daysDiff >= 8 && daysDiff <= 14) {
      const weeks = Math.floor(daysDiff / 7);
      return {
        type: "weeks",
        label:
          weeks === 1
            ? "Lanzado hace 1 semana"
            : `Lanzado hace ${weeks} semanas`,
        icon: FaHistory,
        color: "from-gray-500 to-slate-600",
        borderColor: "border-gray-300",
        animate: "",
        days: daysDiff,
      };
    }

    // Más de 2 semanas
    if (daysDiff > 14) {
      const weeks = Math.floor(daysDiff / 7);
      return {
        type: "old",
        label: `Lanzado hace ${weeks} semanas`,
        icon: FaHistory,
        color: "from-gray-400 to-gray-500",
        borderColor: "border-gray-200",
        animate: "",
        days: daysDiff,
      };
    }

    return null;
  } catch {
    return null;
  }
};