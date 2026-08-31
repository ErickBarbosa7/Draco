# Draco

Sistema de Gestión de Cotizaciones. App de escritorio (Tauri + React) con backend (Node/Express + Prisma/PostgreSQL + Puppeteer para PDF).

## Arquitectura

```
Draco/
├── frontend/   App de escritorio (Tauri 2 + React 19 + Vite)
│   └── src-tauri/  Núcleo Tauri (Rust), iconos, capabilities
├── backend/    API REST (Express + Prisma + PostgreSQL + Puppeteer)
│   └── prisma/ Schema de base de datos
└── .github/
    └── workflows/
        ├── ci.yml        Typecheck, build y audit (push/PR a main)
        └── release.yml   Build multiplataforma y release al crear un tag
```

## Requisitos

- Node.js 20+, npm
- Rust (solo para build Tauri)
- PostgreSQL (para el backend)
- WebKitGTK y dependencias de Tauri en Linux (ver [documentación de Tauri](https://tauri.app/start/prerequisites/))

## Desarrollo

### Backend

```bash
cd backend
cp .env.example .env    # configurar DATABASE_URL, JWT_SECRET, CORS_ORIGINS
npx prisma generate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run tauri:dev
```

En desarrollo el frontend usa un proxy (`/api` → `localhost:4000`). En producción la app de escritorio toma la URL del backend desde `VITE_API_URL` (default `http://localhost:4000/api`).

### Variables de entorno del backend (`.env`)

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | Sí |
| `JWT_SECRET` | Secreto para firmar tokens (**genera uno largo y aleatorio en producción**) | Sí (producción) |
| `CORS_ORIGINS` | Orígenes permitidos por CORS, separados por coma | No |
| `PORT` | Puerto del servidor (default `4000`) | No |

## Actualización automática (updater de Tauri)

La app de escritorio consulta el manifiesto:
`https://github.com/ErickBarbosa7/Draco/releases/latest/download/latest.json`

Este `latest.json` lo genera automáticamente `tauri-action` **solo si** el repositorio tiene configurada la clave de firma. Sin él, la app **no** detecta actualizaciones (es lo que estaba pasando).

### Configurar la clave de firma (una sola vez)

1. Genera un par de claves:
   ```bash
   cd frontend
   npm run tauri -- signer generate
   ```
   Guárdalo en un gestor de contraseñas. Anota la **clave privada** y la **frase**.

2. Copia la **clave pública** generada y pégala en el campo `plugins.updater.pubkey` de `frontend/src-tauri/tauri.conf.json`.

3. En GitHub → **Settings → Secrets and variables → Actions**, añade:
   - `TAURI_PRIVATE_KEY` → la clave privada
   - `TAURI_PRIVATE_KEY_PASSWORD` → la frase de la clave

### Publicar una nueva versión

La app solo se actualiza creando un **tag** (`v*`) y empujándolo; el push a `main` no genera release:

```bash
# 1. Actualiza las versiones en package.json, tauri.conf.json y Cargo.toml
#    (quedan sincronizadas)

# 2. Crea y empuja el tag
git tag v1.0.15
git push origin v1.0.15
```

El workflow `release.yml` compilará para Linux y Windows, publicará los instaladores y comprobará que se generó `latest.json`. Verifica que en la página del release aparezcan `latest.json`, `*.tar.gz` y `*.sig`.

## Seguridad

- **Contraseñas**: hasheadas con `bcrypt` (coste 12).
- **JWT**: firmado con `JWT_SECRET` (requerido en producción); expira en 8 h.
- **CORS**: restringido a `CORS_ORIGINS` en producción (sin `*`).
- **Rate limiting**: límite global y un límite estricto en `/api/auth` para evitar fuerza bruta.
- **Validación**: los body se validan con **zod** (login, registro, perfil, cotizaciones).
- **Roles**: registro de usuarios restringido a `ADMIN` (`verificarRol('ADMIN')`).
- **PDF**: los datos del usuario se escapan antes de inyectarlos en el HTML (anti inyección).
- **Docker**: imagen multi-stage que ejecuta con usuario no-root y sin devDependencies.
- **Claves**: `*.key`, `*.sig` y `*.pem` están en `.gitignore`. **Nunca subas claves privadas al repositorio**.

## CI

`.github/workflows/ci.yml` corre en cada push a `main` y en pull requests: typecheck y build del frontend y backend, más `npm audit` (falla si hay vulnerabilidades ≥ high).
