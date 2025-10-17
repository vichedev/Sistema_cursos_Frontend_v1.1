// ✅ FUNCIONES PARA FECHAS DEL CURSO (100% PRECISAS)
export const isTodayCourse = (curso) => {
  if (!curso.fecha) return false;
  try {
    const fechaStr = curso.fecha.split("T")[0];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return fechaStr === todayStr;
  } catch {
    return false;
  }
};

export const isTomorrowCourse = (curso) => {
  if (!curso.fecha) return false;
  try {
    const fechaStr = curso.fecha.split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(
      tomorrow.getMonth() + 1
    ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    return fechaStr === tomorrowStr;
  } catch {
    return false;
  }
};

export const isUpcomingCourse = (curso) => {
  if (!curso.fecha) return false;
  try {
    const fechaStr = curso.fecha.split("T")[0];
    const [year, month, day] = fechaStr.split("-").map(Number);
    const courseDate = new Date(year, month - 1, day);
    const today = new Date();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const daysDiff = Math.round(
      (courseDate - todayDate) / (1000 * 60 * 60 * 24)
    );
    return daysDiff >= 2 && daysDiff <= 7;
  } catch {
    return false;
  }
};

export const getDaysUntilCourse = (curso) => {
  if (!curso.fecha) return null;
  try {
    const fechaStr = curso.fecha.split("T")[0];
    const [year, month, day] = fechaStr.split("-").map(Number);
    const courseDate = new Date(year, month - 1, day);
    const today = new Date();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const daysDiff = Math.round(
      (courseDate - todayDate) / (1000 * 60 * 60 * 24)
    );
    return daysDiff >= 0 ? daysDiff : null;
  } catch {
    return null;
  }
};
