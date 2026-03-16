// src/components/InternationalPhoneInput.jsx
import { useState, useEffect } from "react";
import { LATAM_COUNTRIES } from "../constants/latam-countries";

export default function InternationalPhoneInput({
  value,
  onChange,
  error,
  country,
}) {
  const [localNumber, setLocalNumber] = useState("");

  // Obtener la info del país actual (viene del componente externo)
  const selectedCountry =
    LATAM_COUNTRIES.find((c) => c.code === country) || LATAM_COUNTRIES[0];

  // Sincronizar el valor local cuando cambia el prop 'value'
  useEffect(() => {
    if (value) {
      const prefix = selectedCountry.dialCode;
      if (value.startsWith(prefix)) {
        // Extraer el número local quitando el prefijo
        let numeroLocal = value.slice(prefix.length);
        setLocalNumber(numeroLocal);
      } else {
        setLocalNumber(value);
      }
    } else {
      setLocalNumber("");
    }
  }, [value, selectedCountry]);

  // Función para normalizar el número (quitar 0 inicial si existe)
  const normalizeLocalNumber = (numero) => {
    // Ejemplo: "0991234567" → "991234567"
    // Ejemplo: "3001234567" → "3001234567" (se mantiene)
    if (numero.startsWith("0")) {
      return numero.substring(1);
    }
    return numero;
  };

  const handleLocalNumberChange = (e) => {
    // Solo permitir dígitos
    let soloNumeros = e.target.value.replace(/\D/g, "");

    // ✅ NORMALIZACIÓN: Eliminar el 0 inicial si existe
    // Esto convierte "0991234567" en "991234567"
    const numeroNormalizado = normalizeLocalNumber(soloNumeros);

    setLocalNumber(numeroNormalizado);

    // Devolvemos el número completo (Prefijo + Local normalizado)
    const fullNumber = selectedCountry.dialCode + numeroNormalizado;
    onChange(fullNumber);
  };

  // Generar placeholder sin el 0 inicial para países que lo necesitan
  const getPlaceholder = () => {
    let ejemplo = selectedCountry.phoneExample
      .replace(selectedCountry.dialCode, "")
      .trim();
    // Si el ejemplo empieza con 0, quitarlo para el placeholder
    if (ejemplo.startsWith("0")) {
      ejemplo = ejemplo.substring(1);
    }
    return `Ej: ${ejemplo}`;
  };

  return (
    <div className="w-full">
      <div
        className={`flex h-[50px] items-stretch border rounded-xl overflow-hidden transition-all ${
          error
            ? "border-red-500"
            : "border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        } bg-white dark:bg-gray-700`}
      >
        {/* Lado Izquierdo: Solo lectura (Visual) */}
        <div className="flex items-center px-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600 select-none">
          <span className="text-lg mr-2">{selectedCountry.flag}</span>
          <span className="text-sm font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
            {selectedCountry.dialCode}
          </span>
        </div>

        {/* Lado Derecho: Input para escribir el número */}
        <input
          type="tel"
          value={localNumber}
          onChange={handleLocalNumberChange}
          placeholder={getPlaceholder()}
          className="flex-1 px-4 py-2 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
