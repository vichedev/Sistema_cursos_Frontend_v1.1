// src/pages/estudiante/DashboardEstudiante.jsx
import EstudianteLayout from "../../layouts/EstudianteLayout";
import DataGeneralEstudiante from "../../components/estudiante/DataGeneralEstudiante";

export default function DashboardEstudiante() {
  return (
    <EstudianteLayout>
      <DataGeneralEstudiante />
    </EstudianteLayout>
  );
}
