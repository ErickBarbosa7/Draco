import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import type { FormEvent } from 'react';

interface PerfilModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PerfilModal({ open, onClose }: PerfilModalProps) {
  const usuario = useAppStore((s) => s.usuario);
  const setSesion = useAppStore((s) => s.setSesion);
  const token = useAppStore((s) => s.token);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPwd, setMostrarPwd] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (open && usuario) {
      setNombre(usuario.nombre);
      setEmail(usuario.email);
      setPassword('');
    }
  }, [open, usuario]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCargando(true);
    try {
      const data = await api.put<{ usuario: any }>('/auth/perfil', {
        nombre,
        email,
        password: password || undefined,
      });
      // Actualizar estado global
      if (token) setSesion(token, data.usuario);
      toast.success('Perfil actualizado correctamente');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-[fade-in_150ms_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-[scale-in_150ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <h3 className="mb-4 text-lg font-bold tracking-tight text-slate-900">Mi Perfil</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              readOnly
              value={email}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500 cursor-not-allowed outline-none"
              title="El correo no se puede modificar"
            />
          </div>
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-slate-700">Nueva Contraseña (opcional)</label>
            <input
              type={mostrarPwd ? 'text' : 'password'}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Dejar en blanco para no cambiar"
              className="w-full rounded-lg border border-gray-200 p-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setMostrarPwd(!mostrarPwd)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {mostrarPwd ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.188-1.58c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={cargando}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
