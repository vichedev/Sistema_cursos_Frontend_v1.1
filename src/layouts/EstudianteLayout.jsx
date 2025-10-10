// src/layouts/EstudianteLayout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import SidebarEstudiante from "../components/estudiante/SidebarEstudiante";
import EstudianteNavbar from "../components/estudiante/EstudianteNavbar";
import { useAuth } from "../hooks/useAuth";

export default function EstudianteLayout({ className = "" }) {
  useAuth(["ESTUDIANTE"]);
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className={`h-screen flex bg-gradient-to-tr from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 min-h-0 transition-colors duration-200 ${className}`}>
      {/* Drawer/Sidebar */}
      <div
        className={`
          fixed z-50 top-0 left-0 h-screen w-72
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        aria-hidden={!open}
      >
        <SidebarEstudiante onNavigate={() => setOpen(false)} />
      </div>

      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 md:hidden dark:bg-black/20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Contenido */}
      <div className="flex-1 flex flex-col md:ml-72 min-h-0">
        {/* Navbar */}
        <div className="sticky top-0 z-30">
          <EstudianteNavbar
            onMenuClick={() => setOpen(true)}
            userData={userData}
          />
        </div>

        {/* Área de contenido principal */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}