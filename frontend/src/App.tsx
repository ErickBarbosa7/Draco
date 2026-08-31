import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { ask } from '@tauri-apps/plugin-dialog';
import toast from 'react-hot-toast';
import Layout from './components/Layout';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const CotizacionesPage = lazy(() => import('./pages/CotizacionesPage'));
const CotizadorPage = lazy(() => import('./pages/CotizadorPage'));

const esTauri = () => '__TAURI_INTERNALS__' in window;

async function checkForUpdates() {
  try {
    const update = await check();
    if (!update) return;

    const confirm = await ask(
      `Hay una nueva versión disponible de Draco (${update.version}).\n\n¿Deseas descargar e instalar la actualización ahora?`,
      { title: 'Actualización Disponible', kind: 'info' },
    );
    if (!confirm) return;

    let lastPercentage = 0;
    let totalBytes = 0;
    await update.downloadAndInstall((event) => {
      if (event.event === 'Started' && event.data.contentLength) {
        totalBytes = event.data.contentLength;
      }
      if (event.event === 'Progress') {
        if (totalBytes > 0) {
          const pct = Math.min(99, Math.round((event.data.chunkLength / totalBytes) * 100));
          if (pct !== lastPercentage) {
            lastPercentage = pct;
            toast.loading(`Descargando actualización… ${pct}%`, { id: 'update-toast' });
          }
        } else {
          toast.loading('Descargando actualización…', { id: 'update-toast' });
        }
      }
    });

    toast.success('Actualización instalada. Reiniciando…', { id: 'update-toast' });
    await relaunch();
  } catch (err) {
    // No bloquear el arranque de la app si el endpoint no responde
    console.error('Error comprobando actualizaciones:', err);
  }
}

function RutaProtegida({ children }: { children: ReactNode }) {
  const token = useAppStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SuspenseBoundary({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#e8e9eb] text-sm text-slate-500">
          Cargando…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function App() {
  useEffect(() => {
    if (esTauri()) {
      checkForUpdates();
    }
  }, []);

  return (
    <SuspenseBoundary>
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
    </SuspenseBoundary>
  );
}