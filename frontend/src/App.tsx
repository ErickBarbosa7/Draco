import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import type { ReactNode } from 'react';
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