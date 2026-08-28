# Fases de Desarrollo del Proyecto

Este documento desglosa la construcción del sistema en 6 fases secuenciales e iterativas.

## FASE 1: Configuración Inicial y Base de Datos (Semana 1)
**Objetivo:** Tener el entorno listo y la base de datos capaz de almacenar información.
*   [ ] Inicializar repositorio de Git (monorepo o repositorios separados para front/back).
*   [ ] Configurar proyecto backend con Node.js y TypeScript.
*   [ ] Instalar e inicializar Prisma ORM.
*   [ ] Definir el esquema de Prisma (`schema.prisma`) con los modelos: `Usuario`, `Cotizacion`, `Partida`.
*   [ ] Ejecutar migraciones iniciales hacia PostgreSQL.
*   [ ] Crear un script de *seed* para insertar un usuario de prueba en la base de datos.

## FASE 2: Backend y Endpoints Core (Semana 1-2)
**Objetivo:** Desarrollar la lógica del servidor para manejar la autenticación y las cotizaciones.
*   [ ] Configurar Express/Fastify.
*   [ ] Implementar endpoint de Login (`/api/auth/login`) y generación de token JWT.
*   [ ] Crear middleware de protección de rutas para verificar el JWT.
*   [ ] Implementar CRUD de Cotizaciones:
    *   `POST /api/cotizaciones` (Crear cotización y sus partidas en una sola transacción).
    *   `GET /api/cotizaciones` (Listar todas con filtros de estado).
    *   `GET /api/cotizaciones/:id` (Obtener detalle completo).
    *   `PUT /api/cotizaciones/:id` (Actualizar estado o partidas).

## FASE 3: Frontend - UI Base y Autenticación (Semana 2-3)
**Objetivo:** Construir el esqueleto de la aplicación web y proteger el acceso.
*   [ ] Inicializar proyecto de React con Vite y configurar Tailwind CSS.
*   [ ] Configurar enrutamiento (ej. React Router).
*   [ ] Crear pantalla de Login y conectar con el backend (guardar JWT en localStorage o cookies).
*   [ ] Crear el *Layout* principal (Sidebar/Navbar) usando un diseño limpio.
*   [ ] Crear la vista de "Listado de Cotizaciones" (Tabla simple para ver el histórico).

## FASE 4: El Cotizador (La Tabla Dinámica) (Semana 3-4)
**Objetivo:** Construir la experiencia principal del usuario (reemplazo del Excel).
*   [ ] Crear el formulario superior (Header): Datos del cliente, vigencia, condiciones de pago.
*   [ ] Implementar Zustand para el estado global del "Tipo de Cambio" y "Moneda Activa".
*   [ ] Integrar TanStack Table para las partidas:
    *   Columnas: Imagen, Código, Cantidad, Descripción, Precio Unitario, Total.
    *   Hacer las celdas de Cantidad y Precio editables.
*   [ ] Programar la lógica reactiva: Al cambiar cantidad/precio o hacer toggle de moneda, actualizar la fila y el Total General automáticamente.
*   [ ] Implementar carga de imágenes (manejo de subida a carpeta temporal o conversión a Base64).
*   [ ] Conectar el botón "Guardar" para enviar el JSON complejo al endpoint `POST /api/cotizaciones`.

## FASE 5: Motor de PDF (Semana 4-5)
**Objetivo:** Generar el documento final para el cliente.
*   [ ] Instalar Puppeteer en el backend de Node.js.
*   [ ] Diseñar una plantilla HTML estática (factura/cotización) que será el esqueleto del PDF.
*   [ ] Crear el endpoint `GET /api/cotizaciones/:id/pdf`.
    *   Recuperar los datos de PostgreSQL.
    *   Inyectar los datos (y las imágenes base64) en la plantilla HTML.
    *   Usar Puppeteer para generar el PDF y devolver el *buffer* al frontend.
*   [ ] En el frontend, implementar la lógica de descarga del archivo al recibir la respuesta.

## FASE 6: Pulido, Pruebas y Despliegue (Semana 5-6)
**Objetivo:** Preparar el sistema para producción.
*   [ ] Validaciones en formularios (React Hook Form + Zod/Yup) para evitar guardar cotizaciones vacías.
*   [ ] Manejo de errores (Notificaciones/Toasts para el usuario).
*   [ ] Pruebas del flujo completo: Crear -> Cambiar Moneda -> Guardar -> Descargar PDF.
*   [ ] Configurar variables de entorno de producción.
*   [ ] Despliegue del backend (ej. Render) y del frontend (ej. Vercel/Netlify).