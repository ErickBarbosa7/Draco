# Documento de Contexto y Planeación: Sistema de Gestión de Cotizaciones

## 1. Visión General del Proyecto
El sistema tiene como objetivo centralizar, automatizar y gestionar la creación de cotizaciones (órdenes) que actualmente se realizan en hojas de cálculo (Excel). Se busca una solución web integral que permita a los usuarios autenticados generar cotizaciones con cálculo de divisas en tiempo real, persistencia de datos históricos y exportación a documentos PDF inmutables de alta calidad.

## 2. Arquitectura del Sistema y Stack Tecnológico
La arquitectura está orientada a ser ligera, moderna y altamente reactiva, separando claramente las responsabilidades del cliente y del servidor.

### 2.1. Frontend (Cliente)
*   **Core:** React estructurado con Vite para un entorno de desarrollo rápido y un build optimizado.
*   **Lenguaje:** TypeScript (recomendado) para tipado estricto, o JavaScript moderno.
*   **Estilos:** Tailwind CSS para un diseño ágil, limpio y responsivo (ej. uso de floating cards).
*   **Gestor de Estado:** Zustand para el manejo global del tipo de cambio (MXN/USD) y los datos de la sesión del usuario.
*   **Componente de Tabla:** TanStack Table para renderizar la cuadrícula interactiva de productos, permitiendo edición en línea y cálculos dinámicos.

### 2.2. Backend (Servidor)
*   **Entorno:** Node.js para un consumo de recursos mínimo.
*   **Framework:** Express.js o Fastify.
*   **Autenticación:** JSON Web Tokens (JWT) para control de acceso seguro y sin estado.
*   **Generador de PDF:** Puppeteer para renderizado de plantillas HTML a PDF en el servidor, asegurando fidelidad visual.

### 2.3. Base de Datos
*   **Motor:** PostgreSQL, ideal para asegurar la integridad relacional de datos financieros.
*   **ORM:** Prisma, facilitando las migraciones, modelado y consultas eficientes.

## 3. Modelo de Dominio (Base de Datos)
*   **Usuarios:** `id`, `nombre`, `email`, `password_hash`, `rol`, `fecha_creacion`.
*   **Cotizaciones:** `id`, `folio` (ej. COT-2026-001), `usuario_id`, `cliente_nombre`, `cliente_contacto`, `cliente_email`, `condiciones_pago`, `estado` (Borrador, Aceptada, etc.), `moneda_base` (MXN/USD), `tipo_cambio_aplicado`, `fecha_creacion`, `vigencia_dias`, `notas`, `subtotal`, `total`.
*   **Partidas (Items):** `id`, `cotizacion_id`, `cantidad`, `codigo_producto`, `descripcion`, `imagen_url` (o base64), `precio_unitario`, `total_partida`.

## 4. Reglas de Negocio Principales
1.  **Inmutabilidad Financiera:** Una vez guardada y generada una cotización, el "tipo_cambio_aplicado" se congela. Consultas futuras deben reflejar el valor histórico, no el actual.
2.  **Cálculo en Vivo:** Si la cotización está en modo edición (Borrador) y el usuario cambia el toggle MXN/USD, la UI (Zustand + TanStack Table) debe recalcular el precio unitario y los totales al instante.
3.  **Generación de Documentos:** El PDF es generado exclusivamente por el backend para asegurar que la tipografía, márgenes e imágenes de productos se rendericen correctamente y sin depender del navegador del cliente.