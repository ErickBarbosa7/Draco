import { create } from 'zustand';
import type { Moneda, Usuario } from '../types';

interface AppState {
  // Sesión
  token: string | null;
  usuario: Usuario | null;
  setSesion: (token: string, usuario: Usuario) => void;
  cerrarSesion: () => void;

  // Moneda y tipo de cambio
  monedaActiva: Moneda;
  tipoCambio: number;
  alternarMoneda: () => void;
  setTipoCambio: (valor: number) => void;
}

function leerSesion(): { token: string | null; usuario: Usuario | null } {
  try {
    const token = localStorage.getItem('draco_token');
    const usuario = localStorage.getItem('draco_usuario');
    return { token, usuario: usuario ? (JSON.parse(usuario) as Usuario) : null };
  } catch {
    return { token: null, usuario: null };
  }
}

const inicial = leerSesion();

export const useAppStore = create<AppState>((set) => ({
  // Sesión
  token: inicial.token,
  usuario: inicial.usuario,
  setSesion: (token, usuario) => {
    localStorage.setItem('draco_token', token);
    localStorage.setItem('draco_usuario', JSON.stringify(usuario));
    set({ token, usuario });
  },
  cerrarSesion: () => {
    localStorage.removeItem('draco_token');
    localStorage.removeItem('draco_usuario');
    set({ token: null, usuario: null });
  },

  // Moneda y tipo de cambio
  monedaActiva: 'MXN',
  tipoCambio: 17.0,
  alternarMoneda: () =>
    set((state) => ({ monedaActiva: state.monedaActiva === 'MXN' ? 'USD' : 'MXN' })),
  setTipoCambio: (valor) => set({ tipoCambio: valor > 0 ? valor : 1 }),
}));