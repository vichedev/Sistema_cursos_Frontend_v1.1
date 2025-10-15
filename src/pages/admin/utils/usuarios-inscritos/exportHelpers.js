import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportToExcel(usuarios, tipo) {
  // ✅ CORREGIDO: Eliminar el campo ID y mejorar formato
  const dataExcel = usuarios.map((user) => {
    const baseData = {
      // ❌ ELIMINADO: ID: user.id,
      Cédula: user.cedula || "No especificada",
      Nombres: user.nombres,
      Apellidos: user.apellidos,
      Correo: user.correo,
      Ciudad: user.ciudad || "No especificado",
      Empresa: user.empresa || "No especificado",
      Cargo: user.cargo || "No especificado",
    };

    if (tipo === "estudiantes") {
      return {
        ...baseData,
        "Cursos Inscritos": user.cursos
          ? user.cursos.map((c) => c.titulo).join("; ")
          : "Ninguno",
        "Celular": user.celular || "No especificado",
        "Fecha Registro": user.createdAt 
          ? new Date(user.createdAt).toLocaleDateString() 
          : "No especificada"
      };
    } else {
      return {
        ...baseData,
        Usuario: user.usuario || "No especificado",
        Asignatura: user.asignatura || "No especificado",
        Rol: user.rol || "No especificado",
        "Fecha Registro": user.createdAt 
          ? new Date(user.createdAt).toLocaleDateString() 
          : "No especificada"
      };
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(dataExcel);
  const workbook = XLSX.utils.book_new();
  
  // ✅ MEJORADO: Nombre de hoja más descriptivo
  const sheetName = tipo === "estudiantes" ? "Estudiantes" : "Profesores";
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // ✅ MEJORADO: Ajustar anchos de columnas sin ID
  const wscols = [
    { wch: 15 }, // Cédula
    { wch: 20 }, // Nombres
    { wch: 20 }, // Apellidos
    { wch: 30 }, // Correo
    { wch: 15 }, // Ciudad
    { wch: 20 }, // Empresa
    { wch: 20 }, // Cargo
    ...(tipo === "estudiantes"
      ? [
          { wch: 40 }, // Cursos Inscritos
          { wch: 15 }, // Celular
          { wch: 15 }  // Fecha Registro
        ]
      : [
          { wch: 20 }, // Usuario
          { wch: 20 }, // Asignatura
          { wch: 15 }, // Rol
          { wch: 15 }  // Fecha Registro
        ]),
  ];
  worksheet["!cols"] = wscols;

  // ✅ MEJORADO: Nombre de archivo más claro
  const fileName = `${tipo === "estudiantes" ? "Estudiantes" : "Profesores"}_${new Date().toISOString().split("T")[0]}.xlsx`;
  
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName);
}