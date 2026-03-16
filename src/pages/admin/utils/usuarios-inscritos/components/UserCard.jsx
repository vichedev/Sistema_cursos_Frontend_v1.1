import React from "react";
import {
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
  FaChalkboardTeacher,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import CursosDesplegable from "./CursosDesplegable";

const UserCard = React.memo(({ user, type, onView, onEdit, onDelete }) => {
  // 1. Cláusula de guarda: Si el objeto user no existe, evitamos el renderizado
  if (!user) return null;

  // 2. Validación segura de cursos usando Optional Chaining (?.)
  const userCursos = Array.isArray(user?.cursos) ? user.cursos : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
            {user?.nombres || "Sin"} {user?.apellidos || "Nombre"}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mt-1">
            <FiMail className="mr-1 flex-shrink-0" />
            <span className="truncate">{user?.correo || "No disponible"}</span>
          </div>
          {type === "estudiantes" && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">
              Cédula: {user?.cedula || "No especificada"}
            </div>
          )}
        </div>
        <span className="ml-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          ID: {user?.id || "N/A"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {user?.ciudad && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <FaMapMarkerAlt className="mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate">{user.ciudad}</span>
          </div>
        )}
        {user?.empresa && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <FaBuilding className="mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate">{user.empresa}</span>
          </div>
        )}
        {user?.cargo && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <FaBriefcase className="mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate">{user.cargo}</span>
          </div>
        )}
        {type === "administradores" && user?.asignatura && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <FaChalkboardTeacher className="mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate">{user.asignatura}</span>
          </div>
        )}
      </div>

      {/* Renderizado condicional de cursos para evitar errores visuales */}
      {type === "estudiantes" && userCursos.length > 0 && (
        <div className="mb-4">
          <CursosDesplegable cursos={userCursos} />
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onView(user)}
          className="p-2.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors duration-200"
          title="Ver detalle"
        >
          <FaEye size={16} />
        </button>
        <button
          onClick={() => onEdit(user)}
          className="p-2.5 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors duration-200"
          title="Editar usuario"
        >
          <FaEdit size={16} />
        </button>

        {/* Validación para que el administrador maestro (ID: 1) no pueda ser borrado */}
        {user?.id !== 1 ? (
          <button
            onClick={() => onDelete(user)}
            className="p-2.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors duration-200"
            title="Eliminar usuario"
          >
            <FaTrash size={16} />
          </button>
        ) : (
          <div
            className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
            title="El administrador principal está protegido"
          >
            <FaTrash size={16} />
          </div>
        )}
      </div>
    </div>
  );
});

export default UserCard;
