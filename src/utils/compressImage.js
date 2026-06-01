// src/utils/compressImage.js
// ─────────────────────────────────────────────────────────────────────────────
// Compresión / redimensionado de imágenes en el navegador ANTES de subirlas.
// Reduce el peso de las imágenes en cualquier vista del sistema (portadas de
// curso, imágenes de campañas, etc.) para acelerar la subida y ahorrar espacio.
//
// USO:
//   import { compressImage } from "../utils/compressImage";
//   const file = await compressImage(originalFile, { maxWidth: 1280 });
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULTS = {
  maxWidth: 1600, // ancho máximo (px)
  maxHeight: 1600, // alto máximo (px)
  quality: 0.8, // calidad JPEG/WebP (0–1)
  // Si tras comprimir el archivo no resulta más liviano, se conserva el original.
  mimeType: "image/jpeg",
  // No tocar imágenes ya pequeñas (en bytes). 0 = comprimir siempre.
  skipIfUnder: 80 * 1024, // 80 KB
};

// Tipos que NO conviene recomprimir (se devuelven tal cual).
const PASSTHROUGH = ["image/gif", "image/svg+xml"];

/**
 * Comprime/redimensiona una imagen manteniendo su relación de aspecto.
 * Devuelve un nuevo File listo para subir. Si algo falla, devuelve el original
 * para no romper el flujo de subida.
 *
 * @param {File} file  Archivo de imagen original.
 * @param {object} [opts]  Sobrescribe los valores por defecto.
 * @returns {Promise<File>}
 */
export async function compressImage(file, opts = {}) {
  try {
    if (!file || !(file instanceof Blob)) return file;
    if (!file.type?.startsWith("image/")) return file;
    if (PASSTHROUGH.includes(file.type)) return file;

    const cfg = { ...DEFAULTS, ...opts };
    if (cfg.skipIfUnder && file.size <= cfg.skipIfUnder) return file;

    const bitmap = await loadBitmap(file);
    const { width, height } = fitWithin(
      bitmap.width,
      bitmap.height,
      cfg.maxWidth,
      cfg.maxHeight,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    // Fondo blanco para imágenes con transparencia al pasar a JPEG.
    if (cfg.mimeType === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    if (typeof bitmap.close === "function") bitmap.close();

    const blob = await canvasToBlob(canvas, cfg.mimeType, cfg.quality);
    if (!blob) return file;

    // Si la compresión no ayudó, conservar el original.
    if (blob.size >= file.size) return file;

    const ext = cfg.mimeType === "image/webp" ? "webp" : "jpg";
    const baseName = (file.name || "imagen").replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.${ext}`, {
      type: cfg.mimeType,
      lastModified: file.lastModified || undefined,
    });
  } catch {
    // Ante cualquier error, no bloquear la subida: usar el original.
    return file;
  }
}

/** Comprime una lista de archivos en paralelo. */
export async function compressImages(files, opts = {}) {
  return Promise.all(Array.from(files || []).map((f) => compressImage(f, opts)));
}

// ── Helpers internos ─────────────────────────────────────────────────────────
async function loadBitmap(file) {
  // createImageBitmap es lo más rápido y respeta la orientación EXIF.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fallback abajo */
    }
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function fitWithin(w, h, maxW, maxH) {
  const ratio = Math.min(1, maxW / w, maxH / h);
  return {
    width: Math.max(1, Math.round(w * ratio)),
    height: Math.max(1, Math.round(h * ratio)),
  };
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    if (canvas.toBlob) canvas.toBlob((b) => resolve(b), type, quality);
    else resolve(null);
  });
}
