import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import PerfilModal from './PerfilModal';

export default function Layout() {
  const usuario = useAppStore((s) => s.usuario);
  const cerrarSesion = useAppStore((s) => s.cerrarSesion);
  const navigate = useNavigate();
  const location = useLocation();
  const [perfilOpen, setPerfilOpen] = useState(false);

  const esSeccionActiva = (ruta: string) => location.pathname === ruta;

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Navegación superior */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold tracking-tight text-slate-900">Draco</span>
            <nav className="flex items-center gap-1">
              <button
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  esSeccionActiva('/')
                    ? 'bg-[#1e293b] text-white'
                    : 'text-slate-500 hover:bg-[#1e293b]/10 hover:text-slate-900'
                }`}
                onClick={() => navigate('/')}
              >
                Cotizaciones
              </button>
              <button
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  esSeccionActiva('/cotizador')
                    ? 'bg-[#1e293b] text-white'
                    : 'text-slate-500 hover:bg-[#1e293b]/10 hover:text-slate-900'
                }`}
                onClick={() => navigate('/cotizador')}
              >
                Nueva Cotización
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPerfilOpen(true)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {usuario?.nombre ?? 'Perfil'}
            </button>
            <button
              onClick={() => {
                cerrarSesion();
                navigate('/login');
              }}
              className="rounded-full bg-[#1e293b] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#334155]"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>

      <PerfilModal open={perfilOpen} onClose={() => setPerfilOpen(false)} />
    </div>
  );
}