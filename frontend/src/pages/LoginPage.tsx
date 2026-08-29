import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import type { Usuario } from '../types';
import { Lottie } from 'lottie-react';
import animationData from '../assets/animation.json';

interface LoginResponse {
  token: string;
  usuario: Usuario;
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
    setModo((m) => (m === 'login' ? 'registro' : 'login'));
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
    <div className="flex min-h-screen items-center justify-center bg-[#e8e9eb] p-4 font-sans text-sm">
      {/* Contenedor principal estilo tarjeta */}
      <div className="relative flex w-full max-w-[1200px] min-h-[700px] overflow-hidden rounded-[32px] bg-white p-3 shadow-2xl">
        
        {/* ---------------- Panel izquierdo: Animación Lottie ---------------- */}
        <aside className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden rounded-[24px] bg-[#0a0a0a] p-8 md:flex">
          <Lottie src={animationData} loop={true} autoplay={true} className="w-full max-w-[500px]" />
        </aside>

        {/* ---------------- Panel derecho: Formulario ---------------- */}
        <main className="flex w-full flex-col justify-center px-8 py-6 sm:px-16 md:w-1/2 md:py-10">
          
          {/* Encabezado: Logo */}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6" viewBox="0 0 512 512">
                <rect width="512" height="512" rx="110" fill="#0f172a"/>
                <path d="M160 120h90c80 0 140 40 140 136s-60 136-140 136h-90V120z" fill="none" stroke="#ffffff" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="text-xl font-black uppercase tracking-widest text-gray-900">
                DRACO
              </h2>
            </div>
          </div>

          {/* Área central del formulario */}
          <div className="mx-auto mt-12 w-full max-w-md flex-1">
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-extrabold text-gray-900">
                {modo === 'login' ? 'Welcome Back!' : 'Create Account'}
              </h1>
              <p className="mt-2 text-base font-medium text-gray-500">
                {modo === 'login' ? 'welcome to Draco' : 'join our dark side'}
              </p>
            </div>

            <form onSubmit={manejarSubmit} className="space-y-5">
              {modo === 'registro' && (
                <Campo 
                  id="nombre" 
                  label="Name" 
                  type="text" 
                  value={nombre} 
                  onChange={setNombre} 
                  required 
                />
              )}
              <Campo 
                id="email" 
                label="Email" 
                type="email" 
                value={email} 
                onChange={setEmail} 
                required 
              />
              <Campo
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                required
                minLength={modo === 'registro' ? 6 : undefined}
              />

              <button
                type="submit"
                disabled={cargando}
                className="mt-8 flex w-full items-center justify-center rounded-full bg-[#111827] py-4 text-base font-bold tracking-wide text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg hover:shadow-xl"
              >
                {cargando 
                  ? 'Processing...' 
                  : modo === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-semibold text-gray-500">
              {modo === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={alternarModo}
                className="text-red-800 hover:underline"
              >
                {modo === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Subcomponentes Reutilizables                                          */
/* ---------------------------------------------------------------------- */

function Campo({
  id,
  label,
  type: initialType,
  value,
  onChange,
  required,
  minLength,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
}) {
  const [mostrarPwd, setMostrarPwd] = useState(false);
  const esPassword = initialType === 'password';
  const type = esPassword ? (mostrarPwd ? 'text' : 'password') : initialType;

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full rounded-xl border border-gray-200 bg-transparent px-4 pb-2 pt-6 text-sm outline-none transition-all placeholder:text-transparent focus:border-gray-900 focus:ring-1 focus:ring-gray-900 pr-11"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 text-[11px] font-bold text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-gray-900"
      >
        {label}
      </label>
      
      {esPassword && (
        <button
          type="button"
          onClick={() => setMostrarPwd(!mostrarPwd)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
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
      )}
    </div>
  );
}
