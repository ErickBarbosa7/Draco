import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import type { Usuario } from '../types';

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

function FiguraDecorativa({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className={`pointer-events-none select-none ${className ?? ''}`}
    >
      <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" />
      <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

function BloquePatron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={`pointer-events-none select-none ${className ?? ''}`}
    >
      <rect x="4" y="4" width="112" height="112" rx="24" stroke="currentColor" strokeWidth="1.5" />
      {[20, 40, 60, 80, 100].map((x) =>
        [20, 40, 60, 80, 100].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="currentColor" opacity="0.12" />
        )),
      )}
    </svg>
  );
}

function LineasDecorativas({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 100"
      fill="none"
      className={`pointer-events-none select-none ${className ?? ''}`}
    >
      <path d="M0 50 Q75 10 150 50 T300 50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 5" />
      <path d="M0 70 Q75 30 150 70 T300 70" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

export default function LoginPage() {
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const setSesion = useAppStore((s) => s.setSesion);
  const navigate = useNavigate();

  function alternarModo() {
    setModo(m => m === 'login' ? 'registro' : 'login');
    setNombre('');
    setEmail('');
    setPassword('');
  }

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setCargando(true);
    try {
      let res: LoginResponse;
      if (modo === 'login') {
        res = await api.login<LoginResponse>('/auth/login', { email, password });
      } else {
        res = await api.register<LoginResponse>({ nombre, email, password });
      }
      setSesion(res.token, res.usuario);
      toast.success(`Bienvenido, ${res.usuario.nombre}`);
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al procesar');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f1f5f9] px-4">
      {/* Elementos decorativos de fondo */}
      <FiguraDecorativa className="absolute left-[5%] top-[8%] h-48 w-48 text-[#1e293b] opacity-20 animate-[spin_60s_linear_infinite]" />
      <BloquePatron className="absolute right-[8%] top-[5%] h-36 w-36 text-[#1e293b] opacity-15" />
      <FiguraDecorativa className="absolute bottom-[10%] left-[3%] h-32 w-32 text-[#3b82f6] opacity-20 animate-[spin_45s_linear_infinite_reverse]" />
      <BloquePatron className="absolute bottom-[5%] right-[10%] h-28 w-28 text-[#3b82f6] opacity-20" />
      <LineasDecorativas className="absolute bottom-[15%] left-[15%] w-64 text-[#1e293b] opacity-15" />
      <LineasDecorativas className="absolute right-[5%] top-[30%] w-48 rotate-12 text-[#3b82f6] opacity-20" />

      {/* Puntos flotantes decorativos */}
      <div className="absolute left-[20%] top-[20%] h-3 w-3 rounded-full bg-[#1e293b]/20 animate-[bounce_4s_ease-in-out_infinite]" />
      <div className="absolute right-[25%] top-[15%] h-2 w-2 rounded-full bg-[#3b82f6]/30 animate-[bounce_5s_ease-in-out_infinite_1s]" />
      <div className="absolute bottom-[25%] left-[30%] h-2.5 w-2.5 rounded-full bg-[#1e293b]/15 animate-[bounce_6s_ease-in-out_infinite_0.5s]" />
      <div className="absolute bottom-[30%] right-[20%] h-2 w-2 rounded-full bg-[#3b82f6]/30 animate-[bounce_4.5s_ease-in-out_infinite_1.5s]" />

      {/* Tarjeta de login */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[2.5rem] bg-white p-10 animate-[slide-up_300ms_ease-out] sm:p-12">
          {/* Encabezado */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1e293b]">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Draco</h1>
            </div>
            <p className="text-sm text-slate-400">Sistema de Gestión de Cotizaciones</p>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarSubmit} className="space-y-4">
            {modo === 'registro' && (
              <div>
                <label htmlFor="nombre" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@draco.mx"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={modo === 'registro' ? 6 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={modo === 'registro' ? 'Mínimo 6 caracteres' : '••••••••'}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-xl bg-[#1e293b] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#334155] hover:shadow-lg hover:shadow-[#1e293b]/30 disabled:opacity-50"
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {modo === 'login' ? 'Ingresando…' : 'Creando cuenta…'}
                </span>
              ) : (
                modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs font-medium text-slate-300">o continúa con</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Texto inferior */}
        <p className="mt-6 text-center text-xs text-slate-400">
          {modo === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={alternarModo} className="font-semibold text-slate-600 underline underline-offset-2 decoration-slate-300 transition hover:text-slate-900 hover:decoration-slate-900">
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={alternarModo} className="font-semibold text-slate-600 underline underline-offset-2 decoration-slate-300 transition hover:text-slate-900 hover:decoration-slate-900">
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
