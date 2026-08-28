import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // Tus plugins actuales
  plugins: [react(), tailwindcss()],
  
  // 1. Previene que Vite oscurezca errores de compilación de Rust
  clearScreen: false,
  
  // 2. Permite usar variables de entorno de Tauri
  envPrefix: ['VITE_', 'TAURI_'],
  
  server: {
    port: 5173,
    // Tauri necesita que el puerto sea estrictamente este; si está ocupado, debe fallar en lugar de cambiar a 5174
    strictPort: true, 
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  
  // 3. Instrucciones de compilación para el entorno de escritorio
  build: {
    // Tauri usa WebView2 (Chromium) en Windows y WebKit en macOS
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // Deshabilita la minificación si estás haciendo un build de prueba (debug)
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});