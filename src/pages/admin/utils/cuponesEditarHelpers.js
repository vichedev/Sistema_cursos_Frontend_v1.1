// src/utils/cuponesEditarHelpers.js
import Swal from "sweetalert2";
import api from "../../../utils/axiosInstance";
import { formatearFechaParaInput, getEstadoCupon } from "./cuponesHelpers";

export const editarCupon = async (cupon, recargarFunc) => {
  const fechaFormateada = formatearFechaParaInput(cupon.fechaExpiracion);
  const isDarkMode = document.documentElement.classList.contains("dark");

  const { value: formValues } = await Swal.fire({
    title: `Editar Cupón: ${cupon.codigo}`,
    html: `
    <div class="text-left space-y-4 ${isDarkMode ? "dark" : ""}">
      <div>
        <label class="block text-sm font-medium ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        } mb-1">Código del Cupón</label>
        <input 
          id="codigo" 
          class="w-full p-3 border ${
            isDarkMode
              ? "border-gray-600 bg-gray-700 text-white"
              : "border-gray-300 bg-white text-gray-900"
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          placeholder="Ingresa el código" 
          value="${cupon.codigo}"
          required
        >
      </div>
      
      <div>
        <label class="block text-sm font-medium ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        } mb-1">Tipo de Descuento</label>
        <select id="tipo" class="w-full p-3 border ${
          isDarkMode
            ? "border-gray-600 bg-gray-700 text-white"
            : "border-gray-300 bg-white text-gray-900"
        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
             <option value="PORCENTAJE_10" ${
               cupon.tipo === "PORCENTAJE_10" ? "selected" : ""
             }>10% Descuento</option>
              <option value="PORCENTAJE_15" ${
                cupon.tipo === "PORCENTAJE_15" ? "selected" : ""
              }>15% Descuento</option>
            <option value="PORCENTAJE_30" ${
              cupon.tipo === "PORCENTAJE_30" ? "selected" : ""
            }>30% Descuento</option>
        <option value="PORCENTAJE_50" ${
          cupon.tipo === "PORCENTAJE_50" ? "selected" : ""
        }>50% Descuento</option>
        <option value="GRATIS" ${
          cupon.tipo === "GRATIS" ? "selected" : ""
        }>Curso GRATIS</option>
</select>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          } mb-1">Usos Actuales</label>
          <input 
            type="number" 
            class="w-full p-3 border ${
              isDarkMode
                ? "border-gray-600 bg-gray-600 text-gray-300"
                : "border-gray-300 bg-gray-100 text-gray-900"
            } rounded-lg cursor-not-allowed" 
            value="${cupon.usosActuales}"
            disabled
          >
          <small class="text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }">No modificable</small>
        </div>
        
        <div>
          <label class="block text-sm font-medium ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          } mb-1">Usos Máximos</label>
          <input 
            id="usosMaximos" 
            type="number" 
            class="w-full p-3 border ${
              isDarkMode
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-gray-900"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Usos máximos" 
            value="${cupon.usosMaximos}"
            min="${Math.max(cupon.usosActuales, 1)}"
            max="1000"
            required
          >
          <small class="text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }">Mínimo: ${Math.max(cupon.usosActuales, 1)}</small>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        } mb-1">Fecha de Expiración</label>
        <input 
          id="fechaExpiracion" 
          type="date" 
          class="w-full p-3 border ${
            isDarkMode
              ? "border-gray-600 bg-gray-700 text-white"
              : "border-gray-300 bg-white text-gray-900"
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          value="${fechaFormateada}"
        >
        <small class="text-xs ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }">Dejar vacío si no expira</small>
      </div>
      
      <div class="${
        isDarkMode
          ? "bg-blue-900/20 border-blue-700"
          : "bg-blue-50 border-blue-200"
      } p-3 rounded-lg border">
        <p class="text-sm ${
          isDarkMode ? "text-blue-300" : "text-blue-700"
        } font-semibold mb-2">Resumen del Cupón</p>
        <p class="text-sm ${isDarkMode ? "text-blue-400" : "text-blue-600"}">
          <strong>Curso:</strong> ${
            cupon.curso?.titulo || `ID: ${cupon.cursoId}`
          }
        </p>
        <p class="text-sm ${
          isDarkMode ? "text-blue-400" : "text-blue-600"
        } mt-1">
          <strong>Usados:</strong> ${
            cupon.usosActuales
          } | <strong>Disponibles:</strong> ${
            cupon.usosMaximos - cupon.usosActuales
          } | <strong>Total:</strong> ${cupon.usosMaximos}
        </p>
        <p class="text-sm ${
          isDarkMode ? "text-blue-400" : "text-blue-600"
        } mt-1">
          <strong>Estado:</strong> ${getEstadoCupon(cupon).texto}
        </p>
        ${
          cupon.fechaExpiracion
            ? `
        <p class="text-sm ${
          isDarkMode ? "text-blue-400" : "text-blue-600"
        } mt-1">
          <strong>Expira:</strong> ${new Date(
            cupon.fechaExpiracion,
          ).toLocaleDateString()}
        </p>
        `
            : ""
        }
      </div>
    </div>
  `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Guardar Cambios",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    width: "600px",
    backdrop: true,
    background: isDarkMode ? "#1f2937" : "#fff",
    color: isDarkMode ? "#fff" : "#000",
    customClass: {
      popup: isDarkMode ? "dark" : "",
      title: isDarkMode ? "text-white" : "",
      htmlContainer: isDarkMode ? "text-gray-300" : "",
      validationMessage: isDarkMode ? "bg-red-900 text-red-200" : "",
      confirmButton: isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "",
      cancelButton: isDarkMode ? "bg-gray-600 hover:bg-gray-700" : "",
    },
    preConfirm: () => {
      const codigo = document.getElementById("codigo").value.trim();
      const usosMaximos = parseInt(
        document.getElementById("usosMaximos").value,
      );
      const fechaInput = document.getElementById("fechaExpiracion");
      const fechaExpiracion = fechaInput.value || null;

      if (!codigo) {
        Swal.showValidationMessage("El código es obligatorio");
        return false;
      }

      if (isNaN(usosMaximos) || usosMaximos < 1) {
        Swal.showValidationMessage("Los usos máximos deben ser al menos 1");
        return false;
      }

      if (usosMaximos < cupon.usosActuales) {
        Swal.showValidationMessage(
          `Los usos máximos no pueden ser menores a los usos actuales (${cupon.usosActuales})`,
        );
        return false;
      }

      if (fechaExpiracion) {
        const fechaSeleccionada = new Date(fechaExpiracion);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaSeleccionada < hoy) {
          Swal.showValidationMessage(
            "La fecha de expiración no puede ser en el pasado",
          );
          return false;
        }
      }

      return {
        codigo: codigo,
        tipo: document.getElementById("tipo").value,
        usosMaximos: usosMaximos,
        fechaExpiracion: fechaExpiracion,
      };
    },
  });

  if (formValues) {
    try {
      await api.put(`/api/coupons/${cupon.id}`, formValues);

      Swal.fire({
        title: "¡Actualizado!",
        text: "El cupón ha sido actualizado correctamente",
        icon: "success",
        confirmButtonColor: "#3085d6",
        background: isDarkMode ? "#1f2937" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
      });

      recargarFunc();
    } catch (error) {
      console.error("Error actualizando cupón:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo actualizar el cupón",
        icon: "error",
        confirmButtonColor: "#d33",
        background: isDarkMode ? "#1f2937" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
      });
    }
  }
};
