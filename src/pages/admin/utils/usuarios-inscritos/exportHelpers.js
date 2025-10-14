import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportToExcel(usuarios, tipo) {
  const dataExcel = usuarios.map((user) => ({
    ID: user.id,
    Cédula: user.cedula || "No especificada",
    Nombres: user.nombres,
    Apellidos: user.apellidos,
    Correo: user.correo,
    Ciudad: user.ciudad || "No especificado",
    Empresa: user.empresa || "No especificado",
    Cargo: user.cargo || "No especificado",
    ...(tipo === "estudiantes"
      ? {
          "Cursos Inscritos": user.cursos
            ? user.cursos.map((c) => c.titulo).join("; ")
            : "Ninguno",
        }
      : {
          Usuario: user.usuario || "No especificado",
          Asignatura: user.asignatura || "No especificado",
          Rol: user.rol || "No especificado",
        }),
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

  const wscols = [
    { wch: 5 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    ...(tipo === "estudiantes"
      ? [{ wch: 40 }]
      : [{ wch: 20 }, { wch: 20 }, { wch: 15 }]),
  ];
  worksheet["!cols"] = wscols;

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `${tipo}_usuarios_${new Date().toISOString().split("T")[0]}.xlsx`);
}