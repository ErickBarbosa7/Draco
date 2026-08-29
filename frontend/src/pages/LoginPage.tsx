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
      <div className="relative flex w-full max-w-[1000px] overflow-hidden rounded-[32px] bg-white p-3 shadow-2xl">
        
        {/* ---------------- Panel izquierdo: Animación Lottie ---------------- */}
        <aside className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden rounded-[24px] bg-[#0a0a0a] p-8 md:flex">
          <Lottie src={animationData} loop={true} autoplay={true} className="w-full max-w-[400px]" />
        </aside>

        {/* ---------------- Panel derecho: Formulario ---------------- */}
        <main className="flex w-full flex-col justify-center px-8 py-6 sm:px-16 md:w-1/2 md:py-10">
          
          {/* Encabezado: Logo */}
          <div className="flex w-full items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-widest text-gray-900">
              DRACO
            </h2>
          </div>

          {/* Área central del formulario */}
          <div className="mx-auto mt-8 w-full max-w-sm flex-1">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-extrabold text-gray-900">
                {modo === 'login' ? 'Welcome Back!' : 'Create Account'}
              </h1>
              <p className="mt-1 text-sm font-medium text-gray-500">
                {modo === 'login' ? 'welcome to Draco' : 'join our dark side'}
              </p>
            </div>

            <form onSubmit={manejarSubmit} className="space-y-4">
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
                className="mt-8 flex w-full items-center justify-center rounded-full bg-[#111827] py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {cargando 
                  ? 'Processing...' 
                  : modo === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs font-semibold text-gray-500">
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
  type,
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
        className="peer w-full rounded-lg border border-gray-200 bg-transparent px-4 pb-2 pt-6 text-sm outline-none transition-all placeholder:text-transparent focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 text-xs font-bold text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:font-bold peer-focus:text-gray-900"
      >
        {label}
      </label>
    </div>
  );
}
