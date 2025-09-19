// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail"; // Nueva página de verificación
import LandingPage from "./pages/LandingPage";

// ADMIN
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import CrearCurso from "./pages/admin/CrearCurso";
import EditarCurso from "./pages/admin/EditarCurso";
import EstudiantesCurso from "./pages/admin/EstudiantesCurso";
import UsuariosInscritos from "./pages/admin/UsuariosInscritos";
import VerTodosLosCursos from "./pages/admin/VerTodosLosCursos";

// ESTUDIANTE
import DashboardEstudiante from "./pages/estudiante/DashboardEstudiante";
import CursosEstudiante from "./pages/estudiante/CursosEstudiante";
import MisCursos from "./pages/estudiante/MisCursos";
import PaymentSuccess from "./pages/estudiante/PaymentSuccess";
import PaymentFailed from "./pages/estudiante/PaymentFailed";


// NOTISFICATION CONTEXT
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Landing page como raíz */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} /> {/* Nueva ruta */}

          {/* ADMIN */}
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/crear-curso" element={<CrearCurso />} />
          <Route path="/admin/ver-todo" element={<VerTodosLosCursos />} />
          <Route path="/admin/editar-curso/:id" element={<EditarCurso />} />
          <Route path="/admin/estudiantes-curso/:id" element={<EstudiantesCurso />} />
          <Route path="/admin/usuarios-inscritos" element={<UsuariosInscritos />} />

          {/* ESTUDIANTE */}
          <Route path="/estudiante/dashboard" element={<DashboardEstudiante />} />
          <Route path="/estudiante/cursos" element={<CursosEstudiante />} />
          <Route path="/estudiante/mis-cursos" element={<MisCursos />} />

          {/* RUTAS DE PAGO - PAYPHONE */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          <Route path="/payment/cancelled" element={<PaymentFailed />} />

          {/* RUTAS DE PAGO LEGACY (por compatibilidad) */}
          <Route path="/pago-exitoso" element={<PaymentSuccess />} />
          <Route path="/pago-fallido" element={<PaymentFailed />} />

          {/* Default fallback para rutas no definidas */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>

    </NotificationProvider >
  );
}

export default App;