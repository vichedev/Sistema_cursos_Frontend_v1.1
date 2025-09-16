// src/components/admin/BannerSlider.jsx
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const SLIDER_IMAGES = [
  "https://images.unsplash.com/photo-1503676382389-4809596d5290?w=800",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
];

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px] lg:min-h-[640px] p-4 md:p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl shadow-2xl border border-gray-100 transition-all">
      <div className="relative w-full h-[280px] md:h-[420px] flex items-center justify-center">
        <img
          src={SLIDER_IMAGES[current]}
          alt="Slider"
          className="rounded-2xl object-cover w-full h-full transition-all duration-700 shadow-md"
          style={{ maxHeight: "420px", maxWidth: "480px" }}
        />
        <button
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10"
          onClick={() => setCurrent((c) => (c - 1 + SLIDER_IMAGES.length) % SLIDER_IMAGES.length)}
          type="button"
        >
          <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10"
          onClick={() => setCurrent((c) => (c + 1) % SLIDER_IMAGES.length)}
          type="button"
        >
          <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDER_IMAGES.map((_, i) => (
            <span
              key={i}
              className={`block w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${i === current ? "bg-orange-400" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 md:mt-6 text-center text-gray-600 text-xs md:text-sm">
        <p className="mb-1 md:mb-2"><b>Consejo:</b> ¡Usa imágenes atractivas y crea cursos inolvidables!</p>
        <span className="text-orange-500 font-bold">Panel de Administración Cursos RNC</span>
      </div>
    </div>
  );
}
