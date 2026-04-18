// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import LandingPage from "./pages/LandingPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ADMIN
import AdminLayout from "./layouts/AdminLayout";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import CrearCurso from "./pages/admin/CrearCurso";
import EditarCurso from "./pages/admin/EditarCurso";
import EstudiantesCurso from "./pages/admin/EstudiantesCurso";
import UsuariosInscritos from "./pages/admin/UsuariosInscritos";
import VerTodosLosCursos from "./pages/admin/VerTodosLosCursos";
import GestionarCupones from "./pages/admin/GestionarCupones";
// ✅ NUEVO
import GestionDiplomas from "./pages/admin/GestionDiplomas";

// ESTUDIANTE
import EstudianteLayout from "./layouts/EstudianteLayout";
import DashboardEstudiante from "./pages/estudiante/DashboardEstudiante";
import CursosEstudiante from "./pages/estudiante/CursosEstudiante";
import MisCursos from "./pages/estudiante/MisCursos";

// PAGOS
import PaymentSuccess from "./pages/estudiante/PaymentSuccess";
import PaymentFailed from "./pages/estudiante/PaymentFailed";

// CONTEXT
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";

// LEGALES
import Privacidad from "./pages/Privacidad";
import Terminos from "./pages/Terminos";

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ADMIN */}
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardAdmin />} />
              <Route path="crear-curso" element={<CrearCurso />} />
              <Route path="ver-todo" element={<VerTodosLosCursos />} />
              <Route path="editar-curso/:id" element={<EditarCurso />} />
              <Route
                path="estudiantes-curso/:id"
                element={<EstudiantesCurso />}
              />
              <Route
                path="usuarios-inscritos"
                element={<UsuariosInscritos />}
              />
              <Route path="gestionar-cupones" element={<GestionarCupones />} />
              {/* ✅ NUEVO */}
              <Route path="diplomas" element={<GestionDiplomas />} />
            </Route>

            {/* ESTUDIANTE */}
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
            <Route path="/pago-exitoso" element={<PaymentSuccess />} />
            <Route path="/pago-fallido" element={<PaymentFailed />} />
            {/* LEGALES */}
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/terminos" element={<Terminos />} />

            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
