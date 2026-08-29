import { useAppStore } from '../store/useAppStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAppStore.getState().token;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && token) {
    useAppStore.getState().cerrarSesion();
    throw new Error('Sesión expirada. Inicia sesión de nuevo.');
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Error ${res.status}`);
  }

  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: async <T>(path: string): Promise<T> => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(useAppStore.getState().token
          ? { Authorization: `Bearer ${useAppStore.getState().token}` }
          : {}),
      },
    });

    if (res.status === 401 && useAppStore.getState().token) {
      useAppStore.getState().cerrarSesion();
      throw new Error('Sesión expirada. Inicia sesión de nuevo.');
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `Error ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  },

  login: async <T>(path: string, body: unknown): Promise<T> => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Error ${res.status}`);
    }

    return (await res.json()) as T;
  },

  register: async <T>(body: unknown): Promise<T> => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Error ${res.status}`);
    }

    return (await res.json()) as T;
  },

  download: async (path: string, filename: string) => {
    const token = useAppStore.getState().token;
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.status === 401) {
      useAppStore.getState().cerrarSesion();
      throw new Error('Sesión expirada. Inicia sesión de nuevo.');
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `Error ${res.status}`);
    }

    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // Check if running inside Tauri
    if ('__TAURI_INTERNALS__' in window) {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { writeFile } = await import('@tauri-apps/plugin-fs');

      const filePath = await save({
        defaultPath: filename,
        filters: [{
          name: 'PDF',
          extensions: ['pdf']
        }]
      });

      if (filePath) {
        await writeFile(filePath, new Uint8Array(arrayBuffer));
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  },
};