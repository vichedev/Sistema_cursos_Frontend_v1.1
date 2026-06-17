// src/utils/timezones.js
// Zonas horarias de LATAM y conversión de la hora del curso a cada país.

export const LATAM_TIMEZONES = [
  { code: "EC", name: "Ecuador", flag: "🇪🇨", tz: "America/Guayaquil" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", tz: "America/Bogota" },
  { code: "PE", name: "Perú", flag: "🇵🇪", tz: "America/Lima" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", tz: "America/Caracas" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", tz: "America/La_Paz" },
  { code: "CL", name: "Chile", flag: "🇨🇱", tz: "America/Santiago" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", tz: "America/Argentina/Buenos_Aires" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", tz: "America/Asuncion" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", tz: "America/Montevideo" },
  { code: "BR", name: "Brasil", flag: "🇧🇷", tz: "America/Sao_Paulo" },
  { code: "PA", name: "Panamá", flag: "🇵🇦", tz: "America/Panama" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", tz: "America/Costa_Rica" },
  { code: "MX", name: "México", flag: "🇲🇽", tz: "America/Mexico_City" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", tz: "America/Guatemala" },
];

// Offset (ms) de una zona horaria en un instante dado
function tzOffsetMs(tz, date) {
  const utc = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const local = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  return local.getTime() - utc.getTime();
}

const pad = (n) => String(n).padStart(2, "0");

/**
 * Dada la fecha (YYYY-MM-DD), la hora (HH:mm) y la zona horaria de referencia
 * del curso, devuelve la hora local equivalente en cada país de LATAM.
 * @returns Array<{ code, name, flag, tz, hora }>
 */
export function courseTimesByCountry(fecha, hora, sourceTz = "America/Guayaquil") {
  if (!hora) return [];
  const m = String(hora).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return [];
  const hh = pad(m[1]);
  const mm = m[2];

  const dateStr =
    fecha && /^\d{4}-\d{2}-\d{2}/.test(fecha)
      ? String(fecha).slice(0, 10)
      : new Date().toISOString().slice(0, 10);

  // Interpretamos "fecha hh:mm" como hora de pared en la zona de origen → instante UTC
  const naiveUtc = new Date(`${dateStr}T${hh}:${mm}:00Z`);
  if (isNaN(naiveUtc.getTime())) return [];
  const offset = tzOffsetMs(sourceTz, naiveUtc);
  const instant = new Date(naiveUtc.getTime() - offset);

  return LATAM_TIMEZONES.map((z) => ({
    ...z,
    hora: instant.toLocaleTimeString("es", {
      timeZone: z.tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  }));
}

/** Nombre legible de una zona horaria a partir de su tz IANA. */
export function tzLabel(tz) {
  const found = LATAM_TIMEZONES.find((z) => z.tz === tz);
  return found ? `${found.flag} ${found.name}` : tz;
}
