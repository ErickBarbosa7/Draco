import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { useEffect, type ReactNode } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { ask } from '@tauri-apps/plugin-dialog';
import toast from 'react-hot-toast';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import CotizacionesPage from './pages/CotizacionesPage';
import CotizadorPage from './pages/CotizadorPage';

function RutaProtegida({ children }: { children: ReactNode }) {
  const token = useAppStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await check();
        if (update) {
          const confirm = await ask(
            `Hay una nueva versión disponible de Draco (${update.version}).\n\n¿Deseas descargar e instalar la actualización ahora?`,
            { title: 'Actualización Disponible', kind: 'info' }
          );
          if (confirm) {
            toast.loading('Descargando actualización... Por favor espera.', { id: 'update-toast' });
            await update.downloadAndInstall();
            toast.success('Actualización instalada. Reiniciando...', { id: 'update-toast' });
            await relaunch();
          }
        }
      } catch (err) {
        console.error("Error comprobando actualizaciones:", err);
      }
    }
    // Solo comprueba en Tauri, si está en navegador ignora
    if ('__TAURI_INTERNALS__' in window) {
      checkForUpdates();
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RutaProtegida>
            <Layout />
          </RutaProtegida>
        }
      >
        <Route index element={<CotizacionesPage />} />
        <Route path="cotizador" element={<CotizadorPage />} />
        <Route path="cotizador/:id" element={<CotizadorPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}