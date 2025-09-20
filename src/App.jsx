// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import LandingPage from "./pages/LandingPage";

// ADMIN - Importa el layout y las páginas
import AdminLayout from "./layouts/AdminLayout";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import CrearCurso from "./pages/admin/CrearCurso";
import EditarCurso from "./pages/admin/EditarCurso";
import EstudiantesCurso from "./pages/admin/EstudiantesCurso";
import UsuariosInscritos from "./pages/admin/UsuariosInscritos";
import VerTodosLosCursos from "./pages/admin/VerTodosLosCursos";

// ESTUDIANTE - Importa el layout y las páginas
import EstudianteLayout from "./layouts/EstudianteLayout";
import DashboardEstudiante from "./pages/estudiante/DashboardEstudiante";
import CursosEstudiante from "./pages/estudiante/CursosEstudiante";
import MisCursos from "./pages/estudiante/MisCursos";

// PAGOS
import PaymentSuccess from "./pages/estudiante/PaymentSuccess";
import PaymentFailed from "./pages/estudiante/PaymentFailed";

// CONTEXT
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* ADMIN - Rutas protegidas con layout ANIDADO */}
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardAdmin />} />
            <Route path="crear-curso" element={<CrearCurso />} />
            <Route path="ver-todo" element={<VerTodosLosCursos />} />
            <Route path="editar-curso/:id" element={<EditarCurso />} />
            <Route path="estudiantes-curso/:id" element={<EstudiantesCurso />} />
            <Route path="usuarios-inscritos" element={<UsuariosInscritos />} />
          </Route>

          {/* ESTUDIANTE - Rutas protegidas con layout ANIDADO */}
          <Route path="/estudiante/*" element={<EstudianteLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardEstudiante />} />
            <Route path="cursos" element={<CursosEstudiante />} />
            <Route path="mis-cursos" element={<MisCursos />} />
          </Route>

          {/* PAGOS */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          <Route path="/payment/cancelled" element={<PaymentFailed />} />

          {/* Legacy */}
          <Route path="/pago-exitoso" element={<PaymentSuccess />} />
          <Route path="/pago-fallido" element={<PaymentFailed />} />

          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;