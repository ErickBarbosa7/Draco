import { useAppStore } from '../store/useAppStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function handleError(res: Response): Promise<never> {
  if (res.status === 401) {
    useAppStore.getState().cerrarSesion();
    throw new Error('Sesión expirada. Inicia sesión de nuevo.');
  }
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  throw new Error(body.error ?? `Error ${res.status}`);
}

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

  if (!res.ok) {
    await handleError(res);
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
    const token = useAppStore.getState().token;
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      await handleError(res);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  },

  login: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      cache: 'no-store',
      body: JSON.stringify(body),
    }),

  register: <T>(body: unknown) => request<T>('/auth/register', {
    method: 'POST',
    cache: 'no-store',
    body: JSON.stringify(body),
  }),

  download: async (path: string, filename: string) => {
    const token = useAppStore.getState().token;
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      await handleError(res);
    }

    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();

    if ('__TAURI_INTERNALS__' in window) {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { writeFile } = await import('@tauri-apps/plugin-fs');

      const filePath = await save({
        defaultPath: filename,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
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
